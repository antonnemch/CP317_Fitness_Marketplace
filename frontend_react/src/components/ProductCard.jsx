import "../styles/ProductCard.css";
import "../styles/themes.css";

export default function ProductCard({ product }) {
  return (
    <div className="product-card card">
      <h3 className="product-title">{product.name}</h3>

      <p className="product-price">${product.price.toFixed(2)}</p>

      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.name}
          className="product-img"
        />
      )}
    </div>
  );
}
