import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import CompareBar from "../../components/CompareBar/CompareBar";
import "./manufacturerproducts.css";

function ManufacturerProducts() {
  const { manufacturerSlug } = useParams();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("https://builtright-backend-1.onrender.com/api/products");
        const data = await response.json();

        if (data.status && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("MANUFACTURER PRODUCTS LOAD ERROR:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const manufacturerProducts = useMemo(() => {
    return products.filter((product) => {
      const manufacturerSlugFromProduct =
        product.manufacturerSlug ||
        product.brandSlug ||
        product.brand
          ?.toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      return manufacturerSlugFromProduct === manufacturerSlug;
    });
  }, [products, manufacturerSlug]);

  const manufacturerName =
    manufacturerProducts[0]?.manufacturer ||
    manufacturerProducts[0]?.brand ||
    "Manufacturer";

  if (isLoading) {
    return (
      <div className="manufacturer-products-page">
        <div className="not-found">Loading manufacturer products...</div>
      </div>
    );
  }

  if (manufacturerProducts.length === 0) {
    return (
      <div className="manufacturer-products-page">
        <div className="not-found">
          <h2>Manufacturer not found</h2>
          <Link to="/manufacturers">← Back to Manufacturers</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="manufacturer-products-page">
      <section className="manufacturer-hero">
        <div className="manufacturer-hero-content">
          <div className="manufacturer-topbar">
            <p className="section-label">Manufacturer</p>

            <Link to="/manufacturers" className="back-manufacturer-btn">
              ← Back to Manufacturers
            </Link>
          </div>

          <h1>{manufacturerName}</h1>
          <p>
            Explore all available products from {manufacturerName}, including
            specifications and current pricing.
          </p>
        </div>
      </section>

      <section className="manufacturer-products-list">
        <div className="manufacturer-products-head">
          <h2>Available Products</h2>
          <p>{manufacturerProducts.length} products available</p>
        </div>

        <div className="products-grid">
          {manufacturerProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              categorySlug={product.categorySlug || "products"}
            />
          ))}
        </div>

        <CompareBar />
      </section>
    </div>
  );
}

export default ManufacturerProducts;
