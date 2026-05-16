# emmaleonhart.com — Work Queue

**This file is a queue, not a state snapshot.** It lists what is being worked on right now. Finished work lives in `git log` (and `experiment_log.md` if applicable). Longer-horizon ideas live in `todo.md`. When an item is done, delete it — no checkmarks, no status indicators.

**Why this file exists:** when a planning step produces a plan, that plan is written here BEFORE execution starts. An interrupted session can pick up from the queue rather than from chat context.

See `CLAUDE.md` § "Workflow Rules" for how this file, planning mode, and the task tool stay in sync.

---

## Carry-over from before (do not re-do)

### Scheduled (self-executing — but the 90-min one is the suspect)
- One-shot 2026-05-16 00:51 PST (set ~16:51 PST 2026-05-15 this session): upgrade all six submodules to latest upstream, then build the Examples style-gallery — see "## Examples style-gallery build" section below for the full plan. Session-only local cron.
- Monthly /research/ arxiv-link audit (remote routine).
- One-time ~6.5h (2026-05-16 03:24Z): build /skills directory from latest state of all repos. trig_018XAU18fNfRnjB5Y3WA6si2.
- One-time ~90m (2026-05-15 22:29Z): latent-space-cartography paper/CI work — **user said this one is at risk of not firing**, so item #3 above does the same work manually. trig_01De7cjBVmwqdYnXg7p2Crwz.
- Hourly LOCAL subdomain health check: session cron c0e659c7 (:07, 7-day expire). yantra 200; other 5 awaiting GitHub HTTPS cert.

### Flagged, not done by design
- querykey deep code-identifier rename (Go module / `secretarybird-old/` dir) — separate breaking refactor, needs user go-ahead.
- /theory/sutradb/ URL path still literally says sutradb (kept to avoid link breakage).
- publish.yml workflow_dispatch verify (clawRxiv CI path) — not actionable: `gh` not authed on this machine. Do when auth available, or trigger from GitHub UI.

### Subdomain sites — diagnosed 2026-05-15, see experiment_log.md "Subdomain HTTPS Rendering Diagnostic"
Root cause is **NOT** DNS propagation (ruled out: DNS/CNAME/build all verified correct & identical to working yantra). It is GitHub per-domain TLS certs not yet provisioned for the 5 non-yantra subdomains. Open actions:
- **USER decision (blocks sutra coherence, not its cert):** sutra `mkdocs.yml site_url: https://sutralang.dev` + Sutra CLAUDE.md vs `docs/CNAME: sutra.emmaleonhart.com` (+ portfolio). Pick the canonical domain, then align site_url & CLAUDE.md.
- Re-kick DONE 2026-05-15 (user-authorized): empty pages.yml commits pushed — querykey 8c87b20 (main), loka a2e3d70 (main), alignment 964fa5b (master), latent-space-cartography e7bd29f (master). sutra NOT re-kicked (pending the domain decision above; its pages.yml has a paths filter so an empty commit wouldn't trigger anyway). Watch the 4 pages.yml runs go green, then watch for GitHub cert issuance (hourly cron c0e659c7).
- **USER, real lever (needs GitHub auth):** github.com/settings/pages → verify `emmaleonhart.com`; per repo Settings→Pages confirm "DNS check successful" + "Enforce HTTPS". This is the most likely reason yantra's cert provisioned and the rest lag.

---

## Examples style-gallery build (scheduled 2026-05-16 00:51 PST, cron — session-only)

**Why:** the site + its six sister projects currently have a scattered set of visual identities and it is not clear what is going on. Emma wants a single place to SEE and COMPARE every distinct style side by side, as the first step toward a coherent shared visual identity. She does not do front-end, so this gallery is the surface she will use to point at "change this part of the identity."

**Steps (autonomous; commit+push each chunk, delete done lines per CLAUDE.md rules, mirror to task tool):**
1. Upgrade all six submodules to latest upstream (each on its default branch — most master, Loka main; verify with `git remote show origin`; `git pull --ff-only`; do NOT `git lfs pull` latent-space-cartography). `git add repos/<name>`, one commit "Bump all submodule pointers to current upstream state", push.
2. Inventory distinct visual identities across: the main site (landing, the projects/research/tutorials/theory hubs, the visualizer pages) AND each sister project in repos/ (Sutra, Loka, Yantra, querykey, alignment, latent-space-cartography — their site/landing/README styling). Cluster near-identical ones into a small set of DISTINCT styles (palette + typography + component/card styling + layout & spacing + signature motifs).
3. Give each distinct style an ABSTRACT codename — evocative, NOT derived from the project or its topic (Emma's example: "Oyster"; think material/nature/texture words like Slate, Ember, Fern, Vellum). Keep a private codename→source mapping in experiment_log.md; the public label is only the codename.
4. Build `pages/examples/index.html` — a gallery hub: one card per style (codename + small live preview + one-line vibe descriptor), linking to per-style pages. Self-contained HTML, no framework, follow how /tutorials/ and /theory/ hubs are structured/linked.
5. Build `pages/examples/<codename>/index.html` per style — each self-contained page both RENDERS the style (representative components: heading, body copy, a card, buttons, nav, a code/data block as relevant) AND carries an annotated breakdown panel of the concrete elements that make it look that way: exact bg/surface/accent hex, font families+weights, border/radius/shadow, spacing scale, link/button treatment, signature motifs.
6. Link the new Examples hub from the main site nav + landing page (mirror how the other hubs are linked).
7. Update README.md and CLAUDE.md "Page structure" to record `pages/examples/`. Then leave a clear summary so Emma can say which parts of the identity to change next. Do NOT redesign anything yet — this build is inventory + comparison only.

---

## Pointers

- Page-by-page layout: `CLAUDE.md` § "Page structure"
- Longer-horizon ideas: `todo.md`
- Experiment notes: `experiment_log.md`
- Narrative history: `git log`
