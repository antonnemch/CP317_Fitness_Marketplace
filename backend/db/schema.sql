CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'customer'
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    image_url TEXT,
    tags TEXT
);

-- Seed a few starter products
INSERT INTO products (name, price, image_url, tags) VALUES
('Resistance Band Set', 24.99, '', 'equipment'),
('Protein Powder (1kg)', 39.99, '', 'supplement'),
('Yoga Mat', 19.99, '', 'equipment'),
('Creatine Monohydrate', 29.99, '', 'supplement');

-- Seed sample users
-- Password hashes here are placeholders

INSERT INTO users (email, password_hash, role) VALUES
('admin@example.com', 'hashed_admin_pw', 'admin'),
('vendor@example.com', 'hashed_vendor_pw', 'vendor'),
('customer@example.com', 'hashed_customer_pw', 'customer');
