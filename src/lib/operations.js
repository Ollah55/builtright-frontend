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
  { id: "awaiting-deposit", label: "Awaiting 20% deposit", group: "decision", customerLabel: "Deposit required" },
  { id: "deposit-paid", label: "Deposit paid", group: "decision", customerLabel: "Deposit confirmed" },
  { id: "awaiting-disbursement", label: "Awaiting disbursement", group: "disbursement", customerLabel: "Awaiting bank disbursement" },
  { id: "disbursed", label: "Disbursed", group: "disbursement", customerLabel: "Bank disbursement received" },
  { id: "order-created", label: "Order created", group: "fulfillment", customerLabel: "Order and invoice created" },
  { id: "installation-scheduled", label: "Installation scheduled", group: "fulfillment", customerLabel: "Installation scheduled" },
  { id: "installation-in-progress", label: "Installation in progress", group: "fulfillment", customerLabel: "Installation in progress" },
  { id: "completed", label: "Completed", group: "complete", customerLabel: "Project completed" },
];

export const LEGACY_STATUS_MAP = {
  pending: "submitted",
  contacted: "internal-review",
  "under-assessment": "credit-review",
  declined: "rejected",
  "quotation-prepared": "quotation-draft",
};

export const TERMINAL_STATUSES = ["rejected", "cancelled", "completed"];

export function normalizeFinancingStatus(status) {
  return LEGACY_STATUS_MAP[status] || status || "submitted";
}

export function getFinancingStage(status) {
  const normalized = normalizeFinancingStatus(status);
  if (normalized === "rejected") {
    return { id: "rejected", label: "Rejected", group: "decision", customerLabel: "Financing not approved" };
  }
  if (normalized === "due-diligence-failed") {
    return { id: "due-diligence-failed", label: "Assessment needs attention", group: "assessment", customerLabel: "Pre-credit checks need attention" };
  }
  return FINANCING_STAGES.find((stage) => stage.id === normalized) || FINANCING_STAGES[0];
}

export function getStageIndex(status) {
  const normalized = normalizeFinancingStatus(status);
  if (normalized === "rejected") return FINANCING_STAGES.findIndex((stage) => stage.id === "approved");
  if (normalized === "due-diligence-failed") return FINANCING_STAGES.findIndex((stage) => stage.id === "due-diligence-passed");
  return Math.max(0, FINANCING_STAGES.findIndex((stage) => stage.id === normalized));
}

export function getNextFinancingStage(status) {
  const normalized = normalizeFinancingStatus(status);
  const index = FINANCING_STAGES.findIndex((stage) => stage.id === normalized);
  if (index < 0 || index === FINANCING_STAGES.length - 1) return null;
  return FINANCING_STAGES[index + 1];
}

export function isAssessmentPricingUnlocked(financingRequest) {
  if (financingRequest?.assessment?.status === "passed") return true;
  if (["open", "in-progress", "failed"].includes(financingRequest?.assessment?.status)) return false;
  const normalized = normalizeFinancingStatus(financingRequest?.status);
  if (normalized === "due-diligence-failed") return false;
  return getStageIndex(normalized) >= getStageIndex("due-diligence-passed");
}

export function isInstallationCostLabel(label) {
  return /installation|mounting|cable|protection|changeover|civil|electrical work/i.test(String(label || ""));
}

export function statusTone(status) {
  const normalized = normalizeFinancingStatus(status);
  if (["approved", "deposit-paid", "disbursed", "order-created", "completed"].includes(normalized)) return "success";
  if (["rejected", "cancelled", "tamper", "due-diligence-failed"].includes(normalized)) return "danger";
  if (["inspection-scheduled", "awaiting-deposit", "awaiting-disbursement"].includes(normalized)) return "warning";
  if (["sent-to-bank", "kyc-submitted", "credit-review", "quotation-sent"].includes(normalized)) return "violet";
  return "neutral";
}

