"""
init_db.py
----------
Rebuilds the entire SQLite database with the correct schema
(fixed UNIQUE constraints so SQLite accepts all tables).
"""

import sqlite3
import hashlib
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "db" / "fitness.db"

def hash_password(password: str) -> str:
    """Simple SHA256 hashing placeholder."""
    return hashlib.sha256(password.encode()).hexdigest()


# ============================
# FIXED SCHEMA
# ============================

ALL_TABLES_SQL = """
-- USERS
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('customer', 'vendor', 'admin')) DEFAULT 'customer',
    status TEXT NOT NULL CHECK(status IN ('active', 'suspended', 'pending')) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    category TEXT,
    stock INTEGER DEFAULT 0 CHECK(stock >= 0),
    low_stock_threshold INTEGER DEFAULT 10,
    image_url TEXT,
    vendor_id INTEGER NOT NULL,
    is_active INTEGER NOT NULL CHECK(is_active IN (0,1)) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES users(id)
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- WISHLIST
CREATE TABLE IF NOT EXISTS wishlist (
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('placed','processing','shipped','delivered','cancelled')) DEFAULT 'placed',
    tracking_id TEXT,
    shipping_carrier TEXT,
    estimated_delivery DATE,
    payment_status TEXT DEFAULT 'paid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_purchase REAL NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id)
);

-- CART ITEMS
CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    UNIQUE(user_id, product_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- REPORTED PRODUCTS (Admin moderation)
CREATE TABLE IF NOT EXISTS reported_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    reported_by INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','resolved')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(reported_by) REFERENCES users(id)
);

-- STOCK NOTIFICATIONS
CREATE TABLE IF NOT EXISTS stock_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    vendor_id INTEGER NOT NULL,
    notified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged INTEGER DEFAULT 0,
    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(vendor_id) REFERENCES users(id)
);

-- FIX: UNIQUE per-day notifications using a functional INDEX (allowed)
CREATE UNIQUE INDEX IF NOT EXISTS idx_stock_notifs_unique
ON stock_notifications (product_id, vendor_id, DATE(notified_at));

-- SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
"""

# ============================
# DB INITIALIZATION
# ============================

def init_database():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    VENDOR_HASH   = hash_password("vendor123")
    ADMIN_HASH    = hash_password("admin123")
    CUSTOMER_HASH = hash_password("customer123")

    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()

            cursor.executescript(ALL_TABLES_SQL)

            # --------------------------
            # Seed Users
            # --------------------------
            users = [
                ("customer@example.com", CUSTOMER_HASH, "customer", "active"),
                ("vendor@example.com",   VENDOR_HASH,   "vendor",   "active"),
                ("admin@example.com",    ADMIN_HASH,    "admin",    "active"),
            ]
            cursor.executemany(
                "INSERT OR IGNORE INTO users (email,password_hash,role,status) VALUES (?,?,?,?)",
                users
            )

            vendor_id = cursor.execute("SELECT id FROM users WHERE role='vendor'").fetchone()[0]
            customer_id = cursor.execute("SELECT id FROM users WHERE role='customer'").fetchone()[0]

            # --------------------------
            # Seed Products (expanded)
            # --------------------------
            products = [
                # Core 4
                ("Yoga Mat", 29.99, "Premium non-slip yoga mat", "equipment", 50, 10, None, vendor_id),
                ("Dumbbells Set", 89.99, "Adjustable 5–50 lb dumbbells", "equipment", 30, 5, None, vendor_id),
                ("Protein Powder", 49.99, "Whey isolate 2lb, chocolate", "supplement", 10, 20, None, vendor_id),
                ("Running Shoes", 129.99, "High-performance running shoes", "apparel", 2, 5, None, vendor_id),

                # Extra equipment
                ("Adjustable Bench", 159.99, "Flat/incline/decline workout bench", "equipment", 8, 2, None, vendor_id),
                ("Kettlebell 16kg", 59.99, "Cast-iron kettlebell", "equipment", 20, 5, None, vendor_id),
                ("Pull-Up Bar", 39.99, "Doorway pull-up bar with multiple grips", "equipment", 18, 4, None, vendor_id),
                ("Foam Roller", 24.99, "High-density foam roller", "equipment", 30, 5, None, vendor_id),

                # Apparel
                ("Compression Shirt", 34.99, "Moisture-wicking compression shirt", "apparel", 40, 8, None, vendor_id),
                ("Training Shorts", 29.99, "Lightweight shorts with zip pockets", "apparel", 35, 7, None, vendor_id),
                ("Gym Hoodie", 49.99, "Fleece-lined hoodie", "apparel", 25, 5, None, vendor_id),

                # Supplements
                ("BCAA Powder", 26.99, "BCAA citrus flavour, 300 g", "supplement", 22, 5, None, vendor_id),
                ("Pre-Workout Formula", 39.49, "Energy + focus pre-workout", "supplement", 18, 4, None, vendor_id),
                ("Multivitamin Capsules", 21.99, "Daily multivitamin for athletes", "supplement", 50, 10, None, vendor_id),

                # Accessories
                ("Lifting Straps", 14.99, "Padded lifting straps", "accessory", 40, 10, None, vendor_id),
                ("Weightlifting Belt", 69.99, "4-inch leather belt", "accessory", 10, 2, None, vendor_id),
                ("Shaker Bottle 700ml", 12.99, "Leak-proof shaker bottle", "accessory", 60, 12, None, vendor_id),
                ("Workout Logbook", 9.99, "12-week training logbook", "accessory", 80, 15, None, vendor_id),
            ]

            cursor.executemany(
                """INSERT OR IGNORE INTO products
                (name, price, description, category, stock, low_stock_threshold, image_url, vendor_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                products,
            )


            # --------------------------
            # Seed Reviews
            # --------------------------
            reviews = [
                (1, customer_id, 5, "Excellent yoga mat!"),
                (2, customer_id, 4, "Great dumbbells."),
            ]
            cursor.executemany(
                "INSERT OR IGNORE INTO reviews (product_id,user_id,rating,comment) VALUES (?,?,?,?)",
                reviews
            )

            # --------------------------
            # Seed 1 Cart Item
            # --------------------------
            cursor.execute(
                "INSERT OR IGNORE INTO cart_items (user_id,product_id,quantity) VALUES (?,?,?)",
                (customer_id, 4, 1)
            )

            print("✅ Database initialized successfully!")
            print(f"   Path: {DB_PATH}")
            print("   Users, products, and reviews seeded.")

    except sqlite3.Error as e:
        print(f"❌ Database initialization error: {e}")


if __name__ == "__main__":
    init_database()
