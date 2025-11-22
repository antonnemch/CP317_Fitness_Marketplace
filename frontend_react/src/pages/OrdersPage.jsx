import { useEffect, useState } from "react";
import { getOrders } from "../api/api";
import PageContainer from "../components/PageContainer";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then((items) => {
        setOrders(items || []);
      })
      .catch((err) => {
        console.error("Failed to load orders:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <p>Loading orders...</p>
      </PageContainer>
    );
  }

  if (!orders.length) {
    return (
      <PageContainer>
        <p>You have no orders yet.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <h2>Your Orders</h2>
      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <span>Order #{order.id}</span>
            <span>Status: {order.status}</span>
          </div>
          <ul style={{ paddingLeft: "16px" }}>
            {order.items.map((item) => (
              <li key={item.id}>
                {item.name} × {item.quantity} — $
                {(item.price * item.quantity).toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </PageContainer>
  );
};

export default OrdersPage;
