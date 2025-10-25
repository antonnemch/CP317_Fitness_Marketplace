import { useEffect, useState } from "react";
import { getProducts, registerUser, loginUser } from "./api";

// Minimal tab-like UI without react-router
const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      padding: "0.5rem 0.75rem",
      marginRight: "0.5rem",
      border: "1px solid #ccc",
      background: active ? "#eef" : "#fff",
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);

function ProductsView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    setLoading(true);
    getProducts()
      .then((data) => {
        setItems(data.items || []);
        setErr("");
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading products…</p>;
  if (err) return <p style={{ color: "red" }}>Error: {err}</p>;
  if (!items.length) return <p>No products found.</p>;

  return (
    <ul>
      {items.map((p) => (
        <li key={p.id}>
          {p.name} — ${Number(p.price).toFixed(2)}
        </li>
      ))}
    </ul>
  );
}

function RegisterView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    try {
      const res = await registerUser({ email, password });
      setMsg(JSON.stringify(res));
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 360 }}>
      <h3>Create account</h3>
      <input
        type="email"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ display: "block", width: "100%", marginBottom: 8 }}
      />
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{ display: "block", width: "100%", marginBottom: 8 }}
      />
      <button type="submit">Register</button>
      {msg && <pre style={{ marginTop: 12 }}>{msg}</pre>}
    </form>
  );
}

function LoginView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setResult("");
    try {
      const res = await loginUser({ email, password });
      // Store dev token for later requests (if you protect endpoints later)
      localStorage.setItem("token", res.token);
      setResult(JSON.stringify(res, null, 2));
    } catch (e) {
      setResult(`Error: ${e.message}`);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 360 }}>
      <h3>Login</h3>
      <input
        type="email"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ display: "block", width: "100%", marginBottom: 8 }}
      />
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{ display: "block", width: "100%", marginBottom: 8 }}
      />
      <button type="submit">Login</button>
      {result && <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{result}</pre>}
    </form>
  );
}

export default function App() {
  const [tab, setTab] = useState("products"); // 'products' | 'register' | 'login'

  return (
    <div style={{ padding: "1.5rem", fontFamily: "system-ui, Arial" }}>
      <h1 style={{ marginBottom: 8 }}>Fitness Marketplace (Sprint 1)</h1>
      <div style={{ marginBottom: 16 }}>
        <TabButton active={tab === "products"} onClick={() => setTab("products")}>
          Products
        </TabButton>
        <TabButton active={tab === "register"} onClick={() => setTab("register")}>
          Register
        </TabButton>
        <TabButton active={tab === "login"} onClick={() => setTab("login")}>
          Login
        </TabButton>
      </div>

      {tab === "products" && <ProductsView />}
      {tab === "register" && <RegisterView />}
      {tab === "login" && <LoginView />}
    </div>
  );
}
