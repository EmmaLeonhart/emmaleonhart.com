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

### Big / needs-confirmation (asked the user)
- **Submodules**: add the project repos as git submodules of emmaleonhart.com
  so editing happens here without re-cloning; model the layout/docs on how
  Yantra vendors Sutra. Caveats from user: latent-space has an awkward
  structure (maybe symlinks); other repos don't currently use submodules;
  Sutra→Loka submodule is "lean no".
- **latent-space-cartography LFS**: remove committed model weights; point to
  the HuggingFace model + ollama instead. History-rewrite vs HEAD-only is a
  destructive decision — confirm before doing. Do this BEFORE adding it as a
  submodule (else the submodule is huge).

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
