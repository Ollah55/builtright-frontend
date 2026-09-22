from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    KeepTogether,
    PageTemplate,
    PageBreak,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(r"C:\Users\PC\Documents\builtright")
OUTPUT = ROOT / "output" / "pdf" / "BuiltRight_AshGridX_Pilot_Response.pdf"
LOGO = ROOT / "src" / "assets" / "logoooo.png"

RED = colors.HexColor("#B32127")
TEAL = colors.HexColor("#159284")
INK = colors.HexColor("#17262B")
MUTED = colors.HexColor("#5D6B70")
PALE_TEAL = colors.HexColor("#EAF6F4")
PALE_RED = colors.HexColor("#FBEDEE")
LINE = colors.HexColor("#D9E4E5")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="DocTitle", parent=styles["Title"], fontName="Helvetica-Bold",
    fontSize=21, leading=25, textColor=INK, alignment=TA_LEFT,
    spaceAfter=4,
))
styles.add(ParagraphStyle(
    name="Subtitle", parent=styles["Normal"], fontName="Helvetica",
    fontSize=9.5, leading=14, textColor=MUTED,
))
styles.add(ParagraphStyle(
    name="Section", parent=styles["Heading2"], fontName="Helvetica-Bold",
    fontSize=12.5, leading=16, textColor=TEAL, spaceBefore=9, spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="BodyBR", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=9.5, leading=14, textColor=INK, spaceAfter=7,
))
styles.add(ParagraphStyle(
    name="SmallBR", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=8.3, leading=11, textColor=MUTED,
))
styles.add(ParagraphStyle(
    name="CardTitle", parent=styles["BodyText"], fontName="Helvetica-Bold",
    fontSize=9.3, leading=12, textColor=INK, spaceAfter=3,
))
styles.add(ParagraphStyle(
    name="CardBody", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=8.4, leading=12, textColor=INK,
))
styles.add(ParagraphStyle(
    name="ListBR", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=9.1, leading=13.5, textColor=INK, leftIndent=12,
    firstLineIndent=-8, spaceAfter=3,
))
styles.add(ParagraphStyle(
    name="Callout", parent=styles["BodyText"], fontName="Helvetica-Bold",
    fontSize=9.3, leading=13, textColor=RED,
))


def p(text, style="BodyBR"):
    return Paragraph(text, styles[style])


def bullet(text):
    return Paragraph(f"<font color='{TEAL.hexval()}'><b>-</b></font>&nbsp;&nbsp;{text}", styles["ListBR"])


def header_footer(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.6)
    canvas.line(18 * mm, height - 18 * mm, width - 18 * mm, height - 18 * mm)
    canvas.setFont("Helvetica-Bold", 7.5)
    canvas.setFillColor(TEAL)
    canvas.drawString(18 * mm, 11 * mm, "BUILTRIGHT SERVICES LTD")
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(width - 18 * mm, 11 * mm, f"AshGridX pilot response  |  Page {doc.page}")
    canvas.restoreState()


class BrandedDocTemplate(BaseDocTemplate):
    def __init__(self, filename):
        super().__init__(filename, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm,
                         topMargin=24 * mm, bottomMargin=18 * mm, title="BuiltRight AshGridX Pilot Response",
                         author="BuiltRight Services Ltd")
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="normal")
        self.addPageTemplates([PageTemplate(id="branded", frames=frame, onPage=header_footer)])


