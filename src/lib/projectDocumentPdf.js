import { jsPDF } from "jspdf";
import { builtRightEnergyLogoDataUri } from "./invoiceBrandAssets.js";

const cleanText = (value) =>
  String(value || "")
    .replace(/[₦]/g, "NGN ")
    .replace(/[^ -~]/g, "");

const pdfMoney = (value) => `NGN ${Number(value || 0).toLocaleString("en-NG")}`;

const numberToWords = (value) => {
  const number = Math.round(Number(value || 0));
  if (!Number.isFinite(number) || number <= 0) return "Zero Naira Only";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const underThousand = (n) => {
    const words = [];
    if (n >= 100) { words.push(`${ones[Math.floor(n / 100)]} Hundred`); n %= 100; }
    if (n >= 20) { words.push(tens[Math.floor(n / 10)]); if (n % 10) words.push(ones[n % 10]); }
    else if (n > 0) words.push(ones[n]);
    return words.join(" ");
  };
  let remaining = number;
  const words = [];
  [[1_000_000_000, "Billion"], [1_000_000, "Million"], [1_000, "Thousand"]].forEach(([size, label]) => {
    if (remaining >= size) { words.push(`${underThousand(Math.floor(remaining / size))} ${label}`); remaining %= size; }
  });
  if (remaining) words.push(underThousand(remaining));
  return `${words.join(", ")} Naira Only`;
};

