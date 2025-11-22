# backend/routes/orders.py

from flask import Blueprint, request, jsonify
from backend.db_utils import get_db
from backend.models import get_current_user

orders_bp = Blueprint("orders", __name__)


def row_to_order(row, items):
    """Convert an order row + its items into a JSON-serializable dict."""
    return {
        "id": row["id"],
        "user_id": row["user_id"],          # matches schema
        "status": row["status"],
        "total_amount": row["total_amount"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
        "items": items,
    }


@orders_bp.route("/orders", methods=["POST"])
def create_order():
    """
    Create a new order from a list of items:

    {
      "items": [
        {"product_id": 1, "quantity": 2},
        {"product_id": 3, "quantity": 1}
      ]
    }
    """
    db = get_db()
    payload = request.get_json() or {}
    items = payload.get("items") or []

    if not items:
        return jsonify({"error": "No items provided"}), 400

    user = get_current_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401

    # Fetch current product data for price + stock checks
    product_ids = [i.get("product_id") for i in items]
    if not all(product_ids):
        return jsonify({"error": "Invalid product IDs"}), 400

    placeholders = ",".join("?" for _ in product_ids)
    cur = db.execute(
        f"SELECT id, name, price, stock FROM products WHERE id IN ({placeholders})",
        product_ids,
    )
    product_rows = {row["id"]: row for row in cur.fetchall()}

    order_items_to_insert = []
    total_amount = 0.0

    for item in items:
        pid = item.get("product_id")
        qty = int(item.get("quantity", 0))

        if qty <= 0 or pid not in product_rows:
            return jsonify({"error": f"Invalid item {item}"}), 400

        product = product_rows[pid]
        if product["stock"] < qty:
            return jsonify(
                {"error": f"Insufficient stock for product {product['name']}"}
            ), 400

        price = float(product["price"])
        line_total = price * qty
        total_amount += line_total

        order_items_to_insert.append((pid, qty, price))

    # Create order: IMPORTANT -> total_amount is NOT NULL, status must match CHECK
    cur = db.execute(
        "INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)",
        (user["id"], total_amount, "placed"),  # status in lowercase to match CHECK
    )
    order_id = cur.lastrowid

    # Insert order_items and update product stock
    for pid, qty, price_at_purchase in order_items_to_insert:
        db.execute(
            """
            INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
            VALUES (?, ?, ?, ?)
            """,
            (order_id, pid, qty, price_at_purchase),
        )
        db.execute(
            "UPDATE products SET stock = stock - ? WHERE id = ?",
            (qty, pid),
        )

    db.commit()

    # Fetch the created order
    cur = db.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    order_row = cur.fetchone()

    # Fetch its items
    cur = db.execute(
        """
        SELECT oi.id, oi.product_id, oi.quantity, oi.price_at_purchase, p.name
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ?
        """,
        (order_id,),
    )
    item_rows = [
        {
            "id": r["id"],
            "product_id": r["product_id"],
            "quantity": r["quantity"],
            "price": r["price_at_purchase"],
            "name": r["name"],
        }
        for r in cur.fetchall()
    ]

    return jsonify({"order": row_to_order(order_row, item_rows)}), 201


@orders_bp.route("/orders", methods=["GET"])
def list_orders():
    """List all orders for the current user."""
    db = get_db()
    user = get_current_user()
    if not user:
        return jsonify({"error": "Authentication required"}), 401

    cur = db.execute(
        "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
        (user["id"],),
    )
    order_rows = cur.fetchall()

    if not order_rows:
        return jsonify({"items": []})

    order_ids = [r["id"] for r in order_rows]
    placeholders = ",".join("?" for _ in order_ids)

    cur = db.execute(
        f"""
        SELECT oi.*, p.name
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id IN ({placeholders})
        """,
        order_ids,
    )

    items_by_order = {oid: [] for oid in order_ids}
    for r in cur.fetchall():
        items_by_order[r["order_id"]].append(
            {
                "id": r["id"],
                "product_id": r["product_id"],
                "quantity": r["quantity"],
                "price": r["price_at_purchase"],
                "name": r["name"],
            }
        )

    orders = [
        row_to_order(row, items_by_order.get(row["id"], []))
        for row in order_rows
    ]
    return jsonify({"items": orders})
