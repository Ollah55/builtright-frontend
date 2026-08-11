import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./suppliers.css";

function Suppliers() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("https://builtright-backend-1.onrender.com/api/products");

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        if (data.status && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("SUPPLIERS LOAD ERROR:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const suppliers = useMemo(() => {
    const grouped = {};

    products.forEach((product) => {
      const supplierName = product.supplier || "Other Supplier";
      const supplierSlug = product.supplierSlug || "other-supplier";

      if (!grouped[supplierSlug]) {
        grouped[supplierSlug] = {
          name: supplierName,
          slug: supplierSlug,
          products: [],
          categories: new Set(),
        };
      }

      grouped[supplierSlug].products.push(product);

      if (product.category) {
        grouped[supplierSlug].categories.add(product.category);
      }
    });

    return Object.values(grouped).map((supplier) => ({
      ...supplier,
      categories: Array.from(supplier.categories),
    }));
  }, [products]);

  if (isLoading) {
    return (
      <div className="suppliers-page">
        <div className="suppliers-loading">
          <h3>Loading suppliers...</h3>
          <p>Please wait while we load supplier products.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="suppliers-page">
      <Helmet>
        <title>Suppliers | BuiltRight Shop</title>
        <meta
          name="description"
          content="Browse solar products by supplier. Explore trusted suppliers and view their available products across batteries, inverters, solar panels, and more."
        />
      </Helmet>

      <section className="suppliers-hero">
        <div className="suppliers-hero-content">
          <p className="section-label">Suppliers</p>
          <h1>Browse Products by Supplier</h1>
          <p>
            Explore trusted suppliers and discover available solar products
            across multiple manufacturers and categories.
          </p>
        </div>
      </section>

      <section className="suppliers-list-section">
        <div className="suppliers-list-head">
          <p className="section-label">Available Suppliers</p>
          <h2>Choose a Supplier</h2>
          <p>
            Select a supplier to view their available product range and compare
            options for your project.
          </p>
        </div>

        {suppliers.length === 0 ? (
          <div className="suppliers-empty">
            <h3>No suppliers found</h3>
            <p>Please check that your products have been seeded properly.</p>
          </div>
        ) : (
          <div className="suppliers-grid">
            {suppliers.map((supplier) => (
              <Link
                key={supplier.slug}
                to={`/suppliers/${supplier.slug}`}
                className="supplier-card"
              >
                <span className="supplier-card-badge">Supplier</span>
                <h3>{supplier.name}</h3>

                <p>
                  Browse products supplied by {supplier.name} across{" "}
                  {supplier.categories.length} product categories.
                </p>

                <div className="supplier-category-tags">
                  {supplier.categories.slice(0, 3).map((category) => (
                    <span key={category}>{category}</span>
                  ))}
                </div>

                <div className="supplier-card-footer">
                  <span>{supplier.products.length} Products</span>
                  <span className="supplier-card-arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Suppliers;
