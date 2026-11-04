import markdown
import os

md_path = "PROJECT_FILE_SUBMISSION.md"
html_path = "PROJECT_FILE_SUBMISSION.html"

with open(md_path, "r", encoding="utf-8") as f:
    text = f.read()

# Convert markdown to HTML
html_content = markdown.markdown(text, extensions=['tables', 'fenced_code'])

full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EcoSort AI — End-Semester Project File Submission</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
  
  body {{
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.65;
    color: #1f2937;
    background-color: #f8fafc;
    margin: 0;
    padding: 40px 20px;
  }}

  .container {{
    max-width: 900px;
    margin: 0 auto;
    background: #ffffff;
    padding: 60px 80px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    border: 1px solid #e2e8f0;
  }}

  h1 {{
    color: #065f46;
    font-size: 26px;
    font-weight: 800;
    margin-top: 32px;
    margin-bottom: 16px;
    line-height: 1.3;
    border-bottom: 2px solid #10b981;
    padding-bottom: 8px;
  }}

  h2 {{
    color: #1e3a8a;
    font-size: 20px;
    font-weight: 700;
    margin-top: 28px;
    margin-bottom: 12px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 6px;
  }}

  h3 {{
    color: #111827;
    font-size: 16px;
    font-weight: 600;
    margin-top: 20px;
    margin-bottom: 8px;
  }}

  p, li {{
    font-size: 14.5px;
    color: #374151;
  }}

  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 24px 0;
    font-size: 13.5px;
  }}

  th, td {{
    padding: 10px 14px;
    border: 1px solid #cbd5e1;
    text-align: left;
  }}

  th {{
    background-color: #047857;
    color: #ffffff;
    font-weight: 600;
  }}

  tr:nth-child(even) {{
    background-color: #f8fafc;
  }}

  pre, code {{
    font-family: 'JetBrains Mono', monospace;
    background-color: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
  }}

  pre {{
    padding: 16px;
    overflow-x: auto;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #0f172a;
    color: #f8fafc;
  }}

  pre code {{
    background: transparent;
    padding: 0;
    color: inherit;
  }}

  blockquote {{
    border-left: 4px solid #10b981;
    margin: 0;
    padding-left: 16px;
    color: #4b5563;
    font-style: italic;
  }}

  @media print {{
    body {{
      background: none;
      padding: 0;
    }}
    .container {{
      box-shadow: none;
      border: none;
      padding: 20px;
      max-width: 100%;
    }}
  }}
</style>
</head>
<body>
<div class="container">
{html_content}
</div>
</body>
</html>
"""

with open(html_path, "w", encoding="utf-8") as f:
    f.write(full_html)

print("Generated HTML successfully:", os.path.abspath(html_path))

