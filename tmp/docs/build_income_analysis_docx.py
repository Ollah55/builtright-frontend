from copy import deepcopy
from decimal import Decimal as D
from pathlib import Path

from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(r"C:\Users\PC\Documents\builtright")
SOURCE = Path(r"C:\Users\PC\Desktop\PAYMENT STRUCTURE.docx")
OUTPUT = ROOT / "output" / "docx" / "BuiltRight_RichGreen_Project_Income_Analysis_CORRECTED.docx"
LOGO = ROOT / "src" / "assets" / "logoooo.png"

RED = "B32127"
TEAL = "159284"
INK = "17262B"
MUTED = "5D6B70"
PALE_TEAL = "EAF6F4"
PALE_RED = "FBEDEE"
PALE_GRAY = "F7FAFA"
LINE = "D9E4E5"

LOAN = D("9406545.00")
INTEREST = D("1874590.05")
MANAGEMENT = D("94065.45")
BUILTRIGHT_GROSS = D("510000.00")
RICHGREEN_GROSS = INTEREST + MANAGEMENT
COMBINED_GROSS = BUILTRIGHT_GROSS + RICHGREEN_GROSS
REPAYMENT_EXCL_FEE = LOAN + INTEREST
REPAYMENT_INCL_FEE = REPAYMENT_EXCL_FEE + MANAGEMENT


def money(value):
    return f"₦{value:,.2f}"


def pct(value):
    return f"{value * D('100'):.2f}%"


def set_run(run, size=11, color=INK, bold=False, italic=False, font="Calibri"):
    run.font.name = font
    run._element.rPr.rFonts.set(qn("w:ascii"), font)
    run._element.rPr.rFonts.set(qn("w:hAnsi"), font)
    run.font.size = Pt(size)
    run.font.color.rgb = RGBColor.from_string(color)
    run.bold = bold
    run.italic = italic


