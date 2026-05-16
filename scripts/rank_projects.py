#!/usr/bin/env python3
"""Rank the projects by GitHub stars (vibes order as tiebreaker) and rewrite
the auto-generated regions of the site.

Source of truth: data/projects.json. This script fetches each repo's
stargazers_count from the GitHub API, sorts by (stars DESC, vibes ASC), and
regenerates two marker-delimited regions:

  - pages/projects/index.html   the <article class="project"> cards
  - pages/index.html            the top-bar dropdown menu links

Run by .github/workflows/rank-projects.yml on a schedule; it commits only if
the output changed. Safe to run locally too (no token needed for public
repos, but set GITHUB_TOKEN / GH_TOKEN to avoid the 60 req/hr limit).

stdlib only.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = REPO_ROOT / "data" / "projects.json"
PROJECTS_HTML = REPO_ROOT / "pages" / "projects" / "index.html"
INDEX_HTML = REPO_ROOT / "pages" / "index.html"

CARDS_START = "<!-- PROJECTS:AUTO:START"
CARDS_END = "<!-- PROJECTS:AUTO:END -->"
MENU_START = "<!-- PROJECTS-MENU:AUTO:START"
MENU_END = "<!-- PROJECTS-MENU:AUTO:END -->"


def fetch_stars(repo: str) -> int | None:
    """Return stargazers_count for owner/name, or None if it couldn't be read."""
    url = f"https://api.github.com/repos/{repo}"
    req = urllib.request.Request(url)
    req.add_header("User-Agent", "emmaleonhart.com-rank-projects")
    req.add_header("Accept", "application/vnd.github+json")
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.load(resp)
        return int(data.get("stargazers_count", 0))
    except (urllib.error.URLError, ValueError, KeyError) as exc:
        print(f"  WARN: could not fetch stars for {repo}: {exc}", file=sys.stderr)
        return None


def render_card(p: dict) -> str:
    sub = p["subdomain"]
    flag = " flag" if p.get("flagship") else ""
    head = ['        <div class="p-head">']
    if p.get("flagship"):
        head.append('          <span class="p-scroll">&#128220;</span>')
    head.append(f'          <a class="p-title" href="https://{sub}">{p["name"]}</a>')
    if p.get("flagship"):
        head.append('          <span class="p-badge">Flagship</span>')
    head.append("        </div>")
    tags = "".join(
        f'          <span class="p-tag">{t}</span>\n' for t in p["tags"]
    )
    return (
        f'      <article class="project{flag}">\n'
        + "\n".join(head)
        + "\n"
        + f'        <a class="p-domain" href="https://{sub}">{sub}</a>\n'
        + f'        <p class="p-desc">{p["desc"]}</p>\n'
        + '        <div class="p-foot">\n'
        + tags
        + f'          <a class="btn btn-secondary" href="https://github.com/{p["repo"]}">GitHub</a>\n'
        + "        </div>\n"
        + "      </article>"
    )


def render_menu_item(p: dict) -> str:
    return f'          <a role="menuitem" href="https://{p["subdomain"]}">{p["name"]}</a>'


def splice(path: Path, start_tok: str, end_tok: str, body: str) -> bool:
    """Replace text between the start-marker line and the end-marker line.
    Returns True if the file content changed."""
    text = path.read_text(encoding="utf-8")
    s = text.index(start_tok)
    start_line_end = text.index("\n", s) + 1
    e = text.index(end_tok)
    end_line_start = text.rfind("\n", 0, e) + 1
    new_text = text[:start_line_end] + body + "\n" + text[end_line_start:]
    if new_text != text:
        path.write_text(new_text, encoding="utf-8", newline="\n")
        return True
    return False


def main() -> int:
    spec = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    projects = spec["projects"]

    for p in projects:
        stars = fetch_stars(p["repo"])
        p["_stars"] = 0 if stars is None else stars
        p["_star_known"] = stars is not None

    ranked = sorted(projects, key=lambda p: (-p["_stars"], p["vibes"]))

    order = ", ".join(f'{p["name"]}={p["_stars"]}' for p in ranked)
    print(f"Ranked order: {order}")

    cards = "\n\n".join(render_card(p) for p in ranked)
    menu = "\n".join(render_menu_item(p) for p in ranked)

    changed = False
    changed |= splice(PROJECTS_HTML, CARDS_START, CARDS_END, "\n" + cards + "\n")
    changed |= splice(INDEX_HTML, MENU_START, MENU_END, menu)

    print("Files changed." if changed else "No changes (already up to date).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
