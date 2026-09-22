import fs from "node:fs/promises";
import path from "node:path";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const root = process.cwd();
const outDir = path.join(root, "outputs", "payment_calendar_2026");
const logoPath = path.join(root, "src", "assets", "logoooo.png");

const wb = Workbook.create();
const summary = wb.worksheets.add("2026 Calendar");
const schedule = wb.worksheets.add("Payment Schedule");
summary.showGridLines = false;
schedule.showGridLines = false;

const teal = "#16988A";
const red = "#BE1E2D";
const ink = "#202A32";
const pale = "#EAF6F3";
const softRed = "#FBEAEC";
const grey = "#667085";
const light = "#F5F7F8";
const white = "#FFFFFF";
const nairaFmt = '"₦"#,##0;[Red]("₦"#,##0);-';

const logo = await fs.readFile(logoPath);
const logoData = `data:image/png;base64,${logo.toString("base64")}`;

// Input schedule
schedule.getRange("A1:H1").merge();
schedule.getRange("A1").values = [["BUILDRIGHT PAYMENT SCHEDULE"]];
schedule.getRange("A1:H1").format = { fill: ink, font: { bold: true, color: white, size: 20 }, verticalAlignment: "center", horizontalAlignment: "right" };
schedule.getRange("A1:H1").format.rowHeight = 70;
schedule.getRange("A2:H2").merge();
schedule.getRange("A2").values = [["Recurring subscriptions and annual renewals | Prepared 14 Aug 2026"]];
schedule.getRange("A2:H2").format = { fill: ink, font: { color: "#D6E1E5", italic: true, size: 10 }, horizontalAlignment: "right" };
schedule.getRange("A4:H4").values = [["Service", "Frequency", "Due rule", "Amount (₦)", "Annual cost (₦)", "Budget status", "Owner", "Notes"]];
schedule.getRange("A5:H10").values = [
  ["CapCut subscription", "Monthly", "Last day of month", 6900, null, "Confirmed", "Admin", "Interpreted from ‘31st every month’"],
  ["Canva subscription", "Monthly", "23rd", 5500, null, "Confirmed", "Admin", ""],
  ["ChatGPT subscription", "Monthly", "TBD", 7000, null, "Date required", "Admin", "Billing day was not provided"],
  ["Zoho Mail", "Monthly", "11th", 16555, null, "Variable", "Admin / HR", "Increases as staff count increases"],
  ["Domain subscription", "Annual", "28 April", 78226, null, "Confirmed", "IT", "Annual renewal"],
  ["Internet subscription", "Monthly", "27th", 25000, null, "Confirmed", "Admin", ""],
];
schedule.getRange("E5").formulas = [["=D5*12"]];
schedule.getRange("E5:E8").fillDown();
schedule.getRange("E9").formulas = [["=D9"]];
schedule.getRange("E10").formulas = [["=D10*12"]];
schedule.getRange("A4:H4").format = { fill: teal, font: { bold: true, color: white }, horizontalAlignment: "center", verticalAlignment: "center", wrapText: true };
schedule.getRange("A5:H10").format = { font: { color: ink, size: 10 }, verticalAlignment: "center" };
schedule.getRange("D5:E10").format.numberFormat = nairaFmt;
schedule.getRange("D5:E10").format.horizontalAlignment = "right";
schedule.getRange("A5:H10").format.borders = { bottom: { style: "thin", color: "#D9E1E5" } };
schedule.getRange("F7").format = { fill: softRed, font: { bold: true, color: red }, horizontalAlignment: "center" };
schedule.getRange("F8").format = { fill: "#FFF4D6", font: { bold: true, color: "#9A6700" }, horizontalAlignment: "center" };
schedule.getRange("F5:F6").format.horizontalAlignment = "center";
schedule.getRange("F9:F10").format.horizontalAlignment = "center";

