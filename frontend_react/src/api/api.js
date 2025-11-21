import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// ---------------- AUTH ---------------- //

export const registerUser = async (payload) => {
  const res = await api.post("/register", payload);
  return res.data;
};

export const loginUser = async (payload) => {
  const res = await api.post("/login", payload);
  return res.data;
};

// ---------------- PRODUCTS (public) ---------------- //

export const getProducts = async () => {
  const res = await api.get("/products");
  return res.data.items;
};

// ---------------- VENDOR CONTROLS ---------------- //

export const createProduct = async (payload) => {
  const res = await api.post("/products", payload);
  return res.data;
};

export const updateProduct = async (id, payload) => {
  const res = await api.put(`/products/${id}`, payload);
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};
