"""
wishlist.py
------------
API routes for managing the user's wishlist (CR-2).
"""
from flask import Blueprint, jsonify, g, request
import sqlite3
from ..security import login_required
from ..db_utils import rows_to_dicts, get_db

wishlist_bp = Blueprint("wishlist_bp", __name__)

# --- GET /api/wishlist (CR-2) ---
@wishlist_bp.route("/wishlist", methods=["GET"])
@login_required
def get_user_wishlist():
    user_id = g.user["id"]
    conn = g.db
    
    try:
        query = """
            SELECT p.id, p.name, p.price, p.image_url, p.description, p.stock, w.added_at
            FROM wishlist w
            JOIN products p ON w.product_id = p.id
            WHERE w.user_id = ? AND p.is_active = 1
            ORDER BY w.added_at DESC
        """
        rows = conn.execute(query, (user_id,)).fetchall()
        
        return jsonify({"items": rows_to_dicts(rows)}), 200
        
    except sqlite3.Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

# --- POST /api/wishlist/<id> (CR-2) ---
@wishlist_bp.route("/wishlist/<int:product_id>", methods=["POST"])
@login_required
def add_to_wishlist(product_id: int):
    user_id = g.user["id"]
    conn = g.db
    
    try:
        product = conn.execute("SELECT id FROM products WHERE id = ? AND is_active = 1", (product_id,)).fetchone()
        if not product: return jsonify({"error": "Product not found"}), 404

        conn.execute(
            """INSERT OR IGNORE INTO wishlist (user_id, product_id)
            VALUES (?, ?)""",
            (user_id, product_id)
        )
        conn.commit()
        
        return jsonify({"message": "Product added to wishlist"}), 201
        
    except sqlite3.Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

# --- DELETE /api/wishlist/<id> (CR-2) ---
@wishlist_bp.route("/wishlist/<int:product_id>", methods=["DELETE"])
@login_required
def remove_from_wishlist(product_id: int):
    user_id = g.user["id"]
    conn = g.db
    
    try:
        cursor = conn.execute(
            """DELETE FROM wishlist
            WHERE user_id = ? AND product_id = ?""",
            (user_id, product_id)
        )
        conn.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"error": "Item not found in your wishlist"}), 404
        
        return jsonify({"message": "Product removed from wishlist"}), 200
        
    except sqlite3.Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500