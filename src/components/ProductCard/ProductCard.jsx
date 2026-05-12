import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/useCart";
import "./productcard.css";

function ProductCard({ product, categorySlug }) {
  const { addToCart, compareItems, toggleCompare } = useCart();
  const [added, setAdded] = useState(false);

  const isCompared = compareItems.some((item) => item.id === product.id);

  const productLink = categorySlug.startsWith("supplier/")
    ? `/suppliers/${categorySlug.replace("supplier/", "")}/${product.id}`
    : `/shop/${categorySlug}/${product.id}`;

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);

    window.dispatchEvent(
      new CustomEvent("cart-toast", {
        detail: {
          message: `${product.name} added to cart`,
        },
      })
    );

    setTimeout(() => {
      setAdded(false);
    }, 1200);
  };

  return (
    <article className={`product-card ${isCompared ? "is-compared" : ""}`}>
      <Link to={productLink} className="product-card-image-link">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="product-card-image"
          />
        ) : (
          <div className="product-card-image placeholder">
            <span>Image coming soon</span>
          </div>
        )}
      </Link>

      <div className="product-card-body">
        <div className="product-card-top">
          {product.manufacturer && (
            <span className="product-brand">{product.manufacturer}</span>
          )}

          {product.capacity && (
            <span className="product-capacity">{product.capacity}</span>
          )}
        </div>

        <Link to={productLink} className="product-card-title-link">
          <h3>{product.name}</h3>
        </Link>

        {product.supplier && (
          <p className="product-supplier">
            Supplier: <span>{product.supplier}</span>
          </p>
        )}

        <p className="product-card-description">
          {product.description ||
            "High quality solar product available for installation."}
        </p>

        {product.features?.length > 0 && (
          <ul className="product-card-features">
            {product.features.slice(0, 3).map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        )}

        <div className="product-card-footer">
          <div className="product-card-price">
            {product.price ? `₦${product.price.toLocaleString()}` : "Request Price"}
          </div>

          <div className="product-card-actions">
            <button
              type="button"
              className={`product-btn add-btn ${added ? "added" : ""}`}
              onClick={handleAddToCart}
            >
              {added ? "Added ✓" : "Add to Cart"}
            </button>

            <button
              type="button"
              className={`product-btn compare-btn ${isCompared ? "active" : ""}`}
              onClick={() => toggleCompare(product)}
            >
              {isCompared ? "Compared" : "Compare"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;