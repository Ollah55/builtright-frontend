import React, { useEffect, useMemo, useState } from "react";
import {
  FiArrowUpRight,
  FiCheck,
  FiDownload,
  FiFileText,
  FiLock,
  FiX,
} from "react-icons/fi";
import CustomerLayout from "../../components/CustomerLayout/CustomerLayout";
import { demoProjectDocuments, formatMoney } from "../../lib/operations";
import { isDevelopmentPreview } from "../../lib/previewMode";
import { downloadProjectDocument } from "../../lib/projectDocumentPdf";
import "./customerDocuments.css";

const API_BASE_URL = "https://builtright-backend-1.onrender.com";
const clone = (value) => JSON.parse(JSON.stringify(value));

function CustomerDocuments() {
  const preview = isDevelopmentPreview();
  const [documents, setDocuments] = useState(preview ? clone(demoProjectDocuments) : []);
  const [loading, setLoading] = useState(!preview);
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [approvalChecked, setApprovalChecked] = useState(false);
  const [requestingChanges, setRequestingChanges] = useState(false);
  const [changeNote, setChangeNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (preview) return;
    const loadDocuments = async () => {
      try {
        const token = localStorage.getItem("customerToken");
        const response = await fetch(`${API_BASE_URL}/api/customer/documents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok || !data.status) throw new Error(data.message || "Could not load your documents.");
        setDocuments(data.documents || []);
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    };
    loadDocuments();
  }, [preview]);

  const filteredDocuments = useMemo(
    () => documents.filter((document) => filter === "all" || document.type === filter),
    [documents, filter]
  );
  const selectedDocument = documents.find((document) => document._id === selectedId) || null;
  const pendingApprovalCount = documents.filter((document) => document.type === "quotation" && document.status === "sent").length;
  const approvedQuoteCount = documents.filter((document) => document.type === "quotation" && document.status === "approved").length;
  const invoiceCount = documents.filter((document) => document.type === "invoice").length;

  const closeDocument = () => {
    setSelectedId(null);
    setApprovalChecked(false);
    setRequestingChanges(false);
    setChangeNote("");
  };

  const approveQuotation = async () => {
    if (!selectedDocument || !approvalChecked) return;
    setSaving(true);
    setMessage("");
    try {
      if (preview) {
        setDocuments((items) => items.map((item) => item._id === selectedDocument._id ? {
          ...item,
          status: "approved",
          customerDecision: { status: "approved", decidedAt: new Date().toISOString() },
          financing: {
            ...item.financing,
            status: "quotation-approved",
            bankApplication: {
              ...item.financing?.bankApplication,
              status: item.financing?.bankApplication?.redirectUrl ? "ready-for-customer" : "awaiting-bank-link",
            },
          },
        } : item));
        setMessage("Quotation approved. The bank application will unlock when the bank supplies its hosted link.");
        closeDocument();
      } else {
        const token = localStorage.getItem("customerToken");
        const response = await fetch(`${API_BASE_URL}/api/customer/quotations/${selectedDocument._id}/approve`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ note: "Customer approved the full project cost and quotation terms." }),
        });
        const data = await response.json();
        if (!response.ok || !data.status) throw new Error(data.message || "Quotation could not be approved.");
        setDocuments((items) => items.map((item) => item._id === selectedDocument._id ? {
          ...data.quotation,
          financing: {
            ...item.financing,
            status: "quotation-approved",
            bankApplication: {
              ...item.financing?.bankApplication,
              status: data.bankApplication.status,
              redirectUrl: data.bankApplication.url,
            },
          },
        } : item));
        setMessage(data.message);
        closeDocument();
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const submitChangeRequest = async () => {
    if (!selectedDocument || !changeNote.trim()) return;
    setSaving(true);
    setMessage("");
    try {
      if (preview) {
        setDocuments((items) => items.map((item) => item._id === selectedDocument._id ? { ...item, status: "changes-requested", customerDecision: { status: "changes-requested", decidedAt: new Date().toISOString(), note: changeNote } } : item));
        setMessage("Your requested quotation changes were sent to BuiltRight in preview mode.");
        closeDocument();
      } else {
        const token = localStorage.getItem("customerToken");
        const response = await fetch(`${API_BASE_URL}/api/customer/quotations/${selectedDocument._id}/request-changes`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ note: changeNote }),
        });
        const data = await response.json();
        if (!response.ok || !data.status) throw new Error(data.message || "Change request could not be sent.");
        setDocuments((items) => items.map((item) => item._id === selectedDocument._id ? { ...data.quotation, financing: item.financing } : item));
        setMessage(data.message);
        closeDocument();
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <CustomerLayout>
      <main className="customer-documents-main">
        <section className="customer-documents-hero">
          <div><p>Project records</p><h1>Quotations & invoices</h1><span>View, download, approve, and track every formal document for your BuiltRight solar project.</span></div>
          <FiFileText />
        </section>

        {message && <p className="customer-documents-message" role="status">{message}</p>}

        <section className="customer-document-stats">
          <article><span>Awaiting your approval</span><strong>{pendingApprovalCount}</strong><small>Quotation decisions</small></article>
          <article><span>Approved quotations</span><strong>{approvedQuoteCount}</strong><small>Ready for bank link</small></article>
          <article><span>Issued invoices</span><strong>{invoiceCount}</strong><small>Downloadable records</small></article>
        </section>

        <section className="customer-bank-explainer">
          <FiLock />
          <div><strong>The bank application unlocks only after you approve the final quotation.</strong><p>The bank-hosted journey will handle KYC, credit checks, account opening, equity payment, and bank disbursement. BuiltRight will embed the bank's link here when it is supplied.</p></div>
        </section>

        <div className="customer-document-filters">
          {["all", "quotation", "invoice"].map((item) => <button type="button" key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item === "all" ? "All documents" : `${item}s`}</button>)}
        </div>

        {loading ? (
          <section className="customer-document-empty">Loading your project documents...</section>
        ) : filteredDocuments.length === 0 ? (
          <section className="customer-document-empty"><h2>No documents yet</h2><p>Your quotation will appear after BuiltRight completes the inspection, load audit, and due diligence.</p></section>
        ) : (
          <section className="customer-document-grid">
            {filteredDocuments.map((document) => {
              const bankUrl = document.financing?.bankApplication?.redirectUrl;
              return (
                <article className="customer-document-card" key={document._id}>
                  <header><div><span>{document.type}</span><h2>{document.reference}</h2></div><i className={`document-status ${document.status}`}>{document.status}</i></header>
                  <h3>{document.title}</h3>
                  <p>{document.project?.systemCapacity || "Solar project"} · {document.project?.siteAddress || document.customer?.location || "Project site"}</p>
                  <dl><div><dt>Total project cost</dt><dd>{formatMoney(document.total)}</dd></div>{document.type === "quotation" && <><div><dt>Customer equity</dt><dd>{formatMoney(document.equityAmount)}</dd></div><div><dt>Bank finance request</dt><dd>{formatMoney(document.bankFinanceAmount)}</dd></div></>}</dl>
                  {document.type === "quotation" && document.status === "sent" && <div className="document-action-note pending"><strong>Your decision is required</strong><span>Review the complete cost breakdown before approving.</span></div>}
                  {document.type === "quotation" && document.status === "approved" && bankUrl && <a className="customer-bank-link" href={bankUrl} target="_blank" rel="noreferrer">Continue to bank credit application <FiArrowUpRight /></a>}
                  {document.type === "quotation" && document.status === "approved" && !bankUrl && <div className="document-action-note"><strong>Bank link pending</strong><span>Your approval is recorded. The application button will appear when the bank provides its hosted URL.</span></div>}
                  <footer><button type="button" onClick={() => setSelectedId(document._id)}>View details</button><button type="button" onClick={() => downloadProjectDocument(document)}><FiDownload /> Download PDF</button></footer>
                </article>
              );
            })}
          </section>
        )}
      </main>

      {selectedDocument && (
        <div className="customer-document-modal-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDocument(); }}>
          <section className="customer-document-modal" role="dialog" aria-modal="true" aria-label={selectedDocument.reference}>
            <button type="button" className="customer-document-close" aria-label="Close document" onClick={closeDocument}><FiX /></button>
            <div className="document-modal-heading"><span>{selectedDocument.type}</span><h2>{selectedDocument.reference}</h2><p>{selectedDocument.title}</p></div>
            <div className="document-modal-project"><div><span>System</span><strong>{selectedDocument.project?.systemCapacity || selectedDocument.project?.systemName}</strong></div><div><span>Project site</span><strong>{selectedDocument.project?.siteAddress || selectedDocument.customer?.location}</strong></div><div><span>Property</span><strong>{selectedDocument.project?.propertyType || "Recorded during inspection"}</strong></div></div>
            <div className="document-modal-lines"><div className="header"><span>Description</span><span>Qty</span><span>Amount</span></div>{selectedDocument.lineItems?.map((item, index) => <div key={`${item.description}-${index}`}><span>{item.description}</span><span>{item.quantity} {item.unit}</span><strong>{formatMoney(item.amount)}</strong></div>)}</div>
            <div className="document-modal-total"><span>Total project cost</span><strong>{formatMoney(selectedDocument.total)}</strong></div>
            {selectedDocument.type === "quotation" && <div className="document-modal-finance"><div><span>Your equity ({selectedDocument.equityPercentage}%)</span><strong>{formatMoney(selectedDocument.equityAmount)}</strong></div><div><span>Requested bank finance</span><strong>{formatMoney(selectedDocument.bankFinanceAmount)}</strong></div></div>}
            {selectedDocument.terms && <div className="document-modal-terms"><strong>Terms</strong><p>{selectedDocument.terms}</p></div>}

            {selectedDocument.type === "quotation" && selectedDocument.status === "sent" && !requestingChanges && (
              <label className="quotation-approval-check"><input type="checkbox" checked={approvalChecked} onChange={(event) => setApprovalChecked(event.target.checked)} /><span>I have reviewed the full project scope, materials, total cost, customer equity, and financing amount, and I approve this quotation.</span></label>
            )}
            {requestingChanges && <label className="quotation-change-box"><span>Describe the correction you need</span><textarea rows="4" value={changeNote} onChange={(event) => setChangeNote(event.target.value)} placeholder="Explain the item, scope, quantity or amount that should be reviewed." /></label>}

            <footer className="document-modal-actions">
              <button type="button" className="secondary" onClick={() => downloadProjectDocument(selectedDocument)}><FiDownload /> Download PDF</button>
              {selectedDocument.type === "quotation" && selectedDocument.status === "sent" && !requestingChanges && <button type="button" className="secondary" onClick={() => setRequestingChanges(true)}>Request changes</button>}
              {selectedDocument.type === "quotation" && selectedDocument.status === "sent" && !requestingChanges && <button type="button" className="primary" disabled={!approvalChecked || saving} onClick={approveQuotation}><FiCheck /> {saving ? "Recording..." : "Approve quotation"}</button>}
              {requestingChanges && <button type="button" className="primary" disabled={!changeNote.trim() || saving} onClick={submitChangeRequest}>{saving ? "Sending..." : "Send change request"}</button>}
            </footer>
          </section>
        </div>
      )}
    </CustomerLayout>
  );
}

export default CustomerDocuments;
