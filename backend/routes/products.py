"""
products.py
------------
Product-related API routes for the Fitness Marketplace.

Implemented for Sprint 1:
- GET /api/health      → check DB connectivity + product count
- GET /api/products    → return all products
- GET /api/products/<id> → return one product
- POST/PUT/DELETE stubs → exist but return 501 (not implemented)

Later sprints will add vendor-only create/update/delete routes.
"""

# from flask import Blueprint, jsonify, request
# from ..db_utils import get_db, rows_to_dicts

# # Create the blueprint that groups all product routes
# products_bp = Blueprint("products_bp", __name__)


# # --------------------------------------------------------------------------
# # GET /api/health
# # --------------------------------------------------------------------------
# @products_bp.route("/health", methods=["GET"])
# def health():
#     """
#     Simple health check endpoint.
#     Confirms that the app can connect to the database and read from 'products'.
#     """
#     conn = get_db()
#     try:
#         result = conn.execute("SELECT COUNT(*) AS count FROM products").fetchone()
#         count = result["count"]
#         return jsonify({"status": "ok", "product_count": count}), 200
#     except Exception as e:
#         # Catch DB connection or query errors
#         return jsonify({"status": "error", "message": str(e)}), 500
#     finally:
#         conn.close()


# # --------------------------------------------------------------------------
# # GET /api/products
# # --------------------------------------------------------------------------
# @products_bp.route("/products", methods=["GET"])
# def list_products():
#     """
#     Retrieve all products from the database.
#     Returns:
#         JSON: { "items": [ {id, name, price, image_url, tags}, ... ] }
#     """
#     conn = get_db()
#     try:
#         rows = conn.execute(
#             "SELECT id, name, price, image_url, tags FROM products"
#         ).fetchall()
#         return jsonify({"items": rows_to_dicts(rows)}), 200
#     finally:
#         conn.close()


# # --------------------------------------------------------------------------
# # GET /api/products/<id>
# # --------------------------------------------------------------------------
# @products_bp.route("/products/<int:pid>", methods=["GET"])
# def get_product(pid: int):
#     """
#     Retrieve a single product by its ID.
#     Returns 404 if no product exists with that ID.
#     """
#     conn = get_db()
#     try:
#         row = conn.execute(
#             "SELECT id, name, price, image_url, tags FROM products WHERE id = ?",
#             (pid,),
#         ).fetchone()

#         if not row:
#             return jsonify({"error": "Product not found"}), 404
#         return jsonify(dict(row)), 200
#     finally:
#         conn.close()


# # --------------------------------------------------------------------------
# # Product management routes (for vendors)
# # --------------------------------------------------------------------------
# @products_bp.route("/products", methods=["POST"])
# def create_product():
#     """
#     Create a new product (for vendors).
#     """
#     data = request.get_json(silent=True)
#     if not data or "name" not in data or "price" not in data:
#         return jsonify({"error": "Name and price are required"}), 400

#     name = data.get("name", "").strip()
#     price = data.get("price")
#     image_url = data.get("image_url", "")
#     tags = data.get("tags", "")

#     if not name:
#         return jsonify({"error": "Product name is required"}), 400
    
#     try:
#         price = float(price)
#         if price < 0:
#             return jsonify({"error": "Price must be non-negative"}), 400
#     except (ValueError, TypeError):
#         return jsonify({"error": "Invalid price format"}), 400

#     conn = get_db()
#     try:
#         with conn:
#             cursor = conn.execute(
#                 "INSERT INTO products (name, price, image_url, tags) VALUES (?, ?, ?, ?)",
#                 (name, price, image_url, tags)
#             )
#             product_id = cursor.lastrowid
        
#         # Return the created product
#         product = conn.execute(
#             "SELECT id, name, price, image_url, tags FROM products WHERE id = ?",
#             (product_id,)
#         ).fetchone()
        
#         return jsonify(dict(product)), 201
#     except Exception as e:
#         return jsonify({"error": f"Database error: {str(e)}"}), 500
#     finally:
#         conn.close()


