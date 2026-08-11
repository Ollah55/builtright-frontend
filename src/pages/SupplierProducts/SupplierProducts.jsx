import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import "./supplierproducts.css";

function SupplierProducts() {
  const { supplierSlug } = useParams();

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
        console.error("SUPPLIER PRODUCTS LOAD ERROR:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const supplierProducts = useMemo(() => {
    return products.filter((product) => product.supplierSlug === supplierSlug);
  }, [products, supplierSlug]);

  const supplierName = supplierProducts[0]?.supplier || "Supplier";

  if (isLoading) {
    return (
      <div className="supplier-products-page">
        <div className="not-found">Loading supplier products...</div>
      </div>
    );
  }

  if (supplierProducts.length === 0) {
    return (
      <div className="supplier-products-page">
        <div className="not-found">
          <h2>Supplier not found</h2>
          <Link to="/suppliers">← Back to Suppliers</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="supplier-products-page">
      <section className="supplier-hero">
        <div className="supplier-hero-content">
          <div className="supplier-topbar">
            <p className="section-label">Supplier</p>

            <Link to="/suppliers" className="back-supplier-btn">
              ← Back to Suppliers
            </Link>
          </div>

          <h1>{supplierName}</h1>
          <p>
            Browse products supplied by {supplierName}, across multiple
            manufacturers and categories.
          </p>
        </div>
      </section>

      <section className="supplier-products-list">
        <div className="supplier-products-head">
          <h2>Available Products</h2>
          <p>{supplierProducts.length} products available</p>
        </div>

        <div className="products-grid">
          {supplierProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              categorySlug={product.categorySlug || "products"}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default SupplierProducts;
