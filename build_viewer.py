"""Build the embedding space viewer HTML with Word2Vec 10K data projected onto semantic axes."""
import json

with open('prototype/word2vec_projected.json') as f:
    data_json = f.read()

html = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Beyond Proximity: Embedding Space Viewer">
  <meta property="og:description" content="Interactive Voronoi map of 10,000 Word2Vec embeddings projected onto gender and age axes defined by man, woman, boy, and girl. Explore how words organize themselves in high-dimensional space.">
  <meta property="og:url" content="https://emmaleonhart.com/">
  <meta property="og:site_name" content="Beyond Proximity">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Beyond Proximity: Embedding Space Viewer">
  <meta name="twitter:description" content="Interactive map of 10,000 Word2Vec embeddings. Explore how words organize in high-dimensional space.">
  <meta name="description" content="Interactive Voronoi map of 10,000 Word2Vec embeddings projected onto semantic axes defined by man/woman (gender) and adult/child (age). Part of the Beyond Proximity neurosymbolic research project.">
  <title>Beyond Proximity — Embedding Space Viewer</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: #0a0a0f;
      color: #e0e0e0;
      overflow: hidden;
      height: 100vh;
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
    }
    #header h1 {
      font-size: 16px;
      font-weight: 600;
      color: #c0c0d0;
      letter-spacing: 0.5px;
    }
    #header h1 span { color: #7c8cf8; }
    #search-box {
      display: flex;
      align-items: center;
      gap: 8px;
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
    #main {
      display: flex;
      height: calc(100vh - 48px - 32px);
    }
    #sidebar {
      width: 240px;
      min-width: 240px;
      background: #111118;
      border-right: 1px solid #2a2a35;
      padding: 12px;
      overflow-y: auto;
      font-size: 12px;
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
    }
    #footer a { color: #7c8cf8; text-decoration: none; }
    #footer a:hover { text-decoration: underline; }
    #zoom-info { color: #555; }
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
  </style>
