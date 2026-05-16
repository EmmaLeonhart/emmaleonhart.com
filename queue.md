# emmaleonhart.com — Work Queue

**This file is a queue, not a state snapshot.** It lists what is being worked on right now. Finished work lives in `git log` (and `experiment_log.md` if applicable). Longer-horizon ideas live in `todo.md`. When an item is done, delete it — no checkmarks, no status indicators.

**Why this file exists:** when a planning step produces a plan, that plan is written here BEFORE execution starts. An interrupted session can pick up from the queue rather than from chat context.

See `CLAUDE.md` § "Workflow Rules" for how this file, planning mode, and the task tool stay in sync.


## ACTIVE — vibecoding/cleanvibe onboarding + button-identity unification (2026-05-16)

Plan set at 2026-05-16 13:35 -0700. Two new sister projects join the
six: `vibecoding-tutorial` → vibecoding.emmaleonhart.com,
`cleanvibe` → cleanvibe.emmaleonhart.com. cleanvibe is in flux until
~15:05 today (new features landing), so its work is deferred to a cron.

### B. CRON 1 (~15:08 today, after cleanvibe flux) — cleanvibe full integration
Same as A but for `cleanvibe` (vibes=8, cleanvibe.emmaleonhart.com).
Commit + push all three repos (cleanvibe + emmaleonhart.com + re-touch
vibecoding if identity changed). Detailed steps live in the cron prompt.

### C. CRON 2 (~19:37 today, +6h) — cleanvibe follow-up
Check cleanvibe for commits landed since cron 1. If any: bump the
`repos/cleanvibe` submodule pointer and refine cleanvibe.emmaleonhart.com
to better fit the visual identity. Commit + push. If unchanged, no-op +
delete this item.

### D. CRON 3 (~23:55 today / 06:55Z, +10h) — cleanvibe new-release check
Emma expects a NEW cleanvibe release by then. Check for new tags /
release / commits since the last run; if any, bump the
`repos/cleanvibe` pointer + update the cleanvibe site and its
`data/projects.json` desc/tags to reflect the release. Commit + push.
No-op if nothing new. Delete this item when done.

These three run as LOCAL one-shot session crons (cleanvibe work needs
the local credential.helper=manager + local working tree — it does NOT
work from the cloud). B=cron e276c1ae (15:08), C=cron 679b53ea (19:37),
D=cron c1d721d8 (23:55), all 2026-05-16 local. The earlier remote
routines (trig_01LUKG7…, trig_01Vd1Uh3…, trig_01LkDXSE…) are DISABLED
(superseded by these locals; delete fully at claude.ai/code/routines).

CAVEAT: the harness does not honor durable cron persistence here, so
these are session-only — they fire only while this Claude Code session
stays open and the machine is awake. If the session is closed before a
fire time, that cron is lost and the cleanvibe work for it must be run
by hand (steps are in sections B/C/D above).

## Visual identity — THE UNIFIED PIPELINE (single source of truth, 2026-05-16)

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
7. Cosmic motif: enlarged rotating orbital hero glyph; more cosmic
   background elements wanted (todo.md).
8. Gradient + italic-serif display type (flagged to revisit, todo.md).

### Pipeline phases
- P1 SKIN — DONE + pushed across all repos (palette, calmer/aurora
  button, widget, search, aurora, emoji, glyph in canonical
  identity.css; sister copies re-synced; Sutra Material steered).
- P2 STYLE GUIDE — /branding is live and iterated FIRST (now:
  aurora-box + emoji cards).
- P3 STRUCTURAL ROLLOUT — the long-haul. Static sites adopt the
  shared `.site-nav` shell + aurora + glyph; **Loka needs a shared
  shell (root cause: per-page static HTML, no template — todo.md)**;
  Sutra stays MkDocs, steered (chrome done; keep its nav/search).
  cleanvibe enters P3 via the cleanvibe crons above.
- P4 DEFERRED — revisit gradient/italic; expand cosmic motifs;
  promote /branding to a formal written style guide.

### KEY RULE
Each sister site deploys from ITS OWN repo's Pages workflow on push
to that repo's default branch. Every submodule edit must be committed
AND pushed to the sister repo's own remote (not just the superproject
pointer), then verified local HEAD == origin. Emma fixed the per-repo
Pages custom domain; subdomains resolve (HTTPS cert may still settle).

