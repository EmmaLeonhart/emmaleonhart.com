# emmaleonhart.com — Work Queue

**This file is a queue, not a state snapshot.** Only work that is pending right now. Done work → deleted (it lives in `git log`). Spec / long-haul / parked → `todo.md`. No checkmarks, no status narration, no "done" notes.

See `CLAUDE.md` § "Workflow Rules". Visual-identity spec + the confirmed kit live in the living style guide at `/branding` and in `todo.md`.

---

## SCHEDULED (+5h LOCAL cron `dcaabdf1`) — sister-repo website links + bio sync + queue/doc barrel-through. DO NOT RUN EARLY.

LOCAL one-shot session cron set 2026-05-16 ~16:30 local, fires
~21:34 local same day. **Nothing here runs before the cron.** If the
session/usage dies and the cron never fires, a human (or a fresh
session) runs the steps below by hand. Self-contained on purpose.

**Repos in scope** (submodules under `repos/`): alignment, cleanvibe,
latent-space-cartography, loka, querykey, sutra, vibecoding-tutorial,
yantra. Default branches AT SCHEDULE TIME: loka=main, querykey=main,
all others=master — BUT the +8h cron `dbd1ff12` is flipping everything
to main at ~00:34 May 17. Always check `git remote show origin` before
assuming. Subdomains per `data/projects.json`. `gh` is NOT
authenticated; use raw git + WebFetch / GitHub REST API.

**What the +5h cron MUST do:**

1. PULL FRESH. `git pull --ff-only` for emmaleonhart.com + every
   submodule on its default branch. credential.helper=manager holds
   creds.

2. AUDIT + BARREL `queue.md` ACROSS SUBMODULES — folds in the
   previously-spec'd `483ad7bb` work (that cron is GONE with the
   prior session). Audit as of 2026-05-16: VIOLATORS (bloated, tracking
   done-status): querykey 882 lines/93 done-hits, loka 369/57,
   alignment 274/9, sutra 233/21. OK: yantra 53, cleanvibe 23,
   emmaleonhart.com ~52. lsc + vibecoding-tutorial have no queue.md.
   For each violator: barrel down to live concrete steps; move
   history to `DEVLOG.md` (create if missing — loka & sutra already
   have one); ensure CLAUDE.md has the forward-flow "Queue and
   longer-horizon work" section (already added to: emmaleonhart.com,
   loka 32285ac, lsc a3eab06, vibecoding-tutorial a2efd0a — note its
   file is lowercase `claude.md`). **SUTRA SPECIAL RULE:** do NOT
   touch vision / substrate-dispute / personal / CLAUDE.md substance /
   code / math; only move clearly-DONE *operational* items into
   DEVLOG.md. Maximally conservative — when unsure, leave it.

3. SISTER-REPO WEBSITE LINKS. For each project in `data/projects.json`,
   edit `repos/<name>/README.*` to PROMINENTLY link the official
   subdomain right under the title:
   - Sutra → https://sutra.emmaleonhart.com
   - Loka → https://loka.emmaleonhart.com
   - Yantra → https://yantra.emmaleonhart.com
   - QueryKey → https://querykey.emmaleonhart.com
   - Alignment → https://alignment.emmaleonhart.com
   - Latent Space Cartography → https://latent-space.emmaleonhart.com
   - Vibecoding Tutorial → https://vibecoding.emmaleonhart.com
   - cleanvibe → https://cleanvibe.emmaleonhart.com
   Skip if already correct. **Sutra exception:** README only, no
   substance edits. Commit + push each repo to its OWN remote.

4. BIO SYNC FIX. Canonical bio source in this repo is
   `github_bio/readme.md` (per `README.md`). EmmaLeonhart/EmmaLeonhart
   has `.github/workflows/sync-from-website.yml` that pulls it; Emma
   reports it isn't working.
   4a. DIAGNOSE: WebFetch
       https://github.com/EmmaLeonhart/EmmaLeonhart , its README raw
       URL, and `/actions`. Note whether Actions are disabled, the
       workflow is failing, or it isn't triggering. Record findings
       in a small "bio sync diagnosis" stub in queue.md before fixing.
   4b. ADD `.github/workflows/sync-profile-readme.yml` in
       emmaleonhart.com (a push-from-here fallback regardless of
       upstream state) that triggers on (a) daily `17 14 * * *` UTC,
       (b) push to master with paths
       `[github_bio/readme.md, .github/workflows/sync-profile-readme.yml]`,
       (c) `workflow_dispatch`. The job: checkout this repo, checkout
       EmmaLeonhart/EmmaLeonhart using secret `PROFILE_README_TOKEN`,
       replace only the region between `<!-- BIO:START -->` /
       `<!-- BIO:END -->` markers in its README (add markers on first
       sync, preserving everything else), diff, commit + push only if
       changed.
   4c. Leave a clear note here: Emma must set `PROFILE_README_TOKEN`
       (fine-grained PAT with contents:write on
       EmmaLeonhart/EmmaLeonhart) at
       https://github.com/EmmaLeonhart/emmaleonhart.com/settings/secrets/actions
       ; if Actions are disabled on EmmaLeonhart/EmmaLeonhart, enable
       at https://github.com/EmmaLeonhart/EmmaLeonhart/settings/actions.

5. COMMIT + PUSH each chunk to the right remote. Bump submodule
   pointers in emmaleonhart.com. Verify local HEAD == origin
   everywhere.