schedule.getRange("A12:C12").merge();
schedule.getRange("A12").values = [["MONTHLY COMMITMENT"]];
schedule.getRange("D12:E12").merge();
schedule.getRange("D12").formulas = [["=SUM(D5:D8,D10)"]];
schedule.getRange("F12:G12").merge();
schedule.getRange("F12").values = [["ANNUALIZED TOTAL"]];
schedule.getRange("H12").formulas = [["=SUM(E5:E10)"]];
schedule.getRange("A12:H12").format = { fill: ink, font: { bold: true, color: white, size: 11 }, verticalAlignment: "center" };
schedule.getRange("D12:E12").format.numberFormat = nairaFmt;
schedule.getRange("H12").format.numberFormat = nairaFmt;
schedule.getRange("D12:E12").format.horizontalAlignment = "right";
schedule.getRange("H12").format.horizontalAlignment = "right";
schedule.getRange("A14:H15").merge();
schedule.getRange("A14").values = [["Important: Confirm the ChatGPT billing day before using this workbook for payment execution. Zoho Mail is a variable staff-linked cost and should be reviewed whenever headcount changes."]];
schedule.getRange("A14:H15").format = { fill: "#FFF4D6", font: { color: "#7A4E00", italic: true }, wrapText: true, verticalAlignment: "center" };
schedule.freezePanes.freezeRows(4);

// Executive calendar
summary.getRange("A1:N1").merge();
summary.getRange("A1").values = [["2026 PAYMENT CALENDAR"]];
summary.getRange("A1:N1").format = { fill: ink, font: { bold: true, color: white, size: 20 }, verticalAlignment: "center", horizontalAlignment: "right" };
summary.getRange("A1:N1").format.rowHeight = 70;
summary.getRange("A2:N2").merge();
summary.getRange("A2").values = [["BuildRight Services Ltd. | Management planning view"]];
summary.getRange("A2:N2").format = { fill: ink, font: { color: "#D6E1E5", italic: true }, horizontalAlignment: "right" };

summary.getRange("A4:C4").merge(); summary.getRange("A4").values = [["Monthly commitment"]];
summary.getRange("D4:F4").merge(); summary.getRange("D4").formulas = [["='Payment Schedule'!D12"]];
summary.getRange("G4:I4").merge(); summary.getRange("G4").values = [["2026 planned spend"]];
summary.getRange("J4:L4").merge(); summary.getRange("J4").formulas = [["='Payment Schedule'!H12"]];
summary.getRange("M4:N4").merge(); summary.getRange("M4").values = [["6 services"]];
summary.getRange("A4:N4").format = { fill: pale, font: { bold: true, color: ink, size: 12 }, verticalAlignment: "center", horizontalAlignment: "center" };
summary.getRange("D4:F4").format = { fill: teal, font: { bold: true, color: white, size: 15 }, horizontalAlignment: "center" };
summary.getRange("J4:L4").format = { fill: red, font: { bold: true, color: white, size: 15 }, horizontalAlignment: "center" };
summary.getRange("D4:F4").format.numberFormat = nairaFmt;
summary.getRange("J4:L4").format.numberFormat = nairaFmt;
summary.getRange("A4:N4").format.rowHeight = 34;

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
summary.getRange("A6:N6").values = [["Payment", ...months, "Annual total"]];
summary.getRange("A6:N6").format = { fill: teal, font: { bold: true, color: white }, horizontalAlignment: "center" };
const services = [
  ["Zoho Mail — 11th", 16555, 16555, 16555, 16555, 16555, 16555, 16555, 16555, 16555, 16555, 16555, 16555],
  ["Canva — 23rd", 5500, 5500, 5500, 5500, 5500, 5500, 5500, 5500, 5500, 5500, 5500, 5500],
  ["Internet — 27th", 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000],
  ["Domain — 28 Apr", 0, 0, 0, 78226, 0, 0, 0, 0, 0, 0, 0, 0],
  ["CapCut — month end", 6900, 6900, 6900, 6900, 6900, 6900, 6900, 6900, 6900, 6900, 6900, 6900],
  ["ChatGPT — date TBD", 7000, 7000, 7000, 7000, 7000, 7000, 7000, 7000, 7000, 7000, 7000, 7000],
];
summary.getRange("A7:M12").values = services;
for (let r = 7; r <= 12; r++) summary.getRange(`N${r}`).formulas = [[`=SUM(B${r}:M${r})`]];
summary.getRange("A13").values = [["TOTAL PLANNED"]];
for (let c = 2; c <= 14; c++) {
  const letter = String.fromCharCode(64 + c);
  summary.getRange(`${letter}13`).formulas = [[`=SUM(${letter}7:${letter}12)`]];
}
summary.getRange("A7:N12").format.borders = { bottom: { style: "thin", color: "#D9E1E5" } };
summary.getRange("B7:N13").format.numberFormat = nairaFmt;
summary.getRange("B7:N13").format.horizontalAlignment = "right";
summary.getRange("A13:N13").format = { fill: ink, font: { bold: true, color: white }, verticalAlignment: "center" };
summary.getRange("B13:N13").format.numberFormat = nairaFmt;
summary.getRange("E10:E10").format.fill = softRed;
summary.getRange("A12:N12").format = { fill: "#FFF9E8", font: { color: ink, italic: true }, borders: { bottom: { style: "thin", color: "#D9E1E5" } } };
summary.getRange("B12:N12").format.numberFormat = nairaFmt;

