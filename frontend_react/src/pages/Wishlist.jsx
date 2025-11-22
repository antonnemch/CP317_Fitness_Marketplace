import React, { useEffect, useState } from "react";
import api from "../api/api";

const Wishlist = () => {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/wishlist");
        const data = res && res.data ? res.data : res;
        const items = Array.isArray(data.items) ? data.items : [];
        setItems(items);
      } catch (err) {
        console.error("Failed to load wishlist:", err);
        // Provide a clearer UX for auth failures
        if (err && err.response && err.response.status === 401) {
          setError("Please log in to view your wishlist.");
          setItems([]);
        } else {
          setError(err?.response?.data?.error || err.message || "Failed to load wishlist");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemove = async (id) => {
    try {
      await api.delete(`/wishlist/${id}`);
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
      setError(err?.response?.data?.error || "Failed to remove item");
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading wishlist...</div>;
  if (error) return (
    <div style={{ padding: 20 }}>
      <div style={{ color: "#c62828", marginBottom: 12 }}>{error}</div>
      {error.includes("log in") && (
        <button onClick={() => window.dispatchEvent(new Event('openLogin'))} style={{ padding: "8px 12px", backgroundColor: "#1976d2", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
          Go to Login
        </button>
      )}
    </div>
  );
  if (!items || items.length === 0) return <div style={{ padding: 20 }}>Your wishlist is empty.</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Wishlist</h2>
      <div style={{ display: "grid", gap: 12, maxWidth: 800 }}>
        {items.map((it) => (
          <div key={it.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, border: "1px solid #e0e0e0", borderRadius: 8, background: "#fff" }}>
            <div>
              <div style={{ fontWeight: 700 }}>{it.name}</div>
              <div style={{ color: "#666" }}>${Number(it.price).toFixed(2)}</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => handleRemove(it.id)} style={{ padding: "8px 12px", backgroundColor: "#f44336", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
