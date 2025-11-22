// frontend_react/src/components/ProductCard.jsx

import React from "react";
import "../styles/components.css";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addItem, getQuantity } = useCart();
  const qtyInCart = getQuantity(product.id);

  const handleAdd = () => {
    addItem(product, 1);
  };

  return (
    <div className="product-card">
      <div className="product-card-header">
        <h3 className="product-card-title">{product.name}</h3>

        {qtyInCart > 0 && (
          <span className="product-cart-pill">
            In cart: {qtyInCart}
          </span>
        )}
      </div>

      {product.description && (
        <p className="product-card-desc">{product.description}</p>
      )}

      <div className="product-card-footer">
        <span className="product-card-price">
          ${product.price.toFixed(2)}
        </span>
        <button
          type="button"
          className="btn-primary"
          onClick={handleAdd}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
