# TODO — emmaleonhart.com

## Research page (`/research/`)
- [ ] The research index is still vague. It links the project subdomains and a
      few standalone papers, but most per-project papers are only referenced
      indirectly ("paper in-repo"). Flesh it out: pull the real paper
      titles/PDFs from each repo's `paper/` dir, and add the standalone
      research repos that aren't listed yet (the set is chaotic — sweep
      github.com/EmmaLeonhart for `paper/`-bearing repos).
- [ ] Swap the clawRxiv / personal-subdomain links for arXiv / Google Scholar
      links once papers are accepted there — currently the only homes are the
      Claw site and the project subdomains, which reads less professional. A
      scheduled remote agent audits this roughly monthly so the page doesn't
      go stale the moment something lands on arXiv (see the routine set via
      the `schedule` skill); this item tracks the manual side until then.

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

## HTTPS / Custom Domain Fix
- [ ] At domain registrar, add A records pointing to GitHub Pages IPs:
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- [ ] Optionally add AAAA records for IPv6:
  - `2606:50c0:8000::153`
  - `2606:50c0:8001::153`
  - `2606:50c0:8002::153`
  - `2606:50c0:8003::153`
- [ ] In GitHub repo Settings > Pages, confirm custom domain is set to `emmaleonhart.com`
- [ ] Wait for DNS check to pass (green checkmark in Settings > Pages)
- [ ] Enable "Enforce HTTPS" checkbox (greyed out until DNS resolves and SSL cert is provisioned)

## Visual identity / style guide
- [ ] **`/branding` is the living style guide.** It is the single
  reference for the shared kit (Material GitHub repo widget, compact
  search, light/dark toggle, calmer primary button, aurora glow,
  emoji card icons, gradient+italic display type, Lacquer palette).
  Iterate it first; roll changes out to the sister sites after Emma
  confirms on `/branding`.
- [ ] **Revisit: gradient text + italic-serif display treatment.**
  Emma likes the gradient headline + italic-serif accent (the
  `Vibe Coding, done properly` hero look) and wants it a consistent
  identity element — but is unsure others will appreciate it. Keep it
  in the style guide for now; revisit whether to dial it back / make
  it opt-in once more of the sites are unified and it can be judged in
  aggregate. Decision deferred on purpose, not forgotten.
- [ ] Consider promoting `/branding` to a formal written style guide
  (tokens + do/don't) if the kit stabilises.
- [ ] **Cosmic background motifs — expand.** Emma loves the rotating
  orbital glyph on the main-site hero ("cosmic vibe") and the
  aurora-neon coloured italics. Enlarged the glyph 2026-05-16; she
  wants MORE of this: additional subtle cosmic background elements
  (constellation lines, faint orbital rings, drifting points) layered
  with the aurora, as a defining identity trait. Build out a small
  reusable set and put it in `/identity.css` so every site gets it.
- [ ] **Primary buttons are based on the main-site buttons.** Emma
  judged the main-site buttons the best (calmer + aurora gradient/glow)
  — they are now the shared `.btn-primary`. Loka and the rest inherit
  it. Keep the main site as the button reference.

## Site Infrastructure
- [ ] Add favicon
- [ ] Add Open Graph images for social sharing
- [ ] Consider adding a project index/gallery page with thumbnails
- [ ] Add analytics (privacy-respecting, like Plausible or self-hosted)
- [ ] Set up GitHub Actions to auto-compile TypeScript on push
- [ ] Add 404 page
