import React, { useState, useEffect } from "react";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(saved);
  }, []);

  const removeItem = (id) => {
    const updated = wishlist.filter((p) => p.id !== id);
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  return (
    <div className="wishlist">
      <h2>Your Wishlist ❤️</h2>
      {wishlist.length === 0 ? (
        <p>No items saved yet.</p>
      ) : (
        wishlist.map((p) => (
          <div key={p.id} className="wishlist-item">
            <img src={p.image} alt={p.name} />
            <h4>{p.name}</h4>
            <button onClick={() => removeItem(p.id)}>Remove</button>
          </div>
        ))
      )}
    </div>
  );
};

export default Wishlist;
