from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, Frame, Image, KeepTogether, PageBreak, PageTemplate,
    Paragraph, Spacer, Table, TableStyle,
)


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "output" / "pdf" / "BuiltRight_Company_Wide_Accounting_System_Brief.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
LOGO = ROOT / "src" / "assets" / "logoooo.png"

RED = colors.HexColor("#B32127")
TEAL = colors.HexColor("#159284")
INK = colors.HexColor("#172B2B")
MUTED = colors.HexColor("#536364")
PALE = colors.HexColor("#EAF5F2")
LINE = colors.HexColor("#D9E6E2")
WHITE = colors.white

PAGE_W, PAGE_H = A4
LEFT = RIGHT = 19 * mm
TOP = 22 * mm
BOTTOM = 18 * mm
CONTENT_W = PAGE_W - LEFT - RIGHT

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="TitleBR", parent=styles["Title"], fontName="Helvetica-Bold",
    fontSize=22, leading=27, textColor=INK, alignment=TA_LEFT,
    spaceAfter=9,
))
styles.add(ParagraphStyle(
    name="SubtitleBR", parent=styles["Normal"], fontName="Helvetica",
    fontSize=10.2, leading=15, textColor=MUTED, spaceAfter=14,
))
styles.add(ParagraphStyle(
    name="H1BR", parent=styles["Heading1"], fontName="Helvetica-Bold",
    fontSize=12.8, leading=16.5, textColor=TEAL, spaceBefore=10, spaceAfter=3,
    keepWithNext=True,
))
styles.add(ParagraphStyle(
    name="H2BR", parent=styles["Heading2"], fontName="Helvetica-Bold",
    fontSize=10.2, leading=13.5, textColor=INK, spaceBefore=8, spaceAfter=3,
    keepWithNext=True,
))
styles.add(ParagraphStyle(
    name="BodyBR", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=8.4, leading=11, textColor=INK, spaceAfter=1.5,
))
styles.add(ParagraphStyle(
    name="SmallBR", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=7.7, leading=10.8, textColor=MUTED, spaceAfter=4,
))
styles.add(ParagraphStyle(
    name="TableBR", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=7.5, leading=10.5, textColor=INK,
))
styles.add(ParagraphStyle(
    name="TableHeadBR", parent=styles["BodyText"], fontName="Helvetica-Bold",
    fontSize=7.7, leading=10.8, textColor=WHITE,
))
styles.add(ParagraphStyle(
    name="LabelBR", parent=styles["BodyText"], fontName="Helvetica-Bold",
    fontSize=8.1, leading=12, textColor=RED, spaceAfter=8,
))
styles.add(ParagraphStyle(
    name="CenterBR", parent=styles["BodyText"], fontName="Helvetica-Bold",
    fontSize=9, leading=13, textColor=INK, alignment=TA_CENTER,
))


def p(text, style="BodyBR"):
    return Paragraph(text, styles[style])


def plain(text):
    return escape(text)


def para(text):
    return p(plain(text))


def bullet(text):
    return p(f'<font color="#159284"><b>-</b></font>  {escape(text)}')


def table(headers, rows, widths, body_style="TableBR"):
    data = [[p(escape(h), "TableHeadBR") for h in headers]]
    for row in rows:
        data.append([p(escape(str(v)), body_style) for v in row])
    t = Table(data, colWidths=widths, hAlign="LEFT", repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), TEAL),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, colors.HexColor("#F6FAF9")]),
        ("GRID", (0, 0), (-1, -1), 0.35, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    return t


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.6)
    canvas.line(LEFT, PAGE_H - 16 * mm, PAGE_W - RIGHT, PAGE_H - 16 * mm)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.setFillColor(TEAL)
    canvas.drawString(LEFT, PAGE_H - 13 * mm, "BUILTRIGHT SERVICES LIMITED")
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(PAGE_W - RIGHT, PAGE_H - 13 * mm, "ACCOUNTING SYSTEM REQUIREMENTS")
    canvas.line(LEFT, 14 * mm, PAGE_W - RIGHT, 14 * mm)
    canvas.drawString(LEFT, 9.7 * mm, "Draft for accountant review | 22 September 2026")
    canvas.drawRightString(PAGE_W - RIGHT, 9.7 * mm, f"Page {doc.page}")
    canvas.restoreState()


