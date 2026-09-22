from __future__ import annotations

from datetime import date
from pathlib import Path

from PIL import Image as PILImage, ImageChops
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import (
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    Preformatted,
    Spacer,
    SimpleDocTemplate,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "BuiltRight_AshGridX_API_Clarifications.pdf"
TMP = ROOT / "tmp" / "pdfs" / "ashgridx-review"
LOGO_SOURCE = Path(r"C:\Users\PC\Pictures\logooooo.png")
LOGO_TRIMMED = TMP / "builtright-logo-trimmed.png"

PAGE_W, PAGE_H = A4
MARGIN_X = 18 * mm
TOP_MARGIN = 25 * mm
BOTTOM_MARGIN = 18 * mm

TEAL = colors.HexColor("#15988C")
RED = colors.HexColor("#C5232A")
NAVY = colors.HexColor("#173A59")
INK = colors.HexColor("#1D2935")
MUTED = colors.HexColor("#5C6975")
LIGHT_TEAL = colors.HexColor("#EAF6F4")
LIGHT_BLUE = colors.HexColor("#EEF3F7")
LIGHT_RED = colors.HexColor("#FCEEEF")
LINE = colors.HexColor("#D6DEE5")
WHITE = colors.white


def register_fonts() -> tuple[str, str, str]:
    font_dir = Path(r"C:\Windows\Fonts")
    regular = font_dir / "arial.ttf"
    bold = font_dir / "arialbd.ttf"
    italic = font_dir / "ariali.ttf"
    if regular.exists() and bold.exists() and italic.exists():
        pdfmetrics.registerFont(TTFont("BR-Regular", str(regular)))
        pdfmetrics.registerFont(TTFont("BR-Bold", str(bold)))
        pdfmetrics.registerFont(TTFont("BR-Italic", str(italic)))
        return "BR-Regular", "BR-Bold", "BR-Italic"
    return "Helvetica", "Helvetica-Bold", "Helvetica-Oblique"


REGULAR, BOLD, ITALIC = register_fonts()


def trim_logo() -> Path:
    if not LOGO_SOURCE.exists():
        raise FileNotFoundError(f"Logo not found: {LOGO_SOURCE}")
    TMP.mkdir(parents=True, exist_ok=True)
    img = PILImage.open(LOGO_SOURCE).convert("RGB")
    bg = PILImage.new("RGB", img.size, "white")
    diff = ImageChops.difference(img, bg).convert("L")
    bbox = diff.point(lambda p: 255 if p > 12 else 0).getbbox()
    if bbox:
        pad = 18
        left = max(0, bbox[0] - pad)
        top = max(0, bbox[1] - pad)
        right = min(img.width, bbox[2] + pad)
        bottom = min(img.height, bbox[3] + pad)
        img = img.crop((left, top, right, bottom))
    img.save(LOGO_TRIMMED, quality=95)
    return LOGO_TRIMMED


class ReviewDocTemplate(SimpleDocTemplate):
    def __init__(self, filename: str):
        super().__init__(
            filename,
            pagesize=A4,
            leftMargin=MARGIN_X,
            rightMargin=MARGIN_X,
            topMargin=TOP_MARGIN,
            bottomMargin=BOTTOM_MARGIN,
            title="BuiltRight - AshGridX API Clarifications and Pilot Readiness Review",
            author="BuiltRight Services Ltd",
            subject="Technical clarification request for AshGridX device-control integration",
        )


def draw_cover_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(TEAL)
    canvas.rect(0, PAGE_H - 8 * mm, PAGE_W * 0.77, 8 * mm, fill=1, stroke=0)
    canvas.setFillColor(RED)
    canvas.rect(PAGE_W * 0.77, PAGE_H - 8 * mm, PAGE_W * 0.23, 8 * mm, fill=1, stroke=0)
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, PAGE_W, 10 * mm, fill=1, stroke=0)
    canvas.restoreState()


