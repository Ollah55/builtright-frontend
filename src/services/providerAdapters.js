const API_BASE_URL = "https://builtright-backend-1.onrender.com";

export const providerState = {
  bank: {
    configured: import.meta.env.VITE_BANK_PROVIDER_ENABLED === "true",
    name: import.meta.env.VITE_BANK_PROVIDER_NAME || "Bank provider pending",
  },
  ashGridX: {
    configured: import.meta.env.VITE_ASHGRIDX_ENABLED === "true",
    name: "AshGridX",
  },
};

export class ProviderNotConfiguredError extends Error {
  constructor(provider) {
    super(`${provider} is not configured yet.`);
    this.name = "ProviderNotConfiguredError";
  }
}

async function providerRequest(path, options = {}) {
  const token = localStorage.getItem("builtright_admin_token");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "The provider request could not be completed.");
  }
  return data;
}

export async function createBankApplication(payload) {
  if (!providerState.bank.configured) {
    throw new ProviderNotConfiguredError("Bank financing provider");
  }
  return providerRequest("/api/integrations/bank/applications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function sendAshGridDeviceControl({ customerDeviceId, control, reason, confirmation }) {
  if (!providerState.ashGridX.configured) {
    throw new ProviderNotConfiguredError("AshGridX");
  }
  return providerRequest("/api/integrations/ashgridx/device/control", {
    method: "POST",
    body: JSON.stringify({ customerDeviceId, control, reason, confirmation }),
  });
}