# @products_bp.route("/products/<int:pid>", methods=["PUT"])
# def update_product(pid: int):
#     """
#     Update an existing product (for vendors).
#     """
#     data = request.get_json(silent=True)
#     if not data:
#         return jsonify({"error": "Request body is required"}), 400

#     conn = get_db()
#     try:
#         # Check if product exists
#         existing = conn.execute(
#             "SELECT id FROM products WHERE id = ?", (pid,)
#         ).fetchone()
        
#         if not existing:
#             return jsonify({"error": "Product not found"}), 404

#         # Build update query dynamically based on provided fields
#         updates = []
#         values = []
        
#         if "name" in data:
#             name = data["name"].strip()
#             if not name:
#                 return jsonify({"error": "Product name cannot be empty"}), 400
#             updates.append("name = ?")
#             values.append(name)
        
#         if "price" in data:
#             try:
#                 price = float(data["price"])
#                 if price < 0:
#                     return jsonify({"error": "Price must be non-negative"}), 400
#                 updates.append("price = ?")
#                 values.append(price)
#             except (ValueError, TypeError):
#                 return jsonify({"error": "Invalid price format"}), 400
        
#         if "image_url" in data:
#             updates.append("image_url = ?")
#             values.append(data["image_url"])
        
#         if "tags" in data:
#             updates.append("tags = ?")
#             values.append(data["tags"])
        
#         if not updates:
#             return jsonify({"error": "No valid fields to update"}), 400
        
#         values.append(pid)
        
#         with conn:
#             conn.execute(
#                 f"UPDATE products SET {', '.join(updates)} WHERE id = ?",
#                 values
#             )
        
#         # Return updated product
#         updated_product = conn.execute(
#             "SELECT id, name, price, image_url, tags FROM products WHERE id = ?",
#             (pid,)
#         ).fetchone()
        
#         return jsonify(dict(updated_product)), 200
        
#     except Exception as e:
#         return jsonify({"error": f"Database error: {str(e)}"}), 500
#     finally:
#         conn.close()


# @products_bp.route("/products/<int:pid>", methods=["DELETE"])
# def delete_product(pid: int):
#     """
#     Delete a product (for vendors/admins).
#     """
#     conn = get_db()
#     try:
#         # Check if product exists
#         existing = conn.execute(
#             "SELECT id, name FROM products WHERE id = ?", (pid,)
#         ).fetchone()
        
#         if not existing:
#             return jsonify({"error": "Product not found"}), 404
        
#         with conn:
#             conn.execute("DELETE FROM products WHERE id = ?", (pid,))
        
#         return jsonify({
#             "message": f"Product '{existing['name']}' deleted successfully"
#         }), 200
        
#     except Exception as e:
#         return jsonify({"error": f"Database error: {str(e)}"}), 500
#     finally:
#         conn.close()

#### ----------------------------------------------------------------------------------------------

# """
# products.py - Complete product management with inventory
# """
# from flask import Blueprint, request, jsonify
# import sqlite3
# from ..db_utils import get_db, rows_to_dicts

# products_bp = Blueprint("products", __name__)


# @products_bp.route("/health", methods=["GET"])
# def health():
#     """Health check"""
#     conn = get_db()
#     try:
#         count = conn.execute("SELECT COUNT(*) as count FROM products").fetchone()["count"]
#         return jsonify({"status": "ok", "product_count": count}), 200
#     except sqlite3.Error as e:
#         return jsonify({"status": "error", "error": str(e)}), 500
#     finally:
#         conn.close()


# @products_bp.route("/products", methods=["GET"])
# def list_products():
#     """Get all products with filtering and search"""
#     category = request.args.get("category")
#     min_price = request.args.get("min_price", type=float)
#     max_price = request.args.get("max_price", type=float)
#     search = request.args.get("search", "")
#     in_stock_only = request.args.get("in_stock", type=bool)

