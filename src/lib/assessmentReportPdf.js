import jsPDF from "jspdf";
import logo from "../assets/logoooo.png";

const clean = (value) => String(value ?? "").replace(/[^\x20-\x7E]/g, "");

export function downloadAssessmentReport(project) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 17;
  const width = 176;
  let y = 46;
  const assessment = project.assessment || {};
  const audit = assessment.loadAudit || {};
  const inspection = assessment.inspection || {};
  const due = assessment.dueDiligence || {};

  const ensure = (space = 12) => {
    if (y + space > 279) { doc.addPage(); y = 20; }
  };
  const line = (label, value) => {
    ensure(8);
    doc.setFont("helvetica", "bold");
    doc.text(clean(label), margin, y);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(clean(value || "Not recorded"), 118);
    doc.text(lines, 70, y);
    y += Math.max(6, lines.length * 4.5);
  };
  const section = (title) => {
    ensure(14);
    y += 4;
    doc.setFillColor(232, 247, 244);
    doc.rect(margin, y - 5, width, 9, "F");
    doc.setTextColor(15, 79, 72);
    doc.setFont("helvetica", "bold");
    doc.text(clean(title.toUpperCase()), margin + 3, y + 1);
    doc.setTextColor(30, 42, 39);
    y += 10;
  };

  doc.setFillColor(15, 79, 72);
  doc.rect(0, 0, 210, 36, "F");
  try { doc.addImage(logo, "PNG", margin, 7, 26, 18); } catch { /* text branding remains */ }
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("BuiltRight Services Ltd", 50, 16);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("LOAD AUDIT AND SITE ASSESSMENT REPORT", 50, 25);

  doc.setTextColor(30, 42, 39);
  doc.setFontSize(9);
  line("Project reference", project.reference);
  line("Customer", project.customer?.fullName);
  line("Phone / email", `${project.customer?.phone || ""} | ${project.customer?.email || ""}`);
  line("Project location", project.customer?.location);
  line("Sales owner", project.intake?.createdByName || "BuiltRight operations");
  line("Assigned installer", project.installerAssignment?.installerName);

  section("Sales load audit");
  line("Peak load", `${audit.peakLoadKw || 0} kW`);
  line("Daily energy", `${audit.dailyEnergyKwh || 0} kWh/day`);
  line("Critical load", `${audit.criticalLoadKw || 0} kW`);
  line("Inverter recommendation", `${audit.recommendedInverterKva || 0} kVA`);
  line("Battery recommendation", `${audit.recommendedBatteryKwh || 0} kWh`);
  line("Solar array", `${audit.recommendedSolarKw || 0} kW`);
  line("Backup target", `${audit.backupHours || 0} hours`);
  line("Completed by", audit.completedBy);
  line("Audit notes", audit.notes);

  if (audit.appliances?.length) {
    section("Appliance schedule");
    audit.appliances.forEach((item, index) => line(`${index + 1}. ${item.name}`, `${item.quantity || 0} x ${item.watts || 0} W for ${item.hoursPerDay || 0} hours/day`));
  }

  section("Installer site assessment");
  line("Inspection status", `${inspection.status || "pending"} / ${inspection.result || "pending"}`);
  line("Completed by", inspection.completedBy || project.installerAssignment?.installerName);
  line("Property type", project.inspection?.propertyType);
  line("Cable distance", project.inspection?.cableDistance);
  line("Mounting method", project.inspection?.mountingMethod);
  line("Inspection notes", inspection.notes || project.inspection?.notes);

  section("Due diligence");
  (due.checklist || []).forEach((item) => line(item.label, `${item.status || "pending"}${item.note ? ` - ${item.note}` : ""}`));
  line("Due-diligence notes", due.notes);

  section("Installation materials and work");
  if (project.inspectionCosts?.length) {
    project.inspectionCosts.forEach((item, index) => line(`${index + 1}. ${item.label}`, item.amount ? `NGN ${Number(item.amount).toLocaleString("en-NG")}` : "Amount pending quotation"));
  } else {
    line("Materials", "No installation materials have been recorded yet.");
  }

  section("Combined outcome");
  line("Assessment status", assessment.status || "in progress");
  line("Quotation readiness", assessment.status === "passed" ? "Ready for sales quotation preparation" : "Pending completion of site assessment and due diligence");
  doc.save(`BuiltRight-Assessment-${project.reference || project._id}.pdf`);
}
