# devlog

Dated entries from the work-loop cron. Older history lives in `git log` and `experiment_log.md`.

## 2026-10-09

- Added the YC Paxel report card to the links hub (repos/links b2bc381). resume.md already carried the link, so only the hub was missing it.
- Diagnosed the failing submodule-bump workflow: alignment pins model-organisms-for-EM to ed36b0d6, which that remote lacks. Queued, not fixed.

## 2026-10-20

- Doc cleanup, done from the topaz-submodules session at Emma's request. CLAUDE.md and README.md now list the submodules that `.gitmodules` actually has (repos/: loka, querykey, alignment, latent-space-cartography, vibecoding-tutorial, cleanvibe, reservoir, links; redirects/: six stubs) instead of the old set with Sutra and Yantra. The CLAUDE.md branch note now says the default is `main` (checked with `gh repo view`); the leftover `master` trigger in `pages.yml` and `origin/master` are named as optional cleanup.
- `pages.yml` now triggers on `main` only (was `[master, main]`). Done from the topaz-submodules session's work loop: the migration to `main` is finished, so the `master` trigger could only deploy a stale branch. `origin/master` itself is left for Emma (branch deletion).