### E. CRON 4 (~16:09 today, +1h) — run the P3 skin+cards rollout
LOCAL one-shot session cron `32aecc22` (needs local creds + tree;
session-only like the cleanvibe crons — fires only while this session
is alive + machine awake).
Reads this pipeline + the FINAL state of `/branding` + canonical
`pages/identity.css`, then: re-sync every sister `identity.css`
byte-for-byte from canonical (loka/querykey/alignment/yantra/
vibecoding, + cleanvibe if integrated); map the same tokens into
Sutra's Material `docs/stylesheets/identity.css`; apply the aurora-box
+ emoji card convention to each site's existing card grids; commit +
push every touched repo to its OWN remote; bump submodule pointers;
verify local==origin for each. Do NOT restructure Loka's per-page
HTML in this pass (P3 shell work is separate long-haul) — skin +
cards only. Delete this item + mark the task done when finished.

---

## (superseded) Visual identity + GitHub stars widget

Folded into THE UNIFIED PIPELINE above. The skin + widget work is
committed AND pushed across all repos (verified local==origin), and
Emma fixed the Pages custom domains, so the old "DONE locally; needs
Emma's push / blocked on auto-mode classifier" framing no longer
applies. Remaining identity work lives in the pipeline phases (P3/P4).

---

## Subdomain RENDER diagnostic — RESOLVED (Emma was right: repo Pages-setting, not DNS/cert)

Full writeup: experiment_log.md "Subdomain Render Diagnostic v2". Emma's git/legacy-domain hypothesis confirmed; supersedes the old "account-level verification" theory.
- Deployed root CNAMEs all correct; no gh-pages branches. The two extra Pages workflows (`sutra/sutraDB/.github/workflows/pages.yml`, `lsc/old/.../pages.yml`) were INERT — GitHub only runs repo-root `.github/workflows/`. Removed as cruft (sutra@a86ec70f, lsc@5377bba) + bumped pointers.
- Root cause: each repo's GitHub Pages **"Custom domain" setting** (server-side, separate from the CNAME file) is stuck/desynced from the legacy domain (sutralang.dev / sutradb.org lineage), so GitHub serves the `*.github.io` cert → `ERR_TLS_CERT_ALTNAME_INVALID`. Loka's own `e136870 Repoint Pages custom domain` proves a human had to manually un-stick this before. `deploy-pages` won't repoint an already-set domain — that's why the re-kicks didn't help.
- **USER-ONLY FIX (needs GitHub UI / gh; not automatable here):** per repo (sutra, loka, querykey, alignment, latent-space-cartography) → Settings → Pages → Custom domain: clear it + Save, then re-enter the correct `<sub>.emmaleonhart.com` + Save. Forces DNS re-check + fresh cert. Same as Loka's e136870.

---

## Carry-over from before (do not re-do)

### Scheduled (self-executing)
- Monthly /research/ arxiv-link audit (remote routine).
- One-time ~6.5h (2026-05-16 03:24Z): build /skills directory from latest state of all repos. trig_018XAU18fNfRnjB5Y3WA6si2.
- Hourly LOCAL subdomain health check: session cron c0e659c7 (:07, 7-day expire). yantra 200; other 5 awaiting GitHub HTTPS cert.

### Flagged, not done by design
- querykey deep code-identifier rename (Go module / `secretarybird-old/` dir) — separate breaking refactor, needs user go-ahead.
- /theory/sutradb/ URL path still literally says sutradb (kept to avoid link breakage).
- publish.yml workflow_dispatch verify (clawRxiv CI path) — not actionable: `gh` not authed on this machine. Do when auth available, or trigger from GitHub UI.

### Subdomain sites — see the RESOLVED diagnostic section above
The earlier "account-level domain verification is the blocker" conclusion is **SUPERSEDED** by the v2 diagnostic (repo Pages custom-domain setting stuck on the legacy domain). Canonical domains were already resolved (sutra@c25c298c → sutra.emmaleonhart.com; loka already loka.emmaleonhart.com). The remaining action is the user-only per-repo Settings→Pages custom-domain re-set described above.

---

## Pointers

- Page-by-page layout: `CLAUDE.md` § "Page structure"
- Longer-horizon ideas: `todo.md`
- Experiment notes: `experiment_log.md`
- Narrative history: `git log`
