# emmaleonhart.com — Work Queue

**This file is a queue, not a state snapshot.** Only work that is pending right now. Done work → deleted (it lives in `git log`). Spec / long-haul / parked → `todo.md`. No checkmarks, no status narration, no "done" notes.

See `CLAUDE.md` § "Workflow Rules". Visual-identity spec + the confirmed kit live in the living style guide at `/branding` and in `todo.md`.

---

## Pending

Three LOCAL one-shot session crons remain. They are **session-only** —
each fires only while this Claude session is alive and the machine is
awake; if one is missed, run its steps by hand.

- **Cron 4 `32aecc22` (~16:09) — visual-identity rollout.** Take the
  final `/branding` + canonical `pages/identity.css` and propagate:
  re-sync every sister `identity.css` byte-for-byte
  (loka/querykey/alignment/yantra/vibecoding/cleanvibe); map the same
  tokens into Sutra's Material `docs/stylesheets/identity.css`; apply
  the aurora-box + emoji card convention + the cosmic glyph to each
  site's existing card grids / hero; copy `pages/404.html` into every
  sister publish dir. Commit + push each repo to its OWN remote; bump
  submodule pointers; verify local==origin. NOT Loka HTML restructure.

- **Cron C `679b53ea` (~19:37) — cleanvibe follow-up.** If cleanvibe
  origin/master moved since integration: pull, refine its `pages/`
  site + re-sync identity.css, push + bump pointer. Else no-op.

- **Cron D `c1d721d8` (~23:55) — cleanvibe new-release check.** If a
  new release/tag/commits: bump pointer + update its site +
  `data/projects.json` desc/tags, push. Else no-op.

Earlier remote routines (trig_01LUKG7…/01Vd1Uh3…/01LkDXSE…) are
DISABLED — delete fully at claude.ai/code/routines.


---

## Pointers

- Visual-identity spec, confirmed kit, P3/P4 long-haul, parked items: `todo.md` + the living `/branding` page.
- Page-by-page layout: `CLAUDE.md` § "Page structure".
- Resolved diagnostics + narrative history: `experiment_log.md`, `git log`.