</head>
<body>
  <div id="header">
    <h1><span>Beyond Proximity</span> — Embedding Space Viewer</h1>
    <div id="search-box">
      <input type="text" id="search" placeholder="Search 10,000 words..." autocomplete="off">
    </div>
  </div>
  <div id="main">
    <div id="sidebar">
      <h3>About</h3>
      <div class="info-text">
        10,000 words from Google News Word2Vec, projected onto two semantic axes
        defined by four pole words.
        Each cell in the Voronoi tessellation represents one word's territory
        in this 2D semantic subspace.
      </div>

      <h3>Axes &amp; Poles</h3>
      <div class="info-text">
        The X-axis captures <strong style="color:#e0e0e0">gender</strong> (man&harr;woman direction).
        The Y-axis captures <strong style="color:#e0e0e0">age</strong> (adult&harr;child direction, orthogonalized).
      </div>
      <div id="pole-legend">
        <div class="pole-item" data-word="man">
          <div class="pole-dot" style="background: #4a9eff; border-color: #4a9eff;"></div>
          <div><span class="pole-label">man</span><br><span class="pole-desc">male, adult</span></div>
        </div>
        <div class="pole-item" data-word="woman">
          <div class="pole-dot" style="background: #ff6b9d; border-color: #ff6b9d;"></div>
          <div><span class="pole-label">woman</span><br><span class="pole-desc">female, adult</span></div>
        </div>
        <div class="pole-item" data-word="boy">
          <div class="pole-dot" style="background: #54d5ff; border-color: #54d5ff;"></div>
          <div><span class="pole-label">boy</span><br><span class="pole-desc">male, young</span></div>
        </div>
        <div class="pole-item" data-word="girl">
          <div class="pole-dot" style="background: #ff9de0; border-color: #ff9de0;"></div>
          <div><span class="pole-label">girl</span><br><span class="pole-desc">female, young</span></div>
        </div>
      </div>

      <h3>Density Regimes</h3>
      <div class="info-text">
        Cell size reveals how densely the embedding space encodes meaning in each region.
      </div>
      <div class="legend-item">
        <div class="legend-dot" style="background: rgba(231,76,60,0.7);"></div>
        <span class="legend-label"><strong>Oversymbolic</strong> — small cells, dense packing</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot" style="background: rgba(46,204,113,0.7);"></div>
        <span class="legend-label"><strong>Neurosymbolic</strong> — medium cells, balanced</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot" style="background: rgba(52,152,219,0.7);"></div>
        <span class="legend-label"><strong>Undersymbolic</strong> — large cells, sparse</span>
      </div>

      <div id="detail-panel">
        <h3>Selected</h3>
        <div id="detail-label"></div>
        <div id="detail-coords"></div>
        <h3 style="margin-top:8px">Nearest Neighbors</h3>
        <ul id="neighbors-list"></ul>
      </div>

      <a id="paper-link" href="paper/">Read the Paper &rarr;</a>
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
    <span>10,000 words &middot; Word2Vec (Google News) &middot; Projected onto man/woman/boy/girl axes</span>
    <span id="zoom-info">Scroll to zoom &middot; Drag to pan</span>
    <span>Research by <a href="paper/">Emma Leonhart</a></span>
  </div>

  <script>
  // ── Data ──
  const RAW = ''' + data_json + ''';

  // ── Pole words ──
  const POLES = {
    man:   { color: '#4a9eff', labelColor: '#4a9eff' },
    woman: { color: '#ff6b9d', labelColor: '#ff6b9d' },
    boy:   { color: '#54d5ff', labelColor: '#54d5ff' },
    girl:  { color: '#ff9de0', labelColor: '#ff9de0' }
  };
  const POLE_SET = new Set(Object.keys(POLES));

  // Notable words to label even at medium zoom
  const NOTABLE = new Set([
    'king', 'queen', 'prince', 'princess',
    'father', 'mother', 'son', 'daughter',
    'husband', 'wife', 'brother', 'sister',
    'dog', 'cat', 'car', 'house', 'water', 'fire',
    'love', 'war', 'death', 'life', 'time', 'world'
  ]);

  // ── Parse data ──
  const points = RAW.map((d, i) => ({
    idx: i,
    label: d.l,
    x: d.x,
    y: d.y,
    isPole: POLE_SET.has(d.l),
    isNotable: NOTABLE.has(d.l)
  }));
  const N = points.length;

  // Build index for quick lookup
  const labelIndex = {};
  points.forEach((p, i) => { labelIndex[p.label] = i; });

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
  const xExtent = d3.extent(points, d => d.x);
  const yExtent = d3.extent(points, d => d.y);
  const dataW = xExtent[1] - xExtent[0];
  const dataH = yExtent[1] - yExtent[0];
  const dataCx = (xExtent[0] + xExtent[1]) / 2;
  const dataCy = (yExtent[0] + yExtent[1]) / 2;

  function getScale() {
    const pad = 40;
    const sx = (W - 2 * pad) / dataW;
    const sy = (H - 2 * pad) / dataH;
    return Math.min(sx, sy);
  }

  function dataToScreen(x, y, transform) {
    const s = getScale();
    const sx = W / 2 + (x - dataCx) * s;
    const sy = H / 2 - (y - dataCy) * s;  // flip Y so positive = up
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

  // ── State ──
  let hoveredIdx = -1;
  let selectedIdx = -1;
  let searchMatches = null;

  // ── Drawing ──
  function draw() {
    const transform = currentTransform;
    const { delaunay, voronoi, screenPts } = computeVoronoi(transform);
    const regimes = classifyCells(voronoi);

    ctx.save();
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, W, H);

    // ── Draw regime-colored cells (BRIGHT enough to see) ──
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

    // ── Draw Voronoi edges ──
    ctx.strokeStyle = 'rgba(80,80,100,0.25)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    voronoi.render(ctx);
    ctx.stroke();

    // ── Draw points ──
    const zoom = transform.k;
    const baseR = Math.max(1, Math.min(3.5, 1.5 * zoom));

    for (let i = 0; i < N; i++) {
      const p = points[i];
      const [sx, sy] = screenPts[i];

      // Skip offscreen
      if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;

      let highlight = false;
      let dimmed = false;
      if (searchMatches) {
        if (!searchMatches.has(i)) dimmed = true;
        else highlight = true;
      }
      if (i === hoveredIdx || i === selectedIdx) highlight = true;

      if (p.isPole) {
        // Pole words always prominent
        const poleColor = POLES[p.label].color;
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

    // ── Labels ──
    // Poles always labeled
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

    // ── Highlight selected cell ──
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

    // ── Draw pole connection lines (axes visualization) ──
    const poleConnections = [
      ['man', 'woman', 'rgba(180,130,220,0.35)'],  // gender axis
      ['boy', 'girl',  'rgba(180,130,220,0.35)'],   // gender axis (young)
      ['man', 'boy',   'rgba(100,200,220,0.35)'],   // age axis
      ['woman', 'girl', 'rgba(100,200,220,0.35)']   // age axis
    ];
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 1.5;
    for (const [a, b, color] of poleConnections) {
      const ia = labelIndex[a];
      const ib = labelIndex[b];
      if (ia !== undefined && ib !== undefined) {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(screenPts[ia][0], screenPts[ia][1]);
        ctx.lineTo(screenPts[ib][0], screenPts[ib][1]);
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);

    // ── Axis labels ──
    ctx.font = '11px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(140,140,170,0.7)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('\\u2190 masculine', 90, H - 8);
    ctx.fillText('feminine \\u2192', W - 90, H - 8);
    ctx.save();
    ctx.translate(14, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.fillText('\\u2190 adult          young \\u2192', 0, 0);
    ctx.restore();

    // ── Store for hit testing ──
    window._delaunay = delaunay;
    window._screenPts = screenPts;
    window._regimes = regimes;

    ctx.restore();
  }

  // ── Zoom ──
  const zoom = d3.zoom()
    .scaleExtent([0.3, 80])
    .on('zoom', (event) => {
      currentTransform = event.transform;
      document.getElementById('zoom-info').textContent =
        `Zoom: ${currentTransform.k.toFixed(1)}x`;
      draw();
    });

  d3.select(canvas).call(zoom);

  // ── Initial view: center on the four poles ──
  setTimeout(() => {
    const poleIdxs = ['man', 'woman', 'boy', 'girl']
      .map(w => labelIndex[w])
      .filter(i => i !== undefined);
    if (poleIdxs.length === 4) {
      const cx = d3.mean(poleIdxs, i => points[i].x);
      const cy = d3.mean(poleIdxs, i => points[i].y);
      const s = getScale();
      const sx = W / 2 + (cx - dataCx) * s;
      const sy = H / 2 - (cy - dataCy) * s;
      const k = 2.0;
      const tx = W / 2 - sx * k;
      const ty = H / 2 - sy * k;
      const t = d3.zoomIdentity.translate(tx, ty).scale(k);
      d3.select(canvas).transition().duration(800).call(zoom.transform, t);
    }
  }, 100);

  // ── Hover ──
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
        `gender: ${p.x >= 0 ? '+' : ''}${p.x.toFixed(3)}  age: ${p.y >= 0 ? '+' : ''}${p.y.toFixed(3)}`;
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

  // ── Click ──
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
      `gender: ${p.x >= 0 ? '+' : ''}${p.x.toFixed(3)}  age: ${p.y >= 0 ? '+' : ''}${p.y.toFixed(3)}`;

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
      d3.select(canvas).transition().duration(400).call(zoom.transform, t);
    }
    draw();
  });

  // ── Pole clicks in sidebar ──
  document.querySelectorAll('.pole-item').forEach(el => {
    el.addEventListener('click', () => {
      const word = el.dataset.word;
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
        d3.select(canvas).transition().duration(600).call(zoom.transform, t);
      }
    });
  });

  // ── Initial draw ──
  draw();
  </script>
</body>
</html>'''

with open('pages/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Written {len(html)} bytes to pages/index.html")
