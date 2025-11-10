# """
# Authentication routes (register, login, etc.)

# This module defines a Flask "Blueprint" that groups all auth-related routes.
# The blueprint is registered by app.py with the URL prefix "/api", so the
# routes here become "/api/register", "/api/login", etc.
# """

# from flask import Blueprint, request, jsonify
# from werkzeug.security import generate_password_hash, check_password_hash
# import sqlite3
# from pathlib import Path

# # -----------------------------------------------------------------------------
# # Blueprint setup
# # -----------------------------------------------------------------------------
# # A Blueprint is a collection of routes that can be registered on the main app.
# # Using a blueprint keeps auth-related code separate from other features.
# auth_bp = Blueprint("auth_bp", __name__)

# # -----------------------------------------------------------------------------
# # Database path and helper
# # -----------------------------------------------------------------------------
# # Resolve the absolute path to backend/db/fitness.db relative to this file.
# # Path(...).parents[1] goes up from routes/ → backend/
# DB_PATH = Path(__file__).resolve().parents[1] / "db" / "fitness.db"

# def get_db() -> sqlite3.Connection:
#     """
#     Open a new SQLite connection to our database file.
#     - row_factory is set so we can access columns by name (row["email"]).
#     - Each handler should open a fresh connection and close it after use.
#       (SQLite is file-based; this is sufficient for our dev sprint.)
#     """
#     conn = sqlite3.connect(DB_PATH)
#     conn.row_factory = sqlite3.Row
#     return conn

# # -----------------------------------------------------------------------------
# # /api/register
# # -----------------------------------------------------------------------------
# @auth_bp.route("/register", methods=["POST"])
# def register():
#     """
#     Create a new user account.

#     Request (JSON):
#       {
#         "email": "user@example.com",
#         "password": "plain-text-password",
#         "role": "customer" | "vendor" | "admin"   (optional; defaults to "customer")
#       }

#     Behavior:
#     - Validates required fields.
#     - Hashes the password (never stores plaintext).
#     - Inserts user into the 'users' table (schema defined in db/schema.sql).
#     - Enforces unique email (handled by DB constraint).

#     Responses:
#     - 201 Created on success: { "message": "User registered successfully" }
#     - 400 Bad Request if fields missing/invalid: { "error": "..." }
#     - 409 Conflict if email already exists: { "error": "Email already exists" }
#     """
#     # Parse JSON body; request.get_json() returns a Python dict or None.
#     data = request.get_json(silent=True)

#     # Basic validation: require email and password in the body.
#     if not data or "email" not in data or "password" not in data:
#         return jsonify({"error": "Email and password required"}), 400

#     email = (data.get("email") or "").strip().lower()
#     password = data.get("password") or ""
#     # Role is optional; default to "customer" for Sprint 1.
#     role = (data.get("role") or "customer").strip().lower()

#     # Defensive input checks (lightweight for Sprint 1).
#     if not email or "@" not in email:
#         return jsonify({"error": "Valid email is required"}), 400
#     if len(password) < 4:
#         return jsonify({"error": "Password must be at least 4 characters"}), 400
#     if role not in {"customer", "vendor", "admin"}:
#         return jsonify({"error": "Role must be customer, vendor, or admin"}), 400

#     # Hash the plaintext password before storing (PBKDF2 by default).
#     # Never store or log plaintext passwords.
#     password_hash = generate_password_hash(password)

#     # Insert the new user into the database.
#     conn = get_db()
#     try:
#         with conn:  # 'with' ensures commit or rollback automatically
#             conn.execute(
#                 """
#                 INSERT INTO users (email, password_hash, role)
#                 VALUES (?, ?, ?)
#                 """,
#                 (email, password_hash, role),
#             )
#     except sqlite3.IntegrityError:
#         # Triggered by the UNIQUE(email) constraint defined in schema.sql
#         return jsonify({"error": "Email already exists"}), 409
#     finally:
#         conn.close()

#     return jsonify({"message": "User registered successfully"}), 201


# # -----------------------------------------------------------------------------
# # /api/login
# # -----------------------------------------------------------------------------
# @auth_bp.route("/login", methods=["POST"])
# def login():
#     """
#     Authenticate a user with email + password.

#     Request (JSON):
#       { "email": "user@example.com", "password": "plaintext" }

