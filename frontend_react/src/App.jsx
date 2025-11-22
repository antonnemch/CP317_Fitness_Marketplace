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

// Chatbot Widget
import ChatbotWidget from "./components/ChatbotWidget";
import Footer from "./components/Footer";


export default function App() {
  // Default page
  const [tab, setTab] = useState("home");

  const [user, setUser] = useState(null);
  const [productsKey, setProductsKey] = useState(0);

  // Chatbot open/close
  const [chatOpen, setChatOpen] = useState(false);

  // Load saved user session
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    setTab("products"); // redirect after login
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

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark");
    }
  }, []);

  return (
    <div className="app-root">
      <Navbar user={user} onTab={setTab} onLogout={handleLogout} />

      <PageContainer>
        {tab === "home" && <Home onTab={setTab} />}
        {tab === "products" && <Products key={productsKey} />}
        {tab === "register" && <RegisterView />}
        {tab === "login" && <LoginView onLogin={handleLogin} />}
        {tab === "manage" && user?.role === "vendor" && (
          <VendorManagement user={user} onProductsChange={refreshProducts} />
        )}
      </PageContainer>

      <ChatbotWidget chatOpen={chatOpen} setChatOpen={setChatOpen} />

      <Footer /> {/* ADD THIS */}
    </div>
  );
}
