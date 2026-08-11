export const financingPartners = [
  {
    id: "richgreen",
    name: "RichGreen Microfinance Bank",
    eligibleCustomers: "Individuals and businesses",
    equityPercentage: 20,
    financePercentage: "Up to 80%",
    maximumAmount: "Subject to approval",
    maximumTenor: "Up to 7 months",
    repaymentFrequency: "Monthly",
    features: [
      "Credit assessment, credit bureau check, and CRMS check are required.",
      "BuiltRight submits the approved quotation after the technical assessment.",
      "The customer contributes 20% equity after financing approval.",
    ],
  },
  {
    id: "lotus",
    name: "LOTUS Bank",
    eligibleCustomers: "SMEs",
    equityPercentage: 10,
    financePercentage: "Up to 90%",
    maximumAmount: "Up to ₦500 million",
    maximumTenor: "Up to 48 months",
    repaymentFrequency: "Monthly",
    features: [
      "Credit assessment, credit bureau check, and CRMS check are required.",
      "The customer contributes 10% equity after financing approval.",
      "The bank-hosted journey will manage KYC, credit review, and account opening when its integration is available.",
    ],
  },
];

export const generalFinancingRequirements = [
  "Valid means of identification",
  "Recent passport photograph",
  "Utility bill",
  "Six months bank statement",
  "BuiltRight solar quotation",
  "Completed application form",
  "BVN",
  "Business registration documents, where applicable",
];

export function getFinancingPartner(nameOrId) {
  return financingPartners.find((partner) => partner.id === nameOrId || partner.name === nameOrId) || financingPartners[0];
}
