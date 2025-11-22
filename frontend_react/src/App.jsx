// frontend_react/src/App.jsx

import { useEffect, useState } from "react";
import "./styles/themes.css";
import "./styles/layout.css";

import Navbar from "./components/Navbar";
import PageContainer from "./components/PageContainer";
import Products from "./pages/Products";
import RegisterView from "./pages/RegisterView";
import LoginView from "./pages/LoginView";
import VendorManagement from "./pages/VendorManagement";
import Home from "./pages/Home";

import CartPage from "./pages/CartPage";       // NEW
import OrdersPage from "./pages/OrdersPage";   // NEW

import { CartProvider } from "./context/CartContext"; // NEW

import ChatbotWidget from "./components/ChatbotWidget";
import Footer from "./components/Footer";

export default function App() {
  const [tab, setTab] = useState("home");

  const [user, setUser] = useState(null);
  const [productsKey, setProductsKey] = useState(0);

  const [chatOpen, setChatOpen] = useState(false);

  // Restore logged-in user if present
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    setTab("products");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setTab("products");
    setProductsKey((k) => k + 1);
  };

  const refreshProducts = () => {
    setProductsKey((k) => k + 1);
  };

  // Restore dark mode
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark");
    }
  }, []);

  return (
    <CartProvider>
      <div className="app-root">
        <Navbar user={user} onTab={setTab} onLogout={handleLogout} />

        <PageContainer>
          {tab === "home" && <Home onTab={setTab} />}

          {tab === "products" && <Products key={productsKey} />}

          {tab === "register" && <RegisterView />}

          {tab === "login" && <LoginView onLogin={handleLogin} />}

          {tab === "manage" &&
            user?.role === "vendor" && (
              <VendorManagement
                user={user}
                onProductsChange={refreshProducts}
              />
            )}

          {/* NEW CART + ORDERS */}
          {tab === "cart" && <CartPage />}

          {tab === "orders" && user && <OrdersPage />}
        </PageContainer>

        <ChatbotWidget chatOpen={chatOpen} setChatOpen={setChatOpen} />

        <Footer />
      </div>
    </CartProvider>
  );
}
