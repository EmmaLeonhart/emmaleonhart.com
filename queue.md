# emmaleonhart.com — Work Queue

**This file is a queue, not a state snapshot.** It lists what is being worked on right now. Finished work lives in `git log` (and `experiment_log.md` if applicable). Longer-horizon ideas live in `todo.md`. When an item is done, delete it — no checkmarks, no status indicators.

**Why this file exists:** when a planning step produces a plan, that plan is written here BEFORE execution starts. An interrupted session can pick up from the queue rather than from chat context.

See `CLAUDE.md` § "Workflow Rules" for how this file, planning mode, and the task tool stay in sync.

---

## Active

### Subdomain consolidation — external repos

Projects page (`pages/projects/index.html`) + landing-page link + docs are
done and pushed. Remaining: the five external project repos.

Subdomain → repo map:

- sutra.emmaleonhart.com → `EmmaLeonhart/Sutra` (was sutralang.dev)
- loka.emmaleonhart.com → `EmmaLeonhart/Loka` (was sutradb.org)
- querykey.emmaleonhart.com → `EmmaLeonhart/querykey` (homepage already set)
- yantra.emmaleonhart.com → `EmmaLeonhart/Yantra` (had no domain)
- latent-space.emmaleonhart.com → `EmmaLeonhart/latent-space-cartography`
  (was emmaleonhart.github.io/latent-space-cartography)

For each repo: `gh repo edit` to set homepage to the subdomain, and edit the
README so the subdomain is the stated canonical domain, replacing the old one.
Commit + push each repo separately.

Open question for the user: `querykey` repo README is "Secretarybird Pivot"
(AI secretary) but the repo *description* says social network / PRM — they
conflict. Projects page was built from the README; user to reconcile.

---

## Pointers

- Page-by-page layout: `CLAUDE.md` § "Page structure"
- Longer-horizon ideas: `todo.md`
- Experiment notes: `experiment_log.md`
- Narrative history: `git log`
