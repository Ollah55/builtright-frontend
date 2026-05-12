import React from "react";
import { useCart } from "../../context/useCart";
import "./comparebar.css";

function CompareBar() {
  const { compareItems, toggleCompare } = useCart();

  if (compareItems.length === 0) return null;

  return (
    <section className="compare-section">
      <div className="compare-header">
        <div>
          <h2>Compare Selected Products</h2>
          <p>{compareItems.length} product(s) selected</p>
        </div>
      </div>

      <div className="compare-table-wrap">
        <div className="compare-table">
          <div className="compare-row compare-head">
            <div>Specification</div>
            {compareItems.map((item) => (
              <div key={item.id}>{item.name}</div>
            ))}
          </div>

          <div className="compare-row">
            <div>Brand</div>
            {compareItems.map((item) => (
              <div key={item.id}>{item.brand || "-"}</div>
            ))}
          </div>

          <div className="compare-row">
            <div>Capacity</div>
            {compareItems.map((item) => (
              <div key={item.id}>{item.capacity || "-"}</div>
            ))}
          </div>

          <div className="compare-row">
            <div>Price</div>
            {compareItems.map((item) => (
              <div key={item.id}>₦{item.price.toLocaleString()}</div>
            ))}
          </div>

          <div className="compare-row">
            <div>Description</div>
            {compareItems.map((item) => (
              <div key={item.id}>{item.description || "-"}</div>
            ))}
          </div>

          <div className="compare-row">
            <div>Actions</div>
            {compareItems.map((item) => (
              <div key={item.id}>
                <button
                  type="button"
                  className="remove-compare-btn"
                  onClick={() => toggleCompare(item)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CompareBar;