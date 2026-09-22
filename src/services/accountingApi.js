const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://builtright-backend-1.onrender.com";

export async function accountingApi(path, { method = "GET", body, admin = false } = {}) {
  const token = localStorage.getItem(admin ? "builtright_admin_token" : "accountantToken") || (admin ? localStorage.getItem("adminToken") : "");
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const type = response.headers.get("content-type") || "";
  if (!type.includes("application/json")) throw new Error("Accounting service is unavailable. Check the backend deployment.");
  const data = await response.json();
  if (!response.ok || !data.status) throw new Error(data.message || "Accounting request failed.");
  return data;
}

export const naira = (kobo) => `₦${(Number(kobo || 0) / 100).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const plainNaira = (kobo) => (Number(kobo || 0) / 100).toFixed(2);