#     conn = get_db()
#     try:
#         query = """
#             SELECT p.*, 
#                    COALESCE(AVG(r.rating), 0) as avg_rating,
#                    COUNT(r.id) as review_count
#             FROM products p
#             LEFT JOIN reviews r ON p.id = r.product_id
#             WHERE 1=1
#         """
#         params = []

#         if category:
#             query += " AND p.category = ?"
#             params.append(category)
        
#         if min_price is not None:
#             query += " AND p.price >= ?"
#             params.append(min_price)
        
#         if max_price is not None:
#             query += " AND p.price <= ?"
#             params.append(max_price)
        
#         if search:
#             query += " AND (p.name LIKE ? OR p.description LIKE ?)"
#             params.extend([f"%{search}%", f"%{search}%"])
        
#         if in_stock_only:
#             query += " AND p.stock > 0"
        
#         query += " GROUP BY p.id ORDER BY p.created_at DESC"

#         rows = conn.execute(query, params).fetchall()
#         products = rows_to_dicts(rows)
        
#         return jsonify({"items": products}), 200
#     except sqlite3.Error as e:
#         return jsonify({"error": str(e)}), 500
#     finally:
#         conn.close()


# @products_bp.route("/products/<int:product_id>", methods=["GET"])
# def get_product(product_id):
#     """Get single product with reviews"""
#     conn = get_db()
#     try:
#         product = conn.execute(
#             """
#             SELECT p.*, 
#                    COALESCE(AVG(r.rating), 0) as avg_rating,
#                    COUNT(r.id) as review_count
#             FROM products p
#             LEFT JOIN reviews r ON p.id = r.product_id
#             WHERE p.id = ?
#             GROUP BY p.id
#             """,
#             (product_id,)
#         ).fetchone()
        
#         if not product:
#             return jsonify({"error": "Product not found"}), 404
        
#         # Get reviews
#         reviews = conn.execute(
#             """
#             SELECT r.*, u.email as user_email
#             FROM reviews r
#             JOIN users u ON r.user_id = u.id
#             WHERE r.product_id = ?
#             ORDER BY r.created_at DESC
#             """,
#             (product_id,)
#         ).fetchall()
        
#         result = dict(product)
#         result["reviews"] = rows_to_dicts(reviews)
        
#         return jsonify(result), 200
#     except sqlite3.Error as e:
#         return jsonify({"error": str(e)}), 500
#     finally:
#         conn.close()


# @products_bp.route("/products", methods=["POST"])
# def create_product():
#     """Create new product"""
#     data = request.get_json()
#     name = data.get("name", "").strip()
#     price = data.get("price")
#     description = data.get("description", "").strip()
#     category = data.get("category", "").strip()
#     stock = data.get("stock", 0)
#     low_stock_threshold = data.get("low_stock_threshold", 10)
#     vendor_id = data.get("vendor_id", 2)  # Default to test vendor

#     if not name or price is None:
#         return jsonify({"error": "Name and price are required"}), 400

#     try:
#         price = float(price)
#         stock = int(stock)
#         low_stock_threshold = int(low_stock_threshold)
#     except (ValueError, TypeError):
#         return jsonify({"error": "Invalid data type"}), 400

#     conn = get_db()
#     try:
#         cursor = conn.execute(
#             """
#             INSERT INTO products 
#             (name, price, description, category, stock, low_stock_threshold, vendor_id)
#             VALUES (?, ?, ?, ?, ?, ?, ?)
#             """,
#             (name, price, description, category, stock, low_stock_threshold, vendor_id)
#         )
#         conn.commit()
        
#         new_product = conn.execute(
#             "SELECT * FROM products WHERE id = ?", (cursor.lastrowid,)
#         ).fetchone()
        
#         return jsonify(dict(new_product)), 201
#     except sqlite3.Error as e:
#         return jsonify({"error": str(e)}), 500
#     finally:
#         conn.close()


# @products_bp.route("/products/<int:product_id>", methods=["PUT"])
# def update_product(product_id):
#     """Update product with inventory tracking"""
#     data = request.get_json()
    
