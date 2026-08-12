import React, { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import logo from "../../assets/logoooo.png";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import "./adminOrders.css";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await fetch("https://builtright-backend-1.onrender.com/api/admin/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.status && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error("LOAD ORDERS ERROR:", error);
        setMessage("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [token]);

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();

      result = result.filter(
        (order) =>
          order.orderNumber?.toLowerCase().includes(search) ||
          order.reference?.toLowerCase().includes(search) ||
          order.customer?.fullName?.toLowerCase().includes(search) ||
          order.customer?.email?.toLowerCase().includes(search) ||
          order.customer?.phone?.toLowerCase().includes(search)
      );
    }

    return result;
  }, [orders, statusFilter, searchTerm]);

  const updateOrderStatus = async (id, status) => {
    try {
      const response = await fetch(
        `https://builtright-backend-1.onrender.com/api/admin/orders/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || "Failed to update order status.");
      }

      setOrders((prev) =>
        prev.map((order) => (order._id === id ? data.order : order))
      );

      setMessage("Order status updated successfully.");
    } catch (error) {
      setMessage(error.message || "Failed to update order status.");
    }
  };

  const deleteOrder = async (order) => {
    if (!window.confirm(`Permanently delete ${order.orderNumber || order.reference}? Linked invoice records will also be removed.`)) return;
    try {
      const response = await fetch(`https://builtright-backend-1.onrender.com/api/admin/orders/${order._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Failed to delete order.");
      setOrders((previous) => previous.filter((item) => item._id !== order._id));
      setMessage(data.message);
    } catch (error) {
      setMessage(error.message || "Failed to delete order.");
    }
  };
const downloadInvoice = async (order) => {
  const doc = new jsPDF();

  const cleanText = (text) => {
    return String(text || "N/A")
      .replace(/[₦]/g, "NGN")
      .replace(/[^\x20-\x7E]/g, "");
  };

  const formatPdfMoney = (value) => {
    if (value == null) return "Request Price";
    return `NGN ${Number(value || 0).toLocaleString()}`;
  };

  const getImageBase64 = (imageUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        resolve(canvas.toDataURL("image/png"));
      };

      img.onerror = reject;
    });
  };

  try {
    const logoBase64 = await getImageBase64(logo);
    doc.addImage(logoBase64, "PNG", 20, 12, 30, 18);
  } catch (error) {
    console.log("Logo could not be added:", error);
  }

  doc.setFontSize(18);
  doc.text("BuiltRight Services Ltd", 58, 22);

  doc.setFontSize(12);
  doc.text("Invoice / Receipt", 58, 32);

  doc.text(`Order Number: ${cleanText(order.orderNumber)}`, 20, 55);
  doc.text(`Payment Reference: ${cleanText(order.reference)}`, 20, 65);
  doc.text(`Status: ${cleanText(order.status)}`, 20, 75);

  doc.text(
    `Date: ${
      order.createdAt
        ? new Date(order.createdAt).toLocaleString()
        : cleanText(order.date)
    }`,
    20,
    85
  );

  doc.text("Customer Details", 20, 105);
  doc.text(`Name: ${cleanText(order.customer?.fullName)}`, 20, 115);
  doc.text(`Email: ${cleanText(order.customer?.email)}`, 20, 125);
  doc.text(`Phone: ${cleanText(order.customer?.phone)}`, 20, 135);

  doc.text("Items", 20, 155);

  let y = 165;

  if (order.items?.length > 0) {
    order.items.forEach((item, index) => {
      const quantity = Number(item.quantity || 1);
      const itemName = cleanText(item.name || "Product");
      const itemTotal =
        item.price != null ? Number(item.price || 0) * quantity : null;

      doc.text(`${index + 1}. ${itemName}`, 20, y);
      y += 8;

      doc.text(`Qty: ${quantity}`, 25, y);
      doc.text(`Total: ${formatPdfMoney(itemTotal)}`, 80, y);
      y += 14;
    });
  } else {
    doc.text("No items found.", 20, y);
    y += 10;
  }

  y += 8;

  doc.setFontSize(14);
  doc.text(`Grand Total: ${formatPdfMoney(order.amount)}`, 20, y);

  doc.setFontSize(10);
  doc.text("Thank you for choosing BuiltRight Services Ltd.", 20, y + 22);

  doc.save(`BuiltRight-Invoice-${order.orderNumber || order._id}.pdf`);
};
  return (
    <AdminLayout
      title="Orders"
      subtitle="Track customer purchases, payment records, and fulfillment status."
    >
      <section className="admin-order-filters">
        <input
          type="text"
          placeholder="Search order number, reference, customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Processing">Processing</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Refunded">Refunded</option>
        </select>
      </section>

      {message && <p className="admin-order-message">{message}</p>}

      <section className="admin-panel">
        <div className="admin-order-head">
          <h2>{filteredOrders.length} Orders</h2>
        </div>

        {loading ? (
          <div className="admin-order-empty">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="admin-order-empty">No orders found.</div>
        ) : (
          <div className="admin-order-grid">
            {filteredOrders.map((order) => (
              <div className="admin-order-card" key={order._id}>
                <div className="admin-order-top">
                  <div>
                    <h3>{order.orderNumber || "Order"}</h3>
                    <p>{order.reference}</p>
                  </div>

                  <span className={`order-status ${order.status}`}>
                    {order.status}
                  </span>
                </div>

                <div className="admin-order-customer">
                  <h4>Customer</h4>
                  <p>{order.customer?.fullName}</p>
                  <p>{order.customer?.email}</p>
                  <p>{order.customer?.phone}</p>
                </div>

                <div className="admin-order-details">
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

                <div className="admin-order-items">
                  <h4>Items</h4>

                  {order.items?.length > 0 ? (
                    order.items.map((item, index) => (
                      <div className="admin-order-item" key={item._id || index}>
                        <span>
                          {item.name} x{item.quantity}
                        </span>

                        <strong>
                          {item.price
                            ? `₦${Number(
                                item.price * item.quantity
                              ).toLocaleString()}`
                            : "Request Price"}
                        </strong>
                      </div>
                    ))
                  ) : (
                    <p>No items found.</p>
                  )}
                </div>

                <div className="admin-order-actions">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateOrderStatus(order._id, e.target.value)
                    }
                  >
                    <option value="Paid">Paid</option>
                    <option value="Processing">Processing</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
                <button
                type="button"
                className="download-order-btn"
                onClick={() => downloadInvoice(order)}
                >
                Download Invoice
                </button>
                <button
                  type="button"
                  className="admin-order-delete-btn"
                  onClick={() => deleteOrder(order)}
                >
                  Permanently Delete Order
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminLayout>
  );
}

export default AdminOrders;
