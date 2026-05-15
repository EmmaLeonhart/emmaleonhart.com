# emmaleonhart.com — Work Queue

**This file is a queue, not a state snapshot.** It lists what is being worked on right now. Finished work lives in `git log` (and `experiment_log.md` if applicable). Longer-horizon ideas live in `todo.md`. When an item is done, delete it — no checkmarks, no status indicators.

**Why this file exists:** when a planning step produces a plan, that plan is written here BEFORE execution starts. An interrupted session can pick up from the queue rather than from chat context.

See `CLAUDE.md` § "Workflow Rules" for how this file, planning mode, and the task tool stay in sync.

---

## Active

### Remaining content scrubs (safe, do via gh API — no clones)
- **querykey repo**: README scrubbed of Secretarybird (done). Still flagged: deep code-identifier rename (Go module / Flutter pkg / `secretarybird-old/` dir) is a separate breaking refactor.
- **Loka repo**: scrub `SutraDB` repo-wide AND remove `RamaDB` (a cancelled project) from the Loka website/`pages/` + docs.
- `/theory/sutradb/` URL path still literally says sutradb (kept to avoid link breakage) — flagged; theory content not re-verified for current Loka.

### Scheduled (self-executing, do not redo)
- Monthly /research/ arxiv-link audit (remote routine).
- One-time ~6.5h (2026-05-16 03:24Z): build /skills directory from latest state of all repos. trig_018XAU18fNfRnjB5Y3WA6si2.
- One-time ~90m (2026-05-15 22:29Z): latent-space-cartography — paper/PDF + clawRxiv CI modeled on Sutra, pin ollama+mxbai to discovery-date versions, drift-check GHA (pinned vs current → is the [UNK] defect fixed?), document in SKILL.md. trig_01De7cjBVmwqdYnXg7p2Crwz. **User flagged this one as load-bearing and at risk of not firing because they changed computers — verify the latent-space-cartography repo got the edits after the timer; if not, do it manually.**
- Hourly LOCAL subdomain health check: session cron c0e659c7 (:07, 7-day expire). yantra 200; other 5 DNS-resolve fine but no HTTPS yet = GitHub Pages cert/verification timing, NOT local. Awaits GitHub cert provisioning.

### Remaining real work
1. **Loka repo**: scrub `SutraDB` repo-wide AND remove `RamaDB` (cancelled project) from the Loka website/pages + docs. Safe, via gh API.
2. **Submodules**: add the 6 project repos under `repos/` in emmaleonhart.com (Pages only serves pages/, so safe), modeled on Yantra's Sutra-submodule docs + an editing-workflow note. latent-space is now lean (LFS removed).
3. Flagged, not done by design: querykey deep code-identifier rename (Go module / `secretarybird-old/` dir) — separate breaking refactor; and the `/theory/sutradb/` URL path still literally says sutradb.

### Subdomain sites — verification pending
Confirm querykey/Yantra/alignment pages.yml runs went green and the six subdomains resolve once GitHub's HTTPS cert/domain-verification finishes provisioning.

---

## Pointers

- Page-by-page layout: `CLAUDE.md` § "Page structure"
- Longer-horizon ideas: `todo.md`
- Experiment notes: `experiment_log.md`
- Narrative history: `git log`
