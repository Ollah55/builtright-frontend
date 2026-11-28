from pathlib import Path

from docx import Document
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "output" / "docx" / "BuiltRight Solar Installation Request Form.docx"
doc = Document()
doc.core_properties.title = "Solar Installation Request Form"
doc.core_properties.author = "BuiltRight Energy"
doc.core_properties.subject = "Customer solar project assessment request"

s = doc.sections[0]
s.page_width = Inches(8.5)
s.page_height = Inches(11)
s.top_margin = Inches(0.63)
s.bottom_margin = Inches(0.62)
s.left_margin = s.right_margin = Inches(0.75)

black = RGBColor.from_string("000000")
teal = RGBColor.from_string("147368")
gray = RGBColor.from_string("3D4945")

def style(name, size, *, color=black, bold=False, before=0, after=0, keep=False):
    styles = doc.styles
    st = styles[name] if name in styles else styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH)
    st.font.name = "Calibri"
    st.font.size = Pt(size)
    st.font.color.rgb = color
    st.font.bold = bold
    f = st.paragraph_format
    f.space_before = Pt(before)
    f.space_after = Pt(after)
    f.line_spacing = 1.08
    f.keep_with_next = keep
    return st

style("Normal", 11, after=6)
title_style = style("Title", 28, bold=True, after=8, keep=True)
title_properties = title_style.element.get_or_add_pPr()
for border in title_properties.findall(qn("w:pBdr")):
    title_properties.remove(border)
style("Heading 1", 13, bold=True, before=10, after=4, keep=True)
style("Form Brand", 11, color=teal, bold=True, after=4, keep=True)
style("Form Note", 10, color=gray, after=5)
style("Form Field", 11, after=7)
style("Form Option", 11, after=4)
style("Form Rule", 11, after=6)

def p(text="", name="Normal"):
    return doc.add_paragraph(text, name)

def field(first, second=None):
    row = p(first, "Form Field")
    tabs = row.paragraph_format.tab_stops
    if second:
        tabs.add_tab_stop(Inches(3.32), WD_TAB_ALIGNMENT.LEFT, WD_TAB_LEADER.LINES)
        tabs.add_tab_stop(Inches(3.6))
        row.add_run("\t\t" + second)
    tabs.add_tab_stop(Inches(6.98), WD_TAB_ALIGNMENT.LEFT, WD_TAB_LEADER.LINES)
    row.add_run("\t")
    return row

def rule():
    row = p("", "Form Rule")
    row.paragraph_format.tab_stops.add_tab_stop(Inches(6.98), WD_TAB_ALIGNMENT.LEFT, WD_TAB_LEADER.LINES)
    row.add_run("\t")

def choices(*labels):
    row = p("", "Form Option")
    for index, label in enumerate(labels):
        if index:
            row.add_run("     ")
        box = row.add_run("□")
        box.font.name = "Segoe UI Symbol"
        row.add_run("  " + label)
    return row

p("BUILTRIGHT ENERGY", "Form Brand")
p("Solar Installation Request Form", "Title")
p("Use this form to request a site assessment for a solar installation. BuiltRight completes the inspection, load audit, and due diligence before preparing the final quotation.")
p("* Required. Complete the bank or vendor fields only if they apply.", "Form Note")

p("Customer and Project Details", "Heading 1")
field("Full name*  ", "Email address*  ")
field("Phone number*  ", "Occupation  ")
field("Project location*  ")

p("Product Source and Payment Route", "Heading 1")
choices("BuiltRight Marketplace", "External vendor / third-party supplier")
p("For BuiltRight Marketplace requests, select your preferred products in the online shop.", "Form Note")
choices("Bank financing (BuiltRight installation required)", "Outright payment after final quotation")
p("Preferred financial institution (if using bank financing):", "Form Note")
choices("RichGreen Microfinance Bank", "LOTUS Bank")

p("External Vendor Information", "Heading 1")
p("Complete this section only if you selected an external vendor.", "Form Note")
field("Vendor name*  ", "Vendor contact*  ")
field("Product/system details*  ")
rule()
choices("I understand that the external vendor remains responsible for its product warranty, while BuiltRight assesses and quotes the project. For financing, BuiltRight is the required installer.")

p("Additional Notes", "Heading 1")
p("Property details, preferred backup hours, critical appliances, or other notes.", "Form Note")
rule()
rule()

p("Customer Consent", "Heading 1")
choices("I authorize BuiltRight to contact me, conduct the project assessment, and prepare my quotation.*")
p("Outright payment: I understand payment is due only after I approve the final quotation.", "Form Note")
p("Bank financing: I authorize BuiltRight to share my approved quotation and necessary application information with the financing bank.", "Form Note")

p("Online submission: www.builtrightltd.com/financing", "Form Note")
OUT.parent.mkdir(parents=True, exist_ok=True)
doc.save(OUT)
print(OUT)
