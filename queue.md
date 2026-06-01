# emmaleonhart.com — Work Queue

**This file is a queue, not a state snapshot.** Only work pending right now. Done work → deleted (it lives in `git log`). Spec / long-haul / parked → `todo.md`. No checkmarks, no status narration, no "done" notes.

See `CLAUDE.md` § "Workflow Rules". Visual-identity spec + confirmed kit live in `/branding` + `todo.md`.

---

## Stuff Emma added

### Links subdomain — finish wiring (BLOCKED on Emma + me)

Standalone links repo is built and committed locally at `../links` (remote set to
`https://github.com/EmmaLeonhart/links.git`, not yet pushed — repo doesn't exist).
`pages/links/` is now a redirect stub → `links.emmaleonhart.com`.

Remaining, in order:
1. **Emma:** create empty `EmmaLeonhart/links` repo on GitHub (no README/files).
2. **Me, once #1 done:** `cd ../links && git push -u origin main`, then in this repo
   `git submodule add https://github.com/EmmaLeonhart/links repos/links` + commit/push.
3. **Emma:** repo Settings → Pages → custom domain `links.emmaleonhart.com`; add DNS
   CNAME `links` → `emmaleonhart.github.io` (same as the other subdomains).
   Until this is live the `/links` redirect points at a not-yet-served subdomain.

## master → main migration — essentially DONE (optional cleanup only)

emmaleonhart.com GitHub default = `main` (Emma flipped it; verified
live `git ls-remote --symref origin HEAD` → `refs/heads/main`,
2026-05-16). All 8 submodules re-pointed to their `main` HEAD
(cron `ec7863e6`); `git submodule status` clean. `main` is the
canonical/current branch everywhere; nothing deploys only from master.

Optional, low-priority, do when convenient (not blocking anything):
trim the `pages.yml` trigger `[master, main]` → `[main]`; once a
repo's GitHub default is confirmed `main`, delete its now-unused
`origin/master`. **Never delete a branch that is still a repo's
GitHub default.**

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
