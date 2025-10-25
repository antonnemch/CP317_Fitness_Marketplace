// Simple API wrapper for your Flask backend.
// Reads the base URL from Vite env: VITE_API_URL
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

// Generic request helper with JSON handling and basic error surfacing
async function apiRequest(path, { method = "GET", body, headers } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Attempt to parse JSON either way; fall back to text for debugging
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const msg = (data && data.error) || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export const getProducts = () => apiRequest("/products");
export const registerUser = (payload) =>
  apiRequest("/register", { method: "POST", body: payload });
export const loginUser = (payload) =>
  apiRequest("/login", { method: "POST", body: payload });
