import { useMemo, useState } from "react";
import "./richGreenApplicationForm.css";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";

const field = (label, name, extra = {}) => ({ label, name, ...extra });
const requiredApplicationFields = [
  ["fullName", "Enter your full name."], ["dateOfBirth", "Select your date of birth."], ["gender", "Select your gender."],
  ["maritalStatus", "Enter your marital status."], ["phoneNumber", "Enter your phone number."], ["emailAddress", "Enter your email address."],
  ["residentialAddress", "Enter your residential address."], ["state", "Enter your state."], ["lga", "Enter your LGA."],
  ["bvn", "Enter your 11-digit BVN."], ["identificationType", "Select your identification type."], ["identificationNumber", "Enter your ID number."],
  ["identificationExpiryDate", "Select the ID expiry date."], ["employmentStatus", "Select your employment status."],
  ["employerBusinessName", "Enter your employer or business name."], ["officeBusinessAddress", "Enter your office or business address."],
  ["positionBusinessType", "Enter your position or business type."], ["monthlyNetIncome", "Enter your monthly net income."],
  ["yearsInEmploymentBusiness", "Enter your years in employment or business."], ["bankName", "Enter your bank name."],
  ["accountNumber", "Enter your 10-digit account number."], ["accountName", "Enter your account name."],
  ["preferredRepaymentMethod", "Select your preferred repayment method."], ["packageSelected", "Enter the selected package."],
  ["systemCapacity", "Enter the system capacity."], ["preferredRepaymentTenor", "Select a repayment tenor."],
  ["installationAddress", "Enter the installation address."], ["applicantName", "Enter the applicant's name."],
  ["electronicSignature", "Type your full legal name as your electronic signature."],
];
const fieldAutoComplete = {
  fullName: "name", dateOfBirth: "bday", gender: "sex", phoneNumber: "tel", emailAddress: "email",
  residentialAddress: "street-address", state: "address-level1", lga: "address-level2",
  employerBusinessName: "organization", positionBusinessType: "organization-title", accountName: "off",
  installationAddress: "off", guarantorName: "off", guarantorPhoneNumber: "off", applicantName: "name", electronicSignature: "off",
};

const validateApplication = (form, businessOwner) => {
  const errors = Object.fromEntries(requiredApplicationFields.filter(([name]) => !String(form[name] ?? "").trim()).map(([name, message]) => [name, message]));
  if (form.bvn && !/^\d{11}$/.test(form.bvn)) errors.bvn = "BVN must contain exactly 11 digits.";
  if (form.nin && !/^\d{11}$/.test(form.nin)) errors.nin = "NIN must contain exactly 11 digits.";
  if (form.accountNumber && !/^\d{10}$/.test(form.accountNumber)) errors.accountNumber = "Account number must contain exactly 10 digits.";
  const normalizedMonthlyIncome = Number(String(form.monthlyNetIncome || "").replace(/[^\d.]/g, ""));
  if (form.monthlyNetIncome && !(normalizedMonthlyIncome > 0)) errors.monthlyNetIncome = "Enter the income in figures, for example 250000.";
  if (form.dateOfBirth && new Date(form.dateOfBirth) >= new Date()) errors.dateOfBirth = "Date of birth must be in the past.";
  if (businessOwner) {
    [["guarantorName", "Enter the guarantor's name."], ["guarantorPhoneNumber", "Enter the guarantor's phone number."], ["guarantorOccupation", "Enter the guarantor's occupation."], ["guarantorResidentialAddress", "Enter the guarantor's address."], ["guarantorRelationship", "Enter the guarantor's relationship to the applicant."]]
      .forEach(([name, message]) => { if (!String(form[name] || "").trim()) errors[name] = message; });
  }
  if (!form.declarationAccepted) errors.declarationAccepted = "Accept the declaration before submitting.";
  return errors;
};

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
  const [errors, setErrors] = useState({});
  const businessOwner = /business owner/i.test(form.employmentStatus);
  const quotationSummary = useMemo(() => ({
    total: Number(projectDocument.total || 0),
    equity: Number(projectDocument.equityAmount || 0),
    finance: Number(projectDocument.bankFinanceAmount || 0),
  }), [projectDocument]);
  const money = (value) => Number(value || 0).toLocaleString("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
  const update = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const renderField = ({ label, name, type = "text", options, optional, wide, numericOnly, help, ...props }) => (
    <label key={name} htmlFor={`richgreen-${name}`} className={`${wide ? "wide " : ""}${errors[name] ? "has-error" : ""}`.trim()}>
      <span>{label}{optional ? " (optional)" : " *"}</span>
      {options ? <select id={`richgreen-${name}`} name={name} required={!optional} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `richgreen-${name}-error` : undefined} autoComplete={fieldAutoComplete[name] || "off"} value={form[name]} onChange={(event) => update(name, event.target.value)}><option value="">Select {label.toLowerCase()}</option>{options.map((option) => <option value={option} key={option}>{option}</option>)}</select>
        : <input id={`richgreen-${name}`} name={name} required={!optional} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `richgreen-${name}-error` : help ? `richgreen-${name}-help` : undefined} autoComplete={props.autoComplete ?? fieldAutoComplete[name] ?? "off"} type={type} value={form[name]} onChange={(event) => update(name, numericOnly ? event.target.value.replace(/\D/g, "") : event.target.value)} {...props} />}
      {help && !errors[name] && <small id={`richgreen-${name}-help`} className="richgreen-field-help">{help}</small>}
      {errors[name] && <small id={`richgreen-${name}-error`} className="richgreen-field-error" role="alert">{errors[name]}</small>}
    </label>
  );

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateApplication(form, businessOwner);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setMessage("Please correct the highlighted fields. Each message appears directly below the field it belongs to.");
      const firstField = Object.keys(nextErrors)[0];
      window.requestAnimationFrame(() => {
        const control = document.getElementById(`richgreen-${firstField}`);
        control?.scrollIntoView({ behavior: "smooth", block: "center" });
        control?.focus({ preventScroll: true });
      });
      return;
    }
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
      <form onSubmit={submit} autoComplete="on" noValidate>
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
          {renderField(field("Monthly net income (NGN)", "monthlyNetIncome", { type: "text", inputMode: "numeric", numericOnly: true, maxLength: 15, placeholder: "Example: 250000", help: "Enter figures only—no ₦, N, #, comma, full stop, or words. Example: 250000." }))}
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
        </div><label htmlFor="richgreen-declarationAccepted" className={`richgreen-consent ${errors.declarationAccepted ? "has-error" : ""}`}><input id="richgreen-declarationAccepted" name="declarationAccepted" required type="checkbox" aria-invalid={Boolean(errors.declarationAccepted)} aria-describedby={errors.declarationAccepted ? "richgreen-declarationAccepted-error" : undefined} checked={form.declarationAccepted} onChange={(event) => update("declarationAccepted", event.target.checked)} /><span>I have read and accept the declaration and financing terms above.</span></label>{errors.declarationAccepted && <small id="richgreen-declarationAccepted-error" className="richgreen-field-error" role="alert">{errors.declarationAccepted}</small>}</fieldset>

        <footer><button type="button" className="secondary" onClick={onClose} disabled={saving}>Cancel</button><button type="submit" className="primary" disabled={saving}>{saving ? "Submitting securely..." : "Review & submit application"}</button></footer>
      </form>
    </section>
  </div>;
}

export default RichGreenApplicationForm;
