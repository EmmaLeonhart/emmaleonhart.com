# devlog

Dated entries from the work-loop cron. Older history lives in `git log` and `experiment_log.md`.

## 2026-10-09

- Added the YC Paxel report card to the links hub (repos/links b2bc381). resume.md already carried the link, so only the hub was missing it.
- Diagnosed the failing submodule-bump workflow: alignment pins model-organisms-for-EM to ed36b0d6, which that remote lacks. Queued, not fixed.

## 2026-10-20

- Doc cleanup, done from the topaz-submodules session at Emma's request. CLAUDE.md and README.md now list the submodules that `.gitmodules` actually has (repos/: loka, querykey, alignment, latent-space-cartography, vibecoding-tutorial, cleanvibe, reservoir, links; redirects/: six stubs) instead of the old set with Sutra and Yantra. The CLAUDE.md branch note now says the default is `main` (checked with `gh repo view`); the leftover `master` trigger in `pages.yml` and `origin/master` are named as optional cleanup.
- `pages.yml` now triggers on `main` only (was `[master, main]`). Done from the topaz-submodules session's work loop: the migration to `main` is finished, so the `master` trigger could only deploy a stale branch. `origin/master` itself is left for Emma (branch deletion).
- Deleted stale remote branches at Emma's answer "Delete master and claude/*". Last commits, for restoring any of them (`git push origin <sha>:refs/heads/<name>` while the objects exist): master 6bac4d5, claude/add-database-tutorials-4AvjF 8645d04, claude/attention-matrix-learning-7SttK 296bcad, claude/complete-mlp-page-M7lS7 e890ecd, claude/debug-https-config-1fkTq 4687f48, claude/fix-homepage-mobile-custom-axis-fCRh4 6f376fd, claude/fix-sutradb-url-LcGPf 2d977ae, claude/implement-paper-algorithm-JfLRC 0e842b8, claude/investigate-https-issue-IEZn6 1d9b1c2, claude/remove-shinto-wiki-3sssr 54bf0d8. Seven of the claude branches had no commits off main. master's one extra commit (a resume clawRxiv ID fix) edits a line main no longer has. claude/attention-matrix-learning held three planning notes (Lecture 9 attention notes, authority-control design and implementation notes, about 600 lines) found nowhere on main, so tag `archive/claude-attention-matrix-learning` keeps them before the branch went. `EmmaLeonhart-patch-1` was not in the request and is untouched.

