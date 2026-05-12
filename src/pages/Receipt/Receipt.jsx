import React, { useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import html2pdf from "html2pdf.js";
import "./receipt.css";

function Receipt() {
  const location = useLocation();
  const receiptRef = useRef(null);

  const order = location.state || {
    orderNumber: "BR-20260416-4821",
    reference: "PSK-1234567890",
    customer: {
      fullName: "Customer Name",
      email: "customer@email.com",
      phone: "+234 801 234 5678",
    },
    items: [
      {
        id: "1",
        name: "10KWh Smart Stackable Battery",
        quantity: 1,
        price: null,
      },
      {
        id: "2",
        name: "5KVA Hybrid Inverter",
        quantity: 1,
        price: null,
      },
    ],
    amount: null,
    date: new Date().toLocaleDateString(),
    status: "Paid",
  };

  const subtotal =
    order.items?.reduce(
      (sum, item) => sum + ((item.price || 0) * (item.quantity || 0)),
      0
    ) || 0;

  const handleDownloadPDF = () => {
    if (!receiptRef.current) return;

    const options = {
      margin: 0.4,
      filename: `${order.orderNumber || "receipt"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0,
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf().set(options).from(receiptRef.current).save();
  };

  return (
    <div className="receipt-page">
      <Helmet>
        <title>Payment Receipt | BuiltRight</title>
        <meta
          name="description"
          content="View your BuiltRight payment receipt and order summary."
        />
      </Helmet>

      <section className="receipt-wrapper">
        <div className="receipt-card" ref={receiptRef}>
          <div className="receipt-header">
            <div>
              <p className="receipt-brand">BuiltRight Services Ltd</p>
              <h1>Payment Receipt</h1>
              <p className="receipt-subtext">
                Thank you for your payment. Your order has been received
                successfully.
              </p>
            </div>

            <div className="receipt-status-box">
              <span className="receipt-status-label">Status</span>
              <strong className="receipt-status-paid">{order.status}</strong>
            </div>
          </div>

          <div className="receipt-grid">
            <div className="receipt-info-card">
              <span>Order Number</span>
              <strong>{order.orderNumber}</strong>
            </div>

            <div className="receipt-info-card">
              <span>Payment Reference</span>
              <strong>{order.reference}</strong>
            </div>

            <div className="receipt-info-card">
              <span>Payment Date</span>
              <strong>{order.date}</strong>
            </div>

            <div className="receipt-info-card">
              <span>Total Paid</span>
              <strong>
                {order.amount != null
                  ? `₦${order.amount.toLocaleString()}`
                  : "Request Price"}
              </strong>
            </div>
          </div>

          <div className="receipt-section">
            <h2>Customer Details</h2>
            <div className="receipt-customer-grid">
              <div>
                <span>Full Name</span>
                <p>{order.customer?.fullName || "N/A"}</p>
              </div>
              <div>
                <span>Email Address</span>
                <p>{order.customer?.email || "N/A"}</p>
              </div>
              <div>
                <span>Phone Number</span>
                <p>{order.customer?.phone || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="receipt-section">
            <h2>Order Summary</h2>

            <div className="receipt-table-wrap">
              <table className="receipt-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>
                        {item.price != null
                          ? `₦${item.price.toLocaleString()}`
                          : "Request Price"}
                      </td>
                      <td>
                        {item.price != null
                          ? `₦${(item.price * item.quantity).toLocaleString()}`
                          : "Request Price"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="receipt-total-box">
              <div className="receipt-total-row">
                <span>Subtotal</span>
                <strong>
                  {subtotal > 0 ? `₦${subtotal.toLocaleString()}` : "Request Price"}
                </strong>
              </div>

              <div className="receipt-total-row grand-total">
                <span>Total Paid</span>
                <strong>
                  {order.amount != null
                    ? `₦${order.amount.toLocaleString()}`
                    : "Request Price"}
                </strong>
              </div>
            </div>
          </div>

          <div className="receipt-next-step">
            <h2>Next Step to Installation</h2>
            <p>
              Our team will review your order and contact you shortly to confirm
              product availability, final pricing where applicable, delivery,
              and installation schedule.
            </p>

            <ul>
              <li>Your order is now being processed.</li>
              <li>
                Items without confirmed prices will be updated once supplier
                pricing is finalized.
              </li>
              <li>You may be contacted for site confirmation if required.</li>
              <li>
                Installation or delivery arrangements will be communicated by
                our team.
              </li>
            </ul>

            <p className="receipt-support">
              For urgent enquiries, contact:{" "}
              <a href="tel:+2349134991239">+234 913 499 1239</a> or{" "}
              <a href="mailto:info@builtrightltd.com">
                info@builtrightltd.com
              </a>
            </p>
          </div>
        </div>

        <div className="receipt-actions">
          <button
            type="button"
            className="receipt-btn secondary"
            onClick={() => window.print()}
          >
            Print Receipt
          </button>

          <button
            type="button"
            className="receipt-btn secondary"
            onClick={handleDownloadPDF}
          >
            Download PDF
          </button>

          <Link to="/shop" className="receipt-btn primary">
            Continue Shopping
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Receipt;