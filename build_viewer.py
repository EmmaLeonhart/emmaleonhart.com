"""Build the embedding space viewer HTML with inlined data."""
import json

# Load the minified data
with open('prototype/topology_minified.json') as f:
    data_json = f.read()

html = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Beyond Proximity: Embedding Space Topology Viewer">
  <meta property="og:description" content="Interactive Voronoi tessellation of 3,000 concept embeddings projected onto gender and cuteness axes. Explore how adjectives like cute, powerful, and beautiful displace nouns through embedding space.">
  <meta property="og:url" content="https://emmaleonhart.com/">
  <meta property="og:site_name" content="Beyond Proximity">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Beyond Proximity: Embedding Space Topology Viewer">
  <meta name="twitter:description" content="Interactive Voronoi tessellation of 3,000 concept embeddings. Explore how adjectives displace nouns through embedding space.">
  <meta name="description" content="Interactive Voronoi tessellation of 3,000 concept embeddings projected onto gender and cuteness axes. Part of the Beyond Proximity neurosymbolic research project.">
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
      width: 220px;
      min-width: 220px;
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
      margin: 12px 0 6px 0;
    }
    #sidebar h3:first-child { margin-top: 0; }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 3px 0;
      cursor: pointer;
      opacity: 1;
      transition: opacity 0.2s;
    }
    .legend-item:hover { opacity: 0.8; }
    .legend-item.dimmed { opacity: 0.3; }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 2px;
      flex-shrink: 0;
    }
    .legend-label { color: #ccc; }
    .legend-count { color: #666; margin-left: auto; }
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
    #detail-category {
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
    }
    #neighbors-list li span { color: #666; float: right; }
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
      background: rgba(20, 20, 30, 0.95);
      border: 1px solid #3a3a45;
      border-radius: 4px;
      padding: 6px 10px;
      font-size: 12px;
      color: #e0e0e0;
      display: none;
      z-index: 20;
      max-width: 250px;
      white-space: nowrap;
    }
    #tooltip .tt-label { font-weight: 600; }
    #tooltip .tt-cat { color: #888; font-size: 11px; }
    #tooltip .tt-regime { font-size: 11px; margin-top: 2px; }
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
    .regime-over { background: rgba(231,76,60,0.3); color: #e74c3c; }
    .regime-neuro { background: rgba(46,204,113,0.3); color: #2ecc71; }
    .regime-under { background: rgba(52,152,219,0.3); color: #3498db; }
  </style>
</head>
<body>
  <div id="header">
    <h1><span>Beyond Proximity</span> — Embedding Space Topology</h1>
    <div id="search-box">
      <input type="text" id="search" placeholder="Search concepts..." autocomplete="off">
    </div>
  </div>
  <div id="main">
    <div id="sidebar">
      <h3>Categories</h3>
      <div id="category-legend"></div>
      <h3>Regimes</h3>
      <div id="regime-legend">
        <div class="legend-item">
          <div class="legend-dot" style="background: rgba(231,76,60,0.5);"></div>
          <span class="legend-label">Oversymbolic</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot" style="background: rgba(46,204,113,0.5);"></div>
          <span class="legend-label">Neurosymbolic</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot" style="background: rgba(52,152,219,0.5);"></div>
          <span class="legend-label">Undersymbolic</span>
        </div>
      </div>
      <div id="detail-panel">
        <h3>Selected</h3>
        <div id="detail-label"></div>
        <div id="detail-category"></div>
        <h3 style="margin-top:8px">Nearest Neighbors</h3>
        <ul id="neighbors-list"></ul>
      </div>
      <a id="paper-link" href="paper/">Read the Paper →</a>
    </div>
    <div id="canvas-wrap">
      <canvas id="canvas"></canvas>
      <div id="tooltip">
        <div class="tt-label"></div>
        <div class="tt-cat"></div>
        <div class="tt-regime"></div>
      </div>
    </div>
  </div>
  <div id="footer">
    <span>3,000 embeddings · 500 nouns × 6 adjective variants · mxbai-embed-large (1024-dim)</span>
    <span id="zoom-info">Scroll to zoom · Drag to pan</span>
    <span>Research by <a href="paper/">Emma Leonhart</a></span>
  </div>

  <script>
  // ── Data ──
  const RAW = ''' + data_json + ''';

  // ── Config ──
  const CATEGORY_COLORS = {
    bare:      '#8888aa',
    cute:      '#ff69b4',
    adorable:  '#ff1493',
    beautiful: '#da70d6',
    powerful:  '#e74c3c',
    strong:    '#e67e22'
  };
  const CATEGORY_LABELS = {
    bare:      'Bare noun',
    cute:      'cute + noun',
    adorable:  'adorable + noun',
    beautiful: 'beautiful + noun',
    powerful:  'powerful + noun',
    strong:    'strong + noun'
  };

  // ── Parse data ──
  const points = RAW.map((d, i) => ({
    idx: i,
    label: d.l,
    category: d.c,
    x: d.x,
    y: d.y
  }));
  const N = points.length;

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

  // Scale to fit with padding
  function getScale() {
    const pad = 40;
    const sx = (W - 2 * pad) / dataW;
    const sy = (H - 2 * pad) / dataH;
    return Math.min(sx, sy);
  }

  function dataToScreen(x, y, transform) {
    const s = getScale();
    const sx = W / 2 + (x - dataCx) * s;
    const sy = H / 2 - (y - dataCy) * s;  // flip Y
    return transform.apply([sx, sy]);
  }

  function screenToData(sx, sy, transform) {
    const [px, py] = transform.invert([sx, sy]);
    const s = getScale();
    const x = (px - W / 2) / s + dataCx;
    const y = -((py - H / 2) / s) + dataCy;
    return [x, y];
  }

  // ── Voronoi ──
  let currentTransform = d3.zoomIdentity;

  function computeVoronoi(transform) {
    const screenPts = points.map(p => dataToScreen(p.x, p.y, transform));
    const delaunay = d3.Delaunay.from(screenPts);
    const voronoi = delaunay.voronoi([0, 0, W, H]);
    return { delaunay, voronoi, screenPts };
  }

  // ── Regime classification (by Voronoi cell area) ──
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
    // Log-area terciles
    const finite = areas.filter(a => isFinite(a) && a > 0).map(a => Math.log(a));
    finite.sort((a, b) => a - b);
    const t1 = finite[Math.floor(finite.length / 3)];
    const t2 = finite[Math.floor(2 * finite.length / 3)];
    return areas.map(a => {
      if (!isFinite(a) || a <= 0) return 'under';
      const la = Math.log(a);
      if (la <= t1) return 'over';    // small cells = oversymbolic (dense)
      if (la <= t2) return 'neuro';   // medium = neurosymbolic
      return 'under';                  // large cells = undersymbolic (sparse)
    });
  }

  // ── State ──
  let hoveredIdx = -1;
  let selectedIdx = -1;
  let searchMatches = null;
  let dimmedCategories = new Set();

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

    // Draw regime-colored cells
    for (let i = 0; i < N; i++) {
      const cell = voronoi.cellPolygon(i);
      if (!cell) continue;
      const regime = regimes[i];
      let fill;
      if (regime === 'over') fill = 'rgba(231,76,60,0.08)';
      else if (regime === 'neuro') fill = 'rgba(46,204,113,0.06)';
      else fill = 'rgba(52,152,219,0.04)';

      ctx.beginPath();
      ctx.moveTo(cell[0][0], cell[0][1]);
      for (let j = 1; j < cell.length; j++) ctx.lineTo(cell[j][0], cell[j][1]);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    }

    // Draw Voronoi edges
    ctx.strokeStyle = 'rgba(60,60,80,0.3)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    voronoi.render(ctx);
    ctx.stroke();

    // Draw points
    const zoom = transform.k;
    const baseR = Math.max(1.5, Math.min(4, 2 * zoom));
    for (let i = 0; i < N; i++) {
      const p = points[i];
      const [sx, sy] = screenPts[i];

      let dimmed = dimmedCategories.has(p.category);
      let highlight = false;
      if (searchMatches && !searchMatches.has(i)) dimmed = true;
      if (searchMatches && searchMatches.has(i)) highlight = true;
      if (i === hoveredIdx || i === selectedIdx) highlight = true;

      const color = CATEGORY_COLORS[p.category] || '#888';
      ctx.globalAlpha = dimmed ? 0.1 : (highlight ? 1.0 : 0.7);

      ctx.beginPath();
      ctx.arc(sx, sy, highlight ? baseR * 1.5 : baseR, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      if (highlight) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    // Labels at sufficient zoom
    if (zoom > 2) {
      ctx.font = `${Math.min(11, 9 * zoom / 2)}px 'Segoe UI', system-ui, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < N; i++) {
        const p = points[i];
        if (dimmedCategories.has(p.category)) continue;
        if (searchMatches && !searchMatches.has(i)) continue;
        const [sx, sy] = screenPts[i];
        if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) continue;
        ctx.fillStyle = 'rgba(200,200,220,0.8)';
        ctx.fillText(p.label, sx + baseR + 3, sy);
      }
    }

    // Highlight selected cell
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

    // Draw connections between man/woman/boy if visible at this zoom
    if (zoom > 1.5) {
      const connPairs = [['man', 'woman'], ['man', 'boy'], ['woman', 'women'], ['boy', 'men']];
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(124,140,248,0.4)';
      ctx.lineWidth = 1;
      for (const [a, b] of connPairs) {
        const ia = points.findIndex(p => p.label === a && p.category === 'bare');
        const ib = points.findIndex(p => p.label === b && p.category === 'bare');
        if (ia >= 0 && ib >= 0) {
          ctx.beginPath();
          ctx.moveTo(screenPts[ia][0], screenPts[ia][1]);
          ctx.lineTo(screenPts[ib][0], screenPts[ib][1]);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
    }

    // Store for hit testing
    window._delaunay = delaunay;
    window._screenPts = screenPts;
    window._regimes = regimes;

    ctx.restore();
  }

  // ── Zoom ──
  const zoom = d3.zoom()
    .scaleExtent([0.5, 50])
    .on('zoom', (event) => {
      currentTransform = event.transform;
      document.getElementById('zoom-info').textContent =
        `Zoom: ${currentTransform.k.toFixed(1)}x`;
      draw();
    });

  d3.select(canvas).call(zoom);

  // Set initial view: zoom into man/woman area
  setTimeout(() => {
    const manIdx = points.findIndex(p => p.label === 'man' && p.category === 'bare');
    const womanIdx = points.findIndex(p => p.label === 'woman' && p.category === 'bare');
    if (manIdx >= 0 && womanIdx >= 0) {
      const cx = (points[manIdx].x + points[womanIdx].x) / 2;
      const cy = (points[manIdx].y + points[womanIdx].y) / 2;
      const s = getScale();
      const sx = W / 2 + (cx - dataCx) * s;
      const sy = H / 2 - (cy - dataCy) * s;
      const k = 2.5;
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

    if (dist < 30) {
      hoveredIdx = idx;
      const p = points[idx];
      const regime = window._regimes[idx];
      tooltip.querySelector('.tt-label').textContent = p.label;
      tooltip.querySelector('.tt-cat').textContent = CATEGORY_LABELS[p.category] || p.category;
      const regimeLabels = { over: 'Oversymbolic', neuro: 'Neurosymbolic', under: 'Undersymbolic' };
      const regimeClasses = { over: 'regime-over', neuro: 'regime-neuro', under: 'regime-under' };
      tooltip.querySelector('.tt-regime').innerHTML =
        `<span class="regime-badge ${regimeClasses[regime]}">${regimeLabels[regime]}</span>`;
      tooltip.style.display = 'block';
      tooltip.style.left = (mx + 15) + 'px';
      tooltip.style.top = (my - 10) + 'px';
      // Keep tooltip in bounds
      const tr = tooltip.getBoundingClientRect();
      if (tr.right > W) tooltip.style.left = (mx - tr.width - 10) + 'px';
      if (tr.bottom > H) tooltip.style.top = (my - tr.height - 10) + 'px';
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

  // ── Click: select + show neighbors ──
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    if (!window._delaunay) return;
    const idx = window._delaunay.find(mx, my);
    const [sx, sy] = window._screenPts[idx];
    const dist = Math.hypot(mx - sx, my - sy);

    if (dist < 30) {
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
    const catColor = CATEGORY_COLORS[p.category] || '#888';
    document.getElementById('detail-category').innerHTML =
      `<span style="color:${catColor}">${CATEGORY_LABELS[p.category] || p.category}</span>` +
      ` · x=${p.x.toFixed(3)} y=${p.y.toFixed(3)}`;

    // Find nearest neighbors by Euclidean distance in data space
    const dists = points.map((q, i) => ({
      i, dist: Math.hypot(q.x - p.x, q.y - p.y)
    }));
    dists.sort((a, b) => a.dist - b.dist);
    const list = document.getElementById('neighbors-list');
    list.innerHTML = '';
    for (let k = 1; k <= 8; k++) {
      const nb = dists[k];
      const q = points[nb.i];
      const li = document.createElement('li');
      const color = CATEGORY_COLORS[q.category] || '#888';
      li.innerHTML = `<span style="color:${color}">●</span> ${q.label} <span>${nb.dist.toFixed(3)}</span>`;
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
    // Pan to first match
    if (searchMatches.size > 0) {
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

  // ── Category legend ──
  const catLegend = document.getElementById('category-legend');
  const catCounts = {};
  points.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
  const catOrder = ['bare', 'cute', 'adorable', 'beautiful', 'powerful', 'strong'];
  catOrder.forEach(cat => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <div class="legend-dot" style="background: ${CATEGORY_COLORS[cat]}"></div>
      <span class="legend-label">${CATEGORY_LABELS[cat]}</span>
      <span class="legend-count">${catCounts[cat] || 0}</span>
    `;
    item.addEventListener('click', () => {
      if (dimmedCategories.has(cat)) {
        dimmedCategories.delete(cat);
        item.classList.remove('dimmed');
      } else {
        dimmedCategories.add(cat);
        item.classList.add('dimmed');
      }
      draw();
    });
    catLegend.appendChild(item);
  });

  // ── Axes labels overlay ──
  function drawAxes() {
    // Draw axis labels on canvas edges
    ctx.save();
    ctx.font = '11px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(120,120,150,0.6)';

    // X axis: Cuteness
    ctx.textAlign = 'center';
    ctx.fillText('← less cute', 60, H - 8);
    ctx.fillText('more cute →', W - 60, H - 8);

    // Y axis: Gender
    ctx.save();
    ctx.translate(12, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('← masculine          feminine →', 0, 0);
    ctx.restore();

    ctx.restore();
  }

  // Patch draw to include axes
  const _origDraw = draw;
  // We'll just add axes in the main draw function
  const origDraw = draw;

  // ── Initial draw ──
  draw();
  </script>
</body>
</html>'''

with open('pages/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Written {len(html)} bytes to pages/index.html")
