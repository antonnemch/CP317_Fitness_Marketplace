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
from backend.db_utils import get_db, rows_to_dicts

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
# Stub routes (to satisfy sprint completeness)
# --------------------------------------------------------------------------
@products_bp.route("/products", methods=["POST"])
def create_product_stub():
    """
    Placeholder for future vendor product creation.
    """
    return jsonify({"message": "Not implemented"}), 501


@products_bp.route("/products/<int:pid>", methods=["PUT"])
def update_product_stub(pid: int):
    """
    Placeholder for future vendor product updates.
    """
    return jsonify({"message": "Not implemented"}), 501


@products_bp.route("/products/<int:pid>", methods=["DELETE"])
def delete_product_stub(pid: int):
    """
    Placeholder for future admin product deletion.
    """
    return jsonify({"message": "Not implemented"}), 501
