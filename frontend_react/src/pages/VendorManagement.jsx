import React, { useEffect, useState } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../api/api";
import "../styles/components.css";

export default function VendorManagement({ user, onProductsChange }) {
  const [products, setProducts] = useState([]);
  const [newProduct, setNew] = useState({ name: "", price: "" });
  const [editProduct, setEdit] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getProducts().then((d) => setProducts(d.items || []));
  }, []);

  const addProduct = async (e) => {
    e.preventDefault();
    await createProduct(newProduct);
    setMsg("Product added!");
    setNew({ name: "", price: "" });
    onProductsChange();
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    await updateProduct(editProduct.id, editProduct);
    setMsg("Updated!");
    setEdit(null);
    onProductsChange();
  };

  const removeProduct = async (id) => {
    await deleteProduct(id);
    setMsg("Deleted product.");
    onProductsChange();
  };

  return (
    <div>
      <h2 className="page-title">Vendor Dashboard</h2>

      <form className="form-card" onSubmit={addProduct}>
        <h3>Add Product</h3>
        <input
          placeholder="Name"
          value={newProduct.name}
          onChange={(e) => setNew({ ...newProduct, name: e.target.value })}
        />
        <input
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) => setNew({ ...newProduct, price: e.target.value })}
        />
        <button className="btn-primary">Add</button>
      </form>

      {editProduct && (
        <form className="form-card" onSubmit={saveEdit}>
          <h3>Edit Product</h3>
          <input
            value={editProduct.name}
            onChange={(e) => setEdit({ ...editProduct, name: e.target.value })}
          />
          <input
            value={editProduct.price}
            onChange={(e) => setEdit({ ...editProduct, price: e.target.value })}
          />
          <button className="btn-primary">Save</button>
        </form>
      )}

      <div className="products-grid">
        {products.map((p) => (
          <div key={p.id} className="product-card">
            <h3>{p.name}</h3>
            <p className="product-price">${Number(p.price).toFixed(2)}</p>

            <div className="vendor-actions">
              <button onClick={() => setEdit(p)}>Edit</button>
              <button className="danger" onClick={() => removeProduct(p.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {msg && <p className="msg-box">{msg}</p>}
    </div>
  );
}
