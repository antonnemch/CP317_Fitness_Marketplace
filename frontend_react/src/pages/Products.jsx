import React, { useEffect, useState } from "react";
import api from "../api/api";
import ProductCard from "../components/ProductCard";
import PageContainer from "../components/PageContainer";

const Products = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState(() => new Set());
  const auth = useAuth();

  useEffect(() => {
    api.get("/products")
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <p style={{ fontSize: "18px", opacity: 0.7 }}>Loading products...</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <h2 style={{ fontSize: "28px", marginBottom: "20px" }}>
        Available Products
      </h2>

      {products.length === 0 ? (
        <p style={{ opacity: 0.7 }}>No products available.</p>
      ) : (
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
      )}
    </PageContainer>
  );
};

export default Products;


// import React, { useEffect, useState } from "react";
// import { getProducts } from "../api/api";
// import ProductCard from "../components/ProductCard";

// const Products = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       const data = await getProducts();
//       setProducts(data);
//       setLoading(false);
//     };
//     fetchProducts();
//   }, []);

//   if (loading) return <p className="p-6">Loading products...</p>;

//   return (
//     <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
//       {products.length === 0 ? (
//         <p>No products available.</p>
//       ) : (
//         products.map((p) => <ProductCard key={p.id} product={p} />)
//       )}
//     </div>
//   );
// };

// export default Products;