class BriefDoc(BaseDocTemplate):
    def __init__(self, filename):
        super().__init__(
            str(filename), pagesize=A4, leftMargin=LEFT, rightMargin=RIGHT,
            topMargin=TOP, bottomMargin=BOTTOM, title="BuiltRight Company-Wide Accounting System Brief",
            author="BuiltRight Services Limited", subject="Accountant review draft",
        )
        frame = Frame(LEFT, BOTTOM, CONTENT_W, PAGE_H - TOP - BOTTOM,
                      leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates(PageTemplate(id="main", frames=[frame], onPage=header_footer))


story = []
if LOGO.exists():
    logo = Image(str(LOGO), width=65 * mm, height=34 * mm)
    logo.hAlign = "LEFT"
    story.extend([logo, Spacer(1, 5 * mm)])
story.append(p("Company-Wide Accounting System", "TitleBR"))
story.append(p("Functional requirements and workflow for BuiltRight Services Limited", "SubtitleBR"))
story.append(p("ACCOUNTANT REVIEW DRAFT - NOT YET IMPLEMENTED", "LabelBR"))
story.append(para(
    "This brief proposes one accounting system for the full history and ongoing operations of BuiltRight Services Limited. "
    "It covers initial capital, office setup, assets, daily costs, e-commerce, solar installations, financing-related receipts, maintenance and training. "
    "The accountant should approve the policies and classifications before the system is used for statutory reporting."
))

story.append(p("1. Objectives and scope", "H1BR"))
for item in [
    "Record all company transactions from inception, including historical entries supported by source documents.",
    "Maintain one general ledger for the legal entity, with divisions, projects, departments and locations as reporting dimensions.",
    "Generate journals, ledgers, trial balances, financial statements and management reports from one consistent data source.",
    "Connect future operational events to controlled accounting entries without posting the same transaction twice.",
    "Preserve audit trails, approvals, reconciliations and locked reporting periods.",
]: story.append(bullet(item))
story.append(para(
    "BuiltRight Energy, training, maintenance and other activities may be tracked as divisions or cost centres if they are part of the same legal entity. "
    "The accountant must confirm whether any activity belongs to a separate entity."
))

story.append(p("2. Accounting flow", "H1BR"))
flow = Table([[p("Source document or business event  >  Draft journal  >  Review and approval  >  Posted journal  >  General ledger and subledgers  >  Adjusted trial balance  >  Reports", "CenterBR")]], colWidths=[CONTENT_W])
flow.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), PALE), ("BOX", (0, 0), (-1, -1), 0.8, TEAL), ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10), ("LEFTPADDING", (0, 0), (-1, -1), 11), ("RIGHTPADDING", (0, 0), (-1, -1), 11)]))
story.append(flow)
story.append(Spacer(1, 3 * mm))
story.append(para(
    "Each posted journal must have equal debit and credit totals. The ledger groups posted entries by account; the trial balance checks arithmetic balance. "
    "A balanced trial balance does not establish that all transactions were classified correctly."
))

story.append(p("3. Chart of accounts", "H1BR"))
story.append(para("Illustrative account ranges; the accountant will approve final codes, account names and classifications."))
story.append(table(["Code", "Group", "BuiltRight examples"], [
    ("1000-1999", "Assets", "Cash and bank; customer receivables; inventory; supplier advances; deposits; prepayments; office fit-out; equipment; furniture; accumulated depreciation"),
    ("2000-2999", "Liabilities", "Supplier payables; customer advances; accrued expenses; tax and payroll liabilities; director and investor loans; other company borrowings"),
    ("3000-3999", "Equity", "Share capital; additional owner contributions; retained earnings; current-year result; distributions"),
    ("4000-4999", "Revenue", "Solar product sales; installation services; inspections; maintenance; training; other services"),
    ("5000-5999", "Direct costs", "Systems purchased for sale; project materials; installation labour; delivery and subcontractors"),
    ("6000-6999", "Operating expenses", "Salaries; rent; utilities; internet; transport; marketing; software; insurance; repairs; professional fees; depreciation"),
    ("7000-7999", "Other/finance", "Interest income; finance costs; other non-operating items when relevant"),
], [26 * mm, 37 * mm, CONTENT_W - 63 * mm]))
story.append(para(
    "Each account should have a unique code, name, type, description, normal balance, reporting category and active/inactive status. "
    "Accounts with historical entries may be deactivated but must not be deleted."
))

story.append(p("4. Reporting dimensions", "H1BR"))
story.append(table(["Dimension", "Purpose", "Illustration"], [
    ("Division", "Performance by line of business", "BuiltRight Energy; training; maintenance"),
    ("Project", "Income, costs and margin for each job", "Customer installation/project reference"),
    ("Department", "Internal cost ownership", "Administration; sales; operations"),
    ("Location", "Office or branch performance", "Lagos office or future branches"),
    ("Funding source", "Trace capital and borrowings", "Shareholder contribution; documented loan"),
], [29 * mm, 66 * mm, CONTENT_W - 95 * mm]))

