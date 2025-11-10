import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";
const TOKEN_KEY = "marketplace_auth_token";
const USER_KEY = "marketplace_user_data";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000, 
});

// --- Token Management Helpers (T2) ---
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

// --- User Data Management ---
export const setUserData = (user) => localStorage.setItem(USER_KEY, JSON.stringify(user));
export const removeUserData = () => localStorage.removeItem(USER_KEY);
export const getUserData = () => JSON.parse(localStorage.getItem(USER_KEY));

// --- Request Interceptor ---
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- AUTH API CALLS ---
export const registerUser = async (payload) => {
  const res = await api.post("/register", payload);
  return res.data;
};

export const loginUser = async (payload) => {
  const res = await api.post("/login", payload);
  // CRITICAL: Save token and user data on success (T2)
  setToken(res.data.token);
  setUserData(res.data.user);
  return res.data.user;
};

export const logoutUser = () => {
    removeToken();
    removeUserData();
};

// --- PRODUCT & DISCOVERY (T7) ---
export const getProducts = async (queryString = "") => {
  const res = await api.get(`/products?${queryString}`);
  return res.data.items || [];
};

export const getProductDetails = async (productId) => {
    const res = await api.get(`/products/${productId}`);
    return res.data;
};

// --- VENDOR MANAGEMENT (VR-1) ---
export const createProduct = async (productData) => {
    const res = await api.post("/products", productData);
    return res.data;
};
export const updateProduct = async (productId, updateData) => {
    const res = await api.put(`/products/${productId}`, updateData);
    return res.data;
};
export const deleteProduct = async (productId) => {
    const res = await api.delete(`/products/${productId}`);
    return res.data;
};

// --- WISHLIST (CR-2) ---
export const getWishlist = async () => {
  const res = await api.get("/wishlist");
  return res.data;
};
export const addToWishlist = async (productId) => {
  const res = await api.post(`/wishlist/${productId}`);
  return res.data;
};
export const removeFromWishlist = async (productId) => {
  const res = await api.delete(`/wishlist/${productId}`);
  return res.data;
};

// --- ORDER / CHECKOUT (CR-4, CR-3) ---
// Assuming cart is handled by a separate module or simple state
export const getCartItems = async () => {
  // STUB: Replace with actual GET /api/cart logic when implemented
  return { items: [
      { id: 1, name: "Yoga Mat", price: 29.99, quantity: 1, stock: 50 },
      { id: 2, name: "Dumbbells Set", price: 89.99, quantity: 1, stock: 30 }
  ], total: 119.98 }; 
};
export const createOrder = async () => {
  const res = await api.post("/orders", {});
  return res.data;
};
export const getOrders = async () => {
  const res = await api.get("/orders");
  return res.data.orders || [];
};

// --- ADMIN / VENDOR DASHBOARD (VR-4, AD-3, AD-5) ---
export const getVendorDashboardData = async () => {
  const res = await api.get("/vendor/dashboard");
  return res.data;
};
export const getReportedProducts = async () => {
  const res = await api.get("/admin/reviews/reported");
  return res.data;
};
export const moderateProduct = async (productId, action) => {
  const res = await api.post(`/admin/products/${productId}/moderation`, { action });
  return res.data;
};
export const getUsersForAdmin = async () => {
  // STUB: Backend needs GET /api/admin/users
  return { users: [
      { id: 1, email: "customer@test.com", role: "customer", status: "active" },
      { id: 2, email: "vendor@test.com", role: "vendor", status: "active" },
      { id: 4, email: "suspended@test.com", role: "customer", status: "suspended" },
  ]}; 
};
export const suspendUser = async (userId) => {
  const res = await api.post(`/admin/users/${userId}/suspend`);
  return res.data;
};
export const activateUser = async (userId) => {
  const res = await api.post(`/admin/users/${userId}/activate`);
  return res.data;
};