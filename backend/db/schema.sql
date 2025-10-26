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
('admin@example.com', 'pbkdf2:sha256:1000000$LJcClb5KSVS6Uy6P$3eab78fda605f9912a5df264ac4c56a18c762554d33ad32a4df281a4f2fa8d87', 'admin'),
('vendor@example.com', 'pbkdf2:sha256:1000000$TbxT0H5cRomsg80P$b4261315f964f72f5f06e3097ee502d4a1c6d49026c12805a1ac5146c5b0d22e', 'vendor'),
('customer@example.com', 'pbkdf2:sha256:1000000$J7QeHqGHrNeq0VSQ$3bea0e89cae99787e251882d2e49eb99971c3795d1d38d1cb99d93377f178d0a', 'customer');
