import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import "./categoryproducts.css";

function CategoryProducts() {
  const { categorySlug } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("https://builtright-backend-1.onrender.com/api/products");
        const data = await response.json();

        if (data.status && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("CATEGORY PRODUCTS ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (item) => item.categorySlug === categorySlug
    );
  }, [products, categorySlug]);

  const categoryName =
    filteredProducts[0]?.category || "Category";

  if (loading) {
    return (
      <div className="category-products-page">
        <div className="category-loading">
          <h2>Loading products...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="category-products-page">
      <Helmet>
        <title>{categoryName} | BuiltRight</title>
      </Helmet>

      <section className="category-products-hero">
        <div className="category-products-hero-content">
          <p className="section-label">Category</p>

          <h1>{categoryName}</h1>

          <p>
            Explore available products under the {categoryName} category.
          </p>
        </div>
      </section>

      <section className="category-products-section">
        <div className="category-products-head">
          <h2>{filteredProducts.length} Products Found</h2>

          <Link to="/shop" className="back-shop-btn">
            Back to Shop
          </Link>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="category-empty">
            <h3>No products found</h3>
          </div>
        ) : (
          <div className="category-products-grid">
            {filteredProducts.map((product) => (
              <Link
                key={product._id}
                to={`/shop/${product.categorySlug}/${product._id}`}
                className="category-product-card"
              >
                <div className="category-product-image">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                    />
                  ) : (
                    <div className="product-image-placeholder">
                      <span>{product.category}</span>
                    </div>
                  )}
                </div>

                <div className="category-product-body">
                  <span>{product.brand || product.supplier}</span>

                  <h3>{product.name}</h3>

                  <strong>
                    ₦{Number(product.price || 0).toLocaleString()}
                  </strong>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default CategoryProducts;
