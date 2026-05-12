import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import "./compare.css";

function Compare() {
  const [compareItems, setCompareItems] = useState(() => {
  return JSON.parse(localStorage.getItem("compare") || "[]");
});

  const removeItem = (id) => {
    const updatedItems = compareItems.filter((item) => item._id !== id);
    setCompareItems(updatedItems);
    localStorage.setItem("compare", JSON.stringify(updatedItems));
  };

  const clearCompare = () => {
    setCompareItems([]);
    localStorage.removeItem("compare");
  };

  return (
    <div className="compare-page">
      <Helmet>
        <title>Compare Solar Products | BuiltRight</title>
        <meta
          name="description"
          content="Compare solar products, prices, suppliers, capacity, and categories on BuiltRight."
        />
      </Helmet>

      <section className="compare-hero">
        <p className="section-label">Product Comparison</p>
        <h1>Compare Solar Products</h1>
        <p>
          Review selected products side-by-side before adding them to your cart
          or requesting financing.
        </p>
      </section>

      <section className="compare-content">
        <div className="compare-head">
          <h2>{compareItems.length} Product(s) Selected</h2>

          {compareItems.length > 0 && (
            <button type="button" onClick={clearCompare}>
              Clear All
            </button>
          )}
        </div>

        {compareItems.length === 0 ? (
          <div className="compare-empty">
            <h3>No products selected for comparison.</h3>
            <p>Go back to the shop and click Compare on any product.</p>
          </div>
        ) : (
          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Product</th>
                  {compareItems.map((item) => (
                    <th key={item._id || item.name}>{item.name}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Price</td>
                  {compareItems.map((item) => (
                    <td key={item._id || item.name}>
                      ₦{Number(item.price || 0).toLocaleString()}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td>Supplier</td>
                  {compareItems.map((item) => (
                    <td key={item._id || item.name}>{item.supplier}</td>
                  ))}
                </tr>

                <tr>
                  <td>Brand</td>
                  {compareItems.map((item) => (
                    <td key={item._id || item.name}>{item.brand || "N/A"}</td>
                  ))}
                </tr>

                <tr>
                  <td>Category</td>
                  {compareItems.map((item) => (
                    <td key={item._id || item.name}>{item.category}</td>
                  ))}
                </tr>

                <tr>
                  <td>Capacity</td>
                  {compareItems.map((item) => (
                    <td key={item._id || item.name}>{item.capacity || "N/A"}</td>
                  ))}
                </tr>

                <tr>
                  <td>Status</td>
                  {compareItems.map((item) => (
                    <td key={item._id || item.name}>
                      {item.inStock ? "In Stock" : "Unavailable"}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td>Description</td>
                  {compareItems.map((item) => (
                    <td key={item._id || item.name}>
                      {item.description || "No description available."}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td>Action</td>
                  {compareItems.map((item) => (
                    <td key={item._id || item.name}>
                      <button
                        type="button"
                        className="remove-compare-btn"
                        onClick={() => removeItem(item._id)}
                      >
                        Remove
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Compare;