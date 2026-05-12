import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import "./adminCustomers.css";

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await fetch(
          "https://builtright-backend.onrender.com/api/admin/customers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (data.status && Array.isArray(data.customers)) {
          setCustomers(data.customers);
        }
      } catch (error) {
        console.error("LOAD CUSTOMERS ERROR:", error);
        setMessage("Failed to load customers.");
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, [token]);
const deleteCustomer = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this customer?"
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(
      `https://builtright-backend.onrender.com/api/admin/customers/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      throw new Error(data.message || "Failed to delete customer.");
    }

    setCustomers((prev) =>
      prev.filter((customer) => customer._id !== id)
    );

    setMessage("Customer deleted successfully.");
  } catch (error) {
    setMessage(error.message || "Failed to delete customer.");
  }
};

  const filteredCustomers = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return customers.filter(
      (customer) =>
        customer.fullName?.toLowerCase().includes(search) ||
        customer.email?.toLowerCase().includes(search) ||
        customer.phone?.toLowerCase().includes(search) ||
        customer.location?.toLowerCase().includes(search)
    );
  }, [customers, searchTerm]);

  return (
    <AdminLayout
      title="Customers"
      subtitle="Manage customer accounts, contact details, and registered users."
    >
      <section className="admin-customer-filters">
        <input
          type="text"
          placeholder="Search name, email, phone, location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </section>

      {message && <p className="admin-customer-message">{message}</p>}

      <section className="admin-panel">
        <div className="admin-customer-head">
          <h2>{filteredCustomers.length} Customers</h2>
        </div>

        {loading ? (
          <div className="admin-customer-empty">Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="admin-customer-empty">No customers found.</div>
        ) : (
          <div className="admin-customers-table-wrap">
            <table className="admin-customers-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Date Joined</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer._id}>
                    <td>
                      <strong>{customer.fullName}</strong>
                      <span>{customer.role}</span>
                    </td>

                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.location || "N/A"}</td>

                    <td>
                      {customer.createdAt
                        ? new Date(customer.createdAt).toLocaleString()
                        : "N/A"}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="admin-customer-delete-btn"
                        onClick={() => deleteCustomer(customer._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}

export default AdminCustomers;