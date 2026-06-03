import markdown
from weasyprint import HTML, CSS

with open("CLIENT_GUIDE.md", "r") as f:
    md_text = f.read()

body_html = markdown.markdown(md_text, extensions=["tables"])

html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

  body {{
    font-family: 'Inter', Arial, sans-serif;
    font-size: 11pt;
    color: #1a1a2e;
    line-height: 1.65;
    margin: 0;
    padding: 0;
  }}

  @page {{
    size: A4;
    margin: 22mm 20mm 22mm 20mm;
    @bottom-center {{
      content: counter(page);
      font-size: 9pt;
      color: #888;
    }}
  }}

  h1 {{
    font-size: 22pt;
    font-weight: 700;
    color: #1a1a2e;
    border-bottom: 3px solid #3b6cf6;
    padding-bottom: 8px;
    margin-bottom: 4px;
  }}

  h2 {{
    font-size: 14pt;
    font-weight: 700;
    color: #3b6cf6;
    margin-top: 28px;
    margin-bottom: 6px;
    border-bottom: 1px solid #e0e7ff;
    padding-bottom: 4px;
  }}

  h3 {{
    font-size: 11pt;
    font-weight: 600;
    color: #1a1a2e;
    margin-top: 16px;
    margin-bottom: 4px;
  }}

  p {{
    margin: 6px 0 10px 0;
  }}

  a {{
    color: #3b6cf6;
    text-decoration: none;
  }}

  /* Tables */
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 16px 0;
    font-size: 10pt;
  }}

  th {{
    background: #3b6cf6;
    color: #fff;
    text-align: left;
    padding: 7px 10px;
    font-weight: 600;
  }}

  td {{
    padding: 6px 10px;
    border-bottom: 1px solid #e8ecf4;
    vertical-align: top;
  }}

  tr:nth-child(even) td {{
    background: #f4f6fd;
  }}

  /* Lists */
  ul, ol {{
    padding-left: 20px;
    margin: 6px 0 10px 0;
  }}

  li {{
    margin-bottom: 4px;
  }}

  /* Blockquotes (tips / notes) */
  blockquote {{
    margin: 12px 0;
    padding: 10px 14px;
    background: #f0f4ff;
    border-left: 4px solid #3b6cf6;
    border-radius: 4px;
    color: #444;
    font-size: 10pt;
  }}

  blockquote p {{
    margin: 0;
  }}

  /* Inline code */
  code {{
    background: #f0f4ff;
    color: #3b6cf6;
    padding: 1px 5px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 9.5pt;
  }}

  /* Horizontal rules */
  hr {{
    border: none;
    border-top: 1px solid #e0e7ff;
    margin: 18px 0;
  }}

  /* Footer line */
  em:last-child {{
    color: #888;
    font-size: 9pt;
  }}

  /* Keep headings with their following content */
  h2, h3 {{
    page-break-after: avoid;
  }}
</style>
</head>
<body>
{body_html}
</body>
</html>"""

HTML(string=html).write_pdf(
    "CLIENT_GUIDE.pdf",
    stylesheets=[CSS(string="")]
)
print("Done")
