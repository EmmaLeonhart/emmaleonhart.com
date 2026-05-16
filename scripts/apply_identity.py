#!/usr/bin/env python3
"""Apply the canonical visual identity (see pages/_identity/) to the Slate
visualizer + hub pages.

These pages hardcode the Slate palette (no CSS variables) and also use
data-visualization colors that must stay theme-stable. This script:

  1. injects the canonical :root (dark Lacquer) + html[data-theme="light"]
     (light Lacquer) + .theme-toggle CSS right after the first <style>;
  2. rewrites ONLY the shared Slate *chrome* hexes -> var(--token), and
     ONLY inside that first <style> block, so canvas/JS drawing colors and
     the data-viz palette (#34d399, #f59e0b, #f43f5e, #38bdf8, ...) are
     left exactly as they are;
  3. adds data-theme="dark" to <html>, the pre-paint anti-flash script,
     the top-right toggle button, and the click handler.

Idempotent: a page that already has id="theme-toggle" is skipped. Safe to
re-run. Run from the repo root:  py scripts/apply_identity.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = [
    "dotproduct", "crossproduct", "cosine-similarity", "mlp",
    "backpropagation", "regression", "feature-transforms", "loss-functions",
    "regularization", "optimizers", "cnn", "cnn-architectures", "rnn",
    "lstm", "attention", "tutorials", "theory",
    "theory/graph-databases", "theory/hnsw-in-rdf", "theory/hybrid-databases",
    "theory/sparql-exit-conditions", "theory/subgraph-indexing",
    "theory/sutradb", "theory/traversal-indexing", "theory/vector-databases",
]

# Slate chrome hex -> canonical Lacquer token. Data-viz colors are
# deliberately absent so they remain theme-stable.
CHROME = {
    "#0a0a0f": "--bg",
    "#12121a": "--bg-card",
    "#0e0e16": "--bg-soft",
    "#16161f": "--bg-elevated",
    "#1e1e2a": "--border",
    "#3a3a50": "--border-hover",
    "#3a3a55": "--border-hover",
    "#d0d0dc": "--text",
    "#b0b0cc": "--text",
    "#c0c0dc": "--text",
    "#e8e8f0": "--text-strong",
    "#9898ac": "--text-mute",
    "#8888a0": "--text-mute",
    "#9090a8": "--text-mute",
    "#777793": "--text-faint",
    "#707088": "--text-faint",
    "#666880": "--text-faint",
    "#555570": "--text-faint",
    "#7c8cf8": "--accent",
    "#9aa4ff": "--accent-bright",
}

IDENTITY_CSS = """
    /* ===== CANONICAL VISUAL IDENTITY (see /_identity/) ==============
       Lacquer tokens; dark is default, [data-theme="light"] flips them.
       Slate chrome hexes in this stylesheet were rewritten to var(). */
    :root {
      --bg: #07070c;
      --bg-soft: #0c0c14;
      --bg-card: #11111b;
      --bg-elevated: #14141f;
      --border: #1d1d2c;
      --border-hover: #34344e;
      --border-strong: #262638;
      --text: #d4d4e0;
      --text-strong: #f0f0f6;
      --text-mute: #8c8caa;
      --text-faint: #5d5d78;
      --accent: #8b9bff;
      --accent-bright: #b0bcff;
      --accent-soft: rgba(139, 155, 255, 0.10);
      --accent-glow: rgba(139, 155, 255, 0.28);
    }
    html[data-theme="light"] {
      --bg: #f4f4f8;
      --bg-soft: #ebebf2;
      --bg-card: #ffffff;
      --bg-elevated: #fbfbfe;
      --border: #dadae6;
      --border-hover: #b6b6cf;
      --border-strong: #c7c7d8;
      --text: #2b2b38;
      --text-strong: #14141f;
      --text-mute: #5c5c74;
      --text-faint: #8c8caa;
      --accent: #5160dd;
      --accent-bright: #3a48c4;
      --accent-soft: rgba(81, 96, 221, 0.10);
      --accent-glow: rgba(81, 96, 221, 0.22);
    }
    body { transition: background 0.35s ease, color 0.35s ease; }
    .theme-toggle {
      position: fixed; top: 18px; right: 18px; z-index: 200;
      width: 40px; height: 40px;
      display: flex; align-items: center; justify-content: center;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: 999px; color: var(--text-mute); cursor: pointer;
      transition: color .2s, border-color .2s, background .2s, transform .2s;
    }
    .theme-toggle:hover {
      color: var(--accent-bright); border-color: var(--accent);
      background: var(--accent-soft); transform: translateY(-1px);
    }
    .theme-toggle svg { width: 18px; height: 18px; display: none; }
    html[data-theme="dark"]  .theme-toggle .icon-sun  { display: block; }
    html[data-theme="light"] .theme-toggle .icon-moon { display: block; }
"""

PRE_PAINT = (
    "  <!-- Canonical identity: theme before first paint (dark default)."
    " See /_identity/. -->\n"
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
        return html  # already migrated

    # 1. <html ...> -> ensure data-theme="dark"
    def add_dt(m):
        tag = m.group(0)
        return tag if "data-theme" in tag else tag[:-1] + ' data-theme="dark">'
    html = re.sub(r"<html[^>]*>", add_dt, html, count=1)

    # 2. pre-paint script before </head>
    html = html.replace("</head>", PRE_PAINT + "</head>", 1)

    # 3. identity CSS right after the first <style ...>, and chrome
    #    hex -> var() ONLY within that first <style>...</style> block
    m = re.search(r"<style[^>]*>", html)
    s_open_end = m.end()
    s_close = html.index("</style>", s_open_end)
    head, css, tail = (html[:s_open_end], html[s_open_end:s_close],
                       html[s_close:])
    for hexv, tok in CHROME.items():
        css = re.sub(re.escape(hexv) + r"(?![0-9a-fA-F])",
                     "var(%s)" % tok, css, flags=re.IGNORECASE)
    html = head + IDENTITY_CSS + css + tail

    # 4. toggle button after first <body ...>
    html = re.sub(r"(<body[^>]*>)", r"\1" + TOGGLE_HTML, html, count=1)

    # 5. handler before the final </body>
    i = html.rfind("</body>")
    html = html[:i] + HANDLER_JS + html[i:]
    return html


def main():
    changed, skipped = [], []
    for rel in PAGES:
        p = ROOT / "pages" / rel / "index.html"
        if not p.exists():
            print("  MISSING %s" % rel)
            continue
        orig = p.read_text(encoding="utf-8")
        new = migrate(orig)
        if new == orig:
            skipped.append(rel)
        else:
            p.write_text(new, encoding="utf-8")
            changed.append(rel)
    print("changed (%d): %s" % (len(changed), ", ".join(changed)))
    print("skipped/already (%d): %s" % (len(skipped), ", ".join(skipped)))


if __name__ == "__main__":
    sys.exit(main())
