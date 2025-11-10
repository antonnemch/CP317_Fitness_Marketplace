"""
security.py
-----------
Defines decorators for authentication (T2) and authorization (AD-2).
"""
from functools import wraps
from flask import request, jsonify, g
from datetime import datetime
from .db_utils import get_db

class AuthError(Exception):
    """Custom exception for authentication/authorization failures."""
    def __init__(self, message, status_code):
        self.message = message
        self.status_code = status_code

def get_current_user(token: str) -> dict | None:
    """Validates a session token and retrieves the associated user data (T2)."""
    conn = get_db()
    
    session_row = conn.execute(
        """
        SELECT s.user_id, s.expires_at, u.id, u.email, u.role, u.status
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token = ?
        """,
        (token,)
    ).fetchone()

    if not session_row:
        return None

    expires_at = datetime.fromisoformat(session_row["expires_at"])
    if expires_at < datetime.now():
        conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
        conn.commit()
        return None
        
    if session_row["status"] == 'suspended': # AD-5 check
        raise AuthError("Account suspended", 403)

    return dict(session_row)

def login_required(f):
    """Decorator to require a valid session token (Authentication)."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authentication required. Token missing"}), 401
        
        token = auth_header.split(" ", 1)[1] 
        
        try:
            user = get_current_user(token)
            if user is None:
                return jsonify({"error": "Invalid or expired token"}), 401
        except AuthError as e:
            return jsonify({"error": e.message}), e.status_code

        g.user = user
        return f(*args, **kwargs)
    return decorated_function

def role_required(required_role: str):
    """Decorator to require a specific user role (Authorization, AD-2)."""
    def decorator(f):
        @login_required
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user_role = g.user['role']
            
            if user_role != required_role:
                return jsonify({"error": "Access denied. Insufficient role permissions."}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Define common role decorators (AD-2)
vendor_required = role_required('vendor')
admin_required = role_required('admin')