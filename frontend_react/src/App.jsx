import { useEffect, useState } from "react";
import { getProducts, registerUser, loginUser, createProduct, updateProduct, deleteProduct } from "./api";

// Minimal tab-like UI without react-router
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

import Products from './pages/Products';
import CartPage from './pages/Cart';

function ProductsView({ onAddToCart }) {
  return <Products onAddToCart={onAddToCart} />;
}

function RegisterView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    try {
      const res = await registerUser({ email, password, role });
      setMsg(`Success: Account created as ${role}!`);
      setEmail("");
      setPassword("");
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 400, padding: "20px", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <h3 style={{ color: "#333", marginBottom: "20px", fontSize: "24px" }}>Create Account</h3>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ 
          display: "block", 
          width: "100%", 
          marginBottom: 12, 
          padding: "12px", 
          border: "2px solid #e0e0e0", 
          borderRadius: "5px",
          fontSize: "14px",
          color: "#333"
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
          marginBottom: 12, 
          padding: "12px", 
          border: "2px solid #e0e0e0", 
          borderRadius: "5px",
          fontSize: "14px",
          color: "#333"
        }}
      />
      <select 
        value={role} 
        onChange={(e) => setRole(e.target.value)}
        style={{ 
          display: "block", 
          width: "100%", 
          marginBottom: 12, 
          padding: "12px", 
          border: "2px solid #e0e0e0", 
          borderRadius: "5px",
          fontSize: "14px",
          color: "#333",
          backgroundColor: "#fff"
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
          cursor: "pointer"
        }}
      >
        Register
      </button>
      {msg && <div style={{ 
        marginTop: 15, 
        padding: "12px", 
        backgroundColor: msg.includes("Error") ? "#ffebee" : "#e8f5e8",
        color: msg.includes("Error") ? "#d32f2f" : "#2e7d32",
        borderRadius: "5px",
        fontWeight: "bold"
      }}>{msg}</div>}
    </form>
  );
}

function LoginView({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setResult("");
    try {
      const res = await loginUser({ email, password });
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      setResult(`Success: Logged in as ${res.user.role}!`);
      onLogin(res.user);
      setEmail("");
      setPassword("");
    } catch (e) {
      setResult(`Error: ${e.message}`);
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit} style={{ maxWidth: 400, padding: "20px", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
        <h3 style={{ color: "#333", marginBottom: "20px", fontSize: "24px" }}>Login</h3>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ 
            display: "block", 
            width: "100%", 
            marginBottom: 12, 
            padding: "12px", 
            border: "2px solid #e0e0e0", 
            borderRadius: "5px",
            fontSize: "14px",
            color: "#333"
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
            marginBottom: 12, 
            padding: "12px", 
            border: "2px solid #e0e0e0", 
            borderRadius: "5px",
            fontSize: "14px",
            color: "#333"
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
            cursor: "pointer"
          }}
        >
          Login
        </button>
        {result && <div style={{ 
          marginTop: 15, 
          padding: "12px", 
          backgroundColor: result.includes("Error") ? "#ffebee" : "#e3f2fd",
          color: result.includes("Error") ? "#d32f2f" : "#1976d2",
          borderRadius: "5px",
          fontWeight: "bold"
        }}>{result}</div>}
      </form>
      
      <div style={{ 
        marginTop: "20px", 
        padding: "20px", 
        backgroundColor: "#f5f5f5", 
        borderRadius: "8px",
        border: "2px solid #e0e0e0",
        maxWidth: "400px"
      }}>
        <h4 style={{ color: "#333", marginBottom: "15px", fontSize: "18px" }}>Test Accounts:</h4>
        <p style={{ margin: "8px 0", color: "#333", fontSize: "14px" }}>
          <strong style={{ color: "#2e7d32" }}>Customer:</strong> customer@example.com / customer123
        </p>
        <p style={{ margin: "8px 0", color: "#333", fontSize: "14px" }}>
          <strong style={{ color: "#1976d2" }}>Vendor:</strong> vendor@example.com / vendor123
        </p>
        <p style={{ margin: "8px 0", color: "#333", fontSize: "14px" }}>
          <strong style={{ color: "#d32f2f" }}>Admin:</strong> admin@example.com / admin123
        </p>
      </div>
    </div>
  );
}

