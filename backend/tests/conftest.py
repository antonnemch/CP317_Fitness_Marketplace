"""
conftest.py
------------
Pytest fixture setup for creating a Flask test client.
Pytest automatically finds fixtures defined here.
"""

import pytest
from backend.app import create_app

@pytest.fixture
def client():
    """
    Create a new Flask test client for each test.
    """
    app = create_app()
    app.config.update({"TESTING": True})
    with app.test_client() as client:
        yield client
