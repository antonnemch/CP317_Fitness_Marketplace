import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, onAdd, onRemove }) => {
  return (
    <div className="product-card">
      <img src={product.image || "/vite.svg"} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <div className="price">${product.price}</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 10 }}>
        {onAdd && (
          <button onClick={() => onAdd(product)} style={{ cursor: "pointer" }}>Add to Cart 🛒</button>
        )}
        {onRemove && (
          <button onClick={() => onRemove(product.id)} style={{ cursor: "pointer", backgroundColor: "#f44336" }}>Remove</button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
