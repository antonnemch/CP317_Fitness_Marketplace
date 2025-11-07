import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export const getProducts = async () => {
  try {
    const res = await api.get("/products"); // endpoint from backend
    return res.data;
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
};

export default api;
