# backend/models.py

from typing import Optional, Dict


def get_current_user() -> Optional[Dict]:
    """
    TEMP auth stub for *customer* flows (browsing / checkout).

    For now we pretend a single demo customer is logged in.
    This matches the seeded user in init_db.py.
    """
    return {
        "id": 1,
        "role": "customer",
        "email": "customer@example.com",
    }


def get_current_vendor() -> Optional[Dict]:
    """
    TEMP auth stub for *vendor* flows (vendor dashboard).

    For Sprint 3, we treat the seeded vendor@example.com as logged in.
    """
    return {
        "id": 2,
        "role": "vendor",
        "email": "vendor@example.com",
    }
