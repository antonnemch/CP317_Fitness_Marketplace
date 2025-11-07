import React, { useEffect, useState } from "react";
import { getProducts } from "../api/api";
import ProductCard from "../components/ProductCard";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  if (loading) return <p className="p-6">Loading products...</p>;

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.length === 0 ? (
        <p>No products available.</p>
      ) : (
        products.map((p) => <ProductCard key={p.id} product={p} />)
      )}
    </div>
  );
};

export default Products;
