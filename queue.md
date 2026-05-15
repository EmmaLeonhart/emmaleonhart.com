# emmaleonhart.com — Work Queue

**This file is a queue, not a state snapshot.** It lists what is being worked on right now. Finished work lives in `git log` (and `experiment_log.md` if applicable). Longer-horizon ideas live in `todo.md`. When an item is done, delete it — no checkmarks, no status indicators.

**Why this file exists:** when a planning step produces a plan, that plan is written here BEFORE execution starts. An interrupted session can pick up from the queue rather than from chat context.

See `CLAUDE.md` § "Workflow Rules" for how this file, planning mode, and the task tool stay in sync.

---

## Active

### Awaiting user decision: querykey identity

Subdomain consolidation is done (projects page + landing link + all five
repo homepages + READMEs pushed). One unresolved item:

`EmmaLeonhart/querykey` has conflicting identities:
- README title: "Secretarybird Pivot" — an AI secretary that manages team
  communication (Flutter + OpenClaw).
- GitHub repo *description*: "QueryKey is a social network you run locally
  from your desktop … PRM … local AI agents."

`pages/projects/index.html` currently describes it from the README
(Secretarybird). Once the user says which is canonical: align the projects-page
card, the repo description, and the README to match.

---

## Pointers

- Page-by-page layout: `CLAUDE.md` § "Page structure"
- Longer-horizon ideas: `todo.md`
- Experiment notes: `experiment_log.md`
- Narrative history: `git log`
