-- Users table (T2, AD-2, AD-5)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'customer' CHECK(role IN ('customer', 'vendor', 'admin')),
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table (T2: Session-based auth)
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Products table (T7: Listing & Filtering, VR-1: Vendor Create/Update)
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    category TEXT,
    stock INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    image_url TEXT,
    vendor_id INTEGER,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(vendor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Reviews table (VR-3: Product Reviews & Ratings)
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Wishlist table (CR-2)
CREATE TABLE IF NOT EXISTS wishlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Stock Notifications table (VR-5: Low Stock Alert)
CREATE TABLE IF NOT EXISTS stock_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    vendor_id INTEGER NOT NULL,
    notified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, vendor_id),
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY(vendor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Orders placed by customers
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'PLACED',       -- PLACED, SHIPPED, DELIVERED, CANCELLED
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES users(id)
);

-- Line items per order
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);


-- Extra sample products for a more realistic catalog
INSERT INTO products (name, description, price, category, stock, low_stock_threshold, vendor_id, is_active)
VALUES
    -- Equipment
    ('Adjustable Dumbbell Set', 'Pair of adjustable dumbbells (2–24kg) with quick dial system.', 199.99, 'equipment', 12, 3, 2, 1),
    ('Kettlebell 16kg', 'Cast iron kettlebell with powder-coated grip.', 59.99, 'equipment', 20, 5, 2, 1),
    ('Pull-Up Bar', 'Doorway pull-up bar with multiple grip positions.', 39.99, 'equipment', 18, 4, 3, 1),
    ('Foam Roller', 'High-density foam roller for recovery and mobility.', 24.99, 'equipment', 30, 5, 3, 1),

    -- Apparel
    ('Compression Shirt', 'Moisture-wicking compression shirt, unisex sizing.', 34.99, 'apparel', 40, 8, 2, 1),
    ('Training Shorts', 'Lightweight training shorts with zip pockets.', 29.99, 'apparel', 35, 7, 2, 1),
    ('Gym Hoodie', 'Fleece-lined hoodie with minimalist branding.', 49.99, 'apparel', 25, 5, 3, 1),

    -- Supplements
    ('BCAA Powder', 'Branched-chain amino acids, citrus flavour, 300 g.', 26.99, 'supplement', 22, 5, 2, 1),
    ('Pre-Workout Formula', 'Caffeine and beta-alanine blend for energy and focus.', 39.49, 'supplement', 18, 4, 3, 1),
    ('Multivitamin Capsules', 'Daily multivitamin for active adults.', 21.99, 'supplement', 50, 10, 3, 1),

    -- Accessories
    ('Lifting Straps', 'Padded lifting straps to improve grip on heavy pulls.', 14.99, 'accessory', 40, 10, 2, 1),
    ('Weightlifting Belt', '4-inch leather belt for heavy squats and deadlifts.', 69.99, 'accessory', 10, 2, 3, 1),
    ('Shaker Bottle 700ml', 'Leak-proof shaker bottle with mixing ball.', 12.99, 'accessory', 60, 12, 2, 1),
    ('Workout Logbook', 'A5 training logbook with 12-week program layout.', 9.99, 'accessory', 80, 15, 3, 1)
ON CONFLICT DO NOTHING;


-- Demo users for Sprint 3
INSERT INTO users (id, name, email, password_hash, role, created_at)
VALUES
    (1, 'Demo Customer', 'demo@fitness.local', 'dummy-hash', 'customer', datetime('now')),
    (2, 'Demo Vendor',   'vendor@fitness.local', 'dummy-hash', 'vendor',   datetime('now'))
ON CONFLICT(id) DO NOTHING;