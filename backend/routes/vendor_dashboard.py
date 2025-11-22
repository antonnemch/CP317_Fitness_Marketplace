# backend/routes/vendor_dashboard.py

from flask import Blueprint, jsonify, request
from backend.db_utils import get_db
from backend.models import get_current_vendor

vendor_bp = Blueprint("vendor", __name__)


def _row_to_vendor_product(row):
    stock = row["stock"] if row["stock"] is not None else 0
    threshold = (
        row["low_stock_threshold"]
        if row["low_stock_threshold"] is not None
        else 0
    )
    is_low = stock <= threshold and threshold > 0

    return {
        "id": row["id"],
        "name": row["name"],
        "price": float(row["price"]),
        "stock": stock,
        "low_stock_threshold": threshold,
        "category": row["category"],
        "is_active": bool(row["is_active"]),
        "avg_rating": float(row["avg_rating"] or 0.0),
        "review_count": int(row["review_count"] or 0),
        "on_order_qty": int(row["on_order_qty"] or 0),
        "is_low_stock": is_low,
    }


@vendor_bp.route("/vendor/overview", methods=["GET"])
def vendor_overview():
    """Return products + summary stats for the current vendor."""
    vendor = get_current_vendor()
    if not vendor:
        return jsonify({"error": "Vendor authentication required"}), 401

    db = get_db()

    sql = """
        SELECT
            p.id,
            p.name,
            p.price,
            p.stock,
            p.low_stock_threshold,
            p.category,
            p.is_active,
            COALESCE(r.avg_rating, 0)    AS avg_rating,
            COALESCE(r.review_count, 0)  AS review_count,
            COALESCE(o.on_order_qty, 0)  AS on_order_qty
        FROM products p
        LEFT JOIN (
            SELECT
                product_id,
                AVG(rating)   AS avg_rating,
                COUNT(*)      AS review_count
            FROM reviews
            GROUP BY product_id
        ) r ON r.product_id = p.id
        LEFT JOIN (
            SELECT
                oi.product_id,
                SUM(oi.quantity) AS on_order_qty
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE o.status IN ('placed', 'processing', 'shipped')
            GROUP BY oi.product_id
        ) o ON o.product_id = p.id
        WHERE p.vendor_id = ?
        ORDER BY p.created_at DESC
    """

    cur = db.execute(sql, (vendor["id"],))
    rows = cur.fetchall()

    products = []
    low_stock_count = 0
    on_order_total = 0

    for row in rows:
        prod = _row_to_vendor_product(row)
        products.append(prod)
        if prod["is_low_stock"]:
            low_stock_count += 1
        on_order_total += prod["on_order_qty"]

    return jsonify(
        {
            "vendor": {
                "id": vendor["id"],
                "email": vendor["email"],
            },
            "products": products,
            "summary": {
                "total_products": len(products),
                "low_stock_count": low_stock_count,
                "on_order_total": on_order_total,
            },
        }
    )


@vendor_bp.route("/vendor/products", methods=["POST"])
def create_vendor_product():
    """Create a new product for the current vendor (VR-1)."""
    vendor = get_current_vendor()
    if not vendor:
        return jsonify({"error": "Vendor authentication required"}), 401

    data = request.get_json() or {}

    name = (data.get("name") or "").strip()
    price = data.get("price")
    description = (data.get("description") or "").strip() or None
    category = (data.get("category") or "").strip() or None
    stock = data.get("stock", 0)
    low_stock_threshold = data.get("low_stock_threshold", 10)
    image_url = (data.get("image_url") or "").strip() or None

    if not name or price is None:
        return jsonify({"error": "name and price are required"}), 400

    try:
        price = float(price)
        stock = int(stock)
        low_stock_threshold = int(low_stock_threshold)
    except (TypeError, ValueError):
        return jsonify(
            {"error": "price, stock, and low_stock_threshold must be numeric"}
        ), 400

    db = get_db()
    cur = db.execute(
        """
        INSERT INTO products
            (name, price, description, category, stock,
             low_stock_threshold, image_url, vendor_id, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        """,
        (
            name,
            price,
            description,
            category,
            stock,
            low_stock_threshold,
            image_url,
            vendor["id"],
        ),
    )
    product_id = cur.lastrowid
    db.commit()

    # Fetch fresh row (without joins) and adapt to the frontend shape
    cur = db.execute(
        """
        SELECT
            id,
            name,
            price,
            stock,
            low_stock_threshold,
            category,
            is_active,
            0 AS avg_rating,
            0 AS review_count,
            0 AS on_order_qty
        FROM products
        WHERE id = ? AND vendor_id = ?
        """,
        (product_id, vendor["id"]),
    )
    row = cur.fetchone()
    product = _row_to_vendor_product(row)

    return jsonify({"product": product}), 201


@vendor_bp.route("/vendor/products/<int:product_id>", methods=["PUT"])
def update_vendor_product(product_id: int):
    """
    Update stock / low_stock_threshold / basic fields for a vendor product.
    For Sprint 3 we focus on stock + low-stock threshold.
    """
    vendor = get_current_vendor()
    if not vendor:
        return jsonify({"error": "Vendor authentication required"}), 401

    data = request.get_json() or {}
    fields = []
    values = []

    # Support updating a small set of fields
    numeric_int_fields = ("stock", "low_stock_threshold")
    allowed_fields = ("name", "price", "description", "category") + numeric_int_fields

    for key in allowed_fields:
        if key in data:
            if key in numeric_int_fields:
                try:
                    values.append(int(data[key]))
                except (TypeError, ValueError):
                    return jsonify(
                        {"error": f"{key} must be an integer"}
                    ), 400
            elif key == "price":
                try:
                    values.append(float(data[key]))
                except (TypeError, ValueError):
                    return jsonify(
                        {"error": "price must be numeric"}
                    ), 400
            else:
                values.append(data[key])
            fields.append(f"{key} = ?")

    if not fields:
        return jsonify({"error": "No updatable fields provided"}), 400

    values.extend([product_id, vendor["id"]])

    db = get_db()
    cur = db.execute(
        f"""
        UPDATE products
        SET {", ".join(fields)}
        WHERE id = ? AND vendor_id = ?
        """,
        values,
    )

    if cur.rowcount == 0:
        return jsonify({"error": "Product not found for this vendor"}), 404

    db.commit()

    # Return updated row with metrics
    cur = db.execute(
        """
        SELECT
            p.id,
            p.name,
            p.price,
            p.stock,
            p.low_stock_threshold,
            p.category,
            p.is_active,
            COALESCE(r.avg_rating, 0)    AS avg_rating,
            COALESCE(r.review_count, 0)  AS review_count,
            COALESCE(o.on_order_qty, 0)  AS on_order_qty
        FROM products p
        LEFT JOIN (
            SELECT product_id, AVG(rating) AS avg_rating, COUNT(*) AS review_count
            FROM reviews
            GROUP BY product_id
        ) r ON r.product_id = p.id
        LEFT JOIN (
            SELECT oi.product_id, SUM(oi.quantity) AS on_order_qty
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE o.status IN ('placed', 'processing', 'shipped')
            GROUP BY oi.product_id
        ) o ON o.product_id = p.id
        WHERE p.id = ? AND p.vendor_id = ?
        """,
        (product_id, vendor["id"]),
    )
    row = cur.fetchone()
    product = _row_to_vendor_product(row)

    return jsonify({"product": product})
