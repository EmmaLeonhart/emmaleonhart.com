# emmaleonhart.com

Personal website and interactive tools, deployed via GitHub Pages.

## Pages

- `/` — Landing page with project links
- `/embeddings/` — Interactive Voronoi map of 485 word embeddings projected onto custom semantic axes
- `/dotproduct/` — Interactive 2D dot product visualizer with projection, angle, and real-time math
- `/crossproduct/` — Interactive 2D cross product visualizer with parallelogram area and rotation direction

## Development

TypeScript sources live in `src/`, compiled output goes to `pages/`.

```bash
npm install
npx tsc
```

The `pages/` directory is served by GitHub Pages.