story.append(p("5. Historical records from the first day", "H1BR"))
story.append(para(
    "The historical-entry workspace should accept bank statements, receipts, invoices, contracts, capital records, loan agreements, payroll evidence and asset lists. "
    "For each item, capture transaction date, posting period, amount, currency, payer/payee, narrative, payment account, division/project, proposed debit and credit, source document, reviewer and evidence status."
))
for i, item in enumerate([
    "Confirm accounting start date, incorporation date, financial year-end and the periods for which accounts were already issued.",
    "Gather and reconcile bank and cash activity with the underlying documents.",
    "Distinguish share capital and other equity contributions from repayable director/investor loans and from revenue.",
    "Create customer, supplier, inventory and fixed-asset opening records.",
    "Review historical journals period by period, reconcile each trial balance and lock approved periods.",
], 1): story.append(para(f"{i}. {item}"))
story.append(p("Migration safeguards", "H2BR"))
story.append(para(
    "Do not post both an opening balance and its underlying historical transactions. Do not invent a balancing entry for missing records; record an unresolved reconciliation item. "
    "Amounts predating incorporation or incurred personally by an owner require the accountant's decision before inclusion. "
    "Previously issued accounts and material prior-period corrections need separate professional review."
))

story.append(p("6. Journal and ledger requirements", "H1BR"))
story.append(para(
    "A journal should carry a unique reference, event date, posting date, financial period, description, balanced account lines, dimensions, creator, reviewer, attachments and status: "
    "Draft > Submitted > Approved > Posted (or Rejected). Support manual, recurring, opening, adjusting and reversing entries."
))
story.append(para(
    "Posting must update the general ledger and relevant customer, supplier, inventory, asset or project subledger in a single controlled operation. "
    "Every ledger shows opening balance, movements and running/closing balance, with drill-down to the journal and document. "
    "A posted entry is not silently edited or deleted; corrections use a traceable reversal or adjustment."
))

story.append(p("7. Operational modules and proposed posting triggers", "H1BR"))
story.append(table(["Module", "Operational records", "Accounting trigger"], [
    ("Bank and cash", "Statements; receipts; payments", "Matched, approved cash movement and reconciliation"),
    ("Customers", "Quotes; invoices; deposits; credits", "Approved invoice, receipt or credit note, subject to recognition policy"),
    ("Suppliers", "Purchase orders; bills; advances", "Goods/services received or supplier bill approved, as policy requires"),
    ("Inventory", "Purchases; issues; returns; sales", "Controlled stock movement and cost recognition"),
    ("Fixed assets", "Asset register; locations; disposal", "Acquisition, scheduled depreciation or disposal"),
    ("Projects", "Budget; materials; labour; milestones", "Approved financial event, tagged to project"),
    ("Training", "Learner charges; payments; costs", "Approved charge, receipt or expense"),
    ("Capital/loans", "Contribution and loan agreements", "Verified receipt or repayment, classified by agreement"),
], [29 * mm, 54 * mm, CONTENT_W - 83 * mm]))
story.append(para(
    "A quote, financing request or purchase order alone is not automatically a journal transaction. Rules should propose entries only when an event has an accounting consequence. "
    "Invoice creation, cash receipt and earned revenue may occur at different times. The accountant should approve the recognition policy for each product and service line."
))

story.append(p("8. Illustrative journal treatments", "H1BR"))
story.append(table(["Event", "Illustrative debit", "Illustrative credit"], [
    ("Owner funding", "Bank", "Equity or Director Loan, per agreement"),
    ("Office equipment purchase", "Fixed Asset", "Bank or Supplier Payable"),
    ("Office electricity payment", "Utilities Expense", "Bank"),
    ("Customer advance for unearned work", "Bank", "Customer Advance / Contract Liability"),
    ("Stock purchase", "Inventory", "Bank or Supplier Payable"),
    ("Customer settles invoice", "Bank", "Customer Receivable"),
    ("Depreciation", "Depreciation Expense", "Accumulated Depreciation"),
], [72 * mm, 38 * mm, CONTENT_W - 110 * mm]))
story.append(p("Financed solar projects", "H2BR"))
story.append(para(
    "The customer's bank loan should not automatically be booked as BuiltRight's liability. Funds held in a bank-controlled no-debit account are not automatically BuiltRight bank cash. "
    "When BuiltRight receives an approved customer or bank payment, it should be matched to the relevant invoice/receivable or advance. "
    "A management fee paid by the customer directly to the bank is bank income, not BuiltRight income or expense."
))

