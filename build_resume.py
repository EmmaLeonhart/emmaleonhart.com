"""Build pages/resume.pdf and pages/resume.html from resume.md.

Renders the markdown to HTML with print-friendly styling, writes pages/resume.html,
then uses headless Chromium (via Playwright) to print pages/resume.pdf. Both files
land inside pages/ so GitHub Pages serves them at /resume.html and /resume.pdf.

Usage:
    python build_resume.py
"""
from __future__ import annotations

import sys
from pathlib import Path

import markdown
from playwright.sync_api import sync_playwright

CSS = """
@page { size: Letter; margin: 0.5in 0.65in; }
html { font-size: 9.5pt; }
body {
    font-family: "Charter", "Georgia", "Cambria", serif;
    color: #111;
    line-height: 1.3;
    max-width: 7.2in;
    margin: 1.5em auto;
    padding: 0 1em;
}
h1 {
    font-size: 1.7em;
    margin: 0 0 0.05em 0;
    border: none;
    letter-spacing: 0.01em;
}
h2 {
    font-size: 1em;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #222;
    border-bottom: 1px solid #999;
    padding-bottom: 0.1em;
    margin: 0.7em 0 0.3em 0;
}
h3 {
    font-size: 1em;
    margin: 0.45em 0 0.05em 0;
}
h4 {
    font-size: 0.95em;
    margin: 0.3em 0 0.1em 0;
    font-style: italic;
    font-weight: normal;
}
p { margin: 0.15em 0; }
ul { margin: 0.15em 0 0.3em 0; padding-left: 1.1em; }
li { margin: 0.08em 0; }
em { color: #444; }
a { color: #1a4480; text-decoration: none; }
hr { display: none; }
strong { color: #000; }
"""

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<link rel="alternate" type="application/pdf" href="resume.pdf">
<style>{css}</style>
</head>
<body>
{body}
</body>
</html>
"""


def md_to_html(md_text: str, title: str) -> str:
    body = markdown.markdown(
        md_text,
        extensions=["extra", "sane_lists", "smarty"],
        output_format="html5",
    )
    return HTML_TEMPLATE.format(title=title, css=CSS, body=body)


def render_pdf(html: str, out_path: Path) -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_content(html, wait_until="domcontentloaded")
        page.emulate_media(media="print")
        page.pdf(
            path=str(out_path),
            format="Letter",
            print_background=True,
            margin={"top": "0.6in", "bottom": "0.6in", "left": "0.7in", "right": "0.7in"},
            prefer_css_page_size=True,
        )
        browser.close()


def main() -> int:
    repo_root = Path(__file__).resolve().parent
    src = repo_root / "resume.md"
    if not src.exists():
        print(f"error: {src} not found", file=sys.stderr)
        return 1
    pages_dir = repo_root / "pages"
    pages_dir.mkdir(exist_ok=True)
    out_html = pages_dir / "resume.html"
    out_pdf = pages_dir / "resume.pdf"
    html = md_to_html(src.read_text(encoding="utf-8"), title="Emma Leonhart — Resume")
    out_html.write_text(html, encoding="utf-8")
    print(f"wrote {out_html}")
    render_pdf(html, out_pdf)
    print(f"wrote {out_pdf}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
