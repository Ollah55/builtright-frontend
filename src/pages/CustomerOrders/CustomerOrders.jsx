import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import logo from "../../assets/logoooo.png";
import CustomerLayout from "../../components/CustomerLayout/CustomerLayout";
import "./customerOrders.css";

function CustomerOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const token = localStorage.getItem("customerToken");

        const response = await fetch("https://builtright-backend-1.onrender.com/api/customer/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.status && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error("LOAD CUSTOMER ORDERS ERROR:", error);
        setMessage("Failed to load your orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const downloadInvoice = (order) => {
    const doc = new jsPDF();
    doc.addImage(logo, "PNG", 29, 10, 45, 20);

    doc.setFontSize(18);
    doc.text("BuiltRight Services Ltd", 20, 40);

    doc.setFontSize(12);
    doc.text("Invoice / Receipt", 20, 50);

    doc.text(`Order Number: ${order.orderNumber || "N/A"}`, 20, 45);
    doc.text(`Payment Reference: ${order.reference || "N/A"}`, 20, 55);
    doc.text(`Status: ${order.status || "N/A"}`, 20, 65);

    doc.text(
      `Date: ${
        order.createdAt
          ? new Date(order.createdAt).toLocaleString()
          : order.date || "N/A"
      }`,
      20,
      75
    );

    doc.text("Customer Details", 20, 95);
    doc.text(`Name: ${order.customer?.fullName || "N/A"}`, 20, 105);
    doc.text(`Email: ${order.customer?.email || "N/A"}`, 20, 115);
    doc.text(`Phone: ${order.customer?.phone || "N/A"}`, 20, 125);

    doc.text("Items", 20, 145);

    let y = 155;

    order.items?.forEach((item, index) => {
      const itemTotal = Number(item.price || 0) * Number(item.quantity || 1);

      doc.text(
        `${index + 1}. ${item.name} x${item.quantity || 1} - ₦${itemTotal.toLocaleString()}`,
        20,
        y
      );

      y += 10;
    });

    y += 10;

    doc.setFontSize(14);
    doc.text(`Total: ₦${Number(order.amount || 0).toLocaleString()}`, 20, y);

    doc.setFontSize(10);
    doc.text("Thank you for choosing BuiltRight Services Ltd.", 20, y + 20);

    doc.save(`BuiltRight-Invoice-${order.orderNumber || order._id}.pdf`);
  };

  return (
    <CustomerLayout>
      <div className="customer-orders-main">
        <div className="customer-orders-topbar">
          <div>
            <p>Customer Dashboard</p>
            <h1>My Orders</h1>
          </div>

          <button type="button" onClick={() => navigate("/shop")}>
            Continue Shopping
          </button>
        </div>

        {message && <p className="customer-orders-message">{message}</p>}

        <section className="customer-orders-panel">
          <h2>
            {orders.length} Order{orders.length === 1 ? "" : "s"}
          </h2>

          {loading ? (
            <div className="customer-orders-empty">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="customer-orders-empty">
              <h3>No orders yet</h3>
              <p>Your paid orders will appear here after checkout.</p>

              <button type="button" onClick={() => navigate("/shop")}>
                Browse Products
              </button>
            </div>
          ) : (
            <div className="customer-orders-grid">
              {orders.map((order) => (
                <div className="customer-order-card" key={order._id}>
                  <div className="customer-order-top">
                    <div>
                      <h3>{order.orderNumber || "Order"}</h3>
                      <p>{order.reference}</p>
                    </div>

                    <span className={`customer-order-status ${order.status}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="customer-order-details">
                    <p>
                      <strong>Total:</strong>{" "}
                      ₦{Number(order.amount || 0).toLocaleString()}
                    </p>

                    <p>
                      <strong>Date:</strong>{" "}
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : order.date || "N/A"}
                    </p>
                  </div>

                  <div className="customer-order-items">
                    <h4>Items</h4>

                    {order.items?.length > 0 ? (
                      order.items.map((item, index) => (
                        <div className="customer-order-item" key={item._id || index}>
                          <span>
                            {item.name} x{item.quantity}
                          </span>

                          <strong>
                            {item.price
                              ? `₦${Number(item.price * item.quantity).toLocaleString()}`
                              : "Request Price"}
                          </strong>
                        </div>
                      ))
                    ) : (
                      <p>No items found.</p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="download-invoice-btn"
                    onClick={() => downloadInvoice(order)}
                  >
                    Download Invoice
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </CustomerLayout>
  );
}

export default CustomerOrders;
