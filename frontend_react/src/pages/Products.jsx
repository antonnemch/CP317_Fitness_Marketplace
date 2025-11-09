import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import api from "../api/api";

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    console.log('Products component: Starting fetch');
    api.get("/products") // this will call backend API
      .then((res) => {
        console.log('Products component: Received response:', res);
        // Extract the items array from the response
        const items = res.data.items || [];
        console.log('Products component: Setting products with items:', items);
        setProducts(items);
      })
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

  return (
    <div className="products-page">
      <h2>Our Products</h2>
      <div className="product-grid">
        {products.length > 0 ? (
          products.map((p) => <ProductCard key={p.id} product={p} />)
        ) : (
          <p>Loading products...</p>
        )}
      </div>
    </div>
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
