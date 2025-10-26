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

from flask import Blueprint, jsonify, request
from db_utils import get_db, rows_to_dicts

# Create the blueprint that groups all product routes
products_bp = Blueprint("products_bp", __name__)


# --------------------------------------------------------------------------
# GET /api/health
# --------------------------------------------------------------------------
@products_bp.route("/health", methods=["GET"])
def health():
    """
    Simple health check endpoint.
    Confirms that the app can connect to the database and read from 'products'.
    """
    conn = get_db()
    try:
        result = conn.execute("SELECT COUNT(*) AS count FROM products").fetchone()
        count = result["count"]
        return jsonify({"status": "ok", "product_count": count}), 200
    except Exception as e:
        # Catch DB connection or query errors
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()


# --------------------------------------------------------------------------
# GET /api/products
# --------------------------------------------------------------------------
@products_bp.route("/products", methods=["GET"])
def list_products():
    """
    Retrieve all products from the database.
    Returns:
        JSON: { "items": [ {id, name, price, image_url, tags}, ... ] }
    """
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT id, name, price, image_url, tags FROM products"
        ).fetchall()
        return jsonify({"items": rows_to_dicts(rows)}), 200
    finally:
        conn.close()


# --------------------------------------------------------------------------
# GET /api/products/<id>
# --------------------------------------------------------------------------
@products_bp.route("/products/<int:pid>", methods=["GET"])
def get_product(pid: int):
    """
    Retrieve a single product by its ID.
    Returns 404 if no product exists with that ID.
    """
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT id, name, price, image_url, tags FROM products WHERE id = ?",
            (pid,),
        ).fetchone()

        if not row:
            return jsonify({"error": "Product not found"}), 404
        return jsonify(dict(row)), 200
    finally:
        conn.close()


# --------------------------------------------------------------------------
# Product management routes (for vendors)
# --------------------------------------------------------------------------
@products_bp.route("/products", methods=["POST"])
def create_product():
    """
    Create a new product (for vendors).
    """
    data = request.get_json(silent=True)
    if not data or "name" not in data or "price" not in data:
        return jsonify({"error": "Name and price are required"}), 400

    name = data.get("name", "").strip()
    price = data.get("price")
    image_url = data.get("image_url", "")
    tags = data.get("tags", "")

    if not name:
        return jsonify({"error": "Product name is required"}), 400
    
    try:
        price = float(price)
        if price < 0:
            return jsonify({"error": "Price must be non-negative"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid price format"}), 400

    conn = get_db()
    try:
        with conn:
            cursor = conn.execute(
                "INSERT INTO products (name, price, image_url, tags) VALUES (?, ?, ?, ?)",
                (name, price, image_url, tags)
            )
            product_id = cursor.lastrowid
        
        # Return the created product
        product = conn.execute(
            "SELECT id, name, price, image_url, tags FROM products WHERE id = ?",
            (product_id,)
        ).fetchone()
        
        return jsonify(dict(product)), 201
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        conn.close()


@products_bp.route("/products/<int:pid>", methods=["PUT"])
def update_product(pid: int):
    """
    Update an existing product (for vendors).
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    conn = get_db()
    try:
        # Check if product exists
        existing = conn.execute(
            "SELECT id FROM products WHERE id = ?", (pid,)
        ).fetchone()
        
        if not existing:
            return jsonify({"error": "Product not found"}), 404

        # Build update query dynamically based on provided fields
        updates = []
        values = []
        
        if "name" in data:
            name = data["name"].strip()
            if not name:
                return jsonify({"error": "Product name cannot be empty"}), 400
            updates.append("name = ?")
            values.append(name)
        
        if "price" in data:
            try:
                price = float(data["price"])
                if price < 0:
                    return jsonify({"error": "Price must be non-negative"}), 400
                updates.append("price = ?")
                values.append(price)
            except (ValueError, TypeError):
                return jsonify({"error": "Invalid price format"}), 400
        
        if "image_url" in data:
            updates.append("image_url = ?")
            values.append(data["image_url"])
        
        if "tags" in data:
            updates.append("tags = ?")
            values.append(data["tags"])
        
        if not updates:
            return jsonify({"error": "No valid fields to update"}), 400
        
        values.append(pid)
        
        with conn:
            conn.execute(
                f"UPDATE products SET {', '.join(updates)} WHERE id = ?",
                values
            )
        
        # Return updated product
        updated_product = conn.execute(
            "SELECT id, name, price, image_url, tags FROM products WHERE id = ?",
            (pid,)
        ).fetchone()
        
        return jsonify(dict(updated_product)), 200
        
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        conn.close()


@products_bp.route("/products/<int:pid>", methods=["DELETE"])
def delete_product(pid: int):
    """
    Delete a product (for vendors/admins).
    """
    conn = get_db()
    try:
        # Check if product exists
        existing = conn.execute(
            "SELECT id, name FROM products WHERE id = ?", (pid,)
        ).fetchone()
        
        if not existing:
            return jsonify({"error": "Product not found"}), 404
        
        with conn:
            conn.execute("DELETE FROM products WHERE id = ?", (pid,))
        
        return jsonify({
            "message": f"Product '{existing['name']}' deleted successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        conn.close()
