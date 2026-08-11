import jsPDF from "jspdf";
import logo from "../assets/logoooo.png";

const cleanText = (value) =>
  String(value || "")
    .replace(/[₦]/g, "NGN ")
    .replace(/[^ -~]/g, "");

const pdfMoney = (value) => `NGN ${Number(value || 0).toLocaleString("en-NG")}`;

export function downloadProjectDocument(projectDocument) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 18;
  const usableWidth = 174;
  let y = 20;

  const ensureRoom = (height = 12) => {
    if (y + height > 278) {
      doc.addPage();
      y = 20;
    }
  };

  const wrapped = (value, x, width, lineHeight = 5) => {
    const lines = doc.splitTextToSize(cleanText(value), width);
    ensureRoom(lines.length * lineHeight + 2);
    doc.text(lines, x, y);
    y += lines.length * lineHeight;
  };

  doc.setFillColor(15, 79, 72);
  doc.rect(0, 0, 210, 38, "F");
  try {
    doc.addImage(logo, "PNG", margin, 8, 27, 18);
  } catch {
    // The branded text header remains when image conversion is unavailable.
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("BuiltRight Services Ltd", 51, 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(projectDocument.type === "invoice" ? "PROJECT INVOICE" : "SOLAR PROJECT QUOTATION", 51, 27);

  y = 49;
  doc.setTextColor(25, 36, 33);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`Reference: ${cleanText(projectDocument.reference)}`, margin, y);
  doc.text(`Status: ${cleanText(projectDocument.status).toUpperCase()}`, 130, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.text(`Customer: ${cleanText(projectDocument.customer?.fullName)}`, margin, y);
  doc.text(`Date: ${new Date(projectDocument.createdAt || Date.now()).toLocaleDateString("en-GB")}`, 130, y);
  y += 6;
  doc.text(`Email: ${cleanText(projectDocument.customer?.email)}`, margin, y);
  y += 11;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  wrapped(projectDocument.title || "Solar project", margin, usableWidth, 5.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  wrapped(
    [projectDocument.project?.systemCapacity, projectDocument.project?.systemName, projectDocument.project?.siteAddress]
      .filter(Boolean)
      .join(" | "),
    margin,
    usableWidth
  );

  y += 4;
  doc.setFillColor(237, 246, 243);
  doc.rect(margin, y, usableWidth, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.text("PROJECT COST BREAKDOWN", margin + 3, y + 5.4);
  y += 13;

  (projectDocument.lineItems || []).forEach((item, index) => {
    ensureRoom(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    wrapped(`${index + 1}. ${item.description}`, margin, 110, 4.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`${Number(item.quantity || 0)} ${cleanText(item.unit || "item")}`, 131, y - 4.5);
    doc.text(pdfMoney(item.amount), 157, y - 4.5);
    doc.setDrawColor(226, 234, 231);
    doc.line(margin, y, margin + usableWidth, y);
    y += 4;
  });

  ensureRoom(38);
  y += 4;
  doc.setFontSize(9);
  doc.text("Subtotal", 126, y);
  doc.text(pdfMoney(projectDocument.subtotal), 157, y);
  y += 6;
  if (Number(projectDocument.discount || 0) > 0) {
    doc.text("Discount", 126, y);
    doc.text(`- ${pdfMoney(projectDocument.discount)}`, 157, y);
    y += 6;
  }
  if (Number(projectDocument.tax || 0) > 0) {
    doc.text("Tax", 126, y);
    doc.text(pdfMoney(projectDocument.tax), 157, y);
    y += 6;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total", 126, y);
  doc.text(pdfMoney(projectDocument.total), 157, y);
  y += 11;

  if (projectDocument.type === "quotation") {
    doc.setFontSize(9);
    doc.text(`Customer equity (${projectDocument.equityPercentage || 20}%): ${pdfMoney(projectDocument.equityAmount)}`, margin, y);
    y += 6;
    doc.text(`Requested bank finance: ${pdfMoney(projectDocument.bankFinanceAmount)}`, margin, y);
    y += 10;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Project scope", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  wrapped(projectDocument.project?.scope || projectDocument.notes || "As described in the approved project assessment.", margin, usableWidth);

  if (projectDocument.terms) {
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Terms", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    wrapped(projectDocument.terms, margin, usableWidth);
  }

  const label = projectDocument.type === "invoice" ? "Invoice" : "Quotation";
  doc.save(`BuiltRight-${label}-${projectDocument.reference || projectDocument._id}.pdf`);
}
