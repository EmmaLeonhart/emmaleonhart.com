#!/usr/bin/env python3
"""Apply the canonical identity (emmaleonhart.com/_identity/) to the Loka
site (repos/loka/pages/*.html).

Loka is heterogeneous: some pages are var-based Pewter (a :root with
--bg/--surface/--accent...), others hardcode the Slate palette, and all of
them carry semantic data colors (--green/--orange/--purple/--red and raw
data hexes) that MUST stay theme-stable.

Strategy per page (idempotent — skips if id="theme-toggle" present):
  * protect the page's own :root{...} from the hex rewrite (so a
    var-based page's `--bg:#0d1117` does NOT become `--bg:var(--bg)`);
  * rewrite the shared Slate+Pewter *chrome* hexes -> var() everywhere
    else (fixes the hardcoded pages); data hexes are not in the map;
  * append a canonical Lacquer :root + html[data-theme="light"] + the
    toggle CSS just before </style>. Being last, it OVERRIDES the
    page's earlier Pewter :root via the cascade, recolouring var-based
    pages to Lacquer while leaving --green/--orange/--purple/--red
    (which it does not redefine) at the page's own values;
  * add data-theme, pre-paint script, toggle button, click handler.

Run from repo root:  py scripts/apply_identity_loka.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOKA = ROOT / "repos" / "loka" / "pages"

# Slate + Pewter/GitHub-dark *chrome* hexes -> Lacquer token. Data colors
# (#34d399 #facc15 #3fb950 #d29922 #f87c7c #f59e0b #f43f5e #38bdf8
# #a78bfa #fb923c #f97316 + badge fills) are deliberately absent.
CHROME = {
    "#0a0a0f": "--bg", "#0d1117": "--bg",
    "#0e0e16": "--bg-soft",
    "#12121a": "--bg-card", "#161b22": "--bg-card",
    "#16161f": "--bg-elevated", "#1a1a28": "--bg-elevated",
    "#1e1e2a": "--border", "#21262d": "--border", "#30363d": "--border",
    "#3a3a50": "--border-hover", "#3a3a55": "--border-hover",
    "#d0d0dc": "--text", "#b0b0cc": "--text", "#c0c0dc": "--text",
    "#e8e8f0": "--text-strong", "#e6edf3": "--text-strong",
    "#9898ac": "--text-mute", "#8888a0": "--text-mute",
    "#8b949e": "--text-mute", "#9090a8": "--text-mute",
    "#666880": "--text-faint", "#777793": "--text-faint",
    "#707088": "--text-faint", "#555570": "--text-faint",
    "#7c8cf8": "--accent", "#58a6ff": "--accent",
    "#9aa4ff": "--accent-bright", "#79c0ff": "--accent-bright",
}

# Canonical block. Defines BOTH standard names and Loka's aliases
# (--surface, --surface2, --accent-hover, --accent-dim, --text-muted,
# --text-dim) so var-based Pewter pages fully recolour. It does NOT
# declare --green/--orange/--purple/--red, so those keep the page's
# own (semantic) values.
IDENTITY_CSS = """
    /* ===== CANONICAL VISUAL IDENTITY (emmaleonhart.com/_identity/) ====
       Appended last so it overrides any earlier Pewter :root. Dark is
       default; [data-theme="light"] flips it. Semantic data vars
       (--green/--orange/--purple/--red) are intentionally NOT redefined. */
    :root{
      --bg:#07070c; --bg-soft:#0c0c14; --bg-card:#11111b; --bg-elevated:#14141f;
      --surface:#11111b; --surface2:#14141f;
      --border:#1d1d2c; --border-hover:#34344e; --border-strong:#262638;
      --text:#d4d4e0; --text-strong:#f0f0f6; --text-mute:#8c8caa;
      --text-muted:#8c8caa; --text-dim:#5d5d78; --text-faint:#5d5d78;
      --accent:#8b9bff; --accent-bright:#b0bcff; --accent-hover:#b0bcff;
      --accent-dim:#5d6bd0; --accent-soft:rgba(139,155,255,.10);
      --accent-glow:rgba(139,155,255,.28);
    }
    html[data-theme="light"]{
      --bg:#f4f4f8; --bg-soft:#ebebf2; --bg-card:#ffffff; --bg-elevated:#fbfbfe;
      --surface:#ffffff; --surface2:#fbfbfe;
      --border:#dadae6; --border-hover:#b6b6cf; --border-strong:#c7c7d8;
      --text:#2b2b38; --text-strong:#14141f; --text-mute:#5c5c74;
      --text-muted:#5c5c74; --text-dim:#8c8caa; --text-faint:#8c8caa;
      --accent:#5160dd; --accent-bright:#3a48c4; --accent-hover:#3a48c4;
      --accent-dim:#7a86e0; --accent-soft:rgba(81,96,221,.10);
      --accent-glow:rgba(81,96,221,.22);
    }
    body{transition:background .35s ease,color .35s ease}
    .theme-toggle{position:fixed;top:18px;right:18px;z-index:200;width:40px;
      height:40px;display:flex;align-items:center;justify-content:center;
      background:var(--bg-card);border:1px solid var(--border);
      border-radius:999px;color:var(--text-mute);cursor:pointer;
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
_PH = "\x00ROOTBLOCK\x00"


def migrate(html: str) -> str:
    if 'id="theme-toggle"' in html:
        return html

    def add_dt(m):
        tag = m.group(0)
        return tag if "data-theme" in tag else tag[:-1] + ' data-theme="dark">'
    html = re.sub(r"<html[^>]*>", add_dt, html, count=1)

    if "</head>" in html:
        html = html.replace("</head>", PRE_PAINT + "</head>", 1)

    m = re.search(r"<style[^>]*>", html)
    if m:
        s0 = m.end()
        s1 = html.index("</style>", s0)
        head, css, tail = html[:s0], html[s0:s1], html[s1:]
        # protect existing :root{...} blocks from the hex rewrite
        roots = re.findall(r":root\s*\{[^}]*\}", css)
        for r in roots:
            css = css.replace(r, _PH, 1)
        for hexv, tok in CHROME.items():
            css = re.sub(re.escape(hexv) + r"(?![0-9a-fA-F])",
                         "var(%s)" % tok, css, flags=re.IGNORECASE)
        for r in roots:
            css = css.replace(_PH, r, 1)
        css = css + IDENTITY_CSS
        html = head + css + tail

    html = re.sub(r"(<body[^>]*>)", r"\1" + TOGGLE_HTML, html, count=1)
    i = html.rfind("</body>")
    if i != -1:
        html = html[:i] + HANDLER_JS + html[i:]
    return html


def main():
    changed, skipped = [], []
    for p in sorted(LOKA.rglob("*.html")):
        orig = p.read_text(encoding="utf-8")
        new = migrate(orig)
        rel = p.relative_to(LOKA).as_posix()
        if new == orig:
            skipped.append(rel)
        else:
            p.write_text(new, encoding="utf-8")
            changed.append(rel)
    print("changed (%d): %s" % (len(changed), ", ".join(changed)))
    print("skipped (%d): %s" % (len(skipped), ", ".join(skipped)))


if __name__ == "__main__":
    main()
