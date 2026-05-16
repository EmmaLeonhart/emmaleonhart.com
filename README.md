# emmaleonhart.com

Personal website and interactive tools, deployed via GitHub Pages.

## GitHub profile sync

`github_bio/readme.md` is the source of truth for the README on [github.com/EmmaLeonhart](https://github.com/EmmaLeonhart). A daily GitHub Action in the `EmmaLeonhart/EmmaLeonhart` profile repo (`.github/workflows/sync-from-website.yml`) copies that file over, so the profile bio can be edited from this monorepo.

## Pages

- `/` — Landing page: bio, flagship project (Sutra), and research directions framed by Emma's three linked goals — neurosymbolic AI, AI interpretability, and AI safety. Geometric tensor languages, Loka, Wikidata / Pramana / Aelaki, and the tutorials are positioned as the *means* toward those goals.
- `/projects/` — Projects hub: the six subdomain projects (Sutra, Loka, QueryKey, Yantra, Latent Space Cartography, Alignment), each linking to its own `*.emmaleonhart.com` subdomain and GitHub repo.
- `/research/` — Research hub: an evolving index of standalone papers (Latent Space Cartography, redemption-realignment, deleuze-claw4S) and the research carried inside each project. Linked from the landing-page top bar.
- `/resume.html` and `/resume.pdf` — Auto-built from `resume.md` by `.github/workflows/pages.yml` on every push.
- `/tutorials/` — Hub for the 14 interactive ML visualizers (vector math, neural networks, training, architectures).
- `/theory/` — Loka theory visualizations (HNSW in RDF, subgraph indexing, SPARQL exit conditions, etc.).
- `/examples/` — Visual identity gallery. Side-by-side rendering of every distinct style currently in use across this site and the six sister projects, under abstract codenames (Lacquer, Slate, Pewter, Heather). Per-style pages list the exact tokens. Inventory, not redesign.
- Individual visualizer pages: `/dotproduct/`, `/crossproduct/`, `/cosine-similarity/`, `/mlp/`, `/cnn/`, `/cnn-architectures/`, `/rnn/`, `/lstm/`, `/attention/`, `/regression/`, `/loss-functions/`, `/regularization/`, `/optimizers/`, `/feature-transforms/`, `/backpropagation/`.

## Visual identity

Every page links one shared stylesheet, `/identity.css` (Lacquer palette,
the Pewter `.btn`, the MkDocs-Material dark/light `.theme-toggle` with dark
default, the `.gh` GitHub-repo pill, and shared type/primitives). Pages own
only their page-specific layout. `/_identity/` is the live demo of that
file. The six sister projects each carry their own copy of the same
`identity.css` and link it (Loka maps its component var names onto the
shared tokens; Sutra steers MkDocs Material to the same palette). Every
sister site shows a GitHub repo pill with the live star count and latest
release/tag (Sutra uses Material's built-in repo widget).

## Development

TypeScript sources live in `src/`, compiled output goes to `pages/`.

```bash
npm install
npx tsc
```

The `pages/` directory is served by GitHub Pages. `repos/` holds submodules pointing at the six sister projects (Sutra, Loka, Yantra, QueryKey, alignment, latent-space-cartography) so cross-project edits can land directly on those repos; it is not part of the Pages deploy. See `CLAUDE.md` for the edit-in-submodule workflow.

## Building the resume

```bash
pip install markdown playwright
python -m playwright install chromium
python build_resume.py
```

Renders `resume.md` to `pages/resume.html` and `pages/resume.pdf`. CI runs this in `.github/workflows/pages.yml` on every push, so a `git push` is enough to publish a resume change.
