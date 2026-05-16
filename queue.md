# emmaleonhart.com — Work Queue

**This file is a queue, not a state snapshot.** It lists what is being worked on right now. Finished work lives in `git log` (and `experiment_log.md` if applicable). Longer-horizon ideas live in `todo.md`. When an item is done, delete it — no checkmarks, no status indicators.

**Why this file exists:** when a planning step produces a plan, that plan is written here BEFORE execution starts. An interrupted session can pick up from the queue rather than from chat context.

See `CLAUDE.md` § "Workflow Rules" for how this file, planning mode, and the task tool stay in sync.

---

## Common Visual Identity rollout (Emma 2026-05-15) — ACTIVE PRIORITY

**Decision (Emma's, from the gallery):** one identity across the main site + all six sister sites =
- **Base = Lacquer** (`#07070c` bg, periwinkle `#8b9bff` accent, Inter / Instrument Serif / JetBrains Mono, drifting aurora, eyebrow pill, gradient headlines) — the majority of the visual identity.
- **Buttons = Pewter's** — prominent FILLED buttons: primary = solid `--accent` fill with `--bg`-colored label, weight 600, ~12×28px, 8px radius, `translateY(-1px)` hover. Replaces Lacquer's hairline-outline buttons everywhere. Emma explicitly wants prominent, visible buttons.
- **Dark/light toggle widget, fixed top-right, DARK DEFAULT** — the thing Emma likes on the Sutra (MkDocs Material) site. Essential on EVERY page of EVERY site. Self-contained vanilla JS + CSS-variable theming, persists to localStorage, defaults dark (prefers-color-scheme only as first-visit fallback). Needs a documented LIGHT-mode token set for the Lacquer palette.
- Drop Heather/Slate/Pewter as separate identities — all converge here. Keep the `/examples/` gallery but it now documents history + the adopted system, not live divergence.

**Why:** the site + 6 sister projects currently have 4 scattered identities; Emma wants one coherent system. She does not do front-end — GitHub Pages live is how she reviews, so push incrementally and land the main-site reference first so she can redirect before the full propagation finishes.

**Canonical artifact:** `pages/_identity/` — a spec page + the exact copy-paste `<style>`/`<script>` block (self-contained per CLAUDE.md "each page self-contained, no shared bundle"; the "shared identity" is a documented template every page copies, not a runtime import).

**Canonical artifact is built:** `pages/_identity/index.html` — the reference page + the copy-paste drop-in block (pre-paint theme script, `:root`/`[data-theme="light"]` token blocks, `.theme-toggle` widget, click handler). Every page below copies from it.

**Steps (commit+push each; delete the line when done; mirror to task tool):**
1. Main-site reference: apply to `pages/index.html` landing (Pewter buttons + toggle widget + light tokens), then `/projects/`, `/research/`. Push after each.
2. Roll the toggle widget + Pewter buttons across the Slate pages — `/tutorials/`, `/theory/`, every per-visualizer page. Largest sub-job; one commit per logical group.
3. Sister repos (push to each default branch per the repos/ workflow, then bump pointers): Yantra/QueryKey/Alignment (already Lacquer) → add Pewter buttons + toggle. Loka (Pewter) → re-base on Lacquer, keep prominent buttons, add toggle. Sutra (MkDocs Material — already has a toggle) → steer its Material palette/accent toward the Lacquer tokens so it visually matches. latent-space-cartography → Lacquer if/when it gets a site.
4. Update README.md + CLAUDE.md "Page structure" + experiment_log.md mapping to record the convergence.

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

### Subdomain sites — diagnosed 2026-05-15, see experiment_log.md "Subdomain HTTPS Rendering Diagnostic"
Root cause is **NOT** DNS propagation (ruled out: DNS/CNAME/build all verified correct & identical to working yantra). It is GitHub per-domain TLS certs not yet provisioned for the 5 non-yantra subdomains. Status:
- Sutra canonical domain RESOLVED → `sutra.emmaleonhart.com` (Emma's call). Fixed across 11 files incl. mkdocs.yml site_url + CLAUDE.md/AGENTS.md, pushed sutra@c25c298c (also re-kicked sutra's pages.yml). Loka was already consistent (loka.emmaleonhart.com everywhere) — no change needed.
- All 5 re-kicked 2026-05-15 (user-authorized): querykey 8c87b20 (main), loka a2e3d70 (main), alignment 964fa5b (master), latent-space-cartography e7bd29f (master), sutra c25c298c (master).
- **Re-check 2026-05-15 ~21:57 PST (~5h after re-kick): all 5 STILL `ERR_TLS_CERT_ALTNAME_INVALID`.** Re-kick alone confirmed insufficient — GitHub is not auto-issuing despite correct config + fresh successful deploys. yantra (provisioned) is the only difference.
- **→ ACTUAL BLOCKER, user-only (was filed "optional" — it is not):** github.com/settings/pages → add & **verify `emmaleonhart.com`** at account level; then per repo Settings→Pages confirm "DNS check successful" and that "Enforce HTTPS" becomes available. This is now the load-bearing step; the certs are unlikely to issue without it. `gh` not authed on this machine, so this cannot be automated here.

---

## Pointers

- Page-by-page layout: `CLAUDE.md` § "Page structure"
- Longer-horizon ideas: `todo.md`
- Experiment notes: `experiment_log.md`
- Narrative history: `git log`
