import React, { useState, useEffect, createContext, useContext } from 'react';
import Products from './pages/Products';
import CartPage from './pages/Cart';
import Wishlist from './pages/Wishlist';
import './App.css';

// ============================================================================
// Authentication Context
// ============================================================================
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // On mount, check if there's a saved user in localStorage
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Failed to parse saved user:', e);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    role: user?.role || 'guest',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================================
// Tab Button Component
// ============================================================================
const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      padding: "0.75rem 1rem",
      marginRight: "0.5rem",
      border: "2px solid #333",
      background: active ? "#333" : "#fff",
      color: active ? "#fff" : "#333",
      cursor: "pointer",
      borderRadius: "5px",
      fontWeight: "bold",
      fontSize: "14px",
      transition: "all 0.2s ease",
    }}
  >
    {children}
  </button>
);

// ============================================================================
// Login Tab Component
// ============================================================================
function LoginTab() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const auth = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMsg(`Error: ${data.error || "Login failed"}`);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      auth.login(data.user);
      setMsg("Login successful!");
      setEmail("");
      setPassword("");
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: "400px",
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h3 style={{ color: "#333", marginBottom: "20px", fontSize: "24px" }}>
        Login
      </h3>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{
          display: "block",
          width: "100%",
          marginBottom: "12px",
          padding: "12px",
          border: "2px solid #e0e0e0",
          borderRadius: "5px",
          fontSize: "14px",
          color: "#333",
          boxSizing: "border-box",
        }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{
          display: "block",
          width: "100%",
          marginBottom: "12px",
          padding: "12px",
          border: "2px solid #e0e0e0",
          borderRadius: "5px",
          fontSize: "14px",
          color: "#333",
          boxSizing: "border-box",
        }}
      />
      <button
        type="submit"
        style={{
          padding: "12px 24px",
          backgroundColor: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Login
      </button>
      {msg && (
        <div
          style={{
            marginTop: "15px",
            padding: "12px",
            backgroundColor: msg.includes("Error") ? "#ffebee" : "#e3f2fd",
            color: msg.includes("Error") ? "#d32f2f" : "#1976d2",
            borderRadius: "5px",
            fontWeight: "bold",
          }}
        >
          {msg}
        </div>
      )}
    </form>
  );
}

// ============================================================================
// Register Tab Component
// ============================================================================
function RegisterTab() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [msg, setMsg] = useState("");
  const auth = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMsg(`Error: ${data.error || "Registration failed"}`);
        return;
      }

      setMsg("Registration successful! Please log in.");
      setEmail("");
      setPassword("");
      setRole("customer");
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: "400px",
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h3 style={{ color: "#333", marginBottom: "20px", fontSize: "24px" }}>
        Create Account
      </h3>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{
          display: "block",
          width: "100%",
          marginBottom: "12px",
          padding: "12px",
          border: "2px solid #e0e0e0",
          borderRadius: "5px",
          fontSize: "14px",
          color: "#333",
          boxSizing: "border-box",
        }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{
          display: "block",
          width: "100%",
          marginBottom: "12px",
          padding: "12px",
          border: "2px solid #e0e0e0",
          borderRadius: "5px",
          fontSize: "14px",
          color: "#333",
          boxSizing: "border-box",
        }}
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={{
          display: "block",
          width: "100%",
          marginBottom: "12px",
          padding: "12px",
          border: "2px solid #e0e0e0",
          borderRadius: "5px",
          fontSize: "14px",
          color: "#333",
          backgroundColor: "#fff",
          boxSizing: "border-box",
        }}
      >
        <option value="customer">Customer</option>
        <option value="vendor">Vendor</option>
      </select>
      <button
        type="submit"
        style={{
          padding: "12px 24px",
          backgroundColor: "#2e7d32",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Register
      </button>
      {msg && (
        <div
          style={{
            marginTop: "15px",
            padding: "12px",
            backgroundColor: msg.includes("Error") ? "#ffebee" : "#e8f5e8",
            color: msg.includes("Error") ? "#d32f2f" : "#2e7d32",
            borderRadius: "5px",
            fontWeight: "bold",
          }}
        >
          {msg}
        </div>
      )}
    </form>
  );
}

// ============================================================================
// Main App Component
// ============================================================================
export default function App() {
  const [tab, setTab] = useState("products");
  const auth = useAuth();
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch (e) {
      return [];
    }
  });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === productId);
      if (!existing) return prev;
      if (existing.quantity > 1) {
        return prev.map((p) =>
          p.id === productId ? { ...p, quantity: p.quantity - 1 } : p
        );
      }
      return prev.filter((p) => p.id !== productId);
    });
  };

  const clearCart = () => setCart([]);

  const handleLogout = () => {
    auth.logout();
    setTab("products");
  };

  // Listen for global UI events (e.g., open login from other components)
  useEffect(() => {
    const onOpenLogin = () => setTab("login");
    window.addEventListener("openLogin", onOpenLogin);
    return () => window.removeEventListener("openLogin", onOpenLogin);
  }, []);

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "system-ui, Arial",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        color: "#333",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ marginBottom: 0, color: "#333", fontSize: "28px" }}>
          Fitness Marketplace
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ color: "#333", fontSize: "14px" }}>
            Cart: <strong>{cart.reduce((s, p) => s + (p.quantity || 0), 0)}</strong>
          </div>
          {auth.isAuthenticated && (
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <span style={{ color: "#666", fontSize: "14px" }}>
                Welcome, <strong style={{ color: "#333" }}>{auth.user?.email}</strong> (
                {auth.role})
              </span>
              <button
                onClick={handleLogout}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f44336",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ marginBottom: "24px" }}>
        <TabButton active={tab === "products"} onClick={() => setTab("products")}>
          Products
        </TabButton>
        <TabButton active={tab === "cart"} onClick={() => setTab("cart")}>
          Cart ({cart.length})
        </TabButton>
        {auth.isAuthenticated && (
          <TabButton active={tab === "wishlist"} onClick={() => setTab("wishlist")}> 
            Wishlist
          </TabButton>
        )}
        {!auth.isAuthenticated && (
          <>
            <TabButton active={tab === "login"} onClick={() => setTab("login")}>
              Login
            </TabButton>
            <TabButton active={tab === "register"} onClick={() => setTab("register")}>
              Register
            </TabButton>
          </>
        )}
      </div>

      {/* Tab Content */}
      {tab === "products" && <Products onAddToCart={addToCart} />}
      {tab === "wishlist" && auth.isAuthenticated && <Wishlist />}
      {tab === "cart" && (
        <CartPage
          cart={cart}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onClear={clearCart}
        />
      )}
      {tab === "login" && !auth.isAuthenticated && <LoginTab />}
      {tab === "register" && !auth.isAuthenticated && <RegisterTab />}
    </div>
  );
}
