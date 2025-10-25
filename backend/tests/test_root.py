"""
test_root.py
-------------
Basic sanity check to verify the API starts correctly.
"""

def test_root_message(client):
    res = client.get("/")
    assert res.status_code == 200
    data = res.get_json()
    assert "message" in data
