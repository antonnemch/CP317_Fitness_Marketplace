// frontend_react/src/pages/CartPage.jsx

import { useState } from "react";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api/api";
import PageContainer from "../components/PageContainer";
import "../styles/components.css";

const CartPage = () => {
  const { items, removeItem, clearCart, total } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleCheckout = async () => {
    setMessage("");
    if (items.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    try {
      const payloadItems = items.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
      }));

      const order = await createOrder(payloadItems);
      console.log("Created order:", order);
      clearCart();
      setMessage(`Order #${order.id} created successfully!`);
    } catch (err) {
      console.error("Checkout failed", err);
      setMessage("Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className="cart-container">
        <h2 className="page-title">Your Cart</h2>

        {items.length === 0 && (
          <p className="cart-empty">Your cart is empty.</p>
        )}

        {items.length > 0 && (
          <>
            <ul className="cart-items">
              {items.map((i) => (
                <li key={i.product.id} className="cart-item">
                  <div className="cart-item-main">
                    <span className="cart-item-name">{i.product.name}</span>
                    <span className="cart-item-qty">
                      Quantity: {i.quantity}
                    </span>
                  </div>

                  <div className="cart-item-right">
                    <span className="cart-item-price">
                      ${(i.product.price * i.quantity).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      className="cart-remove-btn"
                      onClick={() => removeItem(i.product.id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-summary">
              <div className="cart-total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <button
                type="button"
                className="btn-primary cart-checkout-btn"
                onClick={handleCheckout}
                disabled={submitting}
              >
                {submitting ? "Processing..." : "Checkout"}
              </button>
            </div>
          </>
        )}

        {message && <p className="msg-box">{message}</p>}
      </div>
    </PageContainer>
  );
};

export default CartPage;