def draw_body_page(canvas, doc):
    canvas.saveState()
    logo = str(LOGO_TRIMMED)
    canvas.drawImage(logo, MARGIN_X, PAGE_H - 19 * mm, width=29 * mm, height=14 * mm, preserveAspectRatio=True, anchor="w")
    canvas.setFont(BOLD, 8.5)
    canvas.setFillColor(NAVY)
    canvas.drawRightString(PAGE_W - MARGIN_X, PAGE_H - 11 * mm, "ASHGRIDX API CLARIFICATION REVIEW")
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.6)
    canvas.line(MARGIN_X, PAGE_H - 21 * mm, PAGE_W - MARGIN_X, PAGE_H - 21 * mm)

    canvas.line(MARGIN_X, 13.5 * mm, PAGE_W - MARGIN_X, 13.5 * mm)
    canvas.setFont(REGULAR, 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(MARGIN_X, 9.5 * mm, "BuiltRight Services Ltd | Technical clarification request")
    canvas.drawRightString(PAGE_W - MARGIN_X, 9.5 * mm, f"Page {doc.page}")
    canvas.restoreState()


styles = getSampleStyleSheet()
TITLE = ParagraphStyle(
    "Title",
    parent=styles["Title"],
    fontName=BOLD,
    fontSize=25,
    leading=30,
    textColor=NAVY,
    alignment=TA_LEFT,
    spaceAfter=5 * mm,
)
SUBTITLE = ParagraphStyle(
    "Subtitle",
    parent=styles["Normal"],
    fontName=REGULAR,
    fontSize=12,
    leading=17,
    textColor=MUTED,
    spaceAfter=5 * mm,
)
EYEBROW = ParagraphStyle(
    "Eyebrow",
    parent=styles["Normal"],
    fontName=BOLD,
    fontSize=8,
    leading=10,
    textColor=TEAL,
    spaceAfter=3 * mm,
)
H1 = ParagraphStyle(
    "H1",
    parent=styles["Heading1"],
    fontName=BOLD,
    fontSize=17,
    leading=21,
    textColor=NAVY,
    spaceBefore=3 * mm,
    spaceAfter=3 * mm,
    keepWithNext=True,
)
H2 = ParagraphStyle(
    "H2",
    parent=styles["Heading2"],
    fontName=BOLD,
    fontSize=11.5,
    leading=15,
    textColor=TEAL,
    spaceBefore=3 * mm,
    spaceAfter=1.8 * mm,
    keepWithNext=True,
)
BODY = ParagraphStyle(
    "Body",
    parent=styles["BodyText"],
    fontName=REGULAR,
    fontSize=9.2,
    leading=13.2,
    textColor=INK,
    spaceAfter=2.2 * mm,
)
SMALL = ParagraphStyle(
    "Small",
    parent=BODY,
    fontSize=7.8,
    leading=10.3,
    spaceAfter=1 * mm,
)
BULLET = ParagraphStyle(
    "Bullet",
    parent=BODY,
    leftIndent=5 * mm,
    firstLineIndent=-3.5 * mm,
    bulletIndent=0,
    spaceAfter=1.25 * mm,
)
QUESTION = ParagraphStyle(
    "Question",
    parent=BODY,
    leftIndent=7 * mm,
    firstLineIndent=-5 * mm,
    spaceAfter=1.5 * mm,
)
CALLOUT = ParagraphStyle(
    "Callout",
    parent=BODY,
    fontName=BOLD,
    fontSize=10,
    leading=14,
    textColor=NAVY,
    spaceAfter=0,
)
CODE = ParagraphStyle(
    "Code",
    parent=styles["Code"],
    fontName="Courier",
    fontSize=7.4,
    leading=9.6,
    textColor=INK,
    leftIndent=4 * mm,
    rightIndent=4 * mm,
    borderColor=LINE,
    borderWidth=0.6,
    borderPadding=4 * mm,
    backColor=colors.HexColor("#F7F9FA"),
    spaceBefore=2 * mm,
    spaceAfter=3 * mm,
)


def p(text: str, style=BODY) -> Paragraph:
    return Paragraph(text, style)


def bullet(text: str) -> Paragraph:
    return Paragraph(text, BULLET, bulletText="-")


def q(number: int, text: str) -> Paragraph:
    return Paragraph(f"<b>{number}.</b> {text}", QUESTION)


def section_title(number: str, title: str) -> list:
    return [p(f"{number}  {title}", H1)]


def callout(text: str, kind: str = "teal") -> Table:
    bg = LIGHT_TEAL if kind == "teal" else LIGHT_RED
    stripe = TEAL if kind == "teal" else RED
    table = Table([[p(text, CALLOUT)]], colWidths=[PAGE_W - 2 * MARGIN_X])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), bg),
                ("BOX", (0, 0), (-1, -1), 0.6, LINE),
                ("LINEBEFORE", (0, 0), (0, -1), 4, stripe),
                ("LEFTPADDING", (0, 0), (-1, -1), 11),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
            ]
        )
    )
    return table