#     Behavior:
#     - Looks up the user by email.
#     - Verifies password against the stored hash.
#     - Returns a temporary "dev token" for Sprint 1 (stub).
#       (We'll replace this stub with JWT in a later sprint.)

#     Responses:
#     - 200 OK on success:
#         {
#           "token": "dev-token",
#           "user": { "id": 1, "email": "...", "role": "customer" }
#         }
#     - 400 Bad Request if fields missing
#     - 401 Unauthorized if email or password is incorrect
#     """
#     data = request.get_json(silent=True)
#     if not data or "email" not in data or "password" not in data:
#         return jsonify({"error": "Email and password required"}), 400

#     email = (data.get("email") or "").strip().lower()
#     password = data.get("password") or ""

#     conn = get_db()
#     try:
#         row = conn.execute(
#             "SELECT id, email, password_hash, role FROM users WHERE email = ?",
#             (email,),
#         ).fetchone()
#     finally:
#         conn.close()

#     # If user exists and password matches the stored hash → success.
#     if row and check_password_hash(row["password_hash"], password):
#         # NOTE: For Sprint 1, we return a stub token.
#         # In a later sprint, use Flask-JWT-Extended to generate a real JWT:
#         #   pip install flask-jwt-extended
#         #   create_access_token(identity=user_id, additional_claims=...)
#         return jsonify({
#             "token": "dev-token",
#             "user": {
#                 "id": row["id"],
#                 "email": row["email"],
#                 "role": row["role"],
#             },
#         }), 200

#     # Fail with a generic message (avoid leaking whether email exists).
#     return jsonify({"error": "Invalid credentials"}), 401


# # -----------------------------------------------------------------------------
# # Optional: /api/me (stub) for later sprints
# # -----------------------------------------------------------------------------
# @auth_bp.route("/me", methods=["GET"])
# def me_stub():
#     """
#     Placeholder route to illustrate a "who am I?" endpoint.
#     In a real JWT setup, this would read the token from Authorization header,
#     validate it, and return the current user's profile.

#     For Sprint 1, we keep this unimplemented to make the contract explicit.
#     """
#     return jsonify({"message": "Not implemented"}), 501

# -----------------------------------------------------

"""
auth.py
------------
Authentication routes (register, login, etc.)
"""
from flask import Blueprint, request, jsonify, g
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import uuid
import sqlite3
from ..db_utils import get_db

auth_bp = Blueprint("auth_bp", __name__)
TOKEN_EXPIRY_DAYS = 7 

def create_session_token(user_id: int) -> str:
    """Generates a unique token and saves it to the 'sessions' table (T2)."""
    conn = get_db()
    token = uuid.uuid4().hex
    expires_at = datetime.now() + timedelta(days=TOKEN_EXPIRY_DAYS)
    
    try:
        conn.execute(
            """INSERT INTO sessions (user_id, token, expires_at)
            VALUES (?, ?, ?)""",
            (user_id, token, expires_at.isoformat()),
        )
        conn.commit()
        return token
    except sqlite3.Error:
        return None

# --- /api/register ---
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)
    if not data or "email" not in data or "password" not in data:
        return jsonify({"error": "Email and password required"}), 400

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = (data.get("role") or "customer").strip().lower()

    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400
    if role not in {"customer", "vendor", "admin"}:
        return jsonify({"error": "Role must be customer, vendor, or admin"}), 400

    # NOTE: Using a strong hashing function is critical here.
    password_hash = generate_password_hash(password)

    conn = get_db()
    try:
        conn.execute(
            """INSERT INTO users (email, password_hash, role)
            VALUES (?, ?, ?)""",
            (email, password_hash, role),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already exists"}), 409
    
    return jsonify({"message": "User registered successfully"}), 201

# --- /api/login ---
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)
    if not data or "email" not in data or "password" not in data:
        return jsonify({"error": "Email and password required"}), 400

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    conn = get_db()
    row = conn.execute(
        "SELECT id, email, password_hash, role, status FROM users WHERE email = ?",
        (email,),
    ).fetchone()

    if not row or not check_password_hash(row["password_hash"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    if row["status"] == 'suspended': # AD-5 Check
        return jsonify({"error": "Account suspended. Contact support."}), 403

    # T2: Session Creation
    token = create_session_token(row["id"])

    return jsonify({
        "token": token,
        "user": { "id": row["id"], "email": row["email"], "role": row["role"], "status": row["status"] },
    }), 200
