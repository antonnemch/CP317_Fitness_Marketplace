"""
db_utils.py
------------
Shared helper functions for working with the SQLite database.

Responsibilities:
- Define the database file location.
- Provide a get_db() helper that opens a connection to it.
- Provide a utility to convert query results to plain Python dicts.

SQLite is file-based, so every call just opens/reads/closes the file;
no external DB service is needed for development.
"""

import sqlite3
from pathlib import Path

# Path to the SQLite database file (backend/db/fitness.db)
DB_PATH = Path(__file__).resolve().parent / "db" / "fitness.db"


def get_db() -> sqlite3.Connection:
    """
    Open a new SQLite connection to our database file.

    - row_factory = sqlite3.Row allows rows to behave like dictionaries,
      e.g., row["email"] instead of tuple indexing.
    - Caller is responsible for closing the connection.

    Returns:
        sqlite3.Connection
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def rows_to_dicts(rows) -> list[dict]:
    """
    Convert a list of sqlite3.Row objects into a list of regular dictionaries.

    This makes it easy to jsonify query results directly in Flask routes.

    Example:
        rows = conn.execute("SELECT * FROM products").fetchall()
        jsonify(rows_to_dicts(rows))
    """
    return [dict(r) for r in rows]