def make_table(headers: list[str], rows: list[list[str]], widths: list[float], font_size: float = 7.8) -> Table:
    header_style = ParagraphStyle("TableHeader", parent=SMALL, fontName=BOLD, textColor=WHITE, fontSize=font_size, leading=font_size + 2)
    cell_style = ParagraphStyle("TableCell", parent=SMALL, fontSize=font_size, leading=font_size + 2.4)
    data = [[p(h, header_style) for h in headers]]
    data.extend([[p(str(value), cell_style) for value in row] for row in rows])
    table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("GRID", (0, 0), (-1, -1), 0.45, LINE),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, colors.HexColor("#F7F9FA")]),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


def build_story(logo_path: Path) -> list:
    story: list = []

    # Cover
    story.append(Spacer(1, 15 * mm))
    logo = Image(str(logo_path), width=72 * mm, height=43 * mm)
    logo.hAlign = "LEFT"
    story.append(logo)
    story.append(Spacer(1, 9 * mm))
    story.append(p("TECHNICAL CLARIFICATION REQUEST", EYEBROW))
    story.append(p("AshGridX API Integration and Pilot Readiness Review", TITLE))
    story.append(p("Device control, tamper detection, webhooks, security, device onboarding, and operational assurance", SUBTITLE))
    story.append(Spacer(1, 6 * mm))
    cover_meta = Table(
        [
            [p("Prepared for", SMALL), p("AshGridX Technical Team", BODY)],
            [p("Prepared by", SMALL), p("BuiltRight Services Ltd", BODY)],
            [p("Date", SMALL), p("11 August 2026", BODY)],
            [p("Document status", SMALL), p("Response requested for pilot integration", BODY)],
        ],
        colWidths=[36 * mm, 112 * mm],
    )
    cover_meta.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), LIGHT_BLUE),
                ("GRID", (0, 0), (-1, -1), 0.5, LINE),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(cover_meta)
    story.append(Spacer(1, 8 * mm))
    story.append(callout("Purpose: confirm the missing technical and operational details required to integrate AshGridX safely into BuiltRight's financed solar installation and asset-control platform."))
    story.append(Spacer(1, 10 * mm))
    story.append(p("Reference reviewed", H2))
    story.append(p("Ashgrid API Documentation - Integration guide, endpoint specifications, and webhook reference (9 pages, supplied 11 August 2026).", BODY))
    story.append(PageBreak())

    # 1. Executive summary
    story.extend(section_title("1", "Executive summary"))
    story.append(p("BuiltRight intends to use AshGridX devices in financed solar installations. Each physical device will be assigned to a specific customer, project, site, and financed asset. BuiltRight requires secure remote activation and disablement, auditable control history, immediate tamper alerts, and reliable identification of the affected customer device.", BODY))
    story.append(p("The supplied documentation is a useful starting point. It confirms API-key authentication, staging and production environments, device on/off control, control history, protection removal, protection history, and signed webhooks. However, several details required for safe pilot deployment and later production automation are not yet documented.", BODY))
    story.append(callout("Priority clarification: the example webhook event type <b>BYPASS</b> is not defined. The document does not confirm that unplugging a cable, disconnecting the inverter, opening the device, or otherwise tampering with the installation will trigger an immediate alert." , "red"))
    story.append(Spacer(1, 4 * mm))
    story.append(p("Requested outcome", H2))
    for item in [
        "Written answers to the questions in this document.",
        "Updated API documentation or an OpenAPI/Postman collection covering the missing operations and event definitions.",
        "Staging credentials and at least one pilot or simulated device.",
        "Confirmation of the expected pilot test procedure and support contact.",
    ]:
        story.append(bullet(item))

    # 2. Confirmed capabilities
    story.extend(section_title("2", "Capabilities confirmed by the supplied documentation"))
    confirmed_rows = [
        ["Environment", "Staging and production base URLs are provided.", "Confirmed"],
        ["Authentication", "API key supplied in the Authorization request header.", "Confirmed"],
        ["Device control", "POST /device/control with customerDeviceId and control: on | off.", "Confirmed"],
        ["Control history", "POST /device/control/history with pagination and device/site filters.", "Confirmed"],
        ["Protection removal", "POST /device/remove-protection using customerDeviceId.", "Confirmed, meaning unclear"],
        ["Protection history", "GET /device/protection-history using query parameters.", "Confirmed"],
        ["Webhooks", "Asynchronous POST requests with an HMAC SHA-256 signature header.", "Confirmed, incomplete specification"],
        ["Webhook example", "Payload contains type, deviceId, and time. Example type is BYPASS.", "Confirmed, event undefined"],
    ]
    story.append(make_table(["Area", "What the document states", "Review status"], confirmed_rows, [33 * mm, 97 * mm, 42 * mm]))
    story.append(Spacer(1, 4 * mm))
    story.append(p("Documented device-control request", H2))
    story.append(Preformatted('POST /device/control\nAuthorization: <YOUR_API_KEY>\nContent-Type: application/json\n\n{\n  "customerDeviceId": "string",\n  "control": "on | off"\n}\n\nResponse: 204 No Content', CODE))
    story.append(p("Observation: a 204 response proves that the API accepted the request, but the documentation does not state whether it proves that the physical device or inverter actually changed state.", BODY))
    story.append(PageBreak())

    # 3. Device lifecycle and identity
    story.extend(section_title("3", "Device onboarding, assignment, and identity"))
    story.append(p("BuiltRight must be able to add more devices as financed installations increase. The current document contains device information in history responses, but it does not document how devices are registered, assigned, listed, replaced, or transferred.", BODY))
    questions = [
        "How does BuiltRight register a new device through the API?",
        "Can device registration and customer assignment be automated, or must they be performed in the AshGridX dashboard?",
        "Is customerDeviceId generated by AshGridX or supplied by BuiltRight?",
        "What is the relationship between deviceId, customerDeviceId, deviceNumber, inventoryNumber, siteId, ownerId, and accountNumber?",
        "The control endpoint uses customerDeviceId, while the webhook example uses deviceId. How should BuiltRight map these values reliably?",
        "Is there an endpoint to list all devices belonging to BuiltRight and retrieve their assigned customers/sites?",
        "Is there an endpoint to retrieve one device by customerDeviceId, deviceId, or deviceNumber?",
        "How is a device replaced while preserving the customer, project, and control-history relationship?",
        "Can one customer or installation have multiple AshGridX devices?",
        "Can a device be unassigned, decommissioned, or reassigned through the API?",
        "What fields are mandatory when a customer device is created, and which customer information is stored by AshGridX?",
    ]
    for idx, question in enumerate(questions, 1):
        story.append(q(idx, question))

    story.append(p("Minimum BuiltRight mapping requirement", H2))
    mapping_rows = [
        ["AshGridX identity", "deviceId, customerDeviceId, deviceNumber, siteId"],
        ["BuiltRight identity", "customer ID, financing request, order, installation, site/address"],
        ["Operational state", "requested state, confirmed physical state, connectivity, last-seen time"],
        ["Lifecycle", "assigned, installed, active, disabled, replaced, decommissioned"],
    ]
    story.append(make_table(["Mapping group", "Required fields"], mapping_rows, [42 * mm, 130 * mm]))

    # 4. Control assurance
    story.extend(section_title("4", "Remote control, status verification, and protection"))
    control_questions = [
        "Does a 204 response from /device/control mean the command was queued, transmitted, acknowledged by the device, or physically executed?",
        "How can BuiltRight retrieve the device's live on/off state after issuing a command?",
        "Does device-control history represent requested state or confirmed physical execution?",
        "Is there a command reference or transaction ID that can be used for idempotency, reconciliation, and support?",
        "What happens when a device is offline when an on/off command is submitted?",
        "Are commands queued for later execution, and if so, for how long?",
        "Can control commands fail after the API initially returns success? How is that failure reported?",
        "Is there a webhook for CONTROL_ACCEPTED, CONTROL_EXECUTED, CONTROL_FAILED, or CONTROL_TIMED_OUT?",
        "Are repeated requests idempotent, and how should BuiltRight prevent duplicate commands?",
        "Is bulk device control supported or planned?",
        "What exactly does /device/remove-protection do at device and inverter level?",
        "Is remove-protection reversible? Is it different from setting control to on?",
        "What authorization level is required for remove-protection, and can it be disabled for BuiltRight's API key?",
    ]
    for idx, question in enumerate(control_questions, 1):
        story.append(q(idx, question))
    story.append(callout("BuiltRight will not use the remove-protection endpoint until its precise effect, reversibility, authorization model, and safety implications are confirmed in writing.", "red"))
    # 5. Tamper
    story.extend(section_title("5", "Tamper, bypass, and connectivity alert requirements"))
    story.append(p("BuiltRight previously discussed an immediate tamper-alert requirement with AshGridX. The intended behaviour is that unplugging a protected cable or disconnecting the AshGridX device from the inverter triggers an alert containing the identity of the affected customer device. BuiltRight will use that identity to locate the customer, site, order, and installation immediately.", BODY))
    story.append(p("The current documentation shows only the following example webhook:", BODY))
    story.append(Preformatted('{\n  "type": "BYPASS",\n  "deviceId": "string",\n  "time": "string"\n}', CODE))
    tamper_questions = [
        "Does BYPASS mean physical tampering, cable disconnection, communication bypass, meter bypass, protection removal, or another condition?",
        "Does unplugging the cable between the AshGridX device and inverter trigger BYPASS immediately?",
        "Which protected cables, ports, sensors, or enclosure events can generate a tamper alert?",
        "What is the maximum expected delay between physical tampering and webhook delivery?",
        "Does loss of internet or device connectivity generate a separate DEVICE_OFFLINE or DISCONNECTED event?",
        "Does reconnection generate TAMPER_RESTORED, DEVICE_ONLINE, or another restoration event?",
        "Will the payload include deviceId, customerDeviceId, deviceNumber, siteId, and a human-readable tamper reason?",
        "Can BuiltRight query the device immediately after an alert to verify live condition and connectivity?",
        "How does AshGridX distinguish deliberate tampering from power failure, network outage, maintenance, installation, or equipment fault?",
        "Is there a maintenance mode or alert-suppression window for approved technician work?",
        "Are repeated or continuing tamper conditions re-notified or escalated?",
        "Can historical tamper events be retrieved through an API endpoint?",
        "Does the physical device retain and later transmit tamper events that occur while connectivity is unavailable?",
    ]
    for idx, question in enumerate(tamper_questions, 1):
        story.append(q(idx, question))

    story.append(p("Requested tamper event payload", H2))
    story.append(Preformatted('{\n  "eventId": "evt_12345",\n  "type": "TAMPER_DETECTED",\n  "reason": "INVERTER_CABLE_DISCONNECTED",\n  "deviceId": "ashgrid-device-id",\n  "customerDeviceId": "builtright-device-reference",\n  "deviceNumber": "AGX-0001",\n  "siteId": "site-reference",\n  "occurredAt": "2026-08-11T10:30:00Z",\n  "connectivity": "offline",\n  "restored": false\n}', CODE))

    # 6. Webhooks and security
    story.extend(section_title("6", "Webhook verification, delivery, and security"))
    story.append(p("The documentation specifies an x-ashgrid-signature header in the form t={timestamp},v1={signature} and describes HMAC SHA-256 verification. The precise signing algorithm and delivery guarantees are not documented.", BODY))
    webhook_questions = [
        "What exact byte sequence is signed: rawBody, timestamp + rawBody, timestamp + '.' + rawBody, or another format?",
        "Is the timestamp expressed in Unix seconds, Unix milliseconds, or ISO 8601 format?",
        "What timestamp tolerance should BuiltRight apply to prevent replay attacks?",
        "Must verification use the exact raw HTTP body before JSON parsing?",
        "How are webhook secrets created, viewed, rotated, and revoked?",
        "Can old and new secrets overlap safely during rotation?",
        "Does every event contain a globally unique eventId for duplicate detection?",
        "What HTTP status codes does AshGridX treat as successful webhook delivery?",
        "How many times are failed webhooks retried, and what retry schedule is used?",
        "Are webhook events delivered in order? Can duplicates or delayed events occur?",
        "Can missed events be replayed from the developer dashboard or retrieved through an API?",
        "What complete webhook event catalogue is supported, including control, connectivity, tamper, protection, and restoration events?",
        "Can separate webhook URLs be configured for staging and production?",
        "Can webhook sources be restricted by documented IP ranges in addition to signature verification?",
    ]
    for idx, question in enumerate(webhook_questions, 1):
        story.append(q(idx, question))
    story.append(PageBreak())

    # 7. API resilience
    story.extend(section_title("7", "API errors, limits, availability, and support"))
    story.append(p("The documentation lists 200, 201, 204, 404, and 500 responses and refers to Java ResponseStatusException error objects. A production integration also requires documented authentication, validation, conflict, throttling, timeout, and service-availability behaviour.", BODY))
    resilience_questions = [
        "What are the documented response bodies for validation errors and failed control operations?",
        "How are 400, 401, 403, 409, 422, and 429 responses represented?",
        "What request rate limits apply per API key, customer, or device?",
        "Are rate-limit headers and Retry-After provided?",
        "What client connection and response timeouts are recommended?",
        "What retry policy is safe for GET requests and for device-control POST requests?",
        "What uptime or service-level target applies to production control and webhook delivery?",
        "Is there a public status page or incident-notification channel?",
        "What logs or correlation identifiers should BuiltRight provide when opening a support case?",
        "What are the support contacts and escalation hours for a live pilot or device-control incident?",
        "Is data encrypted at rest, and what is the retention period for customer/device/control records?",
        "Where is customer and device data hosted, and what data-protection terms apply?",
    ]
    for idx, question in enumerate(resilience_questions, 1):
        story.append(q(idx, question))

    story.append(p("Sensitive data observation", H2))
    story.append(p("History responses include customer name, address, email, phone number, account number, owner identifiers, site identifiers, and device/vendor configuration. BuiltRight requests confirmation that API responses are scoped to its own company and that least-privilege access, retention controls, and audit logging are available.", BODY))

    # 8. Pilot
    story.extend(section_title("8", "Proposed BuiltRight pilot workflow"))
    pilot_rows = [
        ["1", "Onboard and assign device", "Identifiers map correctly to the BuiltRight customer, installation, and site."],
        ["2", "Verify connectivity", "Backend can identify online/offline condition and last-seen time."],
        ["3", "Send control: off", "Command is accepted and physical inverter state is independently confirmed."],
        ["4", "Send control: on", "Reactivation is confirmed and recorded without duplicate execution."],
        ["5", "Disconnect protected cable", "Immediate tamper event identifies the correct device, customer, and reason."],
        ["6", "Restore cable", "Restoration event arrives and incident state can be closed."],
        ["7", "Simulate network outage", "Offline event is distinguishable from tampering and queued events recover safely."],
        ["8", "Exercise webhook failure", "AshGridX retries and BuiltRight deduplicates/reconciles the event."],
        ["9", "Review histories", "Control, tamper, protection, and restoration audit trails are complete."],
    ]
    story.append(make_table(["Step", "Pilot test", "Required result"], pilot_rows, [14 * mm, 55 * mm, 103 * mm], font_size=7.4))
    story.append(Spacer(1, 4 * mm))
    story.append(p("Operational safeguard", H2))
    story.append(p("During the pilot, device disablement should require an authorized BuiltRight administrator after the customer's financing default and grace-period process has been verified and communications have been logged. Automatic disablement should only be considered after control confirmation, webhook reliability, identity mapping, replay protection, and exception handling have been proven.", BODY))

    # 9. Acceptance criteria
    story.extend(section_title("9", "Minimum acceptance criteria before production"))
    acceptance = [
        "Device registration and customer/site assignment process documented.",
        "Stable mapping between deviceId and customerDeviceId confirmed.",
        "Live state, connectivity, and last-seen status available.",
        "Physical execution of on/off commands can be confirmed.",
        "Tamper and restoration events are explicitly defined and testable.",
        "Immediate cable-disconnection alert is demonstrated with the correct customer device identity.",
        "Webhook signature algorithm, raw-body handling, timestamp tolerance, and secret rotation are documented.",
        "Webhook event IDs, retry behaviour, replay/recovery method, and event catalogue are documented.",
        "Idempotency and offline-command behaviour are confirmed.",
        "Error responses, rate limits, timeouts, uptime expectations, and escalation contacts are provided.",
        "Remove-protection behaviour and authorization are explained and approved before use.",
        "Staging tests pass before production credentials or customer devices are enabled.",
    ]
    for item in acceptance:
        story.append(bullet(item))

    story.append(p("Requested response format", H2))
    story.append(p("For each question or acceptance criterion, please indicate one of: <b>Supported and documented</b>, <b>Supported but documentation pending</b>, <b>Not currently supported</b>, or <b>Planned</b> with an expected delivery date. Links to updated documentation, example payloads, and test credentials may be supplied alongside the response.", BODY))
    story.append(Spacer(1, 4 * mm))
    story.append(callout("BuiltRight is ready to proceed with a controlled pilot once the priority identity, control-confirmation, tamper-event, and webhook-security clarifications are resolved."))

    # 10. Contact
    story.extend(section_title("10", "BuiltRight contact"))
    contact_rows = [
        ["Company", "BuiltRight Services Ltd"],
        ["Email", "info@builtrightltd.com"],
        ["Telephone", "+234 913 499 1239 | +234 701 574 9737"],
        ["Address", "1b Adeniji Street, Off Odusami Street, Ogba, Lagos, Nigeria"],
        ["Website", "https://builtright-frontend.vercel.app/"],
    ]
    story.append(make_table(["Contact field", "Details"], contact_rows, [42 * mm, 130 * mm]))
    story.append(Spacer(1, 5 * mm))
    story.append(p("Thank you. We look forward to AshGridX's technical response and confirmation of the pilot setup process.", BODY))

    return story


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    logo = trim_logo()
    doc = ReviewDocTemplate(str(OUTPUT))
    doc.build(
        build_story(logo),
        onFirstPage=draw_cover_page,
        onLaterPages=draw_body_page,
    )
    print(OUTPUT)


if __name__ == "__main__":
    main()