story.append(p("9. Reports and downloads", "H1BR"))
for item in [
    "General ledger and individual account movements; unadjusted and adjusted trial balance.",
    "Profit and loss by month, year, division and project; balance sheet at a selected date.",
    "Statement of cash flows and statement of changes in equity.",
    "Customer and supplier statements; receivables/payables ageing; bank reconciliations.",
    "Fixed-asset and depreciation schedule; project budget versus actual and margin.",
    "Since-inception summary of capital, cumulative revenue, expenses, assets, liabilities and results.",
]: story.append(bullet(item))
story.append(para(
    "A customer statement of account (one customer's invoices and payments) is different from BuiltRight's company profit and loss statement. "
    "Reports should be filtered by date, period and dimension, and downloadable as branded PDF and Excel/CSV with generation time, filters and draft/approved status."
))

story.append(p("10. Roles, controls and period close", "H1BR"))
story.append(table(["Role", "Proposed rights"], [
    ("Accounts officer", "Prepare entries, attach evidence and submit for review"),
    ("Accountant", "Approve classifications, post journals, reconcile accounts and propose close"),
    ("Finance manager", "Approve significant adjustments and lock/reopen periods under control"),
    ("Management", "Read dashboards and approved reports"),
    ("External auditor", "Time-limited read-only access if authorised"),
], [38 * mm, CONTENT_W - 38 * mm]))
story.append(para(
    "Enforce permissions on the backend. Require balanced entries, duplicate-document checks, approval thresholds, independent review where appropriate, an immutable audit trail, supporting evidence and monthly bank reconciliation. "
    "Closing a period should require reconciliations, adjustments, review and sign-off. Later corrections must remain traceable."
))

story.append(p("11. Implementation sequence", "H1BR"))
for i, item in enumerate([
    "Approve legal-entity structure, accounting policies, chart of accounts and reporting dimensions.",
    "Collect and classify historical documents; reconcile opening and prior-year balances.",
    "Build journals, approvals, general ledger, subledgers and trial balance.",
    "Add fixed assets, inventory, customer/supplier accounts and bank reconciliation.",
    "Build financial statements, branded downloads and period-close controls.",
    "Integrate current portal operations with accountant-approved automatic posting rules.",
    "Test a complete historical year and a live month in parallel before relying on the outputs.",
], 1): story.append(para(f"{i}. {item}"))

story.append(p("12. Decisions requested from the accountant", "H1BR"))
questions = [
    "What is the accounting start date and financial year-end, and which prior financial statements were issued?",
    "Are BuiltRight Energy, training and other activities divisions or separate legal entities?",
    "What chart of accounts, cost centres and project dimensions should be used?",
    "How should each historical owner/investor payment be classified: equity, loan or another category?",
    "Which office setup items are fixed assets, deposits, prepayments or expenses, and what are their depreciation policies?",
    "How should revenue and project costs be recognised for sales, installations, inspections, maintenance and training?",
    "What inventory valuation and project-cost allocation policies should apply?",
    "Which tax accounts, deductions and reporting formats are required?",
    "How should shared office costs be allocated across divisions?",
    "Who may prepare, approve, post, reverse, close and reopen entries or periods?",
    "Which reports are required monthly, annually and for statutory reporting?",
    "What reconciliation and evidence standard is required before historical periods are approved?",
]
for i, question in enumerate(questions, 1): story.append(para(f"{i}. {question}"))
story.append(Spacer(1, 4 * mm))
story.append(p("Accountant's overall assessment", "H2BR"))
story.append(para("Please mark the proposal as:  [  ] Suitable  [  ] Suitable with changes  [  ] Requires redesign"))
story.append(para("Key changes or comments: _______________________________________________________________________"))
story.append(para("____________________________________________________________________________________________"))
story.append(para("Reviewed by: _____________________________________________    Date: _________________________"))

story.append(p("Reference framework", "H1BR"))
sources = [
    ("IFRS Conceptual Framework", "https://www.ifrs.org/issued-standards/list-of-standards/conceptual-framework/"),
    ("IAS 16 - Property, Plant and Equipment", "https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/"),
    ("IFRS 15 - Revenue from Contracts with Customers", "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/"),
    ("IAS 7 - Statement of Cash Flows", "https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/"),
    ("IAS 8 - Accounting Policies and Errors", "https://www.ifrs.org/issued-standards/list-of-standards/ias-8-accounting-policies-changes-in-accounting-estimates-and-errors/"),
]
source_links = [f'<link href="{escape(url)}" color="#159284">{escape(name)}</link>' for name, url in sources]
story.append(p("  |  ".join(source_links), "SmallBR"))
story.append(p(
    "This is a functional brief, not a set of accounting entries or a statement of compliance. The accountant must approve final policies, tax treatment and historical balances before implementation.",
    "SmallBR",
))

BriefDoc(OUTPUT).build(story)
print(OUTPUT)
