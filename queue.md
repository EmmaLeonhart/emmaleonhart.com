# emmaleonhart.com — Work Queue

**This file is a queue, not a state snapshot.** It lists what is being worked on right now. Finished work lives in `git log` (and `experiment_log.md` if applicable). Longer-horizon ideas live in `todo.md`. When an item is done, delete it — no checkmarks, no status indicators.

**Why this file exists:** when a planning step produces a plan, that plan is written here BEFORE execution starts. An interrupted session can pick up from the queue rather than from chat context.

See `CLAUDE.md` § "Workflow Rules" for how this file, planning mode, and the task tool stay in sync.

---

## Active

### DONE & committed
- Research page rewrite; site-wide SutraDB scrub.
- Star-ranking system: `data/projects.json`, `scripts/rank_projects.py`
  (run with `py`, NOT python), AUTO markers in projects+index, hover dropdown
  in the top bar, `.github/workflows/rank-projects.yml` (weekly+manual).
  Current order Sutra,Loka,Yantra,QueryKey,Alignment,LatentSpace. Regenerating
  the QueryKey card from projects.json also scrubbed Secretarybird off the site.
- `py` (not `python`) recorded in CLAUDE.md + memory.
- Resolved: there is no standalone SutraDB repo — `EmmaLeonhart/SutraDB`
  redirects to `EmmaLeonhart/Loka` (it was renamed). github_bio already → Loka.

### Remaining content scrubs (safe, do via gh API — no clones)
- **querykey repo**: rewrite README without Secretarybird (drop lineage /
  "note on the name"); scrub `site/index.html` note. Prose/UI only — renaming
  the Go module / Flutter pkg / `secretarybird-old/` dir is a separate
  breaking refactor (flag, don't silently do).
- **Loka repo**: scrub `SutraDB` repo-wide AND remove `RamaDB` (a cancelled
  project) from the Loka website/`pages/` + docs.
- /theory/sutradb/ URL path still literally says sutradb (kept to avoid link
  breakage) — flagged; theory content not re-verified for current Loka.

### DONE: latent-space LFS
Background agent removed the vendored gguf + LFS rule, repointed Modelfile/
README/SKILL to ollama + HuggingFace (5 API commits, verified). No history
rewrite — unnecessary for LFS (git only held a ~130B pointer).

### Scheduled (self-executing, do not redo)
- Monthly /research/ arxiv-link audit (remote routine, earlier).
- One-time ~6.5h (2026-05-16 03:24Z): build /skills directory from latest
  state of all repos. trig_018XAU18fNfRnjB5Y3WA6si2.
- One-time ~90m (2026-05-15 22:29Z): latent-space-cartography — paper/PDF +
  clawRxiv CI modeled on Sutra, pin ollama+mxbai to discovery-date versions,
  drift-check GHA (pinned vs current → is the [UNK] defect fixed?), document
  in SKILL.md. trig_01De7cjBVmwqdYnXg7p2Crwz.
- Hourly LOCAL subdomain health check: session cron c0e659c7 (:07, 7-day
  expire). First run done: yantra 200; other 5 DNS-resolve fine (local+8.8.8.8)
  but no HTTPS yet = GitHub Pages cert/verification timing, NOT local.

### Remaining real work
1. **Loka repo**: scrub `SutraDB` repo-wide AND remove `RamaDB` (cancelled
   project) from the Loka website/pages + docs. Safe, via gh API.
2. **Submodules**: add the 6 project repos under `repos/` in emmaleonhart.com
   (Pages only serves pages/, so safe), modeled on Yantra's Sutra-submodule
   docs + an editing-workflow note. latent-space is now lean (LFS removed).
3. Flagged, not done by design: querykey deep code-identifier rename (Go
   module / `secretarybird-old/` dir) — separate breaking refactor; and the
   `/theory/sutradb/` URL path still literally says sutradb.

### Research-page auto-audit routine

Top bar + `/research/` page done & pushed. `todo.md` now tracks fleshing out
the research index. A scheduled remote agent (via the `schedule` skill) audits
`/research/` ~monthly: when referenced repos gain arXiv / Google Scholar links,
replace the clawRxiv / personal-subdomain links so the page doesn't go stale.

### Subdomain sites — verification pending

All repo-side work pushed. Old domains redirect (registrar-side, user did it),
so the Sutra/Loka repoint is lossless.

Done: Sutra `docs/CNAME`→sutra., Loka `pages/CNAME`→loka.,
latent-space-cartography new `docs/CNAME`→latent-space.,
querykey/Yantra/alignment each got `site/` + `site/CNAME` +
`.github/workflows/pages.yml` (Pages source=GitHub Actions), repo homepages
set, alignment README Website line, and alignment added as the 6th card on
`/projects/` + landing hub + README.

Remaining: confirm the querykey/Yantra/alignment pages.yml runs went green and
the six subdomains resolve once DNS finishes propagating (user's side).

---

## Pointers

- Page-by-page layout: `CLAUDE.md` § "Page structure"
- Longer-horizon ideas: `todo.md`
- Experiment notes: `experiment_log.md`
- Narrative history: `git log`