#     conn = get_db()
#     try:
#         existing = conn.execute(
#             "SELECT * FROM products WHERE id = ?", (product_id,)
#         ).fetchone()
        
#         if not existing:
#             return jsonify({"error": "Product not found"}), 404

#         updates = []
#         params = []
        
#         if "name" in data:
#             updates.append("name = ?")
#             params.append(data["name"])
        
#         if "price" in data:
#             updates.append("price = ?")
#             params.append(float(data["price"]))
        
#         if "description" in data:
#             updates.append("description = ?")
#             params.append(data["description"])
        
#         if "category" in data:
#             updates.append("category = ?")
#             params.append(data["category"])
        
#         if "stock" in data:
#             new_stock = int(data["stock"])
#             updates.append("stock = ?")
#             params.append(new_stock)
            
#             # Check if stock falls below threshold
#             threshold = existing["low_stock_threshold"]
#             if new_stock < threshold:
#                 # Create notification
#                 conn.execute(
#                     """
#                     INSERT INTO stock_notifications (product_id, vendor_id)
#                     VALUES (?, ?)
#                     """,
#                     (product_id, existing["vendor_id"])
#                 )
        
#         if "low_stock_threshold" in data:
#             updates.append("low_stock_threshold = ?")
#             params.append(int(data["low_stock_threshold"]))

#         if not updates:
#             return jsonify({"error": "No fields to update"}), 400

#         query = f"UPDATE products SET {', '.join(updates)} WHERE id = ?"
#         params.append(product_id)
        
#         conn.execute(query, params)
#         conn.commit()
        
#         updated_product = conn.execute(
#             "SELECT * FROM products WHERE id = ?", (product_id,)
#         ).fetchone()
        
#         return jsonify(dict(updated_product)), 200
#     except (ValueError, TypeError) as e:
#         return jsonify({"error": "Invalid data type"}), 400
#     except sqlite3.Error as e:
#         return jsonify({"error": str(e)}), 500
#     finally:
#         conn.close()


# @products_bp.route("/products/<int:product_id>", methods=["DELETE"])
# def delete_product(product_id):
#     """Delete product"""
#     conn = get_db()
#     try:
#         existing = conn.execute(
#             "SELECT * FROM products WHERE id = ?", (product_id,)
#         ).fetchone()
        
#         if not existing:
#             return jsonify({"error": "Product not found"}), 404

#         conn.execute("DELETE FROM products WHERE id = ?", (product_id,))
#         conn.commit()
        
#         return jsonify({"message": "Product deleted successfully"}), 200
#     except sqlite3.Error as e:
#         return jsonify({"error": str(e)}), 500
#     finally:
#         conn.close()


# @products_bp.route("/products/<int:product_id>/reviews", methods=["POST"])
# def add_review(product_id):
#     """Add product review"""
#     data = request.get_json()
#     user_id = data.get("user_id", 1)  # Should come from auth token
#     rating = data.get("rating")
#     comment = data.get("comment", "")

#     if not rating or rating < 1 or rating > 5:
#         return jsonify({"error": "Rating must be between 1 and 5"}), 400

#     conn = get_db()
#     try:
#         # Check if product exists
#         product = conn.execute(
#             "SELECT id FROM products WHERE id = ?", (product_id,)
#         ).fetchone()
        
#         if not product:
#             return jsonify({"error": "Product not found"}), 404

#         cursor = conn.execute(
#             """
#             INSERT INTO reviews (product_id, user_id, rating, comment)
#             VALUES (?, ?, ?, ?)
#             """,
#             (product_id, user_id, rating, comment)
#         )
#         conn.commit()
        
#         return jsonify({"message": "Review added successfully", "id": cursor.lastrowid}), 201
#     except sqlite3.Error as e:
#         return jsonify({"error": str(e)}), 500
#     finally:
#         conn.close()


