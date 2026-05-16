#!/usr/bin/env python3
"""Make the Slate visualizer + hub + theory pages link the ONE shared
identity stylesheet (pages/identity.css) instead of carrying a
hand-duplicated copy of the tokens/toggle CSS.

History: an earlier pass *injected* a duplicated token + toggle block into
each page (the IDENTITY_CSS constant below) and rewrote the Slate chrome
hexes to var(). That produced pages that were *similar*, not *the same*.
This pass finishes the job:

  1. removes the injected IDENTITY_CSS block (exact-string strip);
  2. rewrites the remaining Slate *typography* stacks ('Segoe UI'... /
     'Cascadia Code'...) -> var(--sans)/var(--mono), and re-applies the
     chrome hex -> var() rewrite, ONLY inside the first <style> block, so
     canvas/JS drawing colors + the data-viz palette stay theme-stable;
  3. loads the shared webfonts and links /identity.css (the single source
     of truth for palette, buttons, toggle, type, primitives) right
     before that first <style>, so the page is genuinely the same.

The pre-paint script / data-theme attr / toggle button / click handler
were already added by the earlier pass; they are re-asserted here only if
missing (fresh pages). Idempotent: a page that already links
/identity.css is skipped. Run from the repo root:

    py scripts/apply_identity.py
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
# deliberately absent so they remain theme-stable. (Already applied by the
# earlier pass; kept for fresh pages / idempotent safety.)
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

# Slate typography stacks -> shared token. Longest first so a shorter
# stack never partially matches inside a longer one.
FONTS = [
    ("'Cascadia Code', 'Fira Code', 'Consolas', monospace", "var(--mono)"),
    ("'Cascadia Code', 'Fira Code', monospace", "var(--mono)"),
    ("'Cascadia Code', monospace", "var(--mono)"),
    ("'Segoe UI', system-ui, -apple-system, sans-serif", "var(--sans)"),
    ("'Segoe UI', system-ui, sans-serif", "var(--sans)"),
]

# The exact block the earlier pass injected after the first <style>.
# Stripped verbatim here — its job is now done by /identity.css.
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

# Loaded right before the first <style> so the shared identity is the
# base and the page's own layout CSS (which follows) wins on conflicts.
SHARED_LINKS = (
    '  <!-- Shared visual identity: the ONE source of truth. /_identity/ -->\n'
    '  <link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;'
    '500;600;700;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:'
    'wght@400;500&display=swap" rel="stylesheet">\n'
    '  <link rel="stylesheet" href="/identity.css">\n'
)

PRE_PAINT = (
    "  <!-- Shared identity: theme before first paint (dark default)."
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
    '    <svg class="icon-sun" viewBox="0 0 24 24" fill="currentColor"'
    ' aria-hidden="true"><path d="M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5'
    ' 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0'
    ' 0,0 15,12A3,3 0 0,0 12,9M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16'
    ',5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,'
    '8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M3.36,17L5.12,13.23C5.26,14 5.53,'
    '14.78 5.95,15.5C6.37,16.24 6.91,16.86 7.5,17.37L3.36,17M20.65,7L18.88,'
    '10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65'
    ',7M20.64,17L16.5,17.36C17.09,16.85 17.62,16.22 18.04,15.5C18.46,14.77 '
    '18.73,14 18.87,13.21L20.64,17M12,22L9.59,18.56C10.33,18.83 11.14,19 12,'
    '19C12.82,19 13.63,18.86 14.37,18.59L12,22Z"></path></svg>\n'
    '    <svg class="icon-moon" viewBox="0 0 24 24" fill="currentColor"'
    ' aria-hidden="true"><path d="M17.75,4.09L15.22,6.03L16.13,9.09L13.5,'
    '7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,'
    '4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,'
    '12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8'
    ',15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,'
    '23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,'
    '4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,'
    '13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,'
    '16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.4 6.35,'
    '17.41C9.37,20.43 14,20.54 17.33,17.97Z"></path></svg>\n'
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
    if 'href="/identity.css"' in html:
        return html  # already converted to the shared sheet

    # 1. <html ...> -> ensure data-theme="dark"
    def add_dt(m):
        tag = m.group(0)
        return tag if "data-theme" in tag else tag[:-1] + ' data-theme="dark">'
    html = re.sub(r"<html[^>]*>", add_dt, html, count=1)

    # 2. pre-paint script before </head> (only if absent)
    if "localStorage.getItem('theme')" not in html:
        html = html.replace("</head>", PRE_PAINT + "</head>", 1)

    # 3. first <style> block: strip the injected identity block, then
    #    rewrite the remaining Slate chrome hexes + font stacks to var().
    m = re.search(r"<style[^>]*>", html)
    s_open = m.start()
    s_open_end = m.end()
    s_close = html.index("</style>", s_open_end)
    head, css, tail = html[:s_open], html[s_open_end:s_close], html[s_close:]
    style_open = html[s_open:s_open_end]

    css = css.replace(IDENTITY_CSS, "", 1)
    for hexv, tok in CHROME.items():
        css = re.sub(re.escape(hexv) + r"(?![0-9a-fA-F])",
                     "var(%s)" % tok, css, flags=re.IGNORECASE)
    for stack, tok in FONTS:
        css = css.replace(stack, tok)

    # 4. shared webfonts + /identity.css link, immediately before <style>
    html = head + SHARED_LINKS + style_open + css + tail

    # 5. toggle button after first <body ...> (only if absent)
    if 'id="theme-toggle"' not in html:
        html = re.sub(r"(<body[^>]*>)", r"\1" + TOGGLE_HTML, html, count=1)
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
