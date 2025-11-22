// frontend_react/src/pages/Products.jsx

import { useEffect, useState } from "react";
import { getProducts } from "../api/api";
import ProductCard from "../components/ProductCard";
import PageContainer from "../components/PageContainer";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then((items) => {
        console.log("Products in component:", items);
        setProducts(items || []);
      })
      .catch((err) => {
        console.error("Products page failed to load:", err);
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <p style={{ fontSize: "18px", opacity: 0.7 }}>Loading products.</p>
      </PageContainer>
    );
  }

  if (!products || products.length === 0) {
    return (
      <PageContainer>
        <p style={{ fontSize: "18px", opacity: 0.7 }}>No products found.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <h2 style={{ fontSize: "28px", marginBottom: "20px" }}>
        Available Products
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "20px",
        }}
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </PageContainer>
  );
};

export default Products;