# @products_bp.route("/categories", methods=["GET"])
# def get_categories():
#     """Get all product categories"""
#     conn = get_db()
#     try:
#         categories = conn.execute(
#             "SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category"
#         ).fetchall()
        
#         return jsonify({"categories": [c["category"] for c in categories]}), 200
#     finally:
#         conn.close()


# @products_bp.route("/products/low-stock", methods=["GET"])
# def low_stock_products():
#     """Get products below low stock threshold (vendor only)"""
#     vendor_id = request.args.get("vendor_id", type=int)
    
#     conn = get_db()
#     try:
#         query = """
#             SELECT * FROM products 
#             WHERE stock < low_stock_threshold
#         """
#         params = []
        
#         if vendor_id:
#             query += " AND vendor_id = ?"
#             params.append(vendor_id)
        
#         query += " ORDER BY stock ASC"
        
#         products = conn.execute(query, params).fetchall()
#         return jsonify({"items": rows_to_dicts(products)}), 200
#     finally:
#         conn.close()



"""
products.py
------------
Product CRUD, Listing, Filtering (T7), and Reviews (VR-3).
"""
from flask import Blueprint, request, jsonify, g
import sqlite3
from ..db_utils import get_db, rows_to_dicts
from ..secruity import vendor_required, login_required

products_bp = Blueprint("products", __name__)

# --- Helper to select core product fields ---
PRODUCT_FIELDS = "p.id, p.name, p.price, p.description, p.category, p.stock, p.low_stock_threshold, p.image_url, p.vendor_id, p.is_active, p.created_at"

# --- GET /api/products (Listing & Filtering - T7) ---
@products_bp.route("/products", methods=["GET"])
def list_products():
    conn = get_db()
    category = request.args.get("category")
    search = request.args.get("search", "")
    in_stock_only = request.args.get("in_stock", '').lower() == 'true'

    try:
        query = f"""
            SELECT {PRODUCT_FIELDS}, 
                    COALESCE(AVG(r.rating), 0) AS avg_rating,
                    COUNT(r.id) AS review_count
            FROM products p
            LEFT JOIN reviews r ON p.id = r.product_id
            WHERE p.is_active = 1 
        """
        params = []

        if category:
            query += " AND p.category = ?"
            params.append(category)
        
        if search:
            search_term = f"%{search}%"
            query += " AND (p.name LIKE ? OR p.description LIKE ?)"
            params.extend([search_term, search_term])
        
        if in_stock_only:
            query += " AND p.stock > 0"
        
        query += " GROUP BY p.id ORDER BY p.created_at DESC"

        rows = conn.execute(query, params).fetchall()
        return jsonify({"items": rows_to_dicts(rows)}), 200
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500

