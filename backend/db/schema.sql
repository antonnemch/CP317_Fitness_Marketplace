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

-- Seed sample users
-- Password hashes: admin123, vendor123, customer123 (generated with werkzeug)
INSERT OR IGNORE INTO users (id, email, password_hash, role, status) VALUES
(1, 'admin@example.com', 'pbkdf2:sha256:1000000$LJcClb5KSVS6Uy6P$3eab78fda605f9912a5df264ac4c56a18c762554d33ad32a4df281a4f2fa8d87', 'admin', 'active'),
(2, 'vendor@example.com', 'pbkdf2:sha256:1000000$TbxT0H5cRomsg80P$b4261315f964f72f5f06e3097ee502d4a1c6d49026c12805a1ac5146c5b0d22e', 'vendor', 'active'),
(3, 'customer@example.com', 'pbkdf2:sha256:1000000$J7QeHqGHrNeq0VSQ$3bea0e89cae99787e251882d2e49eb99971c3795d1d38d1cb99d93377f178d0a', 'customer', 'active');

-- Seed starter products (vendor_id=2 is the test vendor)
INSERT OR IGNORE INTO products (id, name, price, description, category, stock, vendor_id, is_active) VALUES
(1, 'Resistance Band Set', 24.99, 'Premium elastic resistance bands for strength training', 'equipment', 50, 2, 1),
(2, 'Protein Powder (1kg)', 39.99, 'Whey protein powder for muscle recovery', 'supplement', 30, 2, 1),
(3, 'Yoga Mat', 19.99, 'Non-slip yoga mat for pilates and stretching', 'equipment', 25, 2, 1),
(4, 'Creatine Monohydrate', 29.99, 'Pure creatine supplement for performance', 'supplement', 40, 2, 1);