def card(title, body, background=PALE_TEAL, accent=TEAL):
    table = Table([[Paragraph(title, styles["CardTitle"])], [Paragraph(body, styles["CardBody"])]], colWidths=[82 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), background),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("LINEBEFORE", (0, 0), (0, -1), 3, accent),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, 0), 8),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 1),
        ("TOPPADDING", (0, 1), (-1, 1), 1),
        ("BOTTOMPADDING", (0, 1), (-1, 1), 8),
    ]))
    return table


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = BrandedDocTemplate(str(OUTPUT))
    story = []

    logo = Image(str(LOGO), width=38 * mm, height=20 * mm, kind="proportional")
    title_block = [
        Paragraph("AshGridX Pilot Integration", styles["DocTitle"]),
        Paragraph("Technical clarification acknowledgement and next-step request", styles["Subtitle"]),
    ]
    top = Table([[logo, title_block]], colWidths=[49 * mm, 125 * mm])
    top.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(top)
    story.append(Spacer(1, 4 * mm))

    meta = Table([
        [Paragraph("TO", styles["SmallBR"]), Paragraph("AshGridX Technical and Pilot Support Team", styles["BodyBR"]),
         Paragraph("DATE", styles["SmallBR"]), Paragraph("17 August 2026", styles["BodyBR"])],
        [Paragraph("SUBJECT", styles["SmallBR"]), Paragraph("BuiltRight pilot integration - clarification acknowledgement and next steps", styles["BodyBR"]),
         Paragraph("FROM", styles["SmallBR"]), Paragraph("BuiltRight Services Ltd", styles["BodyBR"])],
    ], colWidths=[22 * mm, 73 * mm, 18 * mm, 61 * mm])
    meta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F7FAFA")),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(meta)
    story.append(Spacer(1, 5 * mm))

    story.append(p("Dear Israel,"))
    story.append(p("Thank you for the detailed technical clarification. We have reviewed the responses and are ready to proceed with the BuiltRight pilot integration."))
    story.append(p("Our understanding of the confirmed AshGridX behavior is summarized below."))

    cards = [
        card("Device identity", "BuiltRight will use <b>deviceNumber</b> as the primary identifier for every customer device. AshGridX will generate <b>customerDeviceId</b> during onboarding."),
        card("Protection and tamper", "A cable disconnection triggers a BYPASS/protection event and physically shuts down the inverter. Webhook delivery may take up to five minutes.", PALE_RED, RED),
        card("Control behavior", "A successful control response confirms that the request was accepted. BuiltRight will verify the actual state through the status endpoint. Offline commands are not queued."),
        card("Webhook security", "Webhooks will use HMAC-SHA256 verification with a 120-second timestamp tolerance. Protection removal is a separate operation requiring its own authorization key.", PALE_RED, RED),
    ]
    grid = Table([[cards[0], cards[1]], [cards[2], cards[3]]], colWidths=[87 * mm, 87 * mm], hAlign="LEFT")
    grid.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(grid)

    story.append(Paragraph("Pilot activation requirements", styles["Section"]))
    story.append(p("To begin the pilot, please provide the following items:"))
    requirements = [
        "Pilot device purchase and onboarding instructions.",
        "Staging API base URL and API key.",
        "Webhook secret and the exact signature and timestamp header names.",
        "Required IP-whitelisting details.",
        "Device onboarding and assignment procedure.",
        "Complete staging API documentation, including status, control, protection-history, and device-management endpoints.",
        "Sample signed webhook payloads for BYPASS, restoration, online, and offline events.",
        "AshGridX pilot testing checklist and acceptance criteria.",
        "Confirmation of the support process during installation and testing.",
    ]
    for item in requirements:
        story.append(bullet(item))

    story.append(PageBreak())
    story.append(Paragraph("BuiltRight implementation and test approach", styles["Section"]))
    story.append(p("BuiltRight will map each customer to a unique deviceNumber, test tamper alerts, verify device state changes, and maintain a complete command and event audit trail."))
    story.append(p("Remote control will remain disabled until staging tests are successfully completed and approved by both parties."))

    steps = [
        ("01", "Onboard", "Purchase and register the first pilot device through the AshGridX dashboard."),
        ("02", "Connect", "Configure the staging credentials, webhook secret, callback URL, and any required IP whitelist."),
        ("03", "Map", "Assign the AshGridX customerDeviceId to the BuiltRight deviceNumber and customer record."),
        ("04", "Test", "Run signed BYPASS, restoration, online, offline, status, and control-state tests."),
        ("05", "Approve", "Review the audit trail and jointly approve the pilot before enabling live control."),
    ]
    step_rows = []
    for number, heading, detail in steps:
        step_rows.append([
            Paragraph(f"<font color='{RED.hexval()}'><b>{number}</b></font>", styles["BodyBR"]),
            Paragraph(f"<b>{heading}</b><br/><font color='{MUTED.hexval()}'>{detail}</font>", styles["BodyBR"]),
        ])
    step_table = Table(step_rows, colWidths=[16 * mm, 158 * mm])
    step_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.white),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(step_table)
    story.append(Spacer(1, 7 * mm))

    callout = Table([[Paragraph("Please let us know the next step for purchasing and onboarding the first pilot device.", styles["Callout"])]], colWidths=[174 * mm])
    callout.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE_RED),
        ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#E6B9BC")),
        ("LEFTPADDING", (0, 0), (-1, -1), 11),
        ("RIGHTPADDING", (0, 0), (-1, -1), 11),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    story.append(callout)
    story.append(Spacer(1, 10 * mm))
    story.append(p("Kind regards,"))
    story.append(Spacer(1, 5 * mm))
    story.append(Paragraph("<b>BuiltRight Services Ltd</b><br/>Operations and Technical Integration Team", styles["BodyBR"]))
    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph("BuiltRight Services Ltd | Lagos, Nigeria | builtrightltd.com", styles["SmallBR"]))

    doc.build(story)
    print(OUTPUT)


if __name__ == "__main__":
    build()
