"""
init_db.py
----------
Complete database initialization with all tables for Sprint 1 & 2.
"""
import sqlite3
import hashlib
from pathlib import Path
from datetime import datetime

# Define the absolute path for the database file
DB_PATH = Path(__file__).resolve().parent / "db" / "fitness.db"

# --- Security Helper (Placeholder for bcrypt in production) ---
def hash_password(password: str) -> str:
    """Hashes a password using SHA256 (for simple comparison)."""
    return hashlib.sha256(password.encode()).hexdigest()

# --- SQL Definitions ---
ALL_TABLES_SQL = """
-- USERS table (Authentication, Role Permissions, Account Suspension - AD-5)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('customer', 'vendor', 'admin')) DEFAULT 'customer',
    status TEXT NOT NULL CHECK(status IN ('active', 'suspended', 'pending')) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCTS table (VR-1 Inventory Management)
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    category TEXT,
    stock INTEGER DEFAULT 0 CHECK(stock >= 0),
    low_stock_threshold INTEGER DEFAULT 10, -- VR-5 Low stock Notifications
    image_url TEXT,
    vendor_id INTEGER NOT NULL,
    is_active INTEGER NOT NULL CHECK(is_active IN (0, 1)) DEFAULT 1, -- AD-3 Soft Delete
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES users(id)
);

-- REVIEWS table (VR-3)
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- WISHLIST table (CR-2)
CREATE TABLE IF NOT EXISTS wishlist (
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ORDERS table (CR-3 Order Tracking, CR-4 Secure Checkout)
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('placed', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'placed',
    tracking_id TEXT, -- CR-3/VR-2 Tracking
    shipping_carrier TEXT,
    estimated_delivery DATE,
    payment_status TEXT DEFAULT 'paid', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ORDER ITEMS table
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_purchase REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- SHOPPING CART table
CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    UNIQUE(user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- REPORTED PRODUCTS (AD-3 Admin Review Panel)
CREATE TABLE IF NOT EXISTS reported_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    reported_by INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'resolved')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (reported_by) REFERENCES users(id)
);

-- STOCK NOTIFICATIONS (VR-5 Low Stock)
CREATE TABLE IF NOT EXISTS stock_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    vendor_id INTEGER NOT NULL,
    notified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged INTEGER DEFAULT 0,
    UNIQUE(product_id, vendor_id, DATE(notified_at)), 
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (vendor_id) REFERENCES users(id)
);

-- SESSIONS table (T2)
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
"""

def init_database():
    """Create all tables and seed data."""
    
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    # Hashes generated for password 'vendor123' and 'admin123' and 'customer123'
    VENDOR_HASH = 'pbkdf2:sha256:600000$TbxT0H5cRomsg80P$b4261315f964f72f5f06e3097ee502d4a1c6d49026c12805a1ac5146c5b0d22e'
    ADMIN_HASH = 'pbkdf2:sha256:600000$LJcClb5KSVS6Uy6P$3eab78fda605f9912a5df264ac4c56a18c762554d33ad32a4df281a4f2fa8d87'
    CUSTOMER_HASH = 'pbkdf2:sha256:600000$J7QeHqGHrNeq0VSQ$3bea0e89cae99787e251882d2e49eb99971c3795d1d38d1cb99d93377f178d0a'

    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            
            # Execute all table creation SQL
            cursor.executescript(ALL_TABLES_SQL)
            
            # --- Seed Users ---
            test_users = [
                ("customer@example.com", CUSTOMER_HASH, "customer", "active"), # ID 1
                ("vendor@example.com", VENDOR_HASH, "vendor", "active"),       # ID 2
                ("admin@example.com", ADMIN_HASH, "admin", "active"),         # ID 3
            ]
            
            cursor.executemany(
                "INSERT OR IGNORE INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)",
                test_users
            )
            
            # Get Vendor ID
            vendor_id_result = cursor.execute(
                "SELECT id FROM users WHERE email = 'vendor@example.com'"
            ).fetchone()
            vendor_id = vendor_id_result[0] if vendor_id_result else 2 
            
            # Get Customer ID
            customer_id_result = cursor.execute(
                "SELECT id FROM users WHERE email = 'customer@example.com'"
            ).fetchone()
            customer_id = customer_id_result[0] if customer_id_result else 1

            # --- Seed Products ---
            test_products = [
                ("Yoga Mat", 29.99, "Premium non-slip yoga mat for all levels", "Equipment", 50, 10, None, vendor_id), # ID 1
                ("Dumbbells Set", 89.99, "Adjustable dumbbells 5-50 lbs", "Equipment", 30, 5, None, vendor_id),       # ID 2
                ("Protein Powder", 49.99, "Whey protein isolate 2lbs, chocolate flavor", "Supplements", 10, 20, None, vendor_id), # ID 3 (Will trigger low stock)
                ("Running Shoes", 129.99, "Professional running shoes", "Apparel", 2, 5, None, vendor_id),           # ID 4
            ]
            
            cursor.executemany(
                """INSERT OR IGNORE INTO products (name, price, description, category, stock, low_stock_threshold, image_url, vendor_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                test_products
            )
            
            # --- Seed Reviews (VR-3) ---
            test_reviews = [
                (1, customer_id, 5, "Excellent yoga mat!"),
                (2, customer_id, 4, "Great dumbbells, but a bit pricey."),
            ]
            
            cursor.executemany(
                "INSERT OR IGNORE INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)",
                test_reviews
            )

            # --- Seed Cart Item (CR-4 Setup) ---
            cursor.execute(
                "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)",
                (customer_id, 4, 1)
            )

            print(f"✅ Database initialized at {DB_PATH}")
            print(f"✅ Users (C:{customer_id}, V:{vendor_id}) and {len(test_products)} products seeded.")

    except sqlite3.Error as e:
        print(f"❌ Database initialization error: {e}")

if __name__ == "__main__":
    init_database()