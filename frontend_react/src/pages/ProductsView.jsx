import React, { useEffect, useState } from "react";
import { getProducts } from "../api/api";
import "../styles/products.css";   // NEW file

export default function ProductsView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then((data) => setItems(data.items || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <p className="products-msg">Loading products...</p>;

  if (items.length === 0)
    return <p className="products-msg">No products found.</p>;

  return (
    <div className="products-page">
      <h2 className="products-title">Available Products</h2>

      <div className="products-grid">
        {items.map((p) => (
          <div key={p.id} className="product-card">
            <h3 className="product-title">{p.name}</h3>
            <p className="product-price">${Number(p.price).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
