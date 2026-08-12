export const FINANCING_STAGES = [
  { id: "submitted", label: "Submitted", group: "intake", customerLabel: "Request received" },
  { id: "internal-review", label: "Internal review", group: "intake", customerLabel: "BuiltRight review" },
  { id: "inspection-scheduled", label: "Inspection scheduled", group: "inspection", customerLabel: "Site inspection scheduled" },
  { id: "inspection-completed", label: "Inspection completed", group: "inspection", customerLabel: "Site inspection completed" },
  { id: "load-audit-completed", label: "Load audit completed", group: "assessment", customerLabel: "Load audit completed" },
  { id: "due-diligence-passed", label: "Due diligence passed", group: "assessment", customerLabel: "Pre-credit checks passed" },
  { id: "quotation-draft", label: "Quotation draft", group: "quotation", customerLabel: "Quotation being prepared" },
  { id: "quotation-sent", label: "Quotation sent", group: "quotation", customerLabel: "Quotation awaiting your approval" },
  { id: "quotation-approved", label: "Quotation approved", group: "quotation", customerLabel: "Quotation approved" },
  { id: "sent-to-bank", label: "Sent to bank", group: "bank", customerLabel: "Sent for bank review" },
  { id: "kyc-submitted", label: "KYC submitted", group: "bank", customerLabel: "KYC submitted" },
  { id: "credit-review", label: "Credit review", group: "bank", customerLabel: "Under credit review" },
  { id: "approved", label: "Approved", group: "decision", customerLabel: "Financing approved" },
  { id: "awaiting-deposit", label: "Awaiting equity deposit", group: "decision", customerLabel: "Equity deposit required" },
  { id: "deposit-paid", label: "Deposit paid", group: "decision", customerLabel: "Deposit confirmed" },
  { id: "awaiting-disbursement", label: "Awaiting disbursement", group: "disbursement", customerLabel: "Awaiting bank disbursement" },
  { id: "disbursed", label: "Disbursed", group: "disbursement", customerLabel: "Bank disbursement received" },
  { id: "order-created", label: "Order created", group: "fulfillment", customerLabel: "Order and invoice created" },
  { id: "installation-scheduled", label: "Installation scheduled", group: "fulfillment", customerLabel: "Installation scheduled" },
  { id: "installation-in-progress", label: "Installation in progress", group: "fulfillment", customerLabel: "Installation in progress" },
  { id: "completed", label: "Completed", group: "complete", customerLabel: "Project completed" },
];

export const LEGACY_STATUS_MAP = { pending: "submitted", contacted: "internal-review", "under-assessment": "credit-review", declined: "rejected", "quotation-prepared": "quotation-draft" };
export const TERMINAL_STATUSES = ["rejected", "cancelled", "completed"];
export function normalizeFinancingStatus(status) { return LEGACY_STATUS_MAP[status] || status || "submitted"; }
export function getFinancingStage(status) {
  const normalized = normalizeFinancingStatus(status);
  if (normalized === "rejected") return { id: "rejected", label: "Rejected", group: "decision", customerLabel: "Financing not approved" };
  if (normalized === "due-diligence-failed") return { id: normalized, label: "Assessment needs attention", group: "assessment", customerLabel: "Pre-credit checks need attention" };
  return FINANCING_STAGES.find((stage) => stage.id === normalized) || FINANCING_STAGES[0];
}
export function getStageIndex(status) {
  const normalized = normalizeFinancingStatus(status);
  if (normalized === "rejected") return FINANCING_STAGES.findIndex((stage) => stage.id === "approved");
  if (normalized === "due-diligence-failed") return FINANCING_STAGES.findIndex((stage) => stage.id === "due-diligence-passed");
  return Math.max(0, FINANCING_STAGES.findIndex((stage) => stage.id === normalized));
}
export function getNextFinancingStage(status) { const index = FINANCING_STAGES.findIndex((stage) => stage.id === normalizeFinancingStatus(status)); return index < 0 || index === FINANCING_STAGES.length - 1 ? null : FINANCING_STAGES[index + 1]; }
export function isAssessmentPricingUnlocked(financingRequest) { if (financingRequest?.assessment?.status === "passed") return true; if (["open", "in-progress", "failed"].includes(financingRequest?.assessment?.status)) return false; return getStageIndex(financingRequest?.status) >= getStageIndex("due-diligence-passed"); }
export function isInstallationCostLabel(label) { return /installation|mounting|cable|protection|changeover|civil|electrical work/i.test(String(label || "")); }
export function statusTone(status) { const normalized = normalizeFinancingStatus(status); if (["approved", "deposit-paid", "disbursed", "order-created", "completed"].includes(normalized)) return "success"; if (["rejected", "cancelled", "tamper", "due-diligence-failed"].includes(normalized)) return "danger"; if (["inspection-scheduled", "awaiting-deposit", "awaiting-disbursement"].includes(normalized)) return "warning"; if (["sent-to-bank", "kyc-submitted", "credit-review", "quotation-sent"].includes(normalized)) return "violet"; return "neutral"; }
export function formatMoney(value) { if (value === null || value === undefined || Number.isNaN(Number(value))) return "To be confirmed"; return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(value)); }

export const integrationReadiness = [
  { id: "bank", name: "Bank financing provider", status: "Awaiting documentation", tone: "warning", description: "Customer quotation approval, approved-document delivery, and the hosted bank-link gate are ready; provider callbacks and credentials remain pending.", readiness: 45, checks: [{ label: "Provider-neutral application references", done: true }, { label: "Customer quotation approval gate", done: true }, { label: "Hosted application link placeholder", done: true }, { label: "Approved quotation delivery to bank", done: true }, { label: "Webhook signature specification", done: false }, { label: "Sandbox credentials", done: false }] },
  { id: "ashgridx", name: "AshGridX device control", status: "Specification reviewed", tone: "violet", description: "Device assignment, on/off commands, tamper incidents, and audit history are modelled for the pilot.", readiness: 58, checks: [{ label: "Device control endpoint mapped", done: true }, { label: "Multiple device interface", done: true }, { label: "Tamper event definition", done: false }, { label: "Staging API key and webhook secret", done: false }] },
];
