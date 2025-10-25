"""
test_auth.py
-------------
Tests for /api/register and /api/login.
"""

def test_register_success_and_duplicate(client):
    # Successful registration
    res = client.post("/api/register", json={"email": "pytest@example.com", "password": "abcd"})
    assert res.status_code in (201, 409)  # 409 if run twice
    data = res.get_json()
    assert "message" in data or "error" in data

def test_register_missing_fields(client):
    res = client.post("/api/register", json={"email": "missingpw@example.com"})
    assert res.status_code == 400
    assert "error" in res.get_json()

def test_login_success_and_failure(client):
    # Register user first
    client.post("/api/register", json={"email": "logintest@example.com", "password": "abcd"})
    # Correct password
    res = client.post("/api/login", json={"email": "logintest@example.com", "password": "abcd"})
    assert res.status_code == 200
    assert "token" in res.get_json()
    # Wrong password
    res2 = client.post("/api/login", json={"email": "logintest@example.com", "password": "wrong"})
    assert res2.status_code == 401
