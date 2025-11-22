import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api",
  withCredentials: false,
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
  try {
    const res = await api.get("/products");
    console.log("GET /products response:", res.data);

    // Your backend returns: { items: [...] }
    if (res.data && Array.isArray(res.data.items)) {
      return res.data.items;
    }

    console.warn("Unexpected /products response shape:", res.data);
    return [];
  } catch (err) {
    console.error("Error fetching products:", err);
    throw err;
  }
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

export default api;
