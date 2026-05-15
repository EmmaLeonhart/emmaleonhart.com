# emmaleonhart.com — Work Queue

**This file is a queue, not a state snapshot.** It lists what is being worked on right now. Finished work lives in `git log` (and `experiment_log.md` if applicable). Longer-horizon ideas live in `todo.md`. When an item is done, delete it — no checkmarks, no status indicators.

**Why this file exists:** when a planning step produces a plan, that plan is written here BEFORE execution starts. An interrupted session can pick up from the queue rather than from chat context.

See `CLAUDE.md` § "Workflow Rules" for how this file, planning mode, and the task tool stay in sync.

---

## Active

### Subdomain sites — verification pending

All repo-side work pushed. Old domains redirect (registrar-side, user did it),
so the Sutra/Loka repoint is lossless.

Done: Sutra `docs/CNAME`→sutra., Loka `pages/CNAME`→loka.,
latent-space-cartography new `docs/CNAME`→latent-space.,
querykey/Yantra/alignment each got `site/` + `site/CNAME` +
`.github/workflows/pages.yml` (Pages source=GitHub Actions), repo homepages
set, alignment README Website line, and alignment added as the 6th card on
`/projects/` + landing hub + README.

Remaining: confirm the querykey/Yantra/alignment pages.yml runs went green and
the six subdomains resolve once DNS finishes propagating (user's side).

---

## Pointers

- Page-by-page layout: `CLAUDE.md` § "Page structure"
- Longer-horizon ideas: `todo.md`
- Experiment notes: `experiment_log.md`
- Narrative history: `git log`