# --- GET /api/products/<id> (Detail & Reviews - VR-3) ---
@products_bp.route("/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    conn = get_db()
    try:
        product = conn.execute(
            f"""
            SELECT {PRODUCT_FIELDS}, 
                   COALESCE(AVG(r.rating), 0) AS avg_rating,
                   COUNT(r.id) AS review_count
            FROM products p
            LEFT JOIN reviews r ON p.id = r.product_id
            WHERE p.id = ? AND p.is_active = 1
            GROUP BY p.id
            """,
            (product_id,)
        ).fetchone()
        
        if not product:
            return jsonify({"error": "Product not found or inactive"}), 404
        
        reviews = conn.execute(
            """
            SELECT r.rating, r.comment, r.created_at, u.email AS user_email
            FROM reviews r JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC
            """,
            (product_id,)
        ).fetchall()
        
        result = dict(product)
        result["reviews"] = rows_to_dicts(reviews)
        return jsonify(result), 200
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500

# --- POST /api/products (Vendor Create - VR-1) ---
@products_bp.route("/products", methods=["POST"])
@vendor_required
def create_product():
    vendor_id = g.user["id"]
    data = request.get_json()
    name = data.get("name", "").strip()
    price = data.get("price")
    stock = data.get("stock", 0)

    if not name or price is None:
        return jsonify({"error": "Name and price are required"}), 400

    conn = get_db()
    try:
        cursor = conn.execute(
            """INSERT INTO products 
            (name, price, description, category, stock, low_stock_threshold, vendor_id, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (name, float(price), data.get("description"), data.get("category"), int(stock), data.get("low_stock_threshold", 10), vendor_id, data.get("image_url"))
        )
        conn.commit()
        
        new_product = conn.execute("SELECT * FROM products WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return jsonify(dict(new_product)), 201
    except Exception as e:
        return jsonify({"error": f"Error creating product: {str(e)}"}), 400

# --- PUT /api/products/<id> (Vendor Update/Inventory - VR-1, VR-5) ---
@products_bp.route("/products/<int:product_id>", methods=["PUT"])
@vendor_required
def update_product(product_id):
    vendor_id = g.user["id"]
    data = request.get_json()
    conn = get_db()
    
    try:
        existing = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
        if not existing:
            return jsonify({"error": "Product not found"}), 404
        # Ownership check
        if existing["vendor_id"] != vendor_id:
            return jsonify({"error": "Forbidden: Not the product owner"}), 403

        updates = []; params = []
        
        # Build query dynamically
        if "name" in data: updates.append("name = ?"); params.append(data["name"])
        if "price" in data: updates.append("price = ?"); params.append(float(data["price"]))
        
        if "stock" in data:
            new_stock = int(data["stock"])
            updates.append("stock = ?")
            params.append(new_stock)
            
            # VR-5 Low Stock Alert Logic
            threshold = existing["low_stock_threshold"]
            if new_stock < threshold and existing["stock"] >= threshold:
                conn.execute(
                    """INSERT OR IGNORE INTO stock_notifications (product_id, vendor_id, notified_at)
                    VALUES (?, ?, CURRENT_TIMESTAMP)""",
                    (product_id, vendor_id)
                )
        
        if not updates: return jsonify({"error": "No fields to update"}), 400

        query = f"UPDATE products SET {', '.join(updates)} WHERE id = ?"
        params.append(product_id)
        
        conn.execute(query, params)
        conn.commit()
        
        updated_product = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
        return jsonify(dict(updated_product)), 200
    except Exception as e:
        return jsonify({"error": f"Error updating product: {str(e)}"}), 400

# --- DELETE /api/products/<id> (Soft Delete - AD-3 / VR-1) ---
@products_bp.route("/products/<int:product_id>", methods=["DELETE"])
@vendor_required
def delete_product(product_id):
    # This should be a SOFT DELETE (AD-3, VR-1)
    conn = get_db()
    try:
        existing = conn.execute("SELECT id FROM products WHERE id = ?", (product_id,)).fetchone()
        if not existing: return jsonify({"error": "Product not found"}), 404
        
        # Soft delete: Set is_active to 0
        conn.execute("UPDATE products SET is_active = 0 WHERE id = ?", (product_id,))
        conn.commit()
        
        return jsonify({"message": "Product deactivated successfully"}), 200
    except sqlite3.Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

# --- POST /api/products/<id>/reviews (Add Review - VR-3) ---
@products_bp.route("/products/<int:product_id>/reviews", methods=["POST"])
@login_required
def add_review(product_id):
    user_id = g.user["id"]
    data = request.get_json()
    rating = data.get("rating")
    comment = data.get("comment", "")

    if not rating or not (1 <= rating <= 5):
        return jsonify({"error": "Rating must be between 1 and 5"}), 400

    conn = get_db()
    try:
        product = conn.execute("SELECT id FROM products WHERE id = ?", (product_id,)).fetchone()
        if not product: return jsonify({"error": "Product not found"}), 404

        cursor = conn.execute(
            """INSERT INTO reviews (product_id, user_id, rating, comment)
            VALUES (?, ?, ?, ?)""",
            (product_id, user_id, rating, comment)
        )
        conn.commit()
        return jsonify({"message": "Review added successfully", "id": cursor.lastrowid}), 201
    except sqlite3.Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500