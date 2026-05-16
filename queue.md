# emmaleonhart.com — Work Queue

**This file is a queue, not a state snapshot.** It lists what is being worked on right now. Finished work lives in `git log` (and `experiment_log.md` if applicable). Longer-horizon ideas live in `todo.md`. When an item is done, delete it — no checkmarks, no status indicators.

**Why this file exists:** when a planning step produces a plan, that plan is written here BEFORE execution starts. An interrupted session can pick up from the queue rather than from chat context.

See `CLAUDE.md` § "Workflow Rules" for how this file, planning mode, and the task tool stay in sync.


## High priority — GitHub stars widget on sister sites

Live GitHub repo pill (mark + name + ★ star count + latest release/tag,
fetched client-side from the public API) is built and committed LOCALLY
on all four sister sites — Yantra/QueryKey/Alignment (Lacquer topbar)
and Loka (Pewter nav). Sutra already shows stars/forks via Material's
built-in repo widget (no change, P6). `v0.0.0` annotated tags created
LOCALLY on Yantra/QueryKey/Alignment/latent-space-cartography (Loka/Sutra
already have v0.4.0).

REMAINING: the auto-mode classifier blocks the agent from pushing to the
shared sister repos. Emma (or a permitted run) must publish — run from
the emmaleonhart.com repo root:

```
git -C repos/yantra push origin master ; git -C repos/yantra push origin v0.0.0
git -C repos/querykey push origin main ; git -C repos/querykey push origin v0.0.0
git -C repos/alignment push origin master ; git -C repos/alignment push origin v0.0.0
git -C repos/loka push origin main
git -C repos/latent-space-cartography push origin v0.0.0
```

When pushed, delete this section.

---

## TRUE visual identity unification (Emma 2026-05-15) — ACTIVE PRIORITY

**Honest status:** the first pass imposed *similar* (per-page token injection + a toggle, each page keeping its own bespoke layout/buttons). Emma's verdict: not consistent, Loka not properly implemented, prominent buttons missing on most pages, "the same" not achieved. The token-swap is real but insufficient. The Material toggle ICON is now exactly the Sutra one everywhere (8580637 + sister pushes) — keep that.

**Root cause:** the old CLAUDE.md convention ("no shared CSS, every page self-contained, duplicated by hand") makes true sameness impossible. Superseded — see CLAUDE.md change in this commit. The identity is now a single linked stylesheet, not a per-page copy.

**The real plan:**
1. Build `pages/identity.css` — the ONE shared stylesheet: dark/light Lacquer tokens, the prominent Pewter button (`.btn`/`.btn-primary`/`.btn-secondary`), the exact Material `.theme-toggle` widget CSS, and shared surface/typography/card/eyebrow primitives. This is the single source of truth; pages LINK it (`<link rel="stylesheet" href="/identity.css">`), not copy it.
2. Convert every main-site page to: link `/identity.css`, drop its duplicated token/toggle CSS, and use the shared component classes. The prominent buttons go on EVERY page's primary actions (landing cards/CTAs, hub links, "view source", visualizer controls) — no more "N/A, no .btn here".
3. Redo Loka PROPERLY: its pages link a Loka copy of identity.css (or the same component classes) and use the shared button/toggle — not the cascade-override patch currently shipped. Same for Yantra/QueryKey/Alignment (link a shared stylesheet in `site/`).
4. Sutra: keep the Material `extra_css` steer (it already uses the real Material toggle + is genuinely consistent within Material).
5. `pages/embeddings/` via `build_viewer.py` template.
6. Update `/_identity/` to be the live demo of the shared stylesheet (link it, don't inline).

This is a large, multi-pass redo. Commit+push per logical group; do NOT claim "done" until pages actually render the same. Emma reviews live on GitHub Pages — she is the ground truth, not the diff.

**Granular execution checklist (in order; each line = one commit+push):**
- [P5] Sister sites in `repos/`: copy `identity.css` into each repo root/site dir; convert Loka (proper, not cascade-override), Yantra, QueryKey, Alignment pages to link it + shared toggle/buttons. Push each sister repo on its default branch; bump submodule pointers here.
- [P6] Sutra: no code change — keep the Material `extra_css` steer (already genuinely consistent within Material). Record decision.
- [P7] Final pass: visual diff all main-site pages dark+light; update README + experiment_log; delete this whole section from queue.

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
