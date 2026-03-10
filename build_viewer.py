"""Build the embedding space viewer HTML with Word2Vec 10K data projected onto semantic axes.

Embeds both pre-computed projections (for fast initial load) and PCA-reduced vectors
(for client-side custom axis re-projection).
"""
import json

with open('prototype/word2vec_projected.json') as f:
    data_json = f.read()

with open('prototype/word2vec_pca50.json') as f:
    pca_json = f.read()

html = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Beyond Proximity: Embedding Space Viewer">
  <meta property="og:description" content="Interactive Voronoi map of 10,000 Word2Vec embeddings projected onto custom semantic axes. Explore how words organize themselves in high-dimensional space.">
  <meta property="og:url" content="https://emmaleonhart.com/">
  <meta property="og:site_name" content="Beyond Proximity">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Beyond Proximity: Embedding Space Viewer">
  <meta name="twitter:description" content="Interactive map of 10,000 Word2Vec embeddings. Explore how words organize in high-dimensional space.">
  <meta name="description" content="Interactive Voronoi map of 10,000 Word2Vec embeddings projected onto custom semantic axes. Part of the Beyond Proximity neurosymbolic research project.">
  <title>Beyond Proximity \\u2014 Embedding Space Viewer</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: #0a0a0f;
      color: #e0e0e0;
      overflow: hidden;
      height: 100vh;
      height: 100dvh;
    }
    #header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background: #111118;
      border-bottom: 1px solid #2a2a35;
      height: 48px;
      z-index: 10;
      gap: 8px;
    }
    #header h1 {
      font-size: 16px;
      font-weight: 600;
      color: #c0c0d0;
      letter-spacing: 0.5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }
    #header h1 span { color: #7c8cf8; }
    #header-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    #search {
      background: #1a1a25;
      border: 1px solid #3a3a45;
      color: #e0e0e0;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 13px;
      width: 220px;
      outline: none;
    }
    #search:focus { border-color: #7c8cf8; }
    #search::placeholder { color: #666; }
    #sidebar-toggle {
      display: none;
      background: #1a1a25;
      border: 1px solid #3a3a45;
      color: #e0e0e0;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      line-height: 1;
    }
    #sidebar-toggle:hover { background: #252535; }
    #main {
      display: flex;
      height: calc(100vh - 48px - 32px);
      height: calc(100dvh - 48px - 32px);
    }
    #sidebar {
      width: 260px;
      min-width: 260px;
      background: #111118;
      border-right: 1px solid #2a2a35;
      padding: 12px;
      overflow-y: auto;
      font-size: 12px;
      z-index: 15;
      transition: transform 0.25s ease;
    }
    #sidebar h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #888;
      margin: 14px 0 6px 0;
    }
    #sidebar h3:first-child { margin-top: 0; }
    #sidebar .info-text {
      font-size: 11px;
      color: #999;
      line-height: 1.5;
      margin-bottom: 8px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 3px 0;
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 2px;
      flex-shrink: 0;
    }
    .legend-label { color: #ccc; font-size: 11px; }

    /* ── Custom Axis Inputs ── */
    .axis-group {
      margin-bottom: 10px;
    }
    .axis-group-label {
      font-size: 11px;
      color: #aaa;
      margin-bottom: 4px;
      font-weight: 600;
    }
    .axis-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
    }
    .axis-arrow {
      color: #666;
      font-size: 12px;
      flex-shrink: 0;
    }
    .axis-input {
      background: #1a1a25;
      border: 1px solid #3a3a45;
      color: #e0e0e0;
      padding: 4px 8px;
      border-radius: 3px;
      font-size: 12px;
      width: 100%;
      outline: none;
      font-family: inherit;
    }
    .axis-input:focus { border-color: #7c8cf8; }
    .axis-input::placeholder { color: #555; }
    .axis-input.invalid { border-color: #e74c3c; }
    .axis-input.valid { border-color: #2ecc71; }
    #apply-axes {
      display: block;
      width: 100%;
      padding: 6px 12px;
      margin-top: 8px;
      background: #7c8cf8;
      border: none;
      border-radius: 4px;
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    #apply-axes:hover { background: #6b7be8; }
    #apply-axes:disabled { background: #3a3a55; color: #666; cursor: not-allowed; }
    #axis-status {
      font-size: 10px;
      color: #888;
      margin-top: 4px;
      min-height: 14px;
    }
    #reset-axes {
      background: none;
      border: 1px solid #3a3a45;
      color: #999;
      padding: 4px 8px;
      border-radius: 3px;
      font-size: 11px;
      cursor: pointer;
      margin-top: 4px;
      display: block;
      width: 100%;
    }
    #reset-axes:hover { border-color: #7c8cf8; color: #ccc; }

    .pole-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .pole-item:hover { opacity: 0.8; }
    .pole-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid;
      flex-shrink: 0;
    }
    .pole-label { color: #e0e0e0; font-weight: 600; font-size: 12px; }
    .pole-desc { color: #888; font-size: 10px; }
    #detail-panel {
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid #2a2a35;
      display: none;
    }
    #detail-panel h3 { color: #7c8cf8; }
    #detail-label {
      font-size: 14px;
      font-weight: 600;
      color: #e0e0e0;
      margin: 4px 0;
    }
    #detail-coords {
      font-size: 11px;
      color: #888;
      margin-bottom: 8px;
    }
    #neighbors-list {
      list-style: none;
      padding: 0;
    }
    #neighbors-list li {
      padding: 2px 0;
      color: #aaa;
      font-size: 11px;
      display: flex;
      justify-content: space-between;
    }
    #neighbors-list li .dist { color: #666; }
    #paper-link {
      display: block;
      margin-top: 16px;
      padding: 8px 12px;
      background: #1a1a25;
      border: 1px solid #3a3a45;
      border-radius: 4px;
      color: #7c8cf8;
      text-decoration: none;
      font-size: 12px;
      text-align: center;
      transition: background 0.2s;
    }
    #paper-link:hover { background: #252535; }
    #canvas-wrap {
      flex: 1;
      position: relative;
      overflow: hidden;
    }
    canvas {
      display: block;
      cursor: crosshair;
      touch-action: none;
    }
    #tooltip {
      position: absolute;
      pointer-events: none;
      background: rgba(15, 15, 25, 0.95);
      border: 1px solid #3a3a45;
      border-radius: 4px;
      padding: 8px 12px;
      font-size: 12px;
      color: #e0e0e0;
      display: none;
      z-index: 20;
      max-width: 280px;
      white-space: nowrap;
    }
    #tooltip .tt-label { font-weight: 600; font-size: 13px; }
    #tooltip .tt-coords { color: #888; font-size: 11px; margin-top: 2px; }
    #tooltip .tt-regime { font-size: 11px; margin-top: 3px; }
    #footer {
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      background: #111118;
      border-top: 1px solid #2a2a35;
      font-size: 11px;
      color: #666;
      gap: 8px;
    }
    #footer a { color: #7c8cf8; text-decoration: none; }
    #footer a:hover { text-decoration: underline; }
    #footer-info {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }
    #zoom-info { color: #555; white-space: nowrap; flex-shrink: 0; }
    #footer-credit { white-space: nowrap; flex-shrink: 0; }
    .regime-badge {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 10px;
      font-weight: 600;
    }
    .regime-over { background: rgba(231,76,60,0.4); color: #ff6b5a; }
    .regime-neuro { background: rgba(46,204,113,0.4); color: #5ddb9e; }
    .regime-under { background: rgba(52,152,219,0.4); color: #5dade2; }

    /* ── Sidebar overlay for mobile ── */
    #sidebar-overlay {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 14;
    }

    /* ── Mobile Responsive ── */
    @media (max-width: 768px) {
      #header h1 { font-size: 14px; }
      #search { width: 140px; font-size: 12px; padding: 5px 8px; }
      #sidebar-toggle { display: block; }
      #sidebar {
        position: fixed;
        top: 48px;
        left: 0;
        bottom: 32px;
        width: 280px;
        min-width: auto;
        transform: translateX(-100%);
      }
      #sidebar.open { transform: translateX(0); }
      #sidebar-overlay.open { display: block; }
      #main { height: calc(100vh - 48px - 32px); height: calc(100dvh - 48px - 32px); }
      #footer { padding: 0 8px; font-size: 10px; }
      #footer-info { display: none; }
    }

    @media (max-width: 480px) {
      #header { padding: 8px 10px; }
      #header h1 { font-size: 13px; }
      #header h1 .subtitle { display: none; }
      #search { width: 110px; font-size: 11px; }
    }
  </style>
</head>
<body>
  <div id="header">
    <h1><span>Beyond Proximity</span><span class="subtitle"> \\u2014 Embedding Space Viewer</span></h1>
    <div id="header-right">
      <input type="text" id="search" placeholder="Search 10,000 words..." autocomplete="off">
      <button id="sidebar-toggle" aria-label="Toggle sidebar">\\u2630</button>
    </div>
  </div>
  <div id="main">
    <div id="sidebar-overlay"></div>
    <div id="sidebar">
      <h3>Custom Axes</h3>
      <div class="info-text">
        Type any words from the vocabulary to define your own semantic axes.
        The X-axis goes from the left word toward the right word.
        The Y-axis is orthogonalized automatically.
      </div>
      <div class="axis-group">
        <div class="axis-group-label">X-Axis</div>
        <div class="axis-row">
          <span class="axis-arrow">\\u2190</span>
          <input type="text" class="axis-input" id="x-neg" value="man" placeholder="e.g. man" autocomplete="off">
        </div>
        <div class="axis-row">
          <span class="axis-arrow">\\u2192</span>
          <input type="text" class="axis-input" id="x-pos" value="woman" placeholder="e.g. woman" autocomplete="off">
        </div>
      </div>
      <div class="axis-group">
        <div class="axis-group-label">Y-Axis</div>
        <div class="axis-row">
          <span class="axis-arrow">\\u2193</span>
          <input type="text" class="axis-input" id="y-neg" value="man" placeholder="e.g. adult-like word" autocomplete="off">
          <span style="color:#555;font-size:10px">+</span>
          <input type="text" class="axis-input" id="y-neg2" value="woman" placeholder="" autocomplete="off">
        </div>
        <div class="axis-row">
          <span class="axis-arrow">\\u2191</span>
          <input type="text" class="axis-input" id="y-pos" value="boy" placeholder="e.g. young-like word" autocomplete="off">
          <span style="color:#555;font-size:10px">+</span>
          <input type="text" class="axis-input" id="y-pos2" value="girl" placeholder="" autocomplete="off">
        </div>
      </div>
      <button id="apply-axes">Reproject Axes</button>
      <button id="reset-axes">Reset to default (man/woman/boy/girl)</button>
      <div id="axis-status"></div>

      <h3>Current Poles</h3>
      <div id="pole-legend"></div>

      <h3>Density Regimes</h3>
      <div class="info-text">
        Cell size reveals how densely the embedding space encodes meaning in each region.
      </div>
      <div class="legend-item">
        <div class="legend-dot" style="background: rgba(231,76,60,0.7);"></div>
        <span class="legend-label"><strong>Oversymbolic</strong> \\u2014 small cells, dense packing</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot" style="background: rgba(46,204,113,0.7);"></div>
        <span class="legend-label"><strong>Neurosymbolic</strong> \\u2014 medium cells, balanced</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot" style="background: rgba(52,152,219,0.7);"></div>
        <span class="legend-label"><strong>Undersymbolic</strong> \\u2014 large cells, sparse</span>
      </div>

      <div id="detail-panel">
        <h3>Selected</h3>
        <div id="detail-label"></div>
        <div id="detail-coords"></div>
        <h3 style="margin-top:8px">Nearest Neighbors</h3>
        <ul id="neighbors-list"></ul>
      </div>

      <a id="paper-link" href="paper/">Read the Paper \\u2192</a>
    </div>
    <div id="canvas-wrap">
      <canvas id="canvas"></canvas>
      <div id="tooltip">
        <div class="tt-label"></div>
        <div class="tt-coords"></div>
        <div class="tt-regime"></div>
      </div>
    </div>
  </div>
  <div id="footer">
    <span id="footer-info">10,000 words \\u00b7 Word2Vec (Google News) \\u00b7 Custom axis projection</span>
    <span id="zoom-info">Scroll to zoom \\u00b7 Drag to pan</span>
    <span id="footer-credit">Research by <a href="paper/">Emma Leonhart</a></span>
  </div>

  <script>
  // ══════════════════════════════════════════════════════════════
  // DATA
  // ══════════════════════════════════════════════════════════════

  // Pre-computed projection (default axes: man/woman/boy/girl)
  const DEFAULT_PROJ = ''' + data_json + ''';

  // PCA-reduced 50D vectors for client-side re-projection
  const PCA_DATA = ''' + pca_json + ''';

  // Build label -> PCA vector index
  const pcaLabelIndex = {};
  PCA_DATA.labels.forEach((l, i) => { pcaLabelIndex[l] = i; });

  // ══════════════════════════════════════════════════════════════
  // AXIS PROJECTION ENGINE
  // ══════════════════════════════════════════════════════════════

  function vecSub(a, b) {
    const r = new Float64Array(a.length);
    for (let i = 0; i < a.length; i++) r[i] = a[i] - b[i];
    return r;
  }
  function vecAdd(a, b) {
    const r = new Float64Array(a.length);
    for (let i = 0; i < a.length; i++) r[i] = a[i] + b[i];
    return r;
  }
  function vecScale(a, s) {
    const r = new Float64Array(a.length);
    for (let i = 0; i < a.length; i++) r[i] = a[i] * s;
    return r;
  }
  function vecDot(a, b) {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
  }
  function vecNorm(a) { return Math.sqrt(vecDot(a, a)); }
  function vecNormalize(a) {
    const n = vecNorm(a);
    return n > 0 ? vecScale(a, 1 / n) : a;
  }

  function getVec(word) {
    const idx = pcaLabelIndex[word];
    if (idx === undefined) return null;
    return new Float64Array(PCA_DATA.vectors[idx]);
  }

  /**
   * Compute projections for all words onto custom axes.
   * xNeg/xPos: words defining X-axis direction (xNeg -> xPos)
   * yNegWords/yPosWords: arrays of words whose midpoints define Y-axis direction
   * Returns array of {l, x, y} or null if words not found.
   */
  function projectOntoAxes(xNeg, xPos, yNegWords, yPosWords) {
    const vXNeg = getVec(xNeg);
    const vXPos = getVec(xPos);
    if (!vXNeg || !vXPos) return null;

    // X-axis: xNeg -> xPos
    let xAxis = vecNormalize(vecSub(vXPos, vXNeg));

    // Y-axis: midpoint(yNegWords) -> midpoint(yPosWords), orthogonalized
    const yNegVecs = yNegWords.map(getVec).filter(Boolean);
    const yPosVecs = yPosWords.map(getVec).filter(Boolean);
    if (yNegVecs.length === 0 || yPosVecs.length === 0) return null;

    let yNegCenter = yNegVecs[0];
    for (let i = 1; i < yNegVecs.length; i++) yNegCenter = vecAdd(yNegCenter, yNegVecs[i]);
    yNegCenter = vecScale(yNegCenter, 1 / yNegVecs.length);

    let yPosCenter = yPosVecs[0];
    for (let i = 1; i < yPosVecs.length; i++) yPosCenter = vecAdd(yPosCenter, yPosVecs[i]);
    yPosCenter = vecScale(yPosCenter, 1 / yPosVecs.length);

    const yRaw = vecSub(yPosCenter, yNegCenter);
    // Gram-Schmidt: remove X component
    const yOrth = vecSub(yRaw, vecScale(xAxis, vecDot(yRaw, xAxis)));
    const yAxis = vecNormalize(yOrth);

    if (vecNorm(yOrth) < 1e-8) return null; // degenerate

    // Center = midpoint of all pole words
    const allPoleVecs = [vXNeg, vXPos, ...yNegVecs, ...yPosVecs];
    let center = new Float64Array(vXNeg.length);
    for (const v of allPoleVecs) for (let i = 0; i < v.length; i++) center[i] += v[i];
    center = vecScale(center, 1 / allPoleVecs.length);

    // Project all words
    const result = [];
    for (let i = 0; i < PCA_DATA.labels.length; i++) {
      const v = new Float64Array(PCA_DATA.vectors[i]);
      const c = vecSub(v, center);
      result.push({
        l: PCA_DATA.labels[i],
        x: Math.round(vecDot(c, xAxis) * 10000) / 10000,
        y: Math.round(vecDot(c, yAxis) * 10000) / 10000
      });
    }
    return result;
  }

  // ══════════════════════════════════════════════════════════════
  // POLE COLORS (cycle through these for custom poles)
  // ══════════════════════════════════════════════════════════════
  const POLE_COLORS = [
    '#4a9eff', '#ff6b9d', '#54d5ff', '#ff9de0',
    '#ffd700', '#7cff8c'
  ];

  // ══════════════════════════════════════════════════════════════
  // STATE
  // ══════════════════════════════════════════════════════════════
  let currentData = DEFAULT_PROJ;
  let POLES = {};
  let POLE_SET = new Set();
  let xAxisLabel = { neg: 'man', pos: 'woman' };
  let yAxisLabel = { neg: 'adult', pos: 'young' };

  function updatePoles(poleWords) {
    POLES = {};
    poleWords.forEach((w, i) => {
      POLES[w] = { color: POLE_COLORS[i % POLE_COLORS.length], labelColor: POLE_COLORS[i % POLE_COLORS.length] };
    });
    POLE_SET = new Set(Object.keys(POLES));
    updatePoleLegend();
  }

  function updatePoleLegend() {
    const container = document.getElementById('pole-legend');
    container.innerHTML = '';
    for (const [word, cfg] of Object.entries(POLES)) {
      const el = document.createElement('div');
      el.className = 'pole-item';
      el.dataset.word = word;
      el.innerHTML = `<div class="pole-dot" style="background: ${cfg.color}; border-color: ${cfg.color};"></div><div><span class="pole-label">${word}</span></div>`;
      el.addEventListener('click', () => {
        const idx = labelIndex[word];
        if (idx !== undefined) {
          selectedIdx = idx;
          showDetail(idx);
          const p = points[idx];
          const s = getScale();
          const sx = W / 2 + (p.x - dataCx) * s;
          const sy = H / 2 - (p.y - dataCy) * s;
          const k = 4;
          const tx = W / 2 - sx * k;
          const ty = H / 2 - sy * k;
          const t = d3.zoomIdentity.translate(tx, ty).scale(k);
          d3.select(canvas).transition().duration(600).call(zoomBehavior.transform, t);
        }
      });
      container.appendChild(el);
    }
  }

  // Set up default poles
  updatePoles(['man', 'woman', 'boy', 'girl']);

  const NOTABLE = new Set([
    'king', 'queen', 'prince', 'princess',
    'father', 'mother', 'son', 'daughter',
    'husband', 'wife', 'brother', 'sister',
    'dog', 'cat', 'car', 'house', 'water', 'fire',
    'love', 'war', 'death', 'life', 'time', 'world'
  ]);

  // ── Parse data into points ──
  let points = [];
  let N = 0;
  let labelIndex = {};

  function loadProjection(data) {
    points = data.map((d, i) => ({
      idx: i,
      label: d.l,
      x: d.x,
      y: d.y,
      isPole: POLE_SET.has(d.l),
      isNotable: NOTABLE.has(d.l)
    }));
    N = points.length;
    labelIndex = {};
    points.forEach((p, i) => { labelIndex[p.label] = i; });

    // Recompute data extents
    const xe = d3.extent(points, d => d.x);
    const ye = d3.extent(points, d => d.y);
    dataW = xe[1] - xe[0];
    dataH = ye[1] - ye[0];
    dataCx = (xe[0] + xe[1]) / 2;
    dataCy = (ye[0] + ye[1]) / 2;
  }

  loadProjection(DEFAULT_PROJ);

  // ── Canvas setup ──
  const canvasWrap = document.getElementById('canvas-wrap');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvasWrap.clientWidth;
    H = canvasWrap.clientHeight;
    canvas.width = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }
  resize();
  window.addEventListener('resize', () => { resize(); draw(); });

  // ── Projection: data coords -> screen coords ──
  let dataW, dataH, dataCx, dataCy;
  // (initialized by loadProjection above)

  function getScale() {
    const pad = 40;
    const sx = (W - 2 * pad) / dataW;
    const sy = (H - 2 * pad) / dataH;
    return Math.min(sx, sy);
  }

  function dataToScreen(x, y, transform) {
    const s = getScale();
    const sx = W / 2 + (x - dataCx) * s;
    const sy = H / 2 - (y - dataCy) * s;
    return transform.apply([sx, sy]);
  }

  // ── Voronoi ──
  let currentTransform = d3.zoomIdentity;

  function computeVoronoi(transform) {
    const screenPts = points.map(p => dataToScreen(p.x, p.y, transform));
    const delaunay = d3.Delaunay.from(screenPts);
    const voronoi = delaunay.voronoi([0, 0, W, H]);
    return { delaunay, voronoi, screenPts };
  }

  // ── Regime classification ──
  function classifyCells(voronoi) {
    const areas = [];
    for (let i = 0; i < N; i++) {
      const cell = voronoi.cellPolygon(i);
      if (cell) {
        let area = 0;
        for (let j = 0, n = cell.length; j < n; j++) {
          const [x0, y0] = cell[j];
          const [x1, y1] = cell[(j + 1) % n];
          area += x0 * y1 - x1 * y0;
        }
        areas.push(Math.abs(area) / 2);
      } else {
        areas.push(Infinity);
      }
    }
    const finite = areas.filter(a => isFinite(a) && a > 0).map(a => Math.log(a));
    finite.sort((a, b) => a - b);
    const t1 = finite[Math.floor(finite.length / 3)];
    const t2 = finite[Math.floor(2 * finite.length / 3)];
    return areas.map(a => {
      if (!isFinite(a) || a <= 0) return 'under';
      const la = Math.log(a);
      if (la <= t1) return 'over';
      if (la <= t2) return 'neuro';
      return 'under';
    });
  }

  // ── Interaction state ──
  let hoveredIdx = -1;
  let selectedIdx = -1;
  let searchMatches = null;

  // ══════════════════════════════════════════════════════════════
  // DRAWING
  // ══════════════════════════════════════════════════════════════

  function draw() {
    const transform = currentTransform;
    const { delaunay, voronoi, screenPts } = computeVoronoi(transform);
    const regimes = classifyCells(voronoi);

    ctx.save();
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, W, H);

    // ── Regime-colored cells ──
    for (let i = 0; i < N; i++) {
      const cell = voronoi.cellPolygon(i);
      if (!cell) continue;
      const regime = regimes[i];
      let fill;
      if (regime === 'over')  fill = 'rgba(231,76,60,0.25)';
      else if (regime === 'neuro') fill = 'rgba(46,204,113,0.18)';
      else fill = 'rgba(52,152,219,0.12)';

      ctx.beginPath();
      ctx.moveTo(cell[0][0], cell[0][1]);
      for (let j = 1; j < cell.length; j++) ctx.lineTo(cell[j][0], cell[j][1]);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    }

    // ── Voronoi edges ──
    ctx.strokeStyle = 'rgba(80,80,100,0.25)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    voronoi.render(ctx);
    ctx.stroke();

    // ── Points ──
    const zoom = transform.k;
    const baseR = Math.max(1, Math.min(3.5, 1.5 * zoom));

    for (let i = 0; i < N; i++) {
      const p = points[i];
      const [sx, sy] = screenPts[i];
      if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;

      let highlight = false;
      let dimmed = false;
      if (searchMatches) {
        if (!searchMatches.has(i)) dimmed = true;
        else highlight = true;
      }
      if (i === hoveredIdx || i === selectedIdx) highlight = true;

      if (p.isPole) {
        const poleColor = POLES[p.label] ? POLES[p.label].color : '#fff';
        ctx.globalAlpha = dimmed ? 0.2 : 1.0;
        ctx.beginPath();
        ctx.arc(sx, sy, baseR * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = poleColor;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        ctx.globalAlpha = dimmed ? 0.05 : (highlight ? 0.9 : 0.5);
        ctx.beginPath();
        ctx.arc(sx, sy, highlight ? baseR * 1.5 : baseR, 0, Math.PI * 2);
        ctx.fillStyle = highlight ? '#fff' : '#8888bb';
        ctx.fill();
        if (highlight) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    // ── Labels: poles always ──
    ctx.textBaseline = 'middle';
    for (const poleName of Object.keys(POLES)) {
      const idx = labelIndex[poleName];
      if (idx === undefined) continue;
      const [sx, sy] = screenPts[idx];
      if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) continue;
      ctx.font = `bold ${Math.max(12, 14 * zoom / 2)}px 'Segoe UI', system-ui, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillStyle = POLES[poleName].labelColor;
      ctx.fillText(poleName, sx + baseR * 3 + 4, sy);
    }

    // Notable words at moderate zoom
    if (zoom > 1.5) {
      ctx.font = `${Math.min(11, 9 * zoom / 2)}px 'Segoe UI', system-ui, sans-serif`;
      ctx.textAlign = 'left';
      for (let i = 0; i < N; i++) {
        const p = points[i];
        if (!p.isNotable || p.isPole) continue;
        if (searchMatches && !searchMatches.has(i)) continue;
        const [sx, sy] = screenPts[i];
        if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) continue;
        ctx.fillStyle = 'rgba(200,200,220,0.7)';
        ctx.fillText(p.label, sx + baseR + 3, sy);
      }
    }

    // All labels at high zoom
    if (zoom > 3.5) {
      ctx.font = `${Math.min(10, 8 * zoom / 3)}px 'Segoe UI', system-ui, sans-serif`;
      ctx.textAlign = 'left';
      for (let i = 0; i < N; i++) {
        const p = points[i];
        if (p.isPole || p.isNotable) continue;
        if (searchMatches && !searchMatches.has(i)) continue;
        const [sx, sy] = screenPts[i];
        if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) continue;
        ctx.fillStyle = 'rgba(180,180,200,0.6)';
        ctx.fillText(p.label, sx + baseR + 2, sy);
      }
    }

    // ── Selected cell highlight ──
    if (selectedIdx >= 0) {
      const cell = voronoi.cellPolygon(selectedIdx);
      if (cell) {
        ctx.beginPath();
        ctx.moveTo(cell[0][0], cell[0][1]);
        for (let j = 1; j < cell.length; j++) ctx.lineTo(cell[j][0], cell[j][1]);
        ctx.closePath();
        ctx.strokeStyle = '#7c8cf8';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // ── Pole connection lines ──
    const poleNames = Object.keys(POLES);
    if (poleNames.length >= 2) {
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(180,130,220,0.35)';
      for (let a = 0; a < poleNames.length; a++) {
        for (let b = a + 1; b < poleNames.length; b++) {
          const ia = labelIndex[poleNames[a]];
          const ib = labelIndex[poleNames[b]];
          if (ia !== undefined && ib !== undefined) {
            ctx.beginPath();
            ctx.moveTo(screenPts[ia][0], screenPts[ia][1]);
            ctx.lineTo(screenPts[ib][0], screenPts[ib][1]);
            ctx.stroke();
          }
        }
      }
      ctx.setLineDash([]);
    }

    // ── Axis labels ──
    ctx.font = '11px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(140,140,170,0.7)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('\\u2190 ' + xAxisLabel.neg, 90, H - 8);
    ctx.fillText(xAxisLabel.pos + ' \\u2192', W - 90, H - 8);
    ctx.save();
    ctx.translate(14, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.fillText('\\u2190 ' + yAxisLabel.neg + '          ' + yAxisLabel.pos + ' \\u2192', 0, 0);
    ctx.restore();

    // ── Store for hit testing ──
    window._delaunay = delaunay;
    window._screenPts = screenPts;
    window._regimes = regimes;

    ctx.restore();
  }

  // ══════════════════════════════════════════════════════════════
  // ZOOM & PAN
  // ══════════════════════════════════════════════════════════════

  const zoomBehavior = d3.zoom()
    .scaleExtent([0.3, 80])
    .on('zoom', (event) => {
      currentTransform = event.transform;
      document.getElementById('zoom-info').textContent =
        `Zoom: ${currentTransform.k.toFixed(1)}x`;
      draw();
    });

  d3.select(canvas).call(zoomBehavior);

  function centerOnPoles() {
    const poleIdxs = Object.keys(POLES)
      .map(w => labelIndex[w])
      .filter(i => i !== undefined);
    if (poleIdxs.length >= 2) {
      const cx = d3.mean(poleIdxs, i => points[i].x);
      const cy = d3.mean(poleIdxs, i => points[i].y);
      const s = getScale();
      const sx = W / 2 + (cx - dataCx) * s;
      const sy = H / 2 - (cy - dataCy) * s;
      const k = 2.0;
      const tx = W / 2 - sx * k;
      const ty = H / 2 - sy * k;
      const t = d3.zoomIdentity.translate(tx, ty).scale(k);
      d3.select(canvas).transition().duration(800).call(zoomBehavior.transform, t);
    }
  }

  setTimeout(centerOnPoles, 100);

  // ══════════════════════════════════════════════════════════════
  // HOVER / CLICK / SEARCH
  // ══════════════════════════════════════════════════════════════

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const tooltip = document.getElementById('tooltip');

    if (!window._delaunay) return;
    const idx = window._delaunay.find(mx, my);
    const [sx, sy] = window._screenPts[idx];
    const dist = Math.hypot(mx - sx, my - sy);

    if (dist < 40) {
      hoveredIdx = idx;
      const p = points[idx];
      const regime = window._regimes[idx];
      tooltip.querySelector('.tt-label').textContent = p.label;
      tooltip.querySelector('.tt-coords').textContent =
        `x: ${p.x >= 0 ? '+' : ''}${p.x.toFixed(3)}  y: ${p.y >= 0 ? '+' : ''}${p.y.toFixed(3)}`;
      const regimeLabels = { over: 'Oversymbolic (dense)', neuro: 'Neurosymbolic (balanced)', under: 'Undersymbolic (sparse)' };
      const regimeClasses = { over: 'regime-over', neuro: 'regime-neuro', under: 'regime-under' };
      tooltip.querySelector('.tt-regime').innerHTML =
        `<span class="regime-badge ${regimeClasses[regime]}">${regimeLabels[regime]}</span>`;
      tooltip.style.display = 'block';
      tooltip.style.left = (mx + 15) + 'px';
      tooltip.style.top = (my - 10) + 'px';
      const tr = tooltip.getBoundingClientRect();
      const wr = canvasWrap.getBoundingClientRect();
      if (tr.right > wr.right) tooltip.style.left = (mx - tr.width - 10) + 'px';
      if (tr.bottom > wr.bottom) tooltip.style.top = (my - tr.height - 10) + 'px';
    } else {
      hoveredIdx = -1;
      tooltip.style.display = 'none';
    }
    draw();
  });

  canvas.addEventListener('mouseleave', () => {
    hoveredIdx = -1;
    document.getElementById('tooltip').style.display = 'none';
    draw();
  });

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    if (!window._delaunay) return;
    const idx = window._delaunay.find(mx, my);
    const [sx, sy] = window._screenPts[idx];
    const dist = Math.hypot(mx - sx, my - sy);

    if (dist < 40) {
      selectedIdx = idx;
      showDetail(idx);
    } else {
      selectedIdx = -1;
      document.getElementById('detail-panel').style.display = 'none';
    }
    draw();
  });

  function showDetail(idx) {
    const p = points[idx];
    const panel = document.getElementById('detail-panel');
    panel.style.display = 'block';
    document.getElementById('detail-label').textContent = p.label;
    document.getElementById('detail-coords').textContent =
      `x: ${p.x >= 0 ? '+' : ''}${p.x.toFixed(3)}  y: ${p.y >= 0 ? '+' : ''}${p.y.toFixed(3)}`;

    const dists = points.map((q, i) => ({
      i, dist: Math.hypot(q.x - p.x, q.y - p.y)
    }));
    dists.sort((a, b) => a.dist - b.dist);
    const list = document.getElementById('neighbors-list');
    list.innerHTML = '';
    for (let k = 1; k <= 10; k++) {
      if (k >= dists.length) break;
      const nb = dists[k];
      const q = points[nb.i];
      const li = document.createElement('li');
      const isPole = POLE_SET.has(q.label);
      li.innerHTML = `<span style="color:${isPole ? POLES[q.label].color : '#aaa'}">${q.label}</span><span class="dist">${nb.dist.toFixed(3)}</span>`;
      list.appendChild(li);
    }
  }

  // ── Search ──
  const searchInput = document.getElementById('search');
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (q.length === 0) {
      searchMatches = null;
      draw();
      return;
    }
    searchMatches = new Set();
    points.forEach((p, i) => {
      if (p.label.toLowerCase().includes(q)) searchMatches.add(i);
    });
    if (searchMatches.size > 0 && searchMatches.size <= 50) {
      const firstIdx = searchMatches.values().next().value;
      const p = points[firstIdx];
      const s = getScale();
      const sx = W / 2 + (p.x - dataCx) * s;
      const sy = H / 2 - (p.y - dataCy) * s;
      const k = Math.max(currentTransform.k, 3);
      const tx = W / 2 - sx * k;
      const ty = H / 2 - sy * k;
      const t = d3.zoomIdentity.translate(tx, ty).scale(k);
      d3.select(canvas).transition().duration(400).call(zoomBehavior.transform, t);
    }
    draw();
  });

  // ══════════════════════════════════════════════════════════════
  // CUSTOM AXIS INPUT
  // ══════════════════════════════════════════════════════════════

  const axisInputs = ['x-neg', 'x-pos', 'y-neg', 'y-neg2', 'y-pos', 'y-pos2'].map(
    id => document.getElementById(id)
  );

  // Validate inputs as user types
  axisInputs.forEach(input => {
    input.addEventListener('input', () => {
      const word = input.value.trim().toLowerCase();
      input.classList.remove('valid', 'invalid');
      if (word.length === 0) return;
      if (pcaLabelIndex[word] !== undefined) {
        input.classList.add('valid');
      } else {
        input.classList.add('invalid');
      }
    });
  });

  // Apply button
  document.getElementById('apply-axes').addEventListener('click', () => {
    const xNeg = document.getElementById('x-neg').value.trim().toLowerCase();
    const xPos = document.getElementById('x-pos').value.trim().toLowerCase();
    const yNeg = document.getElementById('y-neg').value.trim().toLowerCase();
    const yNeg2 = document.getElementById('y-neg2').value.trim().toLowerCase();
    const yPos = document.getElementById('y-pos').value.trim().toLowerCase();
    const yPos2 = document.getElementById('y-pos2').value.trim().toLowerCase();

    const status = document.getElementById('axis-status');

    // Collect Y-axis words (non-empty ones)
    const yNegWords = [yNeg, yNeg2].filter(w => w.length > 0);
    const yPosWords = [yPos, yPos2].filter(w => w.length > 0);

    // Validate
    const allWords = [xNeg, xPos, ...yNegWords, ...yPosWords];
    const missing = allWords.filter(w => pcaLabelIndex[w] === undefined);
    if (missing.length > 0) {
      status.style.color = '#e74c3c';
      status.textContent = 'Not in vocabulary: ' + missing.join(', ');
      return;
    }
    if (xNeg === xPos) {
      status.style.color = '#e74c3c';
      status.textContent = 'X-axis poles must be different words';
      return;
    }

    status.style.color = '#7c8cf8';
    status.textContent = 'Projecting...';

    // Use requestAnimationFrame so the status text renders before heavy computation
    requestAnimationFrame(() => {
      const result = projectOntoAxes(xNeg, xPos, yNegWords, yPosWords);
      if (!result) {
        status.style.color = '#e74c3c';
        status.textContent = 'Degenerate axes (Y-axis collapses). Try different words.';
        return;
      }

      // Update state
      const uniquePoles = [...new Set([xNeg, xPos, ...yNegWords, ...yPosWords])];
      updatePoles(uniquePoles);
      xAxisLabel = { neg: xNeg, pos: xPos };
      yAxisLabel = {
        neg: yNegWords.join('+'),
        pos: yPosWords.join('+')
      };

      loadProjection(result);
      selectedIdx = -1;
      document.getElementById('detail-panel').style.display = 'none';

      status.style.color = '#2ecc71';
      status.textContent = 'Reprojected onto ' + xNeg + '/' + xPos + ' axes';

      // Reset zoom and center on new poles
      currentTransform = d3.zoomIdentity;
      resize();
      draw();
      setTimeout(centerOnPoles, 50);
    });
  });

  // Reset button
  document.getElementById('reset-axes').addEventListener('click', () => {
    document.getElementById('x-neg').value = 'man';
    document.getElementById('x-pos').value = 'woman';
    document.getElementById('y-neg').value = 'man';
    document.getElementById('y-neg2').value = 'woman';
    document.getElementById('y-pos').value = 'boy';
    document.getElementById('y-pos2').value = 'girl';

    axisInputs.forEach(input => input.classList.remove('valid', 'invalid'));

    updatePoles(['man', 'woman', 'boy', 'girl']);
    xAxisLabel = { neg: 'man', pos: 'woman' };
    yAxisLabel = { neg: 'adult', pos: 'young' };

    loadProjection(DEFAULT_PROJ);
    selectedIdx = -1;
    document.getElementById('detail-panel').style.display = 'none';
    document.getElementById('axis-status').textContent = '';

    currentTransform = d3.zoomIdentity;
    resize();
    draw();
    setTimeout(centerOnPoles, 50);
  });

  // Also allow Enter key to apply
  axisInputs.forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('apply-axes').click();
      }
    });
  });

  // ══════════════════════════════════════════════════════════════
  // MOBILE SIDEBAR TOGGLE
  // ══════════════════════════════════════════════════════════════

  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const sidebarToggle = document.getElementById('sidebar-toggle');

  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('open');
  });

  sidebarOverlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('open');
  });

  // ── Initial draw ──
  draw();
  </script>
</body>
</html>'''

with open('pages/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Written {len(html)} bytes to pages/index.html")
