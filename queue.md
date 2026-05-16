# emmaleonhart.com — Work Queue

**This file is a queue, not a state snapshot.** It lists what is being worked on right now. Finished work lives in `git log` (and `experiment_log.md` if applicable). Longer-horizon ideas live in `todo.md`. When an item is done, delete it — no checkmarks, no status indicators.

**Why this file exists:** when a planning step produces a plan, that plan is written here BEFORE execution starts. An interrupted session can pick up from the queue rather than from chat context.

See `CLAUDE.md` § "Workflow Rules" for how this file, planning mode, and the task tool stay in sync.

---

## Cleanvibe onboarding — C & D crons still pending

cleanvibe is integrated (cron 1 `e276c1ae` fired ~15:08: submodule +
`repos/cleanvibe/pages/` shared-identity site, CNAME, Pages workflow
repointed site/→pages/, in `data/projects.json` vibes 8, ranked into
nav/projects, pushed cleanvibe `@0b31c39` + emmaleonhart.com). Two
LOCAL one-shot session crons remain — session-only, fire only while
this session is alive + machine awake; if missed, run by hand:

- **C. cron `679b53ea` (~19:37)** — cleanvibe follow-up: if cleanvibe
  origin/master moved since integration, pull, refine its `pages/`
  site + re-sync identity.css, push cleanvibe + bump pointer; else no-op.
- **D. cron `c1d721d8` (~23:55)** — cleanvibe new-release check: if a
  new release/tag/commits, bump pointer + update site + projects.json
  desc/tags, push; else no-op.

Earlier remote routines (trig_01LUKG7…/01Vd1Uh3…/01LkDXSE…) are
DISABLED; delete fully at claude.ai/code/routines.

---

## Visual identity — THE UNIFIED PIPELINE (single source of truth)

Goal: every site is the SAME visual identity, produced by ONE
mechanism, iterated in ONE place. No more per-site ad-hoc tweaks.

### Source of truth
- `/branding` (emmaleonhart.com/branding) = the LIVING STYLE GUIDE.
  Every element is demonstrated there first; nothing rolls out until
  it looks right on /branding.
- `pages/identity.css` = the ONE skin file. Sister static sites carry
  a BYTE-IDENTICAL copy (re-synced from canonical, never per-page
  overridden). Sutra (MkDocs) maps the same tokens into Material via
  `docs/stylesheets/identity.css`.

### Confirmed kit (locked from Emma's reference screenshots)
1. GitHub repo widget = Sutra's Material `.md-source` VERBATIM
   (octocat + `Owner/Repo` + version·stars·forks pill).
2. Search = compact, expands on focus.
3. Light/dark toggle next to the GitHub widget; search opposite.
4. Primary button = calmer mid-tone fill + near-white label + subtle
   AURORA GRADIENT/GLOW (based on the main-site buttons).
5. Aurora side-glow = identity element.
6. Aurora-box cards = the main-site gradient-glow + accent-bar card,
   multi-hue; every card ALSO carries an emoji ("everything has an
   Aurora or an emoji").
7. Cosmic orbital glyph (rotating hero SVG) — now on /branding too;
   more cosmic background elements wanted (todo.md).
8. Gradient + italic-serif display type (flagged to revisit, todo.md).

### Pipeline phases
- P1 SKIN — DONE + pushed across all repos (palette, calmer/aurora
  button, widget, search, aurora, emoji, glyph in canonical
  identity.css; sister copies re-synced; Sutra Material steered).
- P2 STYLE GUIDE — /branding is live, iterated FIRST (now: aurora-box
  + emoji cards + the cosmic orbital glyph).
- P3 STRUCTURAL ROLLOUT — the long-haul. Static sites adopt the
  shared `.site-nav` shell + aurora + glyph; **Loka needs a shared
  shell (root cause: per-page static HTML, no template — todo.md)**;
  Sutra stays MkDocs, steered (chrome done; keep its nav/search).
- P4 DEFERRED — revisit gradient/italic; expand cosmic motifs;
  promote /branding to a formal written style guide.

### KEY RULE
Each sister site deploys from ITS OWN repo's Pages workflow on push
to that repo's default branch. Every submodule edit must be committed
AND pushed to the sister repo's own remote (not just the superproject
pointer), then verified local HEAD == origin. Subdomains resolve
(Emma fixed the per-repo Pages custom domain).

### E. CRON 4 (~16:09 today, +1h) — run the P3 skin+cards rollout
LOCAL one-shot session cron `32aecc22` (session-only — fires only
while this session is alive + machine awake). Reads this pipeline +
the FINAL state of `/branding` + canonical `pages/identity.css`,
then: re-sync every sister `identity.css` byte-for-byte from canonical
(loka/querykey/alignment/yantra/vibecoding/cleanvibe); map the same
tokens into Sutra's Material `docs/stylesheets/identity.css`; apply
the aurora-box + emoji card convention + the cosmic orbital glyph to
each site's existing card grids / hero where they exist; commit + push
every touched repo to its OWN remote; bump submodule pointers; verify
local==origin. Do NOT restructure Loka's per-page HTML (separate P3
long-haul) — skin + cards + glyph only. Delete this item + mark the
task done when finished.

---

## Parked (design-flagged, not active queue work)

- querykey deep code-identifier rename (Go module / `secretarybird-old/`)
  — separate breaking refactor, needs user go-ahead.
- `/theory/sutradb/` URL path still literally says sutradb (kept to
  avoid link breakage).
- publish.yml workflow_dispatch verify (clawRxiv CI path) — `gh` not
  authed on this machine; do when auth available or via GitHub UI.

---

## Pointers

- Page-by-page layout: `CLAUDE.md` § "Page structure"
- Longer-horizon ideas: `todo.md`
- Experiment notes + resolved diagnostics (incl. the subdomain Pages
  custom-domain fix, now done): `experiment_log.md`
- Narrative history: `git log`
