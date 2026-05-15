# emmaleonhart.com — Work Queue

**This file is a queue, not a state snapshot.** It lists what is being worked on right now. Finished work lives in `git log` (and `experiment_log.md` if applicable). Longer-horizon ideas live in `todo.md`. When an item is done, delete it — no checkmarks, no status indicators.

**Why this file exists:** when a planning step produces a plan, that plan is written here BEFORE execution starts. An interrupted session can pick up from the queue rather than from chat context.

See `CLAUDE.md` § "Workflow Rules" for how this file, planning mode, and the task tool stay in sync.

---

## In-flight (session 2026-05-15 22:30Z — possible interrupt for low battery)

**Goal:** finish everything the previous session left undone + the 90-min cron job that probably won't fire because the user changed computers. Resume rewrite is DONE and pushed (commit 399f2c2, live at emmaleonhart.com/resume.html with LessWrong link, all six projects, papers section). Working through the remainder below in this order.

### 4. After the above: verify
- Trigger the publish.yml manually (workflow_dispatch) once and confirm the clawRxiv CI path still works. (Optional / skipping if time-constrained.)
- WebFetch each subdomain (sutra., loka., yantra., querykey., alignment., latent-space.) to see which have GitHub Pages HTTPS certs now (the hourly cron c0e659c7 has been watching).

---

## Carry-over from before (do not re-do)

### Scheduled (self-executing — but the 90-min one is the suspect)
- Monthly /research/ arxiv-link audit (remote routine).
- One-time ~6.5h (2026-05-16 03:24Z): build /skills directory from latest state of all repos. trig_018XAU18fNfRnjB5Y3WA6si2.
- One-time ~90m (2026-05-15 22:29Z): latent-space-cartography paper/CI work — **user said this one is at risk of not firing**, so item #3 above does the same work manually. trig_01De7cjBVmwqdYnXg7p2Crwz.
- Hourly LOCAL subdomain health check: session cron c0e659c7 (:07, 7-day expire). yantra 200; other 5 awaiting GitHub HTTPS cert.

### Flagged, not done by design
- querykey deep code-identifier rename (Go module / `secretarybird-old/` dir) — separate breaking refactor, needs user go-ahead.
- /theory/sutradb/ URL path still literally says sutradb (kept to avoid link breakage).

### Subdomain sites — verification pending
Confirm querykey/Yantra/alignment pages.yml runs went green and the six subdomains resolve once GitHub's HTTPS cert/domain-verification finishes provisioning. Watching via hourly cron.

---

## Pointers

- Page-by-page layout: `CLAUDE.md` § "Page structure"
- Longer-horizon ideas: `todo.md`
- Experiment notes: `experiment_log.md`
- Narrative history: `git log`