summary.getRange("A15:N15").merge();
summary.getRange("A15").values = [["PAYMENT TIMING NOTES"]];
summary.getRange("A15:N15").format = { fill: red, font: { bold: true, color: white }, horizontalAlignment: "left" };
summary.getRange("A16:N18").merge();
summary.getRange("A16").values = [["• 11th: Zoho Mail — ₦16,555 (review when staff increases)   • 23rd: Canva — ₦5,500   • 27th: Internet — ₦25,000\n• 28 April: Domain — ₦78,226   • Month-end: CapCut — ₦6,900   • ChatGPT — ₦7,000, billing day still to be confirmed"]];
summary.getRange("A16:N18").format = { fill: light, font: { color: ink, size: 11 }, wrapText: true, verticalAlignment: "center" };
summary.freezePanes.freezeRows(6);

for (const sh of [summary, schedule]) {
  sh.getRange("A1:N20").format.font.name = "Aptos";
}
summary.getRange("A1:A20").format.columnWidth = 27;
summary.getRange("B1:M20").format.columnWidth = 12;
summary.getRange("N1:N20").format.columnWidth = 16;
summary.getRange("A7:A13").format.wrapText = true;
summary.getRange("A7:N13").format.rowHeight = 26;
schedule.getRange("A1:A16").format.columnWidth = 23;
schedule.getRange("B1:B16").format.columnWidth = 13;
schedule.getRange("C1:C16").format.columnWidth = 19;
schedule.getRange("D1:E16").format.columnWidth = 17;
schedule.getRange("F1:F16").format.columnWidth = 16;
schedule.getRange("G1:G16").format.columnWidth = 16;
schedule.getRange("H1:H16").format.columnWidth = 35;
schedule.getRange("A5:H10").format.rowHeight = 29;
schedule.getRange("H5:H10").format.wrapText = true;

// Add branding last so it remains above the title-band formatting.
summary.images.add({ dataUrl: logoData, anchor: { from: { row: 0, col: 0 }, extent: { widthPx: 250, heightPx: 150 } } });
schedule.images.add({ dataUrl: logoData, anchor: { from: { row: 0, col: 0 }, extent: { widthPx: 250, heightPx: 150 } } });

await fs.mkdir(outDir, { recursive: true });
const check1 = await wb.inspect({ kind: "table", range: "2026 Calendar!A4:N18", include: "values,formulas", tableMaxRows: 20, tableMaxCols: 14 });
const check2 = await wb.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 100 }, summary: "final formula error scan" });
console.log(check1.ndjson);
console.log(check2.ndjson);
for (const sheetName of ["2026 Calendar", "Payment Schedule"]) {
  const preview = await wb.render({ sheetName, autoCrop: "all", scale: 1.2, format: "png" });
  await fs.writeFile(path.join(outDir, `${sheetName.replaceAll(" ", "_")}.png`), new Uint8Array(await preview.arrayBuffer()));
}
const output = await SpreadsheetFile.exportXlsx(wb);
await output.save(path.join(outDir, "BuildRight_Payment_Calendar_2026.xlsx"));
console.log(path.join(outDir, "BuildRight_Payment_Calendar_2026.xlsx"));
