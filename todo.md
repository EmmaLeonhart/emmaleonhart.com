# TODO — emmaleonhart.com

## Verify Existing Pages
- [ ] Test dot product visualizer — vectors draggable, math updates, projection renders correctly
- [ ] Test cross product visualizer — parallelogram area, sign colors, rotation direction
- [ ] Test embedding space viewer — Voronoi cells render, custom axes work, search works
- [ ] Test all pages on mobile (touch drag, responsive layout)
- [ ] Verify all internal links work (home → projects, project → home)

## Refactor & Cleanup
- [x] Refactor dot product and cross product to TypeScript
- [ ] Refactor embedding viewer to TypeScript
- [ ] Remove paper-specific language from embedding viewer
- [ ] Add consistent `<meta>` tags across all pages
- [ ] Unify CSS variables across pages (colors, fonts, spacing)

## Potential New Project Showcases
- [ ] **Matrix transformation visualizer** — drag 2D points, see how a 2x2 matrix transforms them (eigenvectors, determinant, shear)
- [ ] **Fourier series playground** — draw a shape, see it decomposed into sine/cosine components with sliders for number of terms
- [ ] **Sorting algorithm visualizer** — side-by-side comparison of bubble sort, quicksort, merge sort with step-through controls
- [ ] **Neural network playground** — tiny 2D classifier (like TensorFlow Playground but simpler, custom-built)
- [ ] **Bezier curve editor** — drag control points, see de Casteljau construction animated
- [ ] **Graph algorithm explorer** — build a graph, run BFS/DFS/Dijkstra, see traversal animated
- [ ] **Regex debugger** — type a regex and a test string, see match groups highlighted with step-by-step engine state
- [ ] **Cellular automata sandbox** — Conway's Game of Life + Rule 110 + custom rules, with drawing tools
- [ ] **Color space explorer** — pick a color, see it mapped across RGB, HSL, LAB, and OKLab with conversion formulas shown
- [ ] **Probability distribution viewer** — interactive PDF/CDF for normal, Poisson, binomial, etc. with parameter sliders
- [ ] **Convolution visualizer** — step through 1D/2D convolution with kernel sliding animation
- [ ] **PCA step-by-step** — upload 2D data points, see covariance matrix, eigenvectors, and projection animated
- [ ] **Quaternion rotation demo** — 3D object with quaternion sliders showing gimbal lock avoidance vs Euler angles
- [ ] **Waveform synthesizer** — combine sine waves with amplitude/frequency/phase controls, hear the result
- [ ] **Binary/hex/float explorer** — type a number, see its IEEE 754 representation, bit manipulation
- [ ] **Markov chain text generator** — paste text, build transition matrix, generate new text, visualize chain
- [ ] **A* pathfinding demo** — draw obstacles on a grid, watch A* find the path with open/closed set visualization
- [ ] **Signal processing demo** — apply filters (low-pass, high-pass, bandpass) to audio/waveforms interactively
- [ ] **Type theory explorer** — visualize type hierarchies, subtyping, and generic type resolution
- [ ] **Lambda calculus reducer** — type lambda expressions, see beta reduction steps animated

## Site Infrastructure
- [ ] Add favicon
- [ ] Add Open Graph images for social sharing
- [ ] Consider adding a project index/gallery page with thumbnails
- [ ] Add analytics (privacy-respecting, like Plausible or self-hosted)
- [ ] Set up GitHub Actions to auto-compile TypeScript on push
- [ ] Add 404 page
