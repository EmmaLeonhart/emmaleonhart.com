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
- `/embeddings/` — Interactive Voronoi map of 485 word embeddings with custom axis projection.
- Individual visualizer pages: `/dotproduct/`, `/crossproduct/`, `/cosine-similarity/`, `/mlp/`, `/cnn/`, `/cnn-architectures/`, `/rnn/`, `/lstm/`, `/attention/`, `/regression/`, `/loss-functions/`, `/regularization/`, `/optimizers/`, `/feature-transforms/`, `/backpropagation/`.

## Development

TypeScript sources live in `src/`, compiled output goes to `pages/`.

```bash
npm install
npx tsc
```

The `pages/` directory is served by GitHub Pages.

## Building the embedding viewer

```bash
python build_viewer.py
```

This regenerates `pages/embeddings/index.html` from `prototype/viewer_data.json`. The output is a single self-contained HTML file with the embeddings data inlined.

## Building the resume

```bash
pip install markdown playwright
python -m playwright install chromium
python build_resume.py
```

Renders `resume.md` to `pages/resume.html` and `pages/resume.pdf`. CI runs this in `.github/workflows/pages.yml` on every push, so a `git push` is enough to publish a resume change.
