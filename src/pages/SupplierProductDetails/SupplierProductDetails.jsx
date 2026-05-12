import React from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import suppliers from "../../data/suppliers";
import { useCart } from "../../context/useCart";
import "./supplierproductdetails.css";

function SupplierProductDetails() {
  const { supplierSlug, productId } = useParams();
  const { addToCart, compareItems, toggleCompare } = useCart();

  const supplier = suppliers.find((item) => item.slug === supplierSlug);

  if (!supplier) {
    return <div className="not-found">Supplier not found.</div>;
  }

  const product = supplier.products.find((item) => item.id === productId);

  if (!product) {
    return <div className="not-found">Product not found.</div>;
  }

  const isCompared = compareItems.some((item) => item.id === product.id);

  const handleAddToCart = () => {
    addToCart(product);

    window.dispatchEvent(
      new CustomEvent("cart-toast", {
        detail: {
          message: `${product.name} added to cart`,
        },
      })
    );
  };

  return (
    <div className="supplier-product-details-page">
      <Helmet>
        <title>
          {product.name} | {supplier.name} | BuiltRight
        </title>
        <meta
          name="description"
          content={`View details for ${product.name} supplied by ${supplier.name}.`}
        />
      </Helmet>

      <section className="supplier-product-hero">
        <div className="supplier-product-hero-content">
          <div className="supplier-product-topbar">
            <Link
              to={`/suppliers/${supplier.slug}`}
              className="back-supplier-products-btn"
            >
              ← Back to {supplier.name}
            </Link>
          </div>

          <div className="supplier-product-layout">
            <div className="supplier-product-image-wrap">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="supplier-product-image"
                />
              ) : (
                <div className="supplier-product-image placeholder">
                  <span>Image coming soon</span>
                </div>
              )}
            </div>

            <div className="supplier-product-info">
              <p className="section-label">Product Details</p>

              <div className="supplier-product-badges">
                {product.manufacturer && (
                  <span className="detail-badge manufacturer">
                    {product.manufacturer}
                  </span>
                )}

                {product.capacity && (
                  <span className="detail-badge capacity">
                    {product.capacity}
                  </span>
                )}
              </div>

              <h1>{product.name}</h1>

              <p className="supplier-product-supplier">
                Supplier: <span>{product.supplier}</span>
              </p>

              <p className="supplier-product-description">
                {product.description ||
                  "High quality solar product available for installation."}
              </p>

              <div className="supplier-product-price">
                {product.price
                  ? `₦${product.price.toLocaleString()}`
                  : "Request Price"}
              </div>

              <div className="supplier-product-meta">
                <div className="meta-item">
                  <span>Category</span>
                  <strong>{product.category}</strong>
                </div>

                {product.type && (
                  <div className="meta-item">
                    <span>Type</span>
                    <strong>{product.type}</strong>
                  </div>
                )}

                <div className="meta-item">
                  <span>Supplier</span>
                  <strong>{supplier.name}</strong>
                </div>
              </div>

              <div className="supplier-product-actions">
                <button
                  type="button"
                  className="detail-btn primary"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </button>

                <button
                  type="button"
                  className={`detail-btn secondary ${
                    isCompared ? "active" : ""
                  }`}
                  onClick={() => toggleCompare(product)}
                >
                  {isCompared ? "Compared" : "Compare"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {product.features?.length > 0 && (
        <section className="supplier-product-features-section">
          <div className="supplier-product-features-wrap">
            <div className="section-head center">
              <p className="section-label">Product Highlights</p>
              <h2>Key Features</h2>
            </div>

            <div className="supplier-product-features-grid">
              {product.features.map((feature, index) => (
                <div className="feature-card" key={index}>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default SupplierProductDetails;