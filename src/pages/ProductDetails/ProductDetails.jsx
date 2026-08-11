import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../../context/useCart";
import "./productDetails.css";

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("https://builtright-backend-1.onrender.com/api/products");
        const data = await response.json();

        if (data.status && Array.isArray(data.products)) {
          setProducts(data.products);

          const foundProduct = data.products.find(
            (item) => item._id === productId || item.id === productId
          );

          if (foundProduct) {
            setProduct(foundProduct);

            const gallery =
              foundProduct.images?.length > 0
                ? foundProduct.images
                : foundProduct.image
                ? [foundProduct.image]
                : [];

            setSelectedImage(gallery[0] || "");
          }
        }
      } catch (error) {
        console.error("LOAD PRODUCT DETAILS ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [productId]);

  const galleryImages = useMemo(() => {
    if (!product) return [];

    return product.images?.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    return products
      .filter(
        (item) =>
          item._id !== product._id &&
          item.category === product.category
      )
      .slice(0, 4);
  }, [products, product]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2000);
  };

  const handleCompare = () => {
    if (!product) return;

    const currentCompare = JSON.parse(localStorage.getItem("compare") || "[]");
    const alreadyExists = currentCompare.find(
      (item) => item._id === product._id
    );

    if (alreadyExists) {
      showToast("Already added to compare");
      return;
    }

    const updatedCompare = [...currentCompare, product];
    localStorage.setItem("compare", JSON.stringify(updatedCompare));
    showToast("Added to compare");
  };

  const whatsappMessage = encodeURIComponent(
    `Hello BuiltRight, I am interested in this product:\n\n${
      product?.name || ""
    }\nPrice: ₦${Number(product?.price || 0).toLocaleString()}\nCapacity: ${
      product?.capacity || "N/A"
    }\nSupplier: ${product?.supplier || "N/A"}`
  );

  if (loading) {
    return (
      <div className="product-details-loading">
        <h2>Loading product details...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-not-found">
        <h2>Product not found</h2>
        <button type="button" onClick={() => navigate("/shop")}>
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <Helmet>
        <title>{product.name} | BuiltRight Marketplace</title>
        <meta
          name="description"
          content={
            product.description ||
            "View solar product details, pricing, specifications, and financing options."
          }
        />
      </Helmet>

      <section className="product-details-hero">
        <div>
          <p className="section-label">BuiltRight Marketplace</p>
          <h1>{product.name}</h1>
          <p>
            Review product details, compare specifications, request financing,
            or add this solar solution to your cart.
          </p>
        </div>

        <Link to="/shop">Back to Shop</Link>
      </section>

      <section className="product-details-layout">
        <div className="product-gallery-panel">
          <div className="product-main-image">
            {selectedImage ? (
              <img src={selectedImage} alt={product.name} />
            ) : (
              <div className="product-image-placeholder">
                <span>{product.category || "Solar Product"}</span>
              </div>
            )}

            <span className="product-stock-badge">
              {product.inStock ? "In Stock" : "Unavailable"}
            </span>
          </div>

          {galleryImages.length > 1 && (
            <div className="product-thumbnails">
              {galleryImages.map((image, index) => (
                <button
                  type="button"
                  key={image || index}
                  className={selectedImage === image ? "active" : ""}
                  onClick={() => setSelectedImage(image)}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-info-panel">
          <div className="product-info-top">
            <span>{product.category || "Solar Product"}</span>
            <span>{product.brand || product.supplier || "BuiltRight"}</span>
          </div>

          <h2>{product.name}</h2>

          <div className="product-detail-price">
            ₦{Number(product.price || 0).toLocaleString()}
          </div>

          <p className="product-description">
            {product.description ||
              "High-quality solar product available through BuiltRight marketplace."}
          </p>

          <div className="product-spec-grid">
            <div>
              <span>Brand</span>
              <strong>{product.brand || "N/A"}</strong>
            </div>

            <div>
              <span>Capacity</span>
              <strong>{product.capacity || "N/A"}</strong>
            </div>

            <div>
              <span>Supplier</span>
              <strong>{product.supplier || "N/A"}</strong>
            </div>

            <div>
              <span>Category</span>
              <strong>{product.category || "N/A"}</strong>
            </div>

            <div>
              <span>Availability</span>
              <strong>
                {product.inStock ? "In Stock" : "Out of Stock"}
              </strong>
            </div>

            <div>
              <span>Manufacturer</span>
              <strong>{product.manufacturer || "BuiltRight"}</strong>
            </div>
          </div>

          {product.features?.length > 0 && (
        <div className="product-features-box">
          <h3>Key Features</h3>

          <ul className="product-features-list">
            {product.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      )}

      {product.specifications &&
        Object.keys(product.specifications).length > 0 && (
          <div className="product-specifications-box">
            <h3>Technical Specifications</h3>

            <div className="product-specifications-grid">
              {Object.entries(product.specifications).map(
                ([key, value]) => (
                  <div
                    className="specification-item"
                    key={key}
                  >
                    <span>{key}</span>
                    <strong>{value}</strong>
                  </div>
                )
              )}
            </div>
          </div>
      )}

          <div className="product-financing-box">
            <h3>Financing Available</h3>
            <p>
              Apply for solar financing and let BuiltRight help you structure a
              suitable payment plan with our selected finance partners.
            </p>
          </div>

          <div className="product-detail-actions">
            <button
              type="button"
              className="add-cart-btn"
              disabled={!product.inStock}
              onClick={() => {
                addToCart(product);
                showToast("Product added to cart");
              }}
            >
              Add to Cart
            </button>

            <button
              type="button"
              className="buy-now-btn"
              onClick={() => navigate("/financing")}
            >
              Apply for Financing
            </button>

            <button
              type="button"
              className="compare-btn"
              onClick={handleCompare}
            >
              Compare
            </button>

            <a
              className="whatsapp-product-btn"
              href={`https://wa.me/2349134991239?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp Enquiry
            </a>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="related-products-section">
          <div className="related-products-head">
            <h2>Related Products</h2>
            <p>Explore similar solar solutions from BuiltRight marketplace.</p>
          </div>

          <div className="related-products-grid">
            {relatedProducts.map((item) => {
              const itemImage =
                item.images?.length > 0 ? item.images[0] : item.image;

              return (
                <Link
                  to={`/shop/${item.categorySlug}/${item._id}`}
                  className="related-product-card"
                  key={item._id}
                >
                  <div className="related-product-image">
                    {itemImage ? (
                      <img src={itemImage} alt={item.name} />
                    ) : (
                      <div className="product-image-placeholder">
                        <span>{item.category}</span>
                      </div>
                    )}
                  </div>

                  <div className="related-product-body">
                    <span>{item.brand || item.supplier}</span>
                    <h3>{item.name}</h3>
                    <strong>
                      ₦{Number(item.price || 0).toLocaleString()}
                    </strong>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {toast && <div className="product-details-toast">{toast}</div>}
    </div>
  );
}

export default ProductDetails;
