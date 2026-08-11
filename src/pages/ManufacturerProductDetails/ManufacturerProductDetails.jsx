import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function ManufacturerProductDetails() {
  const { manufacturerSlug, productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch("https://builtright-backend-1.onrender.com/api/products");
        const data = await response.json();

        if (data.status && Array.isArray(data.products)) {
          const foundProduct = data.products.find((item) => {
            const slug =
              item.manufacturerSlug ||
              item.brandSlug ||
              item.brand
                ?.toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");

            return (
              slug === manufacturerSlug &&
              (item._id === productId || item.id === productId)
            );
          });

          setProduct(foundProduct || null);
        }
      } catch (error) {
        console.error("LOAD MANUFACTURER PRODUCT ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [manufacturerSlug, productId]);

  if (loading) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Loading product...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Product not found</h2>

        <button onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  const productImage =
    product.images?.length > 0
      ? product.images[0]
      : product.image;

  return (
    <div style={{ padding: "40px", maxWidth: "1100px", margin: "0 auto" }}>
      <Link
        to={`/manufacturers/${manufacturerSlug}`}
        style={{
          display: "inline-block",
          marginBottom: "20px",
          color: "#166534",
          fontWeight: "700",
          textDecoration: "none",
        }}
      >
        ← Back to Manufacturer
      </Link>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
          alignItems: "center",
        }}
      >
        <div>
          {productImage ? (
            <img
              src={productImage}
              alt={product.name}
              style={{
                width: "100%",
                borderRadius: "20px",
                background: "#f5f5f5",
              }}
            />
          ) : (
            <div
              style={{
                height: "400px",
                borderRadius: "20px",
                background: "#f5f5f5",
                display: "grid",
                placeItems: "center",
              }}
            >
              No Image
            </div>
          )}
        </div>

        <div>
          <span
            style={{
              display: "inline-block",
              marginBottom: "10px",
              background: "#ecfdf5",
              color: "#166534",
              padding: "8px 14px",
              borderRadius: "999px",
              fontWeight: "700",
            }}
          >
            {product.brand || "Manufacturer"}
          </span>

          <h1
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              marginBottom: "12px",
            }}
          >
            {product.name}
          </h1>

          <h2
            style={{
              color: "#c62828",
              marginBottom: "20px",
            }}
          >
            ₦{Number(product.price || 0).toLocaleString()}
          </h2>

          <p
            style={{
              color: "#555",
              lineHeight: "1.8",
              marginBottom: "24px",
            }}
          >
            {product.description ||
              "High-quality solar product available through BuiltRight marketplace."}
          </p>

          <div style={{ marginBottom: "24px" }}>
            <p>
              <strong>Category:</strong> {product.category || "N/A"}
            </p>

            <p>
              <strong>Capacity:</strong> {product.capacity || "N/A"}
            </p>

            <p>
              <strong>Supplier:</strong> {product.supplier || "N/A"}
            </p>
          </div>

          {product.features?.length > 0 && (
            <ul
              style={{
                paddingLeft: "20px",
                marginBottom: "30px",
              }}
            >
              {product.features.map((feature, index) => (
                <li
                  key={index}
                  style={{
                    marginBottom: "10px",
                    color: "#444",
                  }}
                >
                  {feature}
                </li>
              ))}
            </ul>
          )}

          <button
            style={{
              background: "#166534",
              color: "#fff",
              border: "none",
              padding: "14px 24px",
              borderRadius: "12px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManufacturerProductDetails;
