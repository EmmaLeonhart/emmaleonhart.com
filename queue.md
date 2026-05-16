# emmaleonhart.com — Work Queue

**This file is a queue, not a state snapshot.** Only work that is pending right now. Done work → deleted (it lives in `git log`). Spec / long-haul / parked → `todo.md`. No checkmarks, no status narration, no "done" notes.

See `CLAUDE.md` § "Workflow Rules". Visual-identity spec + the confirmed kit live in the living style guide at `/branding` and in `todo.md`.

---

## SCHEDULED (+2.5h LOCAL cron) — comprehensive doc/queue barrel-through. DO NOT RUN EARLY.

This is the full spec for a LOCAL one-shot session cron set ~2.5h
after 2026-05-16 ~16:1X local. **Nothing here runs before the cron.**
If the session/usage dies and the cron never fires, a human (or a
fresh session) runs the steps below by hand. Self-contained on purpose.

**cleanvibe version reality (already established, don't re-derive):**
- PyPI latest = `0.5.0` (`pip install -U` cannot go higher).
- Newest = `1.0.0` in `repos/cleanvibe` (UNpublished). It will NOT
  `pip install` (wheel build fails); run from source instead:
  `PYTHONPATH=repos/cleanvibe py -c "import sys;from cleanvibe.cli import main;sys.argv=['cleanvibe','new','NAME','--no-claude'];main()"`.
- Reference scaffolds already generated, gitignored: `_refscaffold/refproj`
  (0.5.0), `_refscaffold2/refproj2` (1.0.0). The clarity bar = the
  "Queue and longer-horizon work" forward-flow section.
- **cleanvibe has NO built-in "completed tasks → devlog" feature**
  (grep-verified, 0.5.0 and 1.0.0). The devlog migration below is a
  MANUAL convention. `repos/loka` and `repos/sutra` already keep a
  `DEVLOG.md`; reuse it there, create one where absent.

**Already DONE + pushed (do NOT redo):** the forward-flow "Queue and
longer-horizon work" section was added to CLAUDE.md of
emmaleonhart.com, loka (32285ac), latent-space-cartography (a3eab06),
vibecoding-tutorial (a2efd0a — note its file is lowercase `claude.md`).

**Audit of ACTUAL queue.md violations (2026-05-16):**
- VIOLATORS (bloated, tracking done-status): querykey 882 lines/93
  done-hits · loka 369/57 · alignment 274/9 · sutra 233/21.
- OK (small/clean): yantra 53 · cleanvibe 23 · emmaleonhart.com ~52.
- lsc + vibecoding-tutorial have no queue.md (CLAUDE.md now documents
  the convention; queue.md is created when concrete work is queued).

**What the +2.5h cron MUST do:**
1. Pull EVERY repo fresh from its remote first (emmaleonhart.com +
   all 8 submodules, each on its branch; `git pull --ff-only`).
2. For each repo with a violating queue.md (querykey, loka, alignment,
   sutra — and re-check the others), barrel queue.md down to ONLY
   live, concrete, in-scope steps. Move completed / superseded /
   status-narration / worth-keeping history into that repo's
   `DEVLOG.md` (create if missing). `todo.md` holds abstract/parked.
   Verify CLAUDE.md has the forward-flow section (add if missing).
3. **SUTRA SPECIAL RULE:** do NOT touch the "super active" personal /
   substrate-dispute / vision notes, nor any CLAUDE.md substance,
   code, claims, or math. Only relocate clearly-DONE *operational*
   queue items into `DEVLOG.md`; preserve every dispute/vision note
   verbatim. Be maximally conservative — when unsure, leave it.
4. Commit + push EACH touched repo to its OWN remote (loka=main,
   querykey=main, others=master; fetch+rebase if branch moved).
   Bump submodule pointers in emmaleonhart.com; commit + push it.
   Verify local HEAD == origin for every repo.
5. Delete this whole section from emmaleonhart.com queue.md in that
   same commit; mark the matching task completed.
LOCAL session-only cron `483ad7bb` (~18:38 local 2026-05-16) — fires
only while this session is alive + machine awake. If it does not fire,
run the steps above by hand.

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