function VendorManagement({ user, onProductsChange }) {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });
  const [editingProduct, setEditingProduct] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      // getProducts now returns a normalized array, but keep backward compatibility
      // in case it ever returns an object with `items`.
      const items = Array.isArray(data) ? data : (data && data.items) ? data.items : [];
      setProducts(items);
    } catch (e) {
      setMsg(`Error loading products: ${e.message}`);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    
    try {
      await createProduct(newProduct);
      setMsg("Product added successfully!");
      setNewProduct({ name: "", price: "" });
      loadProducts();
      onProductsChange();
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await updateProduct(editingProduct.id, editingProduct);
      setMsg("Product updated successfully!");
      setEditingProduct(null);
      loadProducts();
      onProductsChange();
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await deleteProduct(id);
      setMsg("Product deleted successfully!");
      loadProducts();
      onProductsChange();
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    }
  };

  return (
    <div>
      <h3 style={{ color: "#333", marginBottom: "25px", fontSize: "24px" }}>Vendor Product Management</h3>
      
      {/* Add New Product */}
      <form onSubmit={handleAddProduct} style={{ 
        marginBottom: "25px", 
        padding: "20px", 
        border: "2px solid #2e7d32", 
        borderRadius: "8px", 
        backgroundColor: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h4 style={{ color: "#2e7d32", marginBottom: "15px", fontSize: "18px" }}>Add New Product</h4>
        <input
          type="text"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
          style={{ 
            display: "block", 
            width: "100%", 
            marginBottom: 12, 
            padding: "12px", 
            border: "2px solid #e0e0e0", 
            borderRadius: "5px",
            fontSize: "14px",
            color: "#333"
          }}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
          style={{ 
            display: "block", 
            width: "100%", 
            marginBottom: 15, 
            padding: "12px", 
            border: "2px solid #e0e0e0", 
            borderRadius: "5px",
            fontSize: "14px",
            color: "#333"
          }}
          required
        />
        <button 
          type="submit" 
          style={{ 
            padding: "12px 24px", 
            backgroundColor: "#2e7d32", 
            color: "white", 
            border: "none", 
            borderRadius: "5px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Add Product
        </button>
      </form>

      {/* Edit Product Form */}
      {editingProduct && (
        <form onSubmit={handleUpdateProduct} style={{ 
          marginBottom: "25px", 
          padding: "20px", 
          border: "2px solid #ff9800", 
          borderRadius: "8px", 
          backgroundColor: "#fff8e1",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <h4 style={{ color: "#e65100", marginBottom: "15px", fontSize: "18px" }}>Edit Product</h4>
          <input
            type="text"
            placeholder="Product Name"
            value={editingProduct.name}
            onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
            style={{ 
              display: "block", 
              width: "100%", 
              marginBottom: 12, 
              padding: "12px", 
              border: "2px solid #e0e0e0", 
              borderRadius: "5px",
              fontSize: "14px",
              color: "#333",
              backgroundColor: "#fff"
            }}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Price"
            value={editingProduct.price}
            onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
            style={{ 
              display: "block", 
              width: "100%", 
              marginBottom: 15, 
              padding: "12px", 
              border: "2px solid #e0e0e0", 
              borderRadius: "5px",
              fontSize: "14px",
              color: "#333",
              backgroundColor: "#fff"
            }}
            required
          />
          <button 
            type="submit" 
            style={{ 
              padding: "12px 20px", 
              backgroundColor: "#ff9800", 
              color: "white", 
              border: "none", 
              borderRadius: "5px", 
              marginRight: "10px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Update Product
          </button>
          <button 
            type="button" 
            onClick={() => setEditingProduct(null)} 
            style={{ 
              padding: "12px 20px", 
              backgroundColor: "#f44336", 
              color: "white", 
              border: "none", 
              borderRadius: "5px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
        </form>
      )}

      {/* Product List */}
      <div style={{ display: "grid", gap: "15px", maxWidth: "800px" }}>
        {products.map((product) => (
          <div key={product.id} style={{ 
            border: "2px solid #e0e0e0", 
            padding: "20px", 
            borderRadius: "8px", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            backgroundColor: "#fff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <div>
              <h4 style={{ margin: "0 0 8px 0", color: "#333", fontSize: "18px" }}>{product.name}</h4>
              <p style={{ margin: 0, fontSize: "20px", fontWeight: "bold", color: "#2e7d32" }}>
                ${Number(product.price).toFixed(2)}
              </p>
            </div>
            <div>
              <button 
                onClick={() => setEditingProduct(product)}
                style={{ 
                  padding: "8px 16px", 
                  backgroundColor: "#1976d2", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "5px", 
                  marginRight: "8px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Edit
              </button>
              <button 
                onClick={() => handleDeleteProduct(product.id)}
                style={{ 
                  padding: "8px 16px", 
                  backgroundColor: "#f44336", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "5px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {msg && <div style={{ 
        marginTop: 20, 
        padding: "15px", 
        backgroundColor: msg.includes("Error") ? "#ffebee" : "#e8f5e8",
        color: msg.includes("Error") ? "#d32f2f" : "#2e7d32",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "bold",
        border: `2px solid ${msg.includes("Error") ? "#f44336" : "#2e7d32"}`
      }}>{msg}</div>}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("products");
  const [user, setUser] = useState(null);
  const [productsKey, setProductsKey] = useState(0);
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (e) {
      // ignore
    }
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === productId);
      if (!existing) return prev;
      if (existing.quantity > 1) {
        return prev.map((p) => (p.id === productId ? { ...p, quantity: p.quantity - 1 } : p));
      }
      return prev.filter((p) => p.id !== productId);
    });
  };

  const clearCart = () => setCart([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const onLogout = () => {
      setUser(null);
      setTab("products");
      setProductsKey((prev) => prev + 1);
    };
    window.addEventListener("logout", onLogout);
    return () => window.removeEventListener("logout", onLogout);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setTab("products"); // Always return to products page after logout
    // Force a products refresh to show the updated state
    setProductsKey(prev => prev + 1);
  };

  const handleProductsChange = () => {
    setProductsKey(prev => prev + 1);
  };

  return (
    <div style={{ 
      padding: "2rem", 
      fontFamily: "system-ui, Arial", 
      backgroundColor: "#f8f9fa", 
      minHeight: "100vh",
      color: "#333"
    }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "24px",
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ marginBottom: 0, color: "#333", fontSize: "28px" }}>Fitness Marketplace</h1>
        <div style={{ marginLeft: 16, color: "#333", fontSize: 14 }}>
          Cart: <strong>{cart.reduce((s, p) => s + (p.quantity || 0), 0)}</strong>
        </div>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <span style={{ color: "#666", fontSize: "14px" }}>
              Welcome, <strong style={{ color: "#333" }}>{user.email}</strong> ({user.role})
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
                fontSize: "14px"
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 24 }}>
        <TabButton active={tab === "products"} onClick={() => setTab("products")}>
          Products
        </TabButton>
        <TabButton active={tab === "cart"} onClick={() => setTab("cart")}>
          Cart
        </TabButton>
        <TabButton active={tab === "register"} onClick={() => setTab("register")}>
          Register
        </TabButton>
        <TabButton active={tab === "login"} onClick={() => setTab("login")}>
          Login
        </TabButton>
        {user && user.role === "vendor" && (
          <TabButton active={tab === "manage"} onClick={() => setTab("manage")}>
            Manage Products
          </TabButton>
        )}
      </div>

      {tab === "products" && <ProductsView key={productsKey} onAddToCart={addToCart} />}
      {tab === "cart" && (
        <CartPage cart={cart} onAdd={addToCart} onRemove={removeFromCart} onClear={clearCart} />
      )}
      {tab === "register" && <RegisterView />}
      {tab === "login" && <LoginView onLogin={handleLogin} />}
      {tab === "manage" && user && user.role === "vendor" && (
        <VendorManagement user={user} onProductsChange={handleProductsChange} />
      )}
    </div>
  );
}
