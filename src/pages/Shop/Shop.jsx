import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useCart } from "../../context/useCart";
import "./shop.css";

function Shop() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState("");

  const [compareItems, setCompareItems] = useState(() => {
    return JSON.parse(localStorage.getItem("compare") || "[]");
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("https://builtright-backend.onrender.com/api/products");
        const data = await response.json();

        if (data.status && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("PRODUCT LOAD ERROR:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2000);
  };

  const suppliers = useMemo(() => {
    return [
      "All",
      ...new Set(products.map((product) => product.supplier).filter(Boolean)),
    ];
  }, [products]);

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedSupplier !== "All") {
      result = result.filter((product) => product.supplier === selectedSupplier);
    }

    if (selectedCategory !== "All") {
      result = result.filter((product) => product.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();

      result = result.filter(
        (product) =>
          product.name?.toLowerCase().includes(search) ||
          product.brand?.toLowerCase().includes(search) ||
          product.capacity?.toLowerCase().includes(search) ||
          product.category?.toLowerCase().includes(search) ||
          product.supplier?.toLowerCase().includes(search)
      );
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (sortBy === "price-high") {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    if (sortBy === "name") {
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    return result;
  }, [products, selectedSupplier, selectedCategory, searchTerm, sortBy]);

  const groupedBySupplier = useMemo(() => {
    return filteredProducts.reduce((acc, product) => {
      const supplier = product.supplier || "Other";

      if (!acc[supplier]) {
        acc[supplier] = [];
      }

      acc[supplier].push(product);
      return acc;
    }, {});
  }, [filteredProducts]);

  const handleCompare = (product) => {
    const exists = compareItems.find((item) => item._id === product._id);

    if (exists) {
      showToast("Already added to compare");
      return;
    }

    const updated = [...compareItems, product];
    setCompareItems(updated);
    localStorage.setItem("compare", JSON.stringify(updated));
    showToast("Added to compare");
  };

  if (isLoading) {
    return (
      <div className="shop-loading">
        <h3>Loading premium products...</h3>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <Helmet>
        <title>Shop Solar Products | BuiltRight</title>
      </Helmet>

      <section className="shop-hero">
        <div className="shop-hero-content">
          <p className="section-label">BuiltRight Marketplace</p>
          <h1>Shop Solar Products by Supplier, Category, and Capacity</h1>
          <p>
            Explore trusted solar products from BuiltRight suppliers. Compare
            inverters, batteries, lithium systems, panels, controllers, and
            accessories.
          </p>

          <div className="shop-hero-stats">
            <div>
              <strong>{products.length}</strong>
              <span>Products</span>
            </div>

            <div>
              <strong>{Math.max(suppliers.length - 1, 0)}</strong>
              <span>Suppliers</span>
            </div>

            <div>
              <strong>{Math.max(categories.length - 1, 0)}</strong>
              <span>Categories</span>
            </div>
          </div>
        </div>
      </section>

      <section className="shop-controls-section">
        <div className="shop-controls-card">
          <div className="shop-search">
            <label>Search products</label>
            <input
              type="text"
              placeholder="Search by name, brand, capacity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="shop-filter-grid">
            <div>
              <label>Supplier</label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
              >
                {suppliers.map((supplier) => (
                  <option key={supplier} value={supplier}>
                    {supplier}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Sort</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="shop-products-section">
        <div className="shop-results-head">
          <div>
            <p className="section-label">Products</p>
            <h2>
              {filteredProducts.length} Product
              {filteredProducts.length === 1 ? "" : "s"} Found
            </h2>
          </div>

          <div className="shop-head-actions">
            <Link to="/compare" className="compare-view-btn">
              View Compare
            </Link>

            <button
              type="button"
              className="shop-reset-btn"
              onClick={() => {
                setSearchTerm("");
                setSelectedSupplier("All");
                setSelectedCategory("All");
                setSortBy("featured");
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="shop-empty-state">
            <h3>No products found</h3>
            <p>Try changing your search, supplier, or category filter.</p>
          </div>
        ) : (
          Object.keys(groupedBySupplier).map((supplier) => (
            <div className="supplier-product-group" key={supplier}>
              <div className="supplier-group-head">
                <h3>{supplier}</h3>
                <span>{groupedBySupplier[supplier].length} products</span>
              </div>

              <div className="product-grid">
                {groupedBySupplier[supplier].map((product) => {
                  const isCompared = compareItems.find(
                    (item) => item._id === product._id
                  );

                  return (
                    <article
                      className="product-card"
                      key={product._id || product.name}
                    >
                      <div className="product-image-box">
                        {(() => {
                          const productImages =
                            product.images?.length > 0
                              ? product.images
                              : product.image
                              ? [product.image]
                              : [];

                          const mainImage = productImages[0];

                          return mainImage ? (
                            <>
                              <img src={mainImage} alt={product.name} />

                              {productImages.length > 1 && (
                                <div className="product-image-count">
                                  +{productImages.length - 1} more
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="product-image-placeholder">
                              <span>{product.category || "Solar Product"}</span>
                            </div>
                          );
                        })()}

                        <div className="product-badges">
                          <span>{product.category || "Solar"}</span>
                          <span>{product.inStock ? "In Stock" : "Unavailable"}</span>
                        </div>
                      </div>

                      <div className="product-card-body">
                        <div className="product-meta-row">
                          <span>{product.brand || product.supplier}</span>
                          <span>{product.capacity || "Solar"}</span>
                        </div>

                        <Link to={`/shop/${product.categorySlug}/${product._id}`}>
                          {product.name}
                        </Link>

                        <p>
                          {product.description ||
                            "Solar product available from BuiltRight marketplace."}
                        </p>

                        <div className="product-price-row">
                          <strong>
                            ₦{Number(product.price || 0).toLocaleString()}
                          </strong>
                          <span>Financing available</span>
                        </div>

                        <div className="product-actions">
                          <button
                            type="button"
                            className="product-btn primary"
                            onClick={() => {
                              addToCart(product);
                              showToast(`🛒 ${product.name} added to cart`);
                            }}
                          >
                            Add to Cart
                          </button>

                          <button
                            type="button"
                            className={`product-btn secondary ${
                              isCompared ? "active" : ""
                            }`}
                            onClick={() => handleCompare(product)}
                          >
                            {isCompared ? "Compared" : "Compare"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </section>

      {toast && <div className="shop-toast">{toast}</div>}
    </div>
  );
}

export default Shop;