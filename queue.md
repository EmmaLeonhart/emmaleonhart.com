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

## master → main migration — essentially DONE (optional cleanup only)

emmaleonhart.com GitHub default = `main` (Emma flipped it; verified
live `git ls-remote --symref origin HEAD` → `refs/heads/main`,
2026-05-16). All 8 submodules re-pointed to their `main` HEAD
(cron `ec7863e6`); `git submodule status` clean. `main` is the
canonical/current branch everywhere; nothing deploys only from master.

Optional, low-priority, do when convenient (not blocking anything):
trim `pages.yml` + `sync-profile-readme.yml` triggers `[master, main]`
→ `[main]`; once a repo's GitHub default is confirmed `main`, delete
its now-unused `origin/master`. **Never delete a branch that is still
a repo's GitHub default.**

---

## Active cross-repo task: Loka site → common render pipeline

Sutra is done (MkDocs scrapped → 2 static pages on the shared
identity + Yantra-style header/footer; repos/sutra@…20fe9d6d; wipe
deploy verified green, later commits serialized in the Pages queue).

Now unifying the Loka website (Emma's explicit next task: Loka's
content is good and must be PRESERVED — only the render pipeline /
shell gets unified to match emmaleonhart.com + Yantra + Sutra).
Concrete staged plan + progress live in `repos/loka/queue.md`
(Loka has its own CLAUDE.md/queue rules — follow them; push to
Loka `main`). Loka is a 41-page static site; this is multi-session.

Note: sister-subdomain pushes can stay invisible until Emma's manual
GitHub Pages custom-domain re-set — verify the push landed, don't
just re-push. Optionally re-confirm the two later Sutra Pages runs
(4161e8dc, 20fe9d6d) went green once the queue drains.

## Pointers

- Visual-identity spec, confirmed kit, P3/P4 long-haul, parked items: `todo.md` + the living `/branding` page.
- Page-by-page layout: `CLAUDE.md` § "Page structure".
- Resolved diagnostics + narrative history: `experiment_log.md`, `git log`.
