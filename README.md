# emmaleonhart.com

Personal website and interactive tools, deployed via GitHub Pages.

## Pages

- `/` — Landing page: bio, flagship project (Sutra), and research directions framed by Emma's three linked goals — neurosymbolic AI, AI interpretability, and AI safety. Geometric tensor languages, SutraDB, Wikidata / Pramana / Aelaki, and the tutorials are positioned as the *means* toward those goals.
- `/tutorials/` — Hub for the 14 interactive ML visualizers (vector math, neural networks, training, architectures).
- `/theory/` — SutraDB theory visualizations (HNSW in RDF, subgraph indexing, SPARQL exit conditions, etc.).
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
