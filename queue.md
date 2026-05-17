# emmaleonhart.com — Work Queue

**This file is a queue, not a state snapshot.** Only work pending right now. Done work → deleted (it lives in `git log`). Spec / long-haul / parked → `todo.md`. No checkmarks, no status narration, no "done" notes.

See `CLAUDE.md` § "Workflow Rules". Visual-identity spec + confirmed kit live in `/branding` + `todo.md`.

---

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

## master → main migration — status + the ONE thing only Emma can do

Done by automation (2026-05-16): emmaleonhart.com has a `main` branch
on origin (mirror of master, `5aa80954a`), local is on `main`,
`pages.yml` + `sync-profile-readme.yml` trigger on `[master, main]`,
Pages is Actions-based (no branch "source" to flip), CLAUDE.md
documents the migration. So nothing deploys *only* from master and
`main` is fully wired.

**Live remote check 2026-05-16 ~21:00: emmaleonhart.com GitHub default
is STILL `master`** (`git ls-remote --symref origin HEAD`). Submodule
defaults already flipped by Emma: sutra/loka/querykey/alignment/
vibecoding=main; yantra/lsc/cleanvibe still master (but `main` exists
on all 8).

**ONLY remaining blocker (Emma, UI — agent has no PAT):** emmaleonhart.com
→ Settings → Branches → set default to `main`
(https://github.com/EmmaLeonhart/emmaleonhart.com/settings/branches).
For the still-master submodules likewise flip their default.
AFTER a repo's GitHub default is confirmed `main`, a session may:
trim `pages.yml`/`sync-profile-readme.yml` to `[main]`,
`git push origin --delete master`, `git remote set-head origin main`,
update remaining CLAUDE/claude.md `master` text. Do NOT delete any
`origin/master` before its GitHub default is confirmed `main`
(destructive — emmaleonhart.com default is still master right now).

Submodule gitlink re-point to each repo's `main` HEAD is handled by
LOCAL one-shot cron `ec7863e6` (~21:29 local 2026-05-16; session-only).

---

## Pointers

- Visual-identity spec, confirmed kit, P3/P4 long-haul, parked items: `todo.md` + the living `/branding` page.
- Page-by-page layout: `CLAUDE.md` § "Page structure".
- Resolved diagnostics + narrative history: `experiment_log.md`, `git log`.
