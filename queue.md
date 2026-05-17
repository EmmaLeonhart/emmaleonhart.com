# emmaleonhart.com — Work Queue

**This file is a queue, not a state snapshot.** Only work pending right now. Done work → deleted (it lives in `git log`). Spec / long-haul / parked → `todo.md`. No checkmarks, no status narration, no "done" notes.

See `CLAUDE.md` § "Workflow Rules". Visual-identity spec + confirmed kit live in `/branding` + `todo.md`.

---

## Sister queue.md barrel-through (was dcaabdf1 step 2 — still pending)

The bloated sister `queue.md`s still need barreling. Audit 2026-05-16:
querykey 882 lines/93 done-hits, loka 369/57, alignment 274/9,
sutra 233/21 (OK: yantra 53, cleanvibe 23). Not rushed under tight
usage because destructively rewriting 4 mature repos' live queues is
exactly where context gets lost. Do it deliberately, one repo at a
time:

- Per violator: move clearly-DONE / superseded / status-narration /
  worth-keeping history into that repo's `DEVLOG.md` (loka & sutra
  already have one; cleanvibe ships `devlog.md` as of v1.1.0 — its
  convention: done = delete from queue.md + dated devlog entry, same
  commit). Barrel `queue.md` down to only live concrete steps.
- Ensure each CLAUDE.md has the forward-flow "Queue and longer-horizon
  work" section (present: emmaleonhart.com, loka, lsc,
  vibecoding-tutorial; check the rest).
- **SUTRA SPECIAL RULE:** never touch vision / substrate-dispute /
  personal / CLAUDE.md substance / code / math; only relocate
  clearly-DONE *operational* items. When unsure, leave it.
- Commit + push each repo to its OWN remote; bump pointers; verify
  local==origin. querykey already pruned 882→clean once (Round 14 per
  its CLAUDE.md) and regrew — it is the priority.

## Bio-sync — Emma action required (one-time)

Diagnosis (2026-05-16): EmmaLeonhart/EmmaLeonhart IS the profile-README
repo (default branch `main`, ~39 commits, content roughly current); it
has a `.github/workflows/` dir but deeper CI status (is
`sync-from-website.yml` failing or disabled?) is not determinable here
— `gh` is unauthenticated and Actions run pages are JS-rendered.
Pragmatic fix shipped instead: a push-from-here fallback,
`.github/workflows/sync-profile-readme.yml`, that syncs
`github_bio/readme.md` into the profile README between
`<!-- BIO:START -->`/`<!-- BIO:END -->` markers.

**Emma must, one-time, for the fallback to run:**
1. Set repo secret `PROFILE_README_TOKEN` (fine-grained PAT,
   contents:write on EmmaLeonhart/EmmaLeonhart) at
   https://github.com/EmmaLeonhart/emmaleonhart.com/settings/secrets/actions
2. Ensure Actions are enabled on the profile repo:
   https://github.com/EmmaLeonhart/EmmaLeonhart/settings/actions
Then trigger once via the workflow's `workflow_dispatch` to verify.

## master → main rename (was dbd1ff12) — MANUAL, blocked on a GitHub PAT

Flipping a repo's default branch needs the GitHub API/UI; `gh` is NOT
authenticated here and there is no REST PAT. Pushing `main` while
unable to flip the default + Pages source would BREAK the live site
and CI, so this was NOT auto-run (the spec's own safety clause:
no PAT → leave a manual TODO, don't delete `master`).

Repos to flip (loka, querykey already `main` — skip):
emmaleonhart.com, alignment, cleanvibe, latent-space-cartography,
sutra (README/CLAUDE text only — conservative), vibecoding-tutorial
(lowercase `claude.md`), yantra.

Per repo, Emma (or a PAT-equipped run): Settings → Branches →
rename `master` → `main`
(`https://github.com/EmmaLeonhart/<repo>/settings/branches`); for
emmaleonhart.com also flip Pages source branch to `main`
(https://github.com/EmmaLeonhart/emmaleonhart.com/settings/pages).
THEN a session can: update `.github/workflows/*.yml` + CLAUDE.md /
claude.md branch refs master→main, `git remote set-head origin main`,
bump pointers, verify. Do NOT `git push origin --delete master` until
the GitHub default + Pages are confirmed `main`.

---

## Pointers

- Visual-identity spec, confirmed kit, P3/P4 long-haul, parked items: `todo.md` + the living `/branding` page.
- Page-by-page layout: `CLAUDE.md` § "Page structure".
- Resolved diagnostics + narrative history: `experiment_log.md`, `git log`.
