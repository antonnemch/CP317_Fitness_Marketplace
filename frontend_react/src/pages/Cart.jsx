import React, { useState } from "react";
import api from "../api/api";

const CartPage = ({ cart = [], onAdd, onRemove, onClear }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const total = cart.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 1), 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!cart || cart.length === 0) return;
    setProcessing(true);

    // Simulate a payment gateway interaction (sandbox)
    await new Promise((res) => setTimeout(res, 1200));

    // Try to send order to backend if available, but don't fail the UX if it isn't
    try {
      const payload = {
        customer: { name, email },
        items: cart,
        total,
        payment: { method: "card", cardLast4: cardNumber.slice(-4) || null, sandbox: true },
      };
      const resp = await api.post("/orders", payload).catch((err) => {
        // backend may not have this endpoint in the sandbox - ignore and continue
        console.warn("Order POST failed (continuing sandbox):", err && err.message);
        return null;
      });

      const generatedId = (resp && resp.data && resp.data.id) || `SIM-${Math.floor(Math.random() * 900000 + 100000)}`;
      setOrderId(generatedId);
      // clear cart after successful checkout
      if (onClear) onClear();
    } catch (err) {
      console.error("Checkout failed:", err);
    } finally {
      setProcessing(false);
    }
  };

  if (orderId) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Order Confirmed</h2>
        <p>Thank you — your order id is <strong>{orderId}</strong>.</p>
        <p>A confirmation email would be sent in a full integration.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Cart</h2>
      {(!cart || cart.length === 0) ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div style={{ display: "grid", gap: 12, maxWidth: 800 }}>
            {cart.map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, border: "1px solid #e0e0e0", borderRadius: 8, background: "#fff" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.name}</div>
                  <div style={{ color: "#666" }}>${Number(item.price).toFixed(2)} each</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => onRemove(item.id)} style={{ padding: "6px 10px" }}>-</button>
                  <div style={{ minWidth: 30, textAlign: "center" }}>{item.quantity || 1}</div>
                  <button onClick={() => onAdd(item)} style={{ padding: "6px 10px" }}>+</button>
                </div>
                <div style={{ fontWeight: 700 }}>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 800 }}>
            <div>
              <button onClick={onClear} style={{ padding: "10px 14px", backgroundColor: "#f44336", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>Clear Cart</button>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              Total: ${total.toFixed(2)}
            </div>
          </div>

          <form onSubmit={handleCheckout} style={{ marginTop: 24, maxWidth: 600, padding: 16, border: "1px solid #e0e0e0", borderRadius: 8, background: "#fff" }}>
            <h3>Sandbox Checkout</h3>
            <p style={{ color: "#666" }}>This is a simulated payment flow for testing. No real card processing occurs.</p>
            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 10, borderRadius: 6, border: "1px solid #ddd" }} />
              <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: 10, borderRadius: 6, border: "1px solid #ddd" }} />
              <input placeholder="Card number (sandbox)" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} style={{ padding: 10, borderRadius: 6, border: "1px solid #ddd" }} />
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
              <button type="submit" disabled={processing} style={{ padding: "10px 16px", backgroundColor: processing ? "#ccc" : "#2e7d32", color: "#fff", border: "none", borderRadius: 6, cursor: processing ? "default" : "pointer" }}>
                {processing ? "Processing…" : `Pay $${total.toFixed(2)}`}
              </button>
              <div style={{ color: "#666" }}>Sandbox payment — no real charges.</div>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default CartPage;