6. DELETE this whole `## SCHEDULED (+5h LOCAL cron …)` section from
   emmaleonhart.com queue.md in the same commit that completes the
   work (workflow rule).

LOCAL session-only cron `dcaabdf1` — fires only while this Claude
session is alive + machine awake. If it does not fire, run by hand.

## SCHEDULED (+8h LOCAL cron `dbd1ff12`) — rename `master` → `main` across emmaleonhart.com + submodules. DO NOT RUN EARLY.

LOCAL one-shot session cron set 2026-05-16 ~16:30 local, fires
~00:34 local 2026-05-17. **Nothing here runs before the cron.**

GOAL: standardize default branch on `main` everywhere. `master` causes
recurring tooling glitches (Emma's call 2026-05-16).

REPOS:
- emmaleonhart.com (master) — RENAME.
- repos/alignment (master) — RENAME.
- repos/cleanvibe (master) — RENAME.
- repos/latent-space-cartography (master) — RENAME.
- repos/loka (main) — SKIP, already main.
- repos/querykey (main) — SKIP, already main.
- repos/sutra (master) — RENAME, **maximally conservative** — only
  branch + workflow + CLAUDE.md text edits; no substance/vision/code/math.
- repos/vibecoding-tutorial (master, lowercase `claude.md`) — RENAME.
- repos/yantra (master) — RENAME.

Verify each with `git remote show origin | rg "HEAD branch"` before
acting — don't trust the list above blindly.

PROCEDURE per repo on master:
1. `git fetch && git checkout master && git pull --ff-only`
2. `git branch -m master main`
3. `git push -u origin main`
4. Flip the GitHub default branch via REST API:
   `curl -u <user>:<PAT> -X PATCH https://api.github.com/repos/EmmaLeonhart/<repo> -d '{"default_branch":"main"}'`.
   If no PAT is available, DO NOT delete origin/master — leave a
   queue.md TODO listing each repo with a direct
   `https://github.com/EmmaLeonhart/<repo>/settings/branches` link for
   Emma to flip manually, and stop on that repo.
5. Only after GitHub default is confirmed `main`:
   `git push origin --delete master`. Verify
   `git remote show origin` → HEAD branch=main, no master.
6. `git remote set-head origin main`.
7. Update `.github/workflows/*.yml` branch refs from master → main.
   For emmaleonhart.com itself: also flip Pages source branch to
   `main` at https://github.com/EmmaLeonhart/emmaleonhart.com/settings/pages
   (UI or API). Update CLAUDE.md text: "deployed via GitHub Pages
   from the `pages/` directory on `master`" → `main`; the
   "Working in repos/ submodules" example commands; the
   "loka=main, querykey=main, all others=master" line.
8. For each submodule: update CLAUDE.md / claude.md references from
   master → main.
9. Update `.gitmodules` if any submodule has `branch = master` pinned
   (probably none).
10. Commit per repo ("branch: rename master → main") and push to
    origin/main.

OPEN-PR CHECK: WebFetch `https://github.com/EmmaLeonhart/<repo>/pulls`
for each. List any open PRs targeting master in queue.md — they need
their base rebased to main.

After all submodule renames: bump submodule pointers in
emmaleonhart.com root, commit, push. Verify local HEAD == origin for
every repo.

DELETE this whole `## SCHEDULED (+8h LOCAL cron …)` section from
emmaleonhart.com queue.md in the same commit that completes the work.

SAFETY: don't `--no-verify`, don't force-push. If anything is
ambiguous, leave a TODO and continue rather than block.

LOCAL session-only cron `dbd1ff12` — fires only while this Claude
session is alive + machine awake. If it does not fire, run by hand.

## Pending

The three previously-listed crons (`32aecc22` visual-identity rollout,
`679b53ea` cleanvibe follow-up, `c1d721d8` cleanvibe new-release check)
are GONE with the prior session — CronList is empty as of 2026-05-16
~16:30 local. Their work is still pending; a human (or fresh session)
runs the steps below by hand, or re-schedules. Session-only crons do
not survive a restart.

- **Visual-identity rollout (was `32aecc22`).** Take the final
  `/branding` + canonical `pages/identity.css` and propagate: re-sync
  every sister `identity.css` byte-for-byte
  (loka/querykey/alignment/yantra/vibecoding/cleanvibe); map the same
  tokens into Sutra's Material `docs/stylesheets/identity.css`; apply
  the aurora-box + emoji card convention + the cosmic glyph to each
  site's existing card grids / hero; copy `pages/404.html` into every
  sister publish dir. Commit + push each repo to its OWN remote; bump
  submodule pointers; verify local==origin. NOT Loka HTML restructure.

- **cleanvibe follow-up (was `679b53ea`).** If cleanvibe origin/master
  moved since integration: pull, refine its `pages/` site + re-sync
  identity.css, push + bump pointer. Else no-op.

- **cleanvibe new-release check (was `c1d721d8`).** If a new
  release/tag/commits: bump pointer + update its site +
  `data/projects.json` desc/tags, push. Else no-op.

Earlier remote routines (trig_01LUKG7…/01Vd1Uh3…/01LkDXSE…) are
DISABLED — delete fully at claude.ai/code/routines.


---

## Pointers

- Visual-identity spec, confirmed kit, P3/P4 long-haul, parked items: `todo.md` + the living `/branding` page.
- Page-by-page layout: `CLAUDE.md` § "Page structure".
- Resolved diagnostics + narrative history: `experiment_log.md`, `git log`.
