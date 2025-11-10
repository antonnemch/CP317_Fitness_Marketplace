import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token from localStorage (if present) for initial requests
const attachInitialToken = () => {
  const token = localStorage.getItem("token");
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
};
attachInitialToken();

// Request interceptor - ensure every request has the latest token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error && error.response && error.response.status === 401) {
      // Clear locally stored auth and notify app to update UI
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Dispatch a global logout event so App can react
      try {
        window.dispatchEvent(new Event("logout"));
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Helper to set auth token (call after login)
 * Stores token in localStorage and attaches it to axios defaults.
 */
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  }
}

export const getProducts = async () => {
  try {
    const res = await api.get("/products"); // endpoint from backend
    // Normalize response so callers always receive an array of products.
    const data = res && res.data ? res.data : res;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    return [];
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
};

export default api;
