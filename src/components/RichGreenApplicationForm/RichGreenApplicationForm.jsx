import { useMemo, useState } from "react";
import "./richGreenApplicationForm.css";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";

const field = (label, name, extra = {}) => ({ label, name, ...extra });

function RichGreenApplicationForm({ projectDocument, onClose, onSubmitted }) {
  const [form, setForm] = useState(() => ({
    fullName: projectDocument.customer?.fullName || "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    phoneNumber: projectDocument.customer?.phone || "",
    emailAddress: projectDocument.customer?.email || "",
    residentialAddress: projectDocument.customer?.location || "",
    state: "",
    lga: "",
    bvn: "",
    nin: "",
    identificationType: "",
    identificationNumber: "",
    identificationExpiryDate: "",
    employmentStatus: "",
    employerBusinessName: "",
    officeBusinessAddress: "",
    positionBusinessType: "",
    monthlyNetIncome: "",
    yearsInEmploymentBusiness: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
    preferredRepaymentMethod: "",
    packageSelected: projectDocument.project?.systemName || projectDocument.title || "",
    systemCapacity: projectDocument.project?.systemCapacity || "",
    preferredRepaymentTenor: "",
    installationAddress: projectDocument.project?.siteAddress || projectDocument.customer?.location || "",
    guarantorName: "",
    guarantorPhoneNumber: "",
    guarantorOccupation: "",
    guarantorResidentialAddress: "",
    guarantorRelationship: "",
    applicantName: projectDocument.customer?.fullName || "",
    electronicSignature: "",
    declarationAccepted: false,
  }));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const businessOwner = /business owner/i.test(form.employmentStatus);
  const quotationSummary = useMemo(() => ({
    total: Number(projectDocument.total || 0),
    equity: Number(projectDocument.equityAmount || 0),
    finance: Number(projectDocument.bankFinanceAmount || 0),
  }), [projectDocument]);
  const money = (value) => Number(value || 0).toLocaleString("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
  const update = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  const renderField = ({ label, name, type = "text", options, optional, wide, ...props }) => (
    <label key={name} className={wide ? "wide" : ""}>
      <span>{label}{optional ? " (optional)" : ""}</span>
      {options ? <select required={!optional} value={form[name]} onChange={(event) => update(name, event.target.value)}><option value="">Select</option>{options.map((option) => <option value={option} key={option}>{option}</option>)}</select>
        : <input required={!optional} type={type} value={form[name]} onChange={(event) => update(name, event.target.value)} {...props} />}
    </label>
  );

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const token = localStorage.getItem("customerToken");
      const response = await fetch(`${API_BASE_URL}/api/customer/financing/${projectDocument.financingRequest}/richgreen-application`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Could not submit the application.");
      setMessage(data.message);
      onSubmitted(data.richGreenApplication);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  return <div className="richgreen-form-layer" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
    <section className="richgreen-form-modal" role="dialog" aria-modal="true" aria-label="RichGreen customer application">
      <header><div><p>BuiltRight Solar Financing Scheme</p><h2>RichGreen customer application</h2><span>Complete this form after approving quotation {projectDocument.reference}. Your sensitive details are encrypted and are available only to authorized BuiltRight operations staff.</span></div><button type="button" onClick={onClose} disabled={saving} aria-label="Close application">×</button></header>
      {message && <p className="richgreen-form-message" role="status">{message}</p>}
      <form onSubmit={submit} autoComplete="on">
        <fieldset><legend>Applicant information</legend><div className="richgreen-form-grid">
          {[field("Full name", "fullName", { wide: true }), field("Date of birth", "dateOfBirth", { type: "date" }), field("Gender", "gender", { options: ["Male", "Female"] }), field("Marital status", "maritalStatus"), field("Phone number", "phoneNumber", { type: "tel" }), field("Email address", "emailAddress", { type: "email" }), field("Residential address", "residentialAddress", { wide: true }), field("State", "state"), field("LGA", "lga"), field("BVN", "bvn", { inputMode: "numeric", pattern: "[0-9]{11}", maxLength: 11, autoComplete: "off" }), field("NIN", "nin", { optional: true, inputMode: "numeric", pattern: "[0-9]{11}", maxLength: 11, autoComplete: "off" })].map(renderField)}
        </div></fieldset>

        <fieldset><legend>Identification</legend><div className="richgreen-form-grid">
          {renderField(field("Identification type", "identificationType", { options: ["National ID", "International Passport", "Driver's License", "Voter's Card"] }))}
          {renderField(field("ID number", "identificationNumber"))}
          {renderField(field("Expiry date", "identificationExpiryDate", { type: "date" }))}
        </div></fieldset>

        <fieldset><legend>Employment or business details</legend><div className="richgreen-form-grid">
          {renderField(field("Employment status", "employmentStatus", { options: ["Salary Earner", "Self-Employed", "Business Owner", "SME", "Other"] }))}
          {renderField(field("Employer or business name", "employerBusinessName"))}
          {renderField(field("Office or business address", "officeBusinessAddress", { wide: true }))}
          {renderField(field("Position or business type", "positionBusinessType"))}
          {renderField(field("Monthly net income (NGN)", "monthlyNetIncome", { type: "number", min: 1, step: 1000 }))}
          {renderField(field("Years in employment or business", "yearsInEmploymentBusiness"))}
        </div></fieldset>

        <fieldset><legend>Bank details</legend><div className="richgreen-form-grid">
          {renderField(field("Bank name", "bankName"))}{renderField(field("Account number", "accountNumber", { inputMode: "numeric", pattern: "[0-9]{10}", maxLength: 10, autoComplete: "off" }))}{renderField(field("Account name", "accountName"))}
          {renderField(field("Preferred repayment method", "preferredRepaymentMethod", { options: ["Direct Debit", "Salary Domiciliation", "Standing Order", "Bank Transfer"] }))}
        </div></fieldset>

        <fieldset><legend>Solar or inverter requirement</legend><div className="richgreen-quote-summary"><div><span>Quotation amount</span><strong>{money(quotationSummary.total)}</strong></div><div><span>Customer equity ({projectDocument.equityPercentage}%)</span><strong>{money(quotationSummary.equity)}</strong></div><div><span>Finance required</span><strong>{money(quotationSummary.finance)}</strong></div></div><div className="richgreen-form-grid">
          {renderField(field("Package selected", "packageSelected"))}{renderField(field("System capacity", "systemCapacity"))}{renderField(field("Preferred repayment tenor", "preferredRepaymentTenor", { options: ["3", "4", "5", "6", "7"] }))}{renderField(field("Installation address", "installationAddress", { wide: true }))}
        </div></fieldset>

        {businessOwner && <fieldset><legend>Guarantor details for business owner</legend><div className="richgreen-form-grid">
          {[field("Guarantor name", "guarantorName"), field("Phone number", "guarantorPhoneNumber", { type: "tel" }), field("Occupation", "guarantorOccupation"), field("Residential address", "guarantorResidentialAddress", { wide: true }), field("Relationship to applicant", "guarantorRelationship")].map(renderField)}
        </div></fieldset>}

        <fieldset><legend>Customer declaration</legend><div className="richgreen-declaration"><p>I declare that the information supplied is true and complete. I understand that approval is subject to RichGreen credit assessment.</p><ul><li>Pay the required minimum equity contribution before disbursement.</li><li>Repay the facility according to the agreed repayment schedule and execute the required repayment mandate.</li><li>Allow BuiltRight Energy to monitor and maintain the financed equipment.</li><li>Accept that ownership remains with RichGreen until the facility is fully repaid.</li><li>Accept recovery or remote load disconnection after prolonged default where applicable.</li><li>Authorize account debit and payment to BuiltRight for the approved equipment cost.</li></ul></div><div className="richgreen-form-grid">
          {renderField(field("Applicant's name", "applicantName"))}{renderField(field("Electronic signature (type full legal name)", "electronicSignature"))}
        </div><label className="richgreen-consent"><input required type="checkbox" checked={form.declarationAccepted} onChange={(event) => update("declarationAccepted", event.target.checked)} /><span>I have read and accept the declaration and financing terms above.</span></label></fieldset>

        <footer><button type="button" className="secondary" onClick={onClose} disabled={saving}>Cancel</button><button type="submit" className="primary" disabled={saving || !form.declarationAccepted}>{saving ? "Submitting securely..." : "Submit RichGreen application"}</button></footer>
      </form>
    </section>
  </div>;
}

export default RichGreenApplicationForm;
