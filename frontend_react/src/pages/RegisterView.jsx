import React, { useState } from "react";
import { registerUser } from "../api/api";
import "../styles/components.css";

export default function RegisterView() {
  const [form, setForm] = useState({ email: "", password: "", role: "customer" });
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      await registerUser(form);
      setMsg("Account created successfully!");
      setForm({ email: "", password: "", role: "customer" });
    } catch (err) {
      setMsg("Error: " + err.message);
    }
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2 className="form-title">Create Account</h2>

      <input
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <select
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
      >
        <option value="customer">Customer</option>
        <option value="vendor">Vendor</option>
      </select>

      <button className="btn-primary">Register</button>

      {msg && <p className="msg-box">{msg}</p>}
    </form>
  );
}
