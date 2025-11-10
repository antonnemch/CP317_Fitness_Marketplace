
"""
app.py
------
The application factory for the Fitness Marketplace API.
"""
from flask import Flask, jsonify, g
from flask_cors import CORS
import sqlite3
import os
from .db_utils import close_db

def create_app(test_config=None):
    """Application factory function."""
    app = Flask(__name__, instance_relative_config=True)
    
    # 1. Configuration
    app.config.from_mapping(
        SECRET_KEY='dev', 
        DATABASE=os.path.join(app.root_path, 'db', 'fitness.db'),
    )
    
    if test_config:
        app.config.from_mapping(test_config)
        
    # 2. CORS and Context Setup
    CORS(app) 
    app.teardown_appcontext(close_db) # CRITICAL: Close DB connection after each request

    # 3. Import and Register Blueprints (Routes)
    from .routes.admin import admin_bp
    from .routes.auth import auth_bp
    from .routes.orders import orders_bp
    from .routes.products import products_bp
    from .routes.wishlist import wishlist_bp
    from .routes.vendor_dashboard import vendor_bp
    
    app.register_blueprint(admin_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(orders_bp, url_prefix="/api")
    app.register_blueprint(products_bp, url_prefix="/api")
    app.register_blueprint(wishlist_bp, url_prefix="/api")
    app.register_blueprint(vendor_bp, url_prefix="/api")

    # 4. Root Route and Error Handlers
    @app.route("/")
    def home():
        return jsonify({
            "message": "Welcome to the Fitness Marketplace API",
            "version": "1.0-Sprint2"
        }), 200

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

