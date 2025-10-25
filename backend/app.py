from flask import Flask, jsonify
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app) ### Enable CORS for all routes CHANGE IN PRODUCTION

    # Import and register blueprints
    from backend.routes.auth import auth_bp
    from backend.routes.products import products_bp

    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(products_bp, url_prefix="/api")

    @app.route("/")
    def home():
        return {"message": "Fitness Marketplace API is running"}


    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Bad request"}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app





if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
