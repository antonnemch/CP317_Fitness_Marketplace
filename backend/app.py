
"""
app.py
------
The application factory for the Fitness Marketplace API.
"""
from flask import Flask, jsonify, g
from flask_cors import CORS
import sqlite3
import os
from pathlib import Path
from .db_utils import close_db, get_db

def create_app(test_config=None):
    """Application factory function."""
    app = Flask(__name__, instance_relative_config=True)
    
    # 1. Configuration
    app.config.from_mapping(
        SECRET_KEY='dev', 
        DATABASE=Path(app.root_path) / 'db' / 'fitness.db',
    )
    
    if test_config:
        app.config.from_mapping(test_config)
        
    # 2. CORS and Context Setup
    CORS(app) 
    app.teardown_appcontext(close_db) # CRITICAL: Close DB connection after each request

    # 2b. Initialize database schema on first run
    def init_db():
        """Initialize the database by running schema.sql if db doesn't exist."""
        db_path = app.config["DATABASE"]
        if not db_path.exists():  # Only run schema if database doesn't exist
            db_path.parent.mkdir(parents=True, exist_ok=True)
            with get_db() as conn:
                schema_path = db_path.parent / "schema.sql"
                if schema_path.exists():
                    with open(schema_path, 'r') as f:
                        conn.executescript(f.read())
                    conn.commit()
    
    with app.app_context():
        init_db()

    # 3. Import and Register Blueprints (Routes)
    # 3. Import and Register Blueprints (Routes)
    # Only import and register route modules that actually exist in the repo.
    # This prevents startup failures when branches are merged and some route
    # modules haven't been added yet.
    route_modules = [
        (".routes.admin", "admin_bp"),
        (".routes.auth", "auth_bp"),
        (".routes.orders", "orders_bp"),
        (".routes.products", "products_bp"),
        (".routes.wishlist", "wishlist_bp"),
        (".routes.vendor_dashboard", "vendor_bp"),
    ]

    for module_path, bp_name in route_modules:
        try:
            module = __import__(f"backend{module_path}", fromlist=[bp_name])
            bp = getattr(module, bp_name)
            app.register_blueprint(bp, url_prefix="/api")
        except ModuleNotFoundError:
            # Module is not present in this checkout/branch; skip it.
            print(f"[startup] optional route module not found: {module_path}, skipping.")
        except Exception as e:
            # Any other import error should be visible but shouldn't completely stop the app.
            print(f"[startup] error importing {module_path}: {e}")

    # 4. Root Route and Error Handlers
    @app.route("/")
    def home():
        return jsonify({
            "message": "Welcome to the Fitness Marketplace API",
            "version": "1.0-Sprint2"
        }), 200

    # Lightweight health endpoint used by the frontend to verify backend availability.
    @app.route("/api/health", methods=["GET"])
    def api_health():
        try:
            conn = get_db()
            row = conn.execute("SELECT COUNT(*) AS count FROM products").fetchone()
            count = row["count"] if row is not None else 0
            return jsonify({"status": "ok", "product_count": count}), 200
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"error": "Unauthorized. Please log in."}), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({"error": "Forbidden. Insufficient permissions."}), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(sqlite3.IntegrityError)
    def handle_integrity_error(e):
        return jsonify({"error": f"Database integrity violation: {e.args[0]}"}), 409
        
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
    

    # from flask import Flask, jsonify
# from flask_cors import CORS

# def create_app():
#     app = Flask(__name__)
#     CORS(app) ### Enable CORS for all routes CHANGE IN PRODUCTION

#     # Import and register blueprints
#     from .routes.auth import auth_bp
#     from .routes.products import products_bp

#     app.register_blueprint(auth_bp, url_prefix="/api")
#     app.register_blueprint(products_bp, url_prefix="/api")

#     @app.route("/")
#     def home():
#         return {"message": "Fitness Marketplace API is running"}


#     @app.errorhandler(400)
#     def bad_request(e):
#         return jsonify({"error": "Bad request"}), 400

#     @app.errorhandler(404)
#     def not_found(e):
#         return jsonify({"error": "Not found"}), 404

#     @app.errorhandler(500)
#     def server_error(e):
#         return jsonify({"error": "Internal server error"}), 500

#     return app





# if __name__ == "__main__":
#     app = create_app()
#     app.run(debug=True)

