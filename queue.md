# emmaleonhart.com — Work Queue

**This file is a queue, not a state snapshot.** It lists what is being worked on right now. Finished work lives in `git log` (and `experiment_log.md` if applicable). Longer-horizon ideas live in `todo.md`. When an item is done, delete it — no checkmarks, no status indicators.

**Why this file exists:** when a planning step produces a plan, that plan is written here BEFORE execution starts. An interrupted session can pick up from the queue rather than from chat context.

See `CLAUDE.md` § "Workflow Rules" for how this file, planning mode, and the task tool stay in sync.

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
- All 5 re-kicked 2026-05-15 (user-authorized): querykey 8c87b20 (main), loka a2e3d70 (main), alignment 964fa5b (master), latent-space-cartography e7bd29f (master), sutra c25c298c (master). Watch the pages.yml runs go green, then watch for GitHub cert issuance (hourly cron c0e659c7).
- **Only remaining item — OPTIONAL, user-only (Emma unsure, no rush):** github.com/settings/pages → verify `emmaleonhart.com` at account level; per repo Settings→Pages confirm "DNS check successful" + "Enforce HTTPS". This likely speeds issuance (probable reason yantra provisioned first) but GitHub should issue the certs on its own now that every repo is correctly configured + freshly deployed.

---

## Pointers

- Page-by-page layout: `CLAUDE.md` § "Page structure"
- Longer-horizon ideas: `todo.md`
- Experiment notes: `experiment_log.md`
- Narrative history: `git log`
