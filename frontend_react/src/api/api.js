import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export const getProducts = async () => {
  try {
    console.log('Fetching products...');
    const res = await api.get("/products"); // endpoint from backend
    console.log('API Response:', res);
    // Normalize response so callers always receive an array of products.
    // Backend may return either an array or an object like { items: [...] }.
    const data = res && res.data ? res.data : res;
    console.log('Data after first normalization:', data);
    let result = [];
    if (Array.isArray(data)) result = data;
    else if (data && Array.isArray(data.items)) result = data.items;
    console.log('Final normalized result:', result);
    return result;
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
};

export default api;