def style_paragraph(paragraph, before=0, after=6, line=1.1, align=None):
    fmt = paragraph.paragraph_format
    fmt.space_before = Pt(before)
    fmt.space_after = Pt(after)
    fmt.line_spacing = line
    if align is not None:
        paragraph.alignment = align


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=90, start=110, bottom=90, end=110):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for margin, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{margin}"))
        if node is None:
            node = OxmlElement(f"w:{margin}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_cell_border(cell, color=LINE, sz=4):
    tc_pr = cell._tc.get_or_add_tcPr()
    borders = tc_pr.first_child_found_in("w:tcBorders")
    if borders is None:
        borders = OxmlElement("w:tcBorders")
        tc_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = f"w:{edge}"
        node = borders.find(qn(tag))
        if node is None:
            node = OxmlElement(tag)
            borders.append(node)
        node.set(qn("w:val"), "single")
        node.set(qn("w:sz"), str(sz))
        node.set(qn("w:space"), "0")
        node.set(qn("w:color"), color)


def set_table_geometry(table, widths):
    table.autofit = False
    tbl_pr = table._tbl.tblPr
    tbl_w = tbl_pr.find(qn("w:tblW"))
    if tbl_w is None:
        tbl_w = OxmlElement("w:tblW")
        tbl_pr.append(tbl_w)
    tbl_w.set(qn("w:w"), str(sum(widths)))
    tbl_w.set(qn("w:type"), "dxa")
    tbl_ind = tbl_pr.find(qn("w:tblInd"))
    if tbl_ind is None:
        tbl_ind = OxmlElement("w:tblInd")
        tbl_pr.append(tbl_ind)
    tbl_ind.set(qn("w:w"), "120")
    tbl_ind.set(qn("w:type"), "dxa")
    grid = table._tbl.tblGrid
    for node in list(grid):
        grid.remove(node)
    for width in widths:
        col = OxmlElement("w:gridCol")
        col.set(qn("w:w"), str(width))
        grid.append(col)
    for row in table.rows:
        for i, cell in enumerate(row.cells):
            tc_pr = cell._tc.get_or_add_tcPr()
            tc_w = tc_pr.find(qn("w:tcW"))
            if tc_w is None:
                tc_w = OxmlElement("w:tcW")
                tc_pr.append(tc_w)
            tc_w.set(qn("w:w"), str(widths[i]))
            tc_w.set(qn("w:type"), "dxa")


def format_existing_table(table, widths):
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    set_table_geometry(table, widths)
    for r, row in enumerate(table.rows):
        for cell in row.cells:
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            set_cell_margins(cell, top=90, bottom=90, start=110, end=110)
            set_cell_border(cell)
            if r == 0:
                set_cell_shading(cell, TEAL)
            else:
                set_cell_shading(cell, "FFFFFF")
            for paragraph in cell.paragraphs:
                style_paragraph(paragraph, 0, 0, 1.0)
                for run in paragraph.runs:
                    set_run(run, size=9.5, color="FFFFFF" if r == 0 else INK, bold=r == 0)


def recreate_source_table(doc, source_table, widths):
    table = doc.add_table(rows=0, cols=len(source_table.columns))
    for source_row in source_table.rows:
        cells = table.add_row().cells
        for idx, source_cell in enumerate(source_row.cells):
            cells[idx].text = source_cell.text.strip()
    format_existing_table(table, widths)
    return table


def add_heading(doc, text, level=1):
    sizes = {1: 17, 2: 13, 3: 11.5}
    before = {1: 16, 2: 12, 3: 8}
    after = {1: 8, 2: 6, 3: 4}
    p = doc.add_paragraph()
    style_paragraph(p, before[level], after[level], 1.1)
    run = p.add_run(text)
    set_run(run, size=sizes[level], color=TEAL if level < 3 else RED, bold=True)
    return p


def add_text(doc, text, size=11, color=INK, bold=False, italic=False, before=0, after=6, line=1.1):
    p = doc.add_paragraph()
    style_paragraph(p, before, after, line)
    run = p.add_run(text)
    set_run(run, size=size, color=color, bold=bold, italic=italic)
    return p


def add_bullet(doc, text):
    p = doc.add_paragraph()
    style_paragraph(p, 0, 4, 1.1)
    p.paragraph_format.left_indent = Inches(0.5)
    p.paragraph_format.first_line_indent = Inches(-0.25)
    p_pr = p._p.get_or_add_pPr()
    num_pr = OxmlElement("w:numPr")
    ilvl = OxmlElement("w:ilvl")
    ilvl.set(qn("w:val"), "0")
    num_id = OxmlElement("w:numId")
    num_id.set(qn("w:val"), str(ensure_bullet_numbering(doc)))
    num_pr.append(ilvl)
    num_pr.append(num_id)
    p_pr.append(num_pr)
    run = p.add_run(text)
    set_run(run, size=10.5, color=INK)
    return p


def ensure_bullet_numbering(doc):
    numbering = doc.part.numbering_part.element
    abstract_ids = [int(node.get(qn("w:abstractNumId"))) for node in numbering.findall(qn("w:abstractNum")) if node.get(qn("w:abstractNumId"))]
    num_ids = [int(node.get(qn("w:numId"))) for node in numbering.findall(qn("w:num")) if node.get(qn("w:numId"))]
    abstract_id = max(abstract_ids or [0]) + 1
    num_id_value = max(num_ids or [0]) + 1
    abstract = OxmlElement("w:abstractNum")
    abstract.set(qn("w:abstractNumId"), str(abstract_id))
    multi = OxmlElement("w:multiLevelType")
    multi.set(qn("w:val"), "singleLevel")
    abstract.append(multi)
    level = OxmlElement("w:lvl")
    level.set(qn("w:ilvl"), "0")
    start = OxmlElement("w:start")
    start.set(qn("w:val"), "1")
    num_fmt = OxmlElement("w:numFmt")
    num_fmt.set(qn("w:val"), "bullet")
    lvl_text = OxmlElement("w:lvlText")
    lvl_text.set(qn("w:val"), "•")
    lvl_jc = OxmlElement("w:lvlJc")
    lvl_jc.set(qn("w:val"), "left")
    p_pr = OxmlElement("w:pPr")
    tabs = OxmlElement("w:tabs")
    tab = OxmlElement("w:tab")
    tab.set(qn("w:val"), "num")
    tab.set(qn("w:pos"), "720")
    tabs.append(tab)
    ind = OxmlElement("w:ind")
    ind.set(qn("w:left"), "720")
    ind.set(qn("w:hanging"), "360")
    p_pr.append(tabs)
    p_pr.append(ind)
    level.extend([start, num_fmt, lvl_text, lvl_jc, p_pr])
    abstract.append(level)
    numbering.append(abstract)
    num = OxmlElement("w:num")
    num.set(qn("w:numId"), str(num_id_value))
    abstract_ref = OxmlElement("w:abstractNumId")
    abstract_ref.set(qn("w:val"), str(abstract_id))
    num.append(abstract_ref)
    numbering.append(num)
    return num_id_value


def add_table(doc, headers, rows, widths, header_fill=TEAL, font_size=9.5):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    set_table_geometry(table, widths)
    for i, text in enumerate(headers):
        cell = table.rows[0].cells[i]
        set_cell_shading(cell, header_fill)
        set_cell_margins(cell, top=90, bottom=90, start=100, end=100)
        set_cell_border(cell)
        p = cell.paragraphs[0]
        style_paragraph(p, 0, 0, 1.0)
        r = p.add_run(text)
        set_run(r, size=font_size, color="FFFFFF", bold=True)
    for row_data in rows:
        cells = table.add_row().cells
        for i, text in enumerate(row_data):
            cell = cells[i]
            set_cell_shading(cell, PALE_GRAY if len(table.rows) % 2 == 0 else "FFFFFF")
            set_cell_margins(cell, top=90, bottom=90, start=100, end=100)
            set_cell_border(cell)
            p = cell.paragraphs[0]
            style_paragraph(p, 0, 0, 1.0)
            r = p.add_run(str(text))
            set_run(r, size=font_size, color=INK, bold=(i == 0 and text not in ("Total", "Combined")))
    return table


def add_page_number(paragraph):
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = paragraph.add_run("Page ")
    set_run(r, size=8.5, color=MUTED)
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = "PAGE"
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    r._r.append(begin)
    r._r.append(instr)
    r._r.append(end)


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    source_doc = Document(str(SOURCE))
    doc = Document()
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(0.75)
    section.bottom_margin = Inches(0.7)
    section.left_margin = Inches(0.9)
    section.right_margin = Inches(0.9)
    section.header_distance = Inches(0.3)
    section.footer_distance = Inches(0.3)

    normal = doc.styles["Normal"]
    normal.font.name = "Calibri"
    normal._element.rPr.rFonts.set(qn("w:ascii"), "Calibri")
    normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Calibri")
    normal.font.size = Pt(11)
    normal.font.color.rgb = RGBColor.from_string(INK)

    header = section.header.paragraphs[0]
    style_paragraph(header, 0, 0, 1.0)
    r = header.add_run("BUILTRIGHT SERVICES LTD")
    set_run(r, size=8.5, color=TEAL, bold=True)
    r = header.add_run("                                      Project income analysis")
    set_run(r, size=8.5, color=MUTED)
    footer = section.footer.paragraphs[0]
    style_paragraph(footer, 0, 0, 1.0)
    r = footer.add_run("BuiltRight Services Ltd | RichGreen financing project")
    set_run(r, size=8.5, color=MUTED)
    add_page_number(footer)

    # Build a compact branded masthead, then retain the two uploaded tables
    # by cloning their original table XML into the new document.
    mast = doc.add_paragraph()
    style_paragraph(mast, 0, 3, 1.0)
    mast.add_run().add_picture(str(LOGO), width=Inches(1.25))
    title = doc.add_paragraph()
    style_paragraph(title, 0, 3, 1.0)
    title_run = title.add_run("RichGreen repayment structure and income")
    set_run(title_run, size=22, color=INK, bold=True)
    subtitle = doc.add_paragraph("Project-level income, financing yield, and margin analysis")
    style_paragraph(subtitle, 0, 12, 1.0)
    for run in subtitle.runs:
        set_run(run, size=11.5, color=MUTED)
    add_heading(doc, "BuiltRight income", 2)
    add_text(doc, "The tables below are retained from the supplied payment-structure document.", size=10, color=MUTED, after=5)
    recreate_source_table(doc, source_doc.tables[0], [6400, 2960])
    richgreen_table = recreate_source_table(doc, source_doc.tables[1], [1600, 1900, 1700, 1900, 2260])
    # Add the customer-paid management fee as a separate RichGreen income row.
    fee_cells = richgreen_table.add_row().cells
    fee_cells[0].text = "MANAGEMENT FEE RECEIVED (PAID BY CUSTOMER)"
    fee_cells[1].text = ""
    fee_cells[2].text = ""
    fee_cells[3].text = ""
    fee_cells[4].text = money(MANAGEMENT)
    for cell in fee_cells:
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        set_cell_margins(cell, top=90, bottom=90, start=110, end=110)
        set_cell_border(cell, color="E6B9BC", sz=5)
        set_cell_shading(cell, PALE_RED)
        for paragraph in cell.paragraphs:
            style_paragraph(paragraph, 0, 0, 1.0)
            for run in paragraph.runs:
                set_run(run, size=9.5, color=RED, bold=True)
    set_table_geometry(richgreen_table, [1600, 1900, 1700, 1900, 2260])

    doc.add_page_break()
    add_heading(doc, "Executive summary", 1)
    add_text(doc, f"Based on the payment structure supplied, RichGreen receives {money(INTEREST)} in interest over the repayment schedule and an additional {money(MANAGEMENT)} management fee on the {money(LOAN)} loan. RichGreen's gross income from this project is therefore {money(RICHGREEN_GROSS)}.", after=7)
    add_text(doc, f"BuiltRight's uploaded income table shows {money(BUILTRIGHT_GROSS)} retained from the project. Because the customer paid the management fee directly to RichGreen, no management-fee deduction is applied to BuiltRight's income; BuiltRight remains at {money(BUILTRIGHT_GROSS)} before installation, equipment, tax, and operating costs.", after=7)
    callout = doc.add_table(rows=1, cols=1)
    set_table_geometry(callout, [9360])
    cell = callout.cell(0, 0)
    set_cell_shading(cell, PALE_RED)
    set_cell_margins(cell, top=130, bottom=130, start=140, end=140)
    set_cell_border(cell, color="E6B9BC", sz=6)
    p = cell.paragraphs[0]
    style_paragraph(p, 0, 0, 1.0)
    r = p.add_run(f"Key argument: one {money(LOAN)} financed project generates {money(RICHGREEN_GROSS)} gross RichGreen income and {money(BUILTRIGHT_GROSS)} gross BuiltRight income. The customer-paid management fee is additional RichGreen income and is not deducted from BuiltRight.")
    set_run(r, size=11, color=RED, bold=True)

    add_heading(doc, "Detailed calculations", 2)
    calc_rows = [
        ("Loan principal advanced", "Given in uploaded schedule", money(LOAN)),
        ("Total interest", "Sum of monthly interest entries", money(INTEREST)),
        ("RichGreen management fee received", f"{money(LOAN)} x 1.00%; paid separately by customer", money(MANAGEMENT)),
        ("RichGreen gross income", "Total interest + management fee", money(RICHGREEN_GROSS)),
        ("BuiltRight gross retained income", "Uploaded BuiltRight income table; no deduction", money(BUILTRIGHT_GROSS)),
        ("Customer repayment excluding management fee", f"{money(LOAN)} + {money(INTEREST)}", money(REPAYMENT_EXCL_FEE)),
        ("Customer cash outflow if fee is charged separately", f"{money(REPAYMENT_EXCL_FEE)} + {money(MANAGEMENT)}", money(REPAYMENT_INCL_FEE)),
        ("Combined gross project income", f"BuiltRight gross income + RichGreen gross income", money(COMBINED_GROSS)),
    ]
    add_table(doc, ["Income item", "Calculation basis", "Amount"], calc_rows, [3150, 3860, 2350], font_size=9.3)

    add_heading(doc, "Income and margin comparison", 2)
    comparison_rows = [
        ("BuiltRight", money(BUILTRIGHT_GROSS), "No adjustment; customer paid management fee", money(BUILTRIGHT_GROSS), pct(BUILTRIGHT_GROSS / LOAN), pct(BUILTRIGHT_GROSS / COMBINED_GROSS)),
        ("RichGreen", money(RICHGREEN_GROSS), "Interest + customer-paid management fee", money(RICHGREEN_GROSS), pct(RICHGREEN_GROSS / LOAN), pct(RICHGREEN_GROSS / COMBINED_GROSS)),
        ("Combined", money(COMBINED_GROSS), "Gross project income basis", money(COMBINED_GROSS), pct(COMBINED_GROSS / LOAN), "100.00%"),
    ]
    add_table(doc, ["Party", "Gross income", "Adjustment / basis", "Income before other costs", "Income / loan", "Share of combined"], comparison_rows, [1350, 1500, 2450, 1950, 1100, 1010], font_size=8.4)
    add_text(doc, f"Interpretation: on the combined gross project-income basis, RichGreen represents approximately {pct(RICHGREEN_GROSS / COMBINED_GROSS)} of the income generated by the financing transaction, while BuiltRight retains approximately {pct(BUILTRIGHT_GROSS / COMBINED_GROSS)}. RichGreen's gross income is approximately {(RICHGREEN_GROSS / BUILTRIGHT_GROSS):.2f} times BuiltRight's gross income on this project.", before=7, after=7)

    add_heading(doc, "Commercial points for discussion with RichGreen", 2)
    for item in [
        f"Every similar {money(LOAN)} applicant loan produces {money(RICHGREEN_GROSS)} in gross RichGreen income under the supplied structure.",
        f"The {money(MANAGEMENT)} management fee is an additional customer-paid income stream to RichGreen equal to 1.00% of the principal advanced.",
        f"BuiltRight's gross retained income remains {money(BUILTRIGHT_GROSS)}; no management fee is deducted because the customer paid RichGreen directly.",
        f"The repayment schedule produces {money(INTEREST)} in interest, or {pct(INTEREST / LOAN)} of the original principal, before considering any RichGreen cost of funds.",
    ]:
        add_bullet(doc, item)

    add_heading(doc, "Basis, assumptions, and limitations", 2)
    add_text(doc, "This document presents gross income and gross income margins, not audited net profit. RichGreen's cost of funds, credit losses, collection costs, taxes, regulatory charges, and operating expenses were not supplied. BuiltRight's equipment costs, installation materials, transport, labour overhead, tax, warranty, insurance, and other delivery costs were also not supplied.", after=6)
    add_text(doc, "The management fee is included in RichGreen's income as instructed and is treated as paid directly by the customer. It is not deducted from BuiltRight's project income. The customer cash-outflow figure including the fee applies when the fee is charged separately, while the party-level income totals remain as shown.", after=6)
    add_text(doc, "The monthly total-payable cells in the supplied table are displayed with rounding. The totals in this analysis use the exact principal and total-interest figures supplied, so minor differences of a few kobo may appear when manually summing rounded monthly display values.", after=6)

    doc.core_properties.title = "BuiltRight and RichGreen Project Income Analysis"
    doc.core_properties.subject = "Detailed financing income and margin calculations"
    doc.core_properties.author = "BuiltRight Services Ltd"
    doc.save(str(OUTPUT))
    print(OUTPUT)


if __name__ == "__main__":
    build()
