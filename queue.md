# emmaleonhart.com — Work Queue

**This file is a queue, not a state snapshot.** It lists what is being worked on right now. Finished work lives in `git log` (and `experiment_log.md` if applicable). Longer-horizon ideas live in `todo.md`. When an item is done, delete it — no checkmarks, no status indicators.

**Why this file exists:** when a planning step produces a plan, that plan is written here BEFORE execution starts. An interrupted session can pick up from the queue rather than from chat context.

See `CLAUDE.md` § "Workflow Rules" for how this file, planning mode, and the task tool stay in sync.

---

## Active

### Research page rewrite + site-wide SutraDB scrub

User directives:
- `/research/`: ONE clear ordered list, no "standalone vs in-project" split
  (that buries the lead). Remove deleuze-claw4S entirely. Order by quality:
  1 Sutra, 2 Latent Space Cartography, 3 Loka, 4 Redemption-Realignment,
  5 Yantra. (LSC will drop below Loka eventually but NOT yet — keep #2.)
- "SutraDB" must not appear on the site at all (old name, now confusing;
  Loka is qualitatively different, not a rename). Scrub: index.html
  (meta/bio/flagship/research/hub), theory/* text+titles+meta, README,
  CLAUDE, resume.md, github_bio/readme.md. Replace name → Loka where it's
  the DB project. Do NOT rename the `/theory/sutradb/` URL path (would break
  links) — flag as a follow-up. Theory technical content not re-verified for
  current Loka — flag in todo.
- Loka repo: scrub SutraDB there too (separate repo). Assess extent; the old
  name should be gone repo-wide.
- Check whether a standalone `EmmaLeonhart/SutraDB` repo exists (github_bio
  links to it) and repoint to Loka.

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