const downloadInvoiceDocument = (projectDocument) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const green = [92, 159, 147];
  const dark = [55, 58, 57];
  const border = [83, 151, 222];
  const left = 10;
  const right = 200;
  const width = right - left;
  const money = (value) => Number(value || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const invoiceLabel = projectDocument.purpose === "inspection-fee" ? "INSPECTION INVOICE" : "INVOICE";
  const date = new Date(projectDocument.createdAt || Date.now());

  try { doc.addImage(builtRightEnergyLogoDataUri, "PNG", 14, 13, 48, 27); } catch { /* Text remains usable if the image cannot render. */ }
  doc.setTextColor(...green);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(projectDocument.purpose === "inspection-fee" ? 21 : 27);
  doc.text(invoiceLabel, 196, 22, { align: "right" });
  doc.setFontSize(15);
  doc.text(cleanText(projectDocument.reference), 196, 31, { align: "right" });
  doc.setFontSize(10);
  doc.text(`Invoice Date: ${date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`, 196, 42, { align: "right" });

  let y = 52;
  doc.text(String(date.getFullYear()), 12, y);
  y += 10;
  const panelTop = y;
  const half = width / 2;
  doc.setFillColor(...green);
  doc.rect(left, panelTop, half, 8, "F");
  doc.rect(left + half, panelTop, half, 8, "F");
  doc.setTextColor(...dark);
  doc.setFontSize(9);
  doc.text("Bill to", left + 3, panelTop + 5.4);
  doc.text("Payment Details", left + half + 3, panelTop + 5.4);
  doc.setDrawColor(...border);
  doc.rect(left, panelTop, width, 47);
  doc.line(left + half, panelTop, left + half, panelTop + 47);
  const drawRows = (rows, x, valueX) => {
    let rowY = panelTop + 14;
    rows.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold"); doc.setFontSize(8.2); doc.text(label, x, rowY);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(cleanText(value || "Nil"), 48).slice(0, 2);
      doc.text(lines, valueX, rowY);
      rowY += Math.max(5.5, lines.length * 4);
    });
  };
  drawRows([
    ["Customer", projectDocument.customer?.fullName],
    ["Customer ID#", String(projectDocument.financingRequest || "").slice(-8).toUpperCase()],
    ["System Size", projectDocument.project?.systemCapacity || projectDocument.project?.systemName],
    ["Address", projectDocument.project?.siteAddress || projectDocument.customer?.location],
    ["Phone", projectDocument.customer?.phone],
    ["Email", projectDocument.customer?.email],
  ], left + 3, left + 40);
  drawRows([["Bank Name", "FCMB"], ["Account Name", "BuiltRight Services Limited"], ["Account Number", "2008839924"]], left + half + 3, left + half + 33);

  y = panelTop + 55;
  const drawHeader = () => {
    doc.setFillColor(...green); doc.rect(left, y, width, 8, "F");
    doc.setTextColor(...dark); doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
    doc.text("S/N", 15, y + 5.4, { align: "center" }); doc.text("Description", 80, y + 5.4, { align: "center" });
    doc.text("QTY", 143, y + 5.4, { align: "center" }); doc.text("Unit price", 161, y + 5.4, { align: "center" }); doc.text("Amount", 186, y + 5.4, { align: "center" });
    y += 8;
  };
  drawHeader();
  (projectDocument.lineItems || []).forEach((item, index) => {
    const lines = doc.splitTextToSize(cleanText(item.description || "Item"), 108);
    const rowHeight = Math.max(8, lines.length * 4.3 + 3);
    if (y + rowHeight > 235) { doc.addPage(); y = 18; drawHeader(); }
    doc.setDrawColor(...border); doc.rect(left, y, width, rowHeight);
    [23, 137, 149, 173].forEach((x) => doc.line(x, y, x, y + rowHeight));
    doc.setTextColor(...dark); doc.setFont("helvetica", "normal"); doc.setFontSize(8.2);
    doc.text(String(index + 1), 15, y + 5.3, { align: "center" }); doc.text(lines, 25, y + 5.3);
    doc.text(String(item.quantity ?? 1), 143, y + 5.3, { align: "center" }); doc.text(money(item.unitPrice), 171, y + 5.3, { align: "right" }); doc.text(money(item.amount), 198, y + 5.3, { align: "right" });
    y += rowHeight;
  });
  if (y > 225) { doc.addPage(); y = 25; } else y += 5;
  const totalsX = 104;
  const totalRows = [["SUBTOTAL", projectDocument.subtotal, true], ...(Number(projectDocument.discount || 0) > 0 ? [["Discount", -Number(projectDocument.discount), false]] : []), ...(Number(projectDocument.tax || 0) > 0 ? [["VAT / Tax", projectDocument.tax, false]] : []), ["GRAND TOTAL", projectDocument.total, true]];
  totalRows.forEach(([label, value, emphasized]) => {
    if (emphasized) { doc.setFillColor(...green); doc.rect(totalsX, y, 92, 8, "F"); } else { doc.setDrawColor(40, 40, 40); doc.rect(totalsX, y, 92, 8); }
    doc.setTextColor(...dark); doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.text(label, totalsX + 3, y + 5.4); doc.text(money(value), 193, y + 5.4, { align: "right" }); y += 8;
  });
  const wordLines = doc.splitTextToSize(`Amount in Words: ${numberToWords(projectDocument.total)}`, 85);
  const wordsHeight = Math.max(14, wordLines.length * 4 + 5);
  doc.setDrawColor(40, 40, 40); doc.rect(totalsX, y, 92, wordsHeight); doc.setFont("helvetica", "bolditalic"); doc.setFontSize(8.2); doc.text(wordLines, totalsX + 3, y + 5.5); y += wordsHeight + 4;
  doc.setTextColor(235, 65, 35); doc.setFont("helvetica", "bolditalic"); doc.setFontSize(8.5);
  doc.text(doc.splitTextToSize(projectDocument.purpose === "inspection-fee" ? "Please note: This invoice covers the site inspection and assessment fee only." : "Please note: This invoice stays valid for a maximum of 2 weeks after submission.", 120), 13, Math.min(y, 263));
  doc.setTextColor(...green); doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.text("Contact for more info: 0904 999 1595 | info@builtrightltd.com | www.builtrightltd.com", 105, 282, { align: "center" });
  doc.setFont("helvetica", "bolditalic"); doc.text("Thank you for your business!!!", 105, 287, { align: "center" });
  doc.save(`BuiltRight-${projectDocument.purpose === "inspection-fee" ? "Inspection-Invoice" : "Invoice"}-${cleanText(projectDocument.reference)}.pdf`);
};

export function downloadProjectDocument(projectDocument) {
  if (projectDocument.type === "invoice") return downloadInvoiceDocument(projectDocument);
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
    doc.addImage(builtRightEnergyLogoDataUri, "PNG", margin, 7, 32, 20);
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