export function formatMoney(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "To be confirmed";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export const demoFinancingRequests = [
  {
    _id: "demo-fin-24018",
    reference: "BRF-24018",
    isDemo: true,
    customer: { fullName: "Amaka Nwosu", email: "amaka@example.com", phone: "+234 803 555 0182", location: "Lekki, Lagos" },
    productSource: "BuiltRight Marketplace",
    systemName: "10kVA Hybrid Solar System",
    systemCapacity: "10kVA / 30kWh",
    status: "inspection-scheduled",
    financeInstitution: "Bank partner pending",
    estimatedAmount: 11200000,
    upfrontCosts: [
      { label: "Solar system", amount: 11200000, confirmed: true },
      { label: "Standard installation service", amount: null, confirmed: false },
      { label: "Insurance and compliance", amount: 250000, confirmed: true },
      { label: "IoT tracking", amount: 180000, confirmed: true },
      { label: "Maintenance plan", amount: 220000, confirmed: true },
    ],
    inspectionCosts: [
      { label: "Installation kit and materials", amount: null },
      { label: "Panel mounting structure", amount: null },
      { label: "Cable and protection accessories", amount: null },
    ],
    inspection: { date: "14 Aug 2026", assignee: "Tunde A.", property: "Duplex - pitched roof", status: "Scheduled" },
    assessment: {
      status: "in-progress",
      inspection: { status: "scheduled", result: "pending" },
      loadAudit: { status: "pending", result: "pending" },
      dueDiligence: { status: "pending", result: "pending" },
    },
    bankApplication: { provider: "Not connected", externalReference: "Pending", status: "Manual handoff" },
    nextAction: "Complete site inspection",
    updatedAt: "2026-08-11T08:40:00Z",
  },
  {
    _id: "demo-fin-24017",
    reference: "BRF-24017",
    isDemo: true,
    customer: { fullName: "David Okafor", email: "david@example.com", phone: "+234 806 222 4108", location: "Ikeja, Lagos" },
    productSource: "BuiltRight Marketplace",
    systemName: "5kVA Essential Power System",
    systemCapacity: "5kVA / 15kWh",
    status: "due-diligence-passed",
    financeInstitution: "Bank partner pending",
    estimatedAmount: 5650000,
    finalProjectCost: 7045000,
    upfrontCosts: [
      { label: "Solar system", amount: 5650000, confirmed: true },
      { label: "Standard installation service", amount: 320000, confirmed: true },
      { label: "IoT tracking", amount: 150000, confirmed: true },
      { label: "Maintenance plan", amount: 180000, confirmed: true },
    ],
    inspectionCosts: [
      { label: "Installation kit and materials", amount: 305000 },
      { label: "Panel mounting materials", amount: 190000 },
      { label: "Cable and protection accessories", amount: 250000 },
    ],
    inspection: { date: "08 Aug 2026", assignee: "Sarah K.", property: "Bungalow - long cable run", status: "Completed" },
    assessment: {
      status: "passed",
      inspection: { status: "completed", result: "pass" },
      loadAudit: { status: "completed", result: "pass", peakLoadKw: 4.1, dailyEnergyKwh: 18.4, recommendedInverterKva: 5, recommendedBatteryKwh: 15, recommendedSolarKw: 5.5, backupHours: 8 },
      dueDiligence: { status: "completed", result: "pass" },
    },
    quotation: { status: "not-started" },
    bankApplication: { provider: "Not connected", externalReference: "Pending", status: "Ready for handoff" },
    nextAction: "Approve quote for bank handoff",
    updatedAt: "2026-08-10T15:20:00Z",
  },
  {
    _id: "demo-fin-24012",
    reference: "BRF-24012",
    isDemo: true,
    customer: { fullName: "Aisha Bello", email: "aisha@example.com", phone: "+234 809 700 3312", location: "Victoria Island, Lagos" },
    productSource: "BuiltRight Marketplace",
    systemName: "15kVA Commercial Solar System",
    systemCapacity: "15kVA / 45kWh",
    status: "quotation-sent",
    financeInstitution: "Bank integration pending",
    estimatedAmount: 18100000,
    finalProjectCost: 21150000,
    upfrontCosts: [
      { label: "Solar system", amount: 18100000, confirmed: true },
      { label: "Standard installation service", amount: 680000, confirmed: true },
      { label: "Insurance and compliance", amount: 310000, confirmed: true },
      { label: "IoT tracking", amount: 190000, confirmed: true },
      { label: "Maintenance plan", amount: 270000, confirmed: true },
    ],
    inspectionCosts: [
      { label: "Installation and mounting materials", amount: 820000 },
      { label: "DB, changeover and protection", amount: 420000 },
      { label: "Extra electrical work", amount: 360000 },
    ],
    inspection: { date: "02 Aug 2026", assignee: "Tunde A.", property: "Commercial office - flat roof", status: "Completed" },
    assessment: {
      status: "passed",
      inspection: { status: "completed", result: "pass" },
      loadAudit: { status: "completed", result: "pass", peakLoadKw: 12.8, dailyEnergyKwh: 52.6, recommendedInverterKva: 15, recommendedBatteryKwh: 45, recommendedSolarKw: 18, backupHours: 9 },
      dueDiligence: { status: "completed", result: "pass" },
    },
    quotation: { status: "sent", reference: "BRQ-24012-V1", version: 1, sentAt: "2026-08-11T07:00:00Z" },
    bankApplication: { provider: "Bank partner pending", externalReference: "Pending", status: "locked-pending-customer-approval", redirectUrl: "" },
    nextAction: "Await customer quotation approval",
    updatedAt: "2026-08-11T07:10:00Z",
  },
  {
    _id: "demo-fin-24005",
    reference: "BRF-24005",
    isDemo: true,
    customer: { fullName: "Chinedu Eze", email: "chinedu@example.com", phone: "+234 812 050 8110", location: "Ogba, Lagos" },
    productSource: "BuiltRight Marketplace",
    systemName: "8kVA Home Plus System",
    systemCapacity: "8kVA / 25kWh",
    status: "quotation-approved",
    financeInstitution: "Manual bank process",
    estimatedAmount: 9200000,
    finalProjectCost: 10680000,
    depositAmount: 2136000,
    depositPaid: true,
    upfrontCosts: [
      { label: "Solar system", amount: 9200000, confirmed: true },
      { label: "Standard installation service", amount: 430000, confirmed: true },
      { label: "Insurance and compliance", amount: 220000, confirmed: true },
      { label: "IoT tracking", amount: 170000, confirmed: true },
      { label: "Maintenance plan", amount: 200000, confirmed: true },
    ],
    inspectionCosts: [
      { label: "Installation and mounting materials", amount: 310000 },
      { label: "Cable and protection accessories", amount: 150000 },
    ],
    inspection: { date: "25 Jul 2026", assignee: "Sarah K.", property: "Duplex - ground mount", status: "Completed" },
    assessment: {
      status: "passed",
      inspection: { status: "completed", result: "pass" },
      loadAudit: { status: "completed", result: "pass", peakLoadKw: 7.3, dailyEnergyKwh: 31.2, recommendedInverterKva: 8, recommendedBatteryKwh: 25, recommendedSolarKw: 9.5, backupHours: 8 },
      dueDiligence: { status: "completed", result: "pass" },
    },
    quotation: { status: "approved", reference: "BRQ-24005-V2", version: 2, approvedAt: "2026-08-10T10:40:00Z" },
    bankApplication: { provider: "Bank partner pending", externalReference: "Pending", status: "awaiting-bank-link", redirectUrl: "" },
    nextAction: "Add bank-hosted application link",
    updatedAt: "2026-08-10T11:05:00Z",
  },
];

export const demoProjectDocuments = [
  {
    _id: "doc-quote-24012",
    reference: "BRQ-24012-V1",
    financingRequest: "demo-fin-24012",
    type: "quotation",
    version: 1,
    status: "sent",
    title: "15kVA commercial solar project quotation",
    customer: { fullName: "Aisha Bello", email: "aisha@example.com", phone: "+234 809 700 3312", location: "Victoria Island, Lagos" },
    project: { systemName: "15kVA Commercial Solar System", systemCapacity: "15kVA / 45kWh", siteAddress: "Victoria Island, Lagos", propertyType: "Commercial office - flat roof", cableDistance: "42 metres", mountingMethod: "Flat-roof aluminium structure", scope: "Supply, install, test, commission, monitor, and maintain the complete commercial solar system." },
    lineItems: [
      { category: "solar-system", description: "15kVA hybrid inverter, 45kWh lithium storage and solar array", quantity: 1, unit: "system", unitPrice: 18100000, amount: 18100000, source: "confirmed" },
      { category: "installation-service", description: "Standard installation and commissioning service", quantity: 1, unit: "service", unitPrice: 680000, amount: 680000, source: "confirmed" },
      { category: "insurance-compliance", description: "Insurance and electrical compliance", quantity: 1, unit: "service", unitPrice: 310000, amount: 310000, source: "confirmed" },
      { category: "iot-tracking", description: "IoT tracking and remote asset control", quantity: 1, unit: "device", unitPrice: 190000, amount: 190000, source: "confirmed" },
      { category: "maintenance", description: "Preventive maintenance plan", quantity: 1, unit: "plan", unitPrice: 270000, amount: 270000, source: "confirmed" },
      { category: "installation-materials", description: "Installation kit and mounting materials", quantity: 1, unit: "lot", unitPrice: 820000, amount: 820000, source: "inspection" },
      { category: "protection-accessories", description: "DB, changeover and protection accessories", quantity: 1, unit: "lot", unitPrice: 420000, amount: 420000, source: "inspection" },
      { category: "civil-electrical-work", description: "Additional electrical and civil work", quantity: 1, unit: "lot", unitPrice: 360000, amount: 360000, source: "inspection" },
    ],
    subtotal: 21150000,
    discount: 0,
    tax: 0,
    total: 21150000,
    equityPercentage: 20,
    equityAmount: 4230000,
    bankFinanceAmount: 16920000,
    terms: "Customer approval is required before the bank credit application becomes available. Work begins after equity and bank disbursement are confirmed.",
    validUntil: "2026-08-25T23:59:59Z",
    sentAt: "2026-08-11T07:00:00Z",
    customerDecision: { status: "pending" },
    createdAt: "2026-08-11T06:40:00Z",
    financing: { reference: "BRF-24012", status: "quotation-sent", bankApplication: { status: "locked-pending-customer-approval", redirectUrl: "" } },
  },
  {
    _id: "doc-quote-24005",
    reference: "BRQ-24005-V2",
    financingRequest: "demo-fin-24005",
    type: "quotation",
    version: 2,
    status: "approved",
    title: "8kVA home solar project quotation",
    customer: { fullName: "Chinedu Eze", email: "chinedu@example.com", phone: "+234 812 050 8110", location: "Ogba, Lagos" },
    project: { systemName: "8kVA Home Plus System", systemCapacity: "8kVA / 25kWh", siteAddress: "Ogba, Lagos", scope: "Complete supply, installation, monitoring and commissioning." },
    lineItems: [
      { category: "solar-system", description: "8kVA hybrid solar system", quantity: 1, unit: "system", unitPrice: 9200000, amount: 9200000, source: "confirmed" },
      { category: "installation-service", description: "Installation and commissioning", quantity: 1, unit: "service", unitPrice: 430000, amount: 430000, source: "confirmed" },
      { category: "installation-materials", description: "Mounting, cable and protection materials", quantity: 1, unit: "lot", unitPrice: 460000, amount: 460000, source: "inspection" },
      { category: "insurance-compliance", description: "Insurance and compliance", quantity: 1, unit: "service", unitPrice: 220000, amount: 220000, source: "confirmed" },
      { category: "iot-tracking", description: "IoT tracking device", quantity: 1, unit: "device", unitPrice: 170000, amount: 170000, source: "confirmed" },
      { category: "maintenance", description: "Maintenance plan", quantity: 1, unit: "plan", unitPrice: 200000, amount: 200000, source: "confirmed" },
    ],
    subtotal: 10680000,
    discount: 0,
    tax: 0,
    total: 10680000,
    equityPercentage: 20,
    equityAmount: 2136000,
    bankFinanceAmount: 8544000,
    terms: "Approved by the customer. Bank application link pending.",
    customerDecision: { status: "approved", decidedAt: "2026-08-10T10:40:00Z" },
    createdAt: "2026-08-09T16:20:00Z",
    financing: { reference: "BRF-24005", status: "quotation-approved", bankApplication: { status: "awaiting-bank-link", redirectUrl: "" } },
  },
  {
    _id: "doc-invoice-1039",
    reference: "BRI-1039",
    financingRequest: "demo-fin-1039",
    type: "invoice",
    version: 1,
    status: "issued",
    title: "5kVA financed solar project invoice",
    customer: { fullName: "Kemi Adeyemi", email: "kemi@example.com", phone: "+234 803 111 2044", location: "Surulere, Lagos" },
    project: { systemName: "5kVA Essential Power System", systemCapacity: "5kVA / 15kWh", siteAddress: "Surulere, Lagos" },
    lineItems: [{ category: "solar-system", description: "Complete approved 5kVA solar project", quantity: 1, unit: "project", unitPrice: 7180000, amount: 7180000, source: "confirmed" }],
    subtotal: 7180000,
    discount: 0,
    tax: 0,
    total: 7180000,
    equityPercentage: 20,
    equityAmount: 1436000,
    bankFinanceAmount: 5744000,
    createdAt: "2026-08-04T13:20:00Z",
    financing: { reference: "BRF-1039", status: "disbursed", bankApplication: { status: "disbursed", redirectUrl: "" } },
  },
];

export const demoProjects = [
  { id: "BRP-1062", customer: "Chinedu Eze", location: "Ogba", system: "8kVA / 25kWh", stage: "Awaiting disbursement", lane: "finance", delivery: "Not released", installation: "Not scheduled", owner: "Sarah K.", updated: "35 min ago" },
  { id: "BRP-1059", customer: "Kemi Adeyemi", location: "Surulere", system: "5kVA / 15kWh", stage: "Delivery processing", lane: "delivery", delivery: "Processing", installation: "18 Aug 2026", owner: "Kunle O.", updated: "2 hr ago" },
  { id: "BRP-1051", customer: "Ibrahim Musa", location: "Yaba", system: "10kVA / 30kWh", stage: "Installation ongoing", lane: "installation", delivery: "Delivered", installation: "In progress", owner: "Tunde A.", updated: "Today" },
  { id: "BRP-1048", customer: "Nneka Umeh", location: "Ajah", system: "12kVA / 40kWh", stage: "Testing and commissioning", lane: "commissioning", delivery: "Delivered", installation: "Testing", owner: "Sarah K.", updated: "Yesterday" },
];

export const demoDevices = [
  { id: "AGX-CUS-001", deviceNumber: "AGX-0001", customer: "Nneka Umeh", project: "BRP-1048", site: "Ajah, Lagos", state: "on", connectivity: "online", lastSeen: "30 sec ago", payment: "current", graceDays: 0, tamper: false, installed: "06 Aug 2026" },
  { id: "AGX-CUS-002", deviceNumber: "AGX-0002", customer: "Ibrahim Musa", project: "BRP-1051", site: "Yaba, Lagos", state: "on", connectivity: "online", lastSeen: "1 min ago", payment: "current", graceDays: 0, tamper: false, installed: "09 Aug 2026" },
  { id: "AGX-CUS-003", deviceNumber: "AGX-0003", customer: "Pilot Customer", project: "BRP-PILOT", site: "Ikeja, Lagos", state: "on", connectivity: "offline", lastSeen: "18 min ago", payment: "grace-period", graceDays: 4, tamper: true, installed: "Pilot" },
  { id: "AGX-CUS-004", deviceNumber: "AGX-0004", customer: "Resolved Account Demo", project: "BRP-1044", site: "Ikoyi, Lagos", state: "off", connectivity: "online", lastSeen: "45 sec ago", payment: "cleared", graceDays: 10, tamper: false, installed: "01 Aug 2026" },
];

export const demoAlerts = [
  { id: "ALT-101", severity: "critical", title: "Pilot device needs attention", detail: "AGX-0003 is offline and has an unresolved tamper signal.", time: "18 min ago", route: "/admin/devices" },
  { id: "ALT-102", severity: "warning", title: "Assessment passed", detail: "BRF-24017 is ready for the full project quotation.", time: "47 min ago", route: "/admin/loan-requests" },
  { id: "ALT-103", severity: "info", title: "Site inspection scheduled", detail: "Amaka Nwosu - Lekki - 14 Aug 2026 at 10:00.", time: "Today", route: "/admin/projects" },
];

export const integrationReadiness = [
  {
    id: "bank",
    name: "Bank financing provider",
    status: "Awaiting documentation",
    tone: "warning",
    description: "Customer quotation approval, approved-document delivery, and the hosted bank-link gate are ready; provider callbacks and credentials remain pending.",
    readiness: 45,
    checks: [
      { label: "Provider-neutral application references", done: true },
      { label: "Customer quotation approval gate", done: true },
      { label: "Hosted application link placeholder", done: true },
      { label: "Approved quotation delivery to bank", done: true },
      { label: "Webhook signature specification", done: false },
      { label: "Sandbox credentials", done: false },
    ],
  },
  {
    id: "ashgridx",
    name: "AshGridX device control",
    status: "Specification reviewed",
    tone: "violet",
    description: "Device assignment, on/off commands, tamper incidents, and audit history are modelled for the pilot.",
    readiness: 58,
    checks: [
      { label: "Device control endpoint mapped", done: true },
      { label: "Multiple device interface", done: true },
      { label: "Tamper event definition", done: false },
      { label: "Staging API key and webhook secret", done: false },
    ],
  },
];
