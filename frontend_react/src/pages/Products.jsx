import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import api, { getProducts } from "../api/api";
import { useAuth } from "../App";

const Products = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState(() => new Set());
  const auth = useAuth();

  useEffect(() => {
    console.log('Products component: Starting fetch');
    // Use helper which normalizes the response
    getProducts()
      .then((items) => setProducts(items))
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

  // Load wishlist from server when authenticated or from localStorage when not
  useEffect(() => {
    const loadWishlist = async () => {
      if (auth && auth.isAuthenticated) {
        try {
          const res = await api.get("/wishlist");
          const data = res && res.data ? res.data : res;
          const ids = (Array.isArray(data.items) ? data.items : []).map((i) => i.id);
          setWishlist(new Set(ids));
        } catch (err) {
          console.warn("Failed to load server wishlist, falling back to local:", err);
          // fallback to local
          const local = JSON.parse(localStorage.getItem("wishlist_local") || "[]");
          setWishlist(new Set(local));
        }
      } else {
        const local = JSON.parse(localStorage.getItem("wishlist_local") || "[]");
        setWishlist(new Set(local));
      }
    };

    loadWishlist();
  }, [auth && auth.isAuthenticated]);

  const toggleWishlist = async (id) => {
    // If authenticated, call server endpoints; otherwise update localStorage
    if (auth && auth.isAuthenticated) {
      try {
        if (wishlist.has(id)) {
          await api.delete(`/wishlist/${id}`);
          setWishlist((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        } else {
          await api.post(`/wishlist/${id}`);
          setWishlist((prev) => new Set(prev).add(id));
        }
      } catch (err) {
        console.error("Wishlist toggle failed:", err);
      }
    } else {
      // local-only wishlist
      setWishlist((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        const arr = Array.from(next);
        localStorage.setItem("wishlist_local", JSON.stringify(arr));
        return next;
      });
    }
  };

  return (
    <div className="products-page">
      <h2>Our Products</h2>
      <div className="product-grid">
        {products.length > 0 ? (
          products.map((p) => {
            const prod = {
              id: p.id,
              name: p.name,
              description: p.description || "",
              price: p.price,
              image: p.image || p.image_url || "",
              stock: p.stock ?? 0,
              isWishlisted: wishlist.has(p.id),
            };

            return (
              <ProductCard
                key={p.id}
                product={prod}
                onAdd={onAddToCart}
                onToggleWishlist={() => toggleWishlist(p.id)}
              />
            );
          })
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
