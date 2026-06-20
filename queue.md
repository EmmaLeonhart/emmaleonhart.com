# emmaleonhart.com — Work Queue

**This file is a queue, not a state snapshot.** Only work pending right now. Done work → deleted (it lives in `git log`). Spec / long-haul / parked → `todo.md`. No checkmarks, no status narration, no "done" notes.

See `CLAUDE.md` § "Workflow Rules". Visual-identity spec + confirmed kit live in `/branding` + `todo.md`.

---

## Stuff Emma added

### Add YC Paxel report link to links hub + resume
Add `https://paxel.ycombinator.com/results/aqwnw8ig` (Emma's YC Paxel
Claude-Code usage profile) as a link card in `repos/links` (Professional
& Social) and as a link in `resume.md`. Push links repo to its `main`,
bump submodule pointer, push site.

### Links subdomain — ONE manual DNS step left (Emma-only)

Repo `EmmaLeonhart/links` created + pushed; mirrored as submodule `repos/links`;
Pages enabled (source `main` /, CNAME `links.emmaleonhart.com`, domain verified);
`pages/links/` is a redirect stub. **Remaining: Emma adds a DNS record** in the
provider that holds emmaleonhart.com — `CNAME  links → emmaleonhart.github.io`
(identical to the existing `reservoir`/`sutra`/`yantra` records). `links` is NOT
in DNS yet (`reservoir` resolves; `links` returns NXDOMAIN). Once it resolves,
GitHub provisions the HTTPS cert and the `/links` redirect lands on a live site.
Optionally then flip HTTPS-enforce on: `gh api -X PUT repos/EmmaLeonhart/links/pages -f https_enforced=true`.

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
