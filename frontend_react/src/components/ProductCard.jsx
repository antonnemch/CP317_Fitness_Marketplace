// import React from "react";
// import "./ProductCard.css";

// const ProductCard = ({ product }) => {
//   return (
//     <div className="product-card">
//       <img src={product.image || "/vite.svg"} alt={product.name} />
//       <h3>{product.name}</h3>
//       <p>{product.description}</p>
//       <div className="price">${product.price}</div>
//       <button>Add to Cart 🛒</button>
//     </div>
//   );
// };

// export default ProductCard;

import React from "react";
import "../index.css"; // Ensure general styles are imported

const ProductCard = ({ product, onAdd, onToggleWishlist, onClickCard }) => {
    
    // Default values and formatting for display
    const formattedPrice = `$${product.price.toFixed(2)}`;
    const averageRating = product.avg_rating ? product.avg_rating.toFixed(1) : 'N/A';

    return (
        <div 
            className="product-card" 
            onClick={() => onClickCard && onClickCard(product.id)}
            role="link" 
            tabIndex={0} 
            aria-label={`View details for ${product.name}`}
        >
            
            <div className="card-header">
                {/* 1. Wishlist Button (CR-2) */}
                <button 
                    className="wishlist-btn"
                    onClick={(e) => {
                        e.stopPropagation(); 
                        onToggleWishlist && onToggleWishlist(product.id);
                    }}
                    aria-label={`Toggle wishlist for ${product.name}`}
                >
                    {/* Assume product.isWishlisted is available */}
                    {product.isWishlisted ? '❤️' : '🤍'} 
                </button>
                <img 
                    src={product.image || product.image_url || "/vite.svg"} 
                    alt={product.name} 
                />
            </div>
            
            <div className="card-content">
                <h3 className="product-title">{product.name}</h3>
                <p className="product-description">{product.description || 'No description provided.'}</p>
                
                {/* 2. Reviews Display (VR-3) */}
                <div className="product-ratings">
                    <span role="img" aria-label="Star rating">⭐</span> 
                    {averageRating} 
                    <span className="review-count">({product.review_count || 0})</span>
                </div>
            </div>

            <div className="card-actions">
                <div className="price">{formattedPrice}</div>
                
                {/* 3. Add to Cart Button (VR-1 Stock Check) */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation(); 
                        // prefer onAdd, but support legacy onToggle name if provided
                        if (onAdd) return onAdd(product);
                    }}
                    disabled={product.stock <= 0}
                    className="primary-btn"
                >
                    {product.stock <= 0 ? "Out of Stock 🚫" : "Add to Cart 🛒"}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;