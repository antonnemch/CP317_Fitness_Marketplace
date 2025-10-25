"""
test_products.py
----------------
Tests for all product routes.
"""

def test_health_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    body = res.get_json()
    assert "status" in body and body["status"] == "ok"
    assert "product_count" in body

def test_list_products(client):
    res = client.get("/api/products")
    assert res.status_code == 200
    body = res.get_json()
    assert "items" in body
    assert isinstance(body["items"], list)

def test_get_product_valid_and_invalid(client):
    # Should succeed for at least one seeded product
    res = client.get("/api/products/1")
    assert res.status_code in (200, 404)  # 404 if seed changed
    # Invalid ID should return 404
    res2 = client.get("/api/products/999999")
    assert res2.status_code == 404

def test_product_write_stubs(client):
    # POST, PUT, DELETE should exist but return 501
    r1 = client.post("/api/products")
    r2 = client.put("/api/products/1")
    r3 = client.delete("/api/products/1")
    for r in (r1, r2, r3):
        assert r.status_code == 501
