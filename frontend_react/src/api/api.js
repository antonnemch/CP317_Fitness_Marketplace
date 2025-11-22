import axios from "axios";

// At top of api.js if not already defined:
const API_BASE =
  import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000/api";

async function handleJsonResponse(res) {
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (data && data.error) {
        message = data.error;
      }
    } catch (_) {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }
  return res.json();
}

// ---------------------------------------------
// Vendor dashboard API
// ---------------------------------------------
export async function fetchVendorOverview() {
  const res = await fetch(`${API_BASE}/vendor/overview`);
  return handleJsonResponse(res);
}

export async function vendorCreateProduct(payload) {
  const res = await fetch(`${API_BASE}/vendor/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJsonResponse(res);
}

export async function vendorUpdateProduct(productId, payload) {
  const res = await fetch(`${API_BASE}/vendor/products/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJsonResponse(res);
}


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

// ---------------- ORDERS / CHECKOUT ---------------- //

export const createOrder = async (items) => {
  // items: [{ product_id, quantity }]
  const res = await api.post("/orders", { items });
  return res.data.order; // shape from backend {"order": {...}}
};

export const getOrders = async () => {
  const res = await api.get("/orders");
  return res.data.items || [];  // list of orders
};



export default api;
