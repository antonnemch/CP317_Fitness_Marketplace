// frontend_react/src/pages/VendorManagement.jsx

import React, { useEffect, useState } from "react";
import "../styles/components.css";
import "../styles/layout.css";
import "../styles/products.css"; // optional
import "../styles/vendor.css";

import {
  fetchVendorOverview,
  vendorCreateProduct,
  vendorUpdateProduct,
} from "../api/api";

export default function VendorManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({
    total_products: 0,
    low_stock_count: 0,
    on_order_total: 0,
  });

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    stock: "0",
    low_stock_threshold: "5",
  });

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchVendorOverview();
      setProducts(data.products || []);
      setSummary(
        data.summary || {
          total_products: 0,
          low_stock_count: 0,
          on_order_total: 0,
        }
      );
    } catch (err) {
      console.error("Failed to load vendor overview", err);
      setError(err.message || "Failed to load vendor data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      setError("");

      const payload = {
        name: form.name,
        price: parseFloat(form.price),
        category: form.category || null,
        description: form.description || null,
        stock: parseInt(form.stock || "0", 10),
        low_stock_threshold: parseInt(
          form.low_stock_threshold || "5",
          10
        ),
      };

      await vendorCreateProduct(payload);

      // Reset form
      setForm({
        name: "",
        price: "",
        category: "",
        description: "",
        stock: "0",
        low_stock_threshold: "5",
      });

      await loadOverview();
    } catch (err) {
      console.error("Failed to create product", err);
      setError(err.message || "Failed to create product");
    }
  };

  const handleThresholdChange = (productId, value) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, low_stock_threshold: value }
          : p
      )
    );
  };

  const handleSaveThreshold = async (product) => {
    try {
      setError("");
      const payload = {
        low_stock_threshold: parseInt(
          product.low_stock_threshold || "0",
          10
        ),
        stock: product.stock, // keep stock unchanged for now
      };
      await vendorUpdateProduct(product.id, payload);
      await loadOverview();
    } catch (err) {
      console.error("Failed to update product", err);
      setError(err.message || "Failed to update product");
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Vendor Dashboard</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="vendor-summary-grid">
        <div className="summary-card">
          <h3>Total Products</h3>
          <p>{summary.total_products}</p>
        </div>
        <div className="summary-card">
          <h3>Low Stock Items</h3>
          <p>{summary.low_stock_count}</p>
        </div>
        <div className="summary-card">
          <h3>Units On Order</h3>
          <p>{summary.on_order_total}</p>
        </div>
      </section>

      <section className="vendor-section">
        <h2>Add Product</h2>
        <form className="form-grid" onSubmit={handleCreateProduct}>
          <input
            name="name"
            value={form.name}
            onChange={handleFormChange}
            placeholder="Name"
            required
          />
          <input
            name="price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={handleFormChange}
            placeholder="Price"
            required
          />
          <input
            name="category"
            value={form.category}
            onChange={handleFormChange}
            placeholder="Category"
          />
          <input
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleFormChange}
            placeholder="Initial Stock"
          />
          <input
            name="low_stock_threshold"
            type="number"
            value={form.low_stock_threshold}
            onChange={handleFormChange}
            placeholder="Low-stock threshold"
          />
          <input
            name="description"
            value={form.description}
            onChange={handleFormChange}
            placeholder="Short description"
          />
          <button type="submit" className="btn-primary">
            Add
          </button>
        </form>
      </section>

      <section className="vendor-section">
        <h2>Your Products</h2>
        {loading ? (
          <p>Loading...</p>
        ) : products.length === 0 ? (
          <p>No products yet.</p>
        ) : (
          <table className="vendor-products-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Low-stock threshold</th>
                <th>On order</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className={p.is_low_stock ? "row-low-stock" : ""}
                >
                  <td>{p.name}</td>
                  <td>{p.category || "-"}</td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>{p.stock}</td>
                  <td>
                    <div className="threshold-cell">
                      <input
                        type="number"
                        value={p.low_stock_threshold ?? 0}
                        onChange={(e) =>
                          handleThresholdChange(p.id, e.target.value)
                        }
                        className="threshold-input"
                      />
                      <button
                        type="button"
                        className="btn-small"
                        onClick={() => handleSaveThreshold(p)}
                      >
                        Save
                      </button>
                    </div>
                  </td>
                  <td>{p.on_order_qty}</td>
                  <td>
                    {p.review_count > 0 ? (
                      <>
                        {p.avg_rating.toFixed(1)} ★ ({p.review_count})
                      </>
                    ) : (
                      "No reviews"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
