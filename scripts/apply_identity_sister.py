#!/usr/bin/env python3
"""Apply the canonical identity to sister-repo pages that ALREADY use the
Lacquer CSS-variable tokens (Yantra / QueryKey / Alignment site/index.html).

These don't need the Slate chrome-hex rewrite (apply_identity.py) — they
already reference var(--bg) etc. with Lacquer values. This only adds the
light-mode token block, the toggle CSS, the data-theme attribute, the
pre-paint anti-flash script, the toggle button, and the click handler.

Idempotent (skips files that already have id="theme-toggle"). Takes file
paths as args:  py scripts/apply_identity_sister.py path1 [path2 ...]
"""
import re
import sys
from pathlib import Path

LIGHT_AND_TOGGLE_CSS = """
    /* ===== CANONICAL VISUAL IDENTITY (see emmaleonhart.com/_identity/) ===
       Light-mode Lacquer palette + the top-right toggle. Dark stays
       default; the page's existing :root holds the dark values. */
    html[data-theme="light"]{
      --bg:#f4f4f8; --bg-soft:#ebebf2; --bg-card:#ffffff; --bg-elevated:#fbfbfe;
      --border:#dadae6; --border-hover:#b6b6cf; --border-strong:#c7c7d8;
      --text:#2b2b38; --text-strong:#14141f; --text-mute:#5c5c74; --text-faint:#8c8caa;
      --accent:#5160dd; --accent-bright:#3a48c4; --accent-soft:rgba(81,96,221,.10);
      --accent-glow:rgba(81,96,221,.22);
    }
    body{transition:background .35s ease,color .35s ease}
    .theme-toggle{position:fixed;top:18px;right:18px;z-index:200;width:40px;
      height:40px;display:flex;align-items:center;justify-content:center;
      background:var(--bg-card);border:1px solid var(--border);border-radius:999px;
      color:var(--text-mute);cursor:pointer;
      transition:color .2s,border-color .2s,background .2s,transform .2s}
    .theme-toggle:hover{color:var(--accent-bright);border-color:var(--accent);
      background:var(--accent-soft);transform:translateY(-1px)}
    .theme-toggle svg{width:18px;height:18px;display:none}
    html[data-theme="dark"] .theme-toggle .icon-sun{display:block}
    html[data-theme="light"] .theme-toggle .icon-moon{display:block}
  """

PRE_PAINT = (
    "  <!-- Canonical identity: theme before first paint (dark default)."
    " See emmaleonhart.com/_identity/. -->\n"
    "  <script>(function(){try{var t=localStorage.getItem('theme');"
    "if(t!=='light'&&t!=='dark')t='dark';"
    "document.documentElement.setAttribute('data-theme',t);}"
    "catch(e){document.documentElement.setAttribute('data-theme','dark');}"
    "})();</script>\n"
)

TOGGLE_HTML = (
    '\n  <button id="theme-toggle" class="theme-toggle" type="button"'
    ' aria-label="Toggle light and dark theme" title="Toggle light / dark">\n'
    '    <svg class="icon-sun" viewBox="0 0 24 24" fill="none"'
    ' stroke="currentColor" stroke-width="2" stroke-linecap="round"'
    ' stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12"'
    ' r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66'
    ' 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07'
    ' 4.93l-1.41 1.41"></path></svg>\n'
    '    <svg class="icon-moon" viewBox="0 0 24 24" fill="none"'
    ' stroke="currentColor" stroke-width="2" stroke-linecap="round"'
    ' stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1'
    ' 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>\n'
    '  </button>\n'
)

HANDLER_JS = (
    "  <script>(function(){var b=document.getElementById('theme-toggle');"
    "if(!b)return;b.addEventListener('click',function(){"
    "var c=document.documentElement.getAttribute('data-theme')==='light'"
    "?'light':'dark';var n=c==='light'?'dark':'light';"
    "document.documentElement.setAttribute('data-theme',n);"
    "try{localStorage.setItem('theme',n);}catch(e){}});})();</script>\n"
)


def migrate(html: str) -> str:
    if 'id="theme-toggle"' in html:
        return html

    def add_dt(m):
        tag = m.group(0)
        return tag if "data-theme" in tag else tag[:-1] + ' data-theme="dark">'
    html = re.sub(r"<html[^>]*>", add_dt, html, count=1)
    html = html.replace("</head>", PRE_PAINT + "</head>", 1)
    html = html.replace("</style>", LIGHT_AND_TOGGLE_CSS + "</style>", 1)
    html = re.sub(r"(<body[^>]*>)", r"\1" + TOGGLE_HTML, html, count=1)
    i = html.rfind("</body>")
    html = html[:i] + HANDLER_JS + html[i:]
    return html


def main(argv):
    for arg in argv:
        p = Path(arg)
        if not p.exists():
            print("  MISSING %s" % arg)
            continue
        orig = p.read_text(encoding="utf-8")
        new = migrate(orig)
        if new == orig:
            print("  skipped (already migrated): %s" % arg)
        else:
            p.write_text(new, encoding="utf-8")
            print("  migrated: %s" % arg)


if __name__ == "__main__":
    main(sys.argv[1:])
