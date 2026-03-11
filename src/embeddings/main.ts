// Embedding Space Viewer — Interactive Voronoi map with custom axis projection
// Data loaded from data.json at runtime
export {};

// D3 is loaded via CDN <script> tag
declare const d3: any;

// ============================================================
// TYPES
// ============================================================
interface ProjPoint {
  l: string;
  x: number;
  y: number;
}

interface PcaData {
  labels: string[];
  scales: number[];
  mean: number[];
  basis: number[][];
  vectors: number[][];
}

interface ViewerData {
  proj: ProjPoint[];
  pca: PcaData;
}

interface Point {
  idx: number;
  label: string;
  x: number;
  y: number;
  isPole: boolean;
  isNotable: boolean;
}

interface PoleConfig {
  color: string;
}

type Regime = 'dense' | 'moderate' | 'sparse';

// ============================================================
// VECTOR MATH
// ============================================================
function vecSub(a: Float64Array, b: Float64Array): Float64Array {
  const r = new Float64Array(a.length);
  for (let i = 0; i < a.length; i++) r[i] = a[i] - b[i];
  return r;
}

function vecAdd(a: Float64Array, b: Float64Array): Float64Array {
  const r = new Float64Array(a.length);
  for (let i = 0; i < a.length; i++) r[i] = a[i] + b[i];
  return r;
}

function vecScale(a: Float64Array, s: number): Float64Array {
  const r = new Float64Array(a.length);
  for (let i = 0; i < a.length; i++) r[i] = a[i] * s;
  return r;
}

function vecDot(a: Float64Array, b: Float64Array): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function vecNorm(a: Float64Array): number {
  return Math.sqrt(vecDot(a, a));
}

function vecNormalize(a: Float64Array): Float64Array {
  const n = vecNorm(a);
  return n > 0 ? vecScale(a, 1 / n) : a;
}

// ============================================================
// STATE
// ============================================================
let DEFAULT_PROJ: ProjPoint[];
let PCA: PcaData;
const pcaLabelIndex: Record<string, number> = {};

const POLE_COLORS = ['#4a9eff', '#ff6b9d', '#54d5ff', '#ff9de0', '#ffd700', '#7cff8c'];
let POLES: Record<string, PoleConfig> = {};
let POLE_SET = new Set<string>();
let xAxisLabel = { neg: 'man', pos: 'woman' };
let yAxisLabel = { neg: 'adult', pos: 'young' };

const NOTABLE = new Set([
  'king', 'queen', 'prince', 'princess',
  'father', 'mother', 'son', 'daughter',
  'husband', 'wife', 'brother', 'sister',
  'dog', 'cat', 'car', 'house', 'water', 'fire',
  'love', 'war', 'death', 'life', 'time', 'world'
]);

let points: Point[] = [];
let N = 0;
let labelIndex: Record<string, number> = {};
let dataW = 0, dataH = 0, dataCx = 0, dataCy = 0;

let canvasEl: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let canvasWrap: HTMLElement;
let W = 0, H = 0;

let currentTransform: any;
let hoveredIdx = -1;
let selectedIdx = -1;
let searchMatches: Set<number> | null = null;

// Hit-test cache (updated each draw)
let hitDelaunay: any = null;
let hitScreenPts: number[][] = [];
let hitRegimes: Regime[] = [];

// ============================================================
// PCA VECTOR RECONSTRUCTION
// ============================================================
function getPcaVec(word: string): Float64Array | null {
  const idx = pcaLabelIndex[word];
  if (idx === undefined) return null;
  const q = PCA.vectors[idx];
  const n = q.length;
  const v = new Float64Array(n);
  for (let i = 0; i < n; i++) v[i] = q[i] * PCA.scales[i] / 127;
  return v;
}

// ============================================================
// AXIS PROJECTION
// ============================================================
function projectOntoAxes(xNeg: string, xPos: string, yNegWords: string[], yPosWords: string[]): ProjPoint[] | null {
  const vXNeg = getPcaVec(xNeg);
  const vXPos = getPcaVec(xPos);
  if (!vXNeg || !vXPos) return null;

  const xAxis = vecNormalize(vecSub(vXPos, vXNeg));

  const yNegVecs = yNegWords.map(getPcaVec).filter((v): v is Float64Array => v !== null);
  const yPosVecs = yPosWords.map(getPcaVec).filter((v): v is Float64Array => v !== null);
  if (yNegVecs.length === 0 || yPosVecs.length === 0) return null;

  let yNegCenter = yNegVecs.reduce((a, b) => vecAdd(a, b));
  yNegCenter = vecScale(yNegCenter, 1 / yNegVecs.length);
  let yPosCenter = yPosVecs.reduce((a, b) => vecAdd(a, b));
  yPosCenter = vecScale(yPosCenter, 1 / yPosVecs.length);

  const yRaw = vecSub(yPosCenter, yNegCenter);
  const yOrth = vecSub(yRaw, vecScale(xAxis, vecDot(yRaw, xAxis)));
  if (vecNorm(yOrth) < 1e-8) return null;
  const yAxis = vecNormalize(yOrth);

  const allPoles = [vXNeg, vXPos, ...yNegVecs, ...yPosVecs];
  const center = new Float64Array(vXNeg.length);
  for (const v of allPoles) for (let i = 0; i < v.length; i++) center[i] += v[i];
  for (let i = 0; i < center.length; i++) center[i] /= allPoles.length;

  const result: ProjPoint[] = [];
  for (let i = 0; i < PCA.labels.length; i++) {
    const v = getPcaVec(PCA.labels[i])!;
    const c = vecSub(v, center);
    result.push({
      l: PCA.labels[i],
      x: Math.round(vecDot(c, xAxis) * 10000) / 10000,
      y: Math.round(vecDot(c, yAxis) * 10000) / 10000
    });
  }
  return result;
}

// ============================================================
// POLES
// ============================================================
function updatePoles(poleWords: string[]): void {
  POLES = {};
  poleWords.forEach((w, i) => {
    POLES[w] = { color: POLE_COLORS[i % POLE_COLORS.length] };
  });
  POLE_SET = new Set(Object.keys(POLES));
  updatePoleLegend();
}

function updatePoleLegend(): void {
  const container = document.getElementById('pole-legend')!;
  container.innerHTML = '';
  for (const [word, cfg] of Object.entries(POLES)) {
    const el = document.createElement('div');
    el.className = 'pole-item';
    el.innerHTML = `<div class="pole-dot" style="background:${cfg.color};border-color:${cfg.color};"></div><div><span class="pole-label">${word}</span></div>`;
    el.addEventListener('click', () => {
      const idx = labelIndex[word];
      if (idx !== undefined) {
        selectedIdx = idx;
        showDetail(idx);
        panToPoint(idx, 4);
      }
    });
    container.appendChild(el);
  }
}

// ============================================================
// DATA LOADING
// ============================================================
function loadProjection(data: ProjPoint[]): void {
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

  const xe = d3.extent(points, (d: Point) => d.x) as [number, number];
  const ye = d3.extent(points, (d: Point) => d.y) as [number, number];
  dataW = xe[1] - xe[0];
  dataH = ye[1] - ye[0];
  dataCx = (xe[0] + xe[1]) / 2;
  dataCy = (ye[0] + ye[1]) / 2;
}

// ============================================================
// CANVAS
// ============================================================
function resize(): void {
  W = canvasWrap.clientWidth;
  H = canvasWrap.clientHeight;
  canvasEl.width = W * devicePixelRatio;
  canvasEl.height = H * devicePixelRatio;
  canvasEl.style.width = W + 'px';
  canvasEl.style.height = H + 'px';
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

function getScale(): number {
  const pad = 40;
  const sx = (W - 2 * pad) / dataW;
  const sy = (H - 2 * pad) / dataH;
  return Math.min(sx, sy);
}

function dataToScreen(x: number, y: number, transform: any): [number, number] {
  const s = getScale();
  const sx = W / 2 + (x - dataCx) * s;
  const sy = H / 2 - (y - dataCy) * s;
  return transform.apply([sx, sy]);
}

function computeVoronoi(transform: any): { delaunay: any; voronoi: any; screenPts: number[][] } {
  const screenPts = points.map(p => dataToScreen(p.x, p.y, transform));
  const delaunay = d3.Delaunay.from(screenPts);
  const voronoi = delaunay.voronoi([0, 0, W, H]);
  return { delaunay, voronoi, screenPts };
}

function classifyCells(voronoi: any): Regime[] {
  const areas: number[] = [];
  for (let i = 0; i < N; i++) {
    const cell = voronoi.cellPolygon(i);
    if (cell) {
      let area = 0;
      for (let j = 0; j < cell.length; j++) {
        const j1 = (j + 1) % cell.length;
        area += cell[j][0] * cell[j1][1] - cell[j1][0] * cell[j][1];
      }
      areas.push(Math.abs(area) / 2);
    } else {
      areas.push(Infinity);
    }
  }
  const finite = areas
    .filter(a => isFinite(a) && a > 0)
    .map(a => Math.log(a));
  finite.sort((a, b) => a - b);
  const t1 = finite[Math.floor(finite.length / 3)];
  const t2 = finite[Math.floor(2 * finite.length / 3)];
  return areas.map(a => {
    if (!isFinite(a) || a <= 0) return 'sparse';
    const la = Math.log(a);
    if (la <= t1) return 'dense';
    if (la <= t2) return 'moderate';
    return 'sparse';
  });
}

// ============================================================
// DRAW
// ============================================================
function draw(): void {
  const transform = currentTransform;
  const computed = computeVoronoi(transform);
  const { delaunay, voronoi, screenPts } = computed;
  const regimes = classifyCells(voronoi);

  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, W, H);

  // Regime-colored cells
  for (let i = 0; i < N; i++) {
    const cell = voronoi.cellPolygon(i);
    if (!cell) continue;
    const regime = regimes[i];
    let fill: string;
    if (regime === 'dense') fill = 'rgba(231,76,60,0.25)';
    else if (regime === 'moderate') fill = 'rgba(46,204,113,0.18)';
    else fill = 'rgba(52,152,219,0.12)';
    ctx.beginPath();
    ctx.moveTo(cell[0][0], cell[0][1]);
    for (let j = 1; j < cell.length; j++) ctx.lineTo(cell[j][0], cell[j][1]);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  // Voronoi edges
  ctx.strokeStyle = 'rgba(80,80,100,0.25)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  voronoi.render(ctx);
  ctx.stroke();

  // Points
  const zoom = transform.k;
  const baseR = Math.max(1.5, Math.min(4, 2 * zoom));

  for (let i = 0; i < N; i++) {
    const p = points[i];
    const sx = screenPts[i][0], sy = screenPts[i][1];
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
      ctx.globalAlpha = dimmed ? 0.05 : (highlight ? 0.9 : 0.6);
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

  // Pole labels (always visible)
  ctx.textBaseline = 'middle';
  const poleNames = Object.keys(POLES);
  for (const poleName of poleNames) {
    const idx = labelIndex[poleName];
    if (idx === undefined) continue;
    const sx = screenPts[idx][0], sy = screenPts[idx][1];
    if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) continue;
    ctx.font = `bold ${Math.max(12, 14 * zoom / 2)}px "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillStyle = POLES[poleName].color;
    ctx.fillText(poleName, sx + baseR * 3 + 4, sy);
  }

  // Notable labels at moderate zoom
  if (zoom > 1.5) {
    ctx.font = `${Math.min(11, 9 * zoom / 2)}px "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = 'left';
    for (let i = 0; i < N; i++) {
      const p = points[i];
      if (!p.isNotable || p.isPole) continue;
      if (searchMatches && !searchMatches.has(i)) continue;
      const sx = screenPts[i][0], sy = screenPts[i][1];
      if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) continue;
      ctx.fillStyle = 'rgba(200,200,220,0.7)';
      ctx.fillText(p.label, sx + baseR + 3, sy);
    }
  }

  // All labels at high zoom
  if (zoom > 3) {
    ctx.font = `${Math.min(10, 8 * zoom / 3)}px "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = 'left';
    for (let i = 0; i < N; i++) {
      const p = points[i];
      if (p.isPole || p.isNotable) continue;
      if (searchMatches && !searchMatches.has(i)) continue;
      const sx = screenPts[i][0], sy = screenPts[i][1];
      if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) continue;
      ctx.fillStyle = 'rgba(180,180,200,0.6)';
      ctx.fillText(p.label, sx + baseR + 2, sy);
    }
  }

  // Selected cell highlight
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

  // Pole connections
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

  // Axis labels
  ctx.font = '11px "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(140,140,170,0.7)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('\u2190 ' + xAxisLabel.neg, 90, H - 8);
  ctx.fillText(xAxisLabel.pos + ' \u2192', W - 90, H - 8);
  ctx.save();
  ctx.translate(14, H / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';
  ctx.fillText('\u2190 ' + yAxisLabel.neg + '          ' + yAxisLabel.pos + ' \u2192', 0, 0);
  ctx.restore();

  // Store for hit testing
  hitDelaunay = delaunay;
  hitScreenPts = screenPts;
  hitRegimes = regimes;

  ctx.restore();
}

// ============================================================
// ZOOM & NAVIGATION
// ============================================================
let zoomBehavior: any;

function panToPoint(idx: number, k: number): void {
  const p = points[idx];
  const s = getScale();
  const sx = W / 2 + (p.x - dataCx) * s;
  const sy = H / 2 - (p.y - dataCy) * s;
  const tx = W / 2 - sx * k;
  const ty = H / 2 - sy * k;
  const t = d3.zoomIdentity.translate(tx, ty).scale(k);
  d3.select(canvasEl).transition().duration(600).call(zoomBehavior.transform, t);
}

function centerOnPoles(): void {
  const poleIdxs = Object.keys(POLES)
    .map(w => labelIndex[w])
    .filter((i): i is number => i !== undefined);
  if (poleIdxs.length >= 2) {
    const cx = d3.mean(poleIdxs, (i: number) => points[i].x);
    const cy = d3.mean(poleIdxs, (i: number) => points[i].y);
    const s = getScale();
    const sx = W / 2 + (cx - dataCx) * s;
    const sy = H / 2 - (cy - dataCy) * s;
    const k = 2.0;
    const tx = W / 2 - sx * k;
    const ty = H / 2 - sy * k;
    const t = d3.zoomIdentity.translate(tx, ty).scale(k);
    d3.select(canvasEl).transition().duration(800).call(zoomBehavior.transform, t);
  }
}

// ============================================================
// HOVER / CLICK / DETAIL
// ============================================================
function showDetail(idx: number): void {
  const p = points[idx];
  document.getElementById('detail-panel')!.style.display = 'block';
  document.getElementById('detail-label')!.textContent = p.label;
  document.getElementById('detail-coords')!.textContent =
    'x: ' + (p.x >= 0 ? '+' : '') + p.x.toFixed(3) + '  y: ' + (p.y >= 0 ? '+' : '') + p.y.toFixed(3);

  const dists = points.map((q, i) => ({
    i,
    dist: Math.hypot(q.x - p.x, q.y - p.y)
  }));
  dists.sort((a, b) => a.dist - b.dist);
  const list = document.getElementById('neighbors-list')!;
  list.innerHTML = '';
  for (let k = 1; k <= 10 && k < dists.length; k++) {
    const nb = dists[k];
    const q = points[nb.i];
    const li = document.createElement('li');
    const isPole = POLE_SET.has(q.label);
    li.innerHTML = `<span style="color:${isPole ? POLES[q.label].color : '#aaa'}">${q.label}</span><span class="dist">${nb.dist.toFixed(3)}</span>`;
    list.appendChild(li);
  }
}

// ============================================================
// INIT
// ============================================================
async function init(): Promise<void> {
  // Load data
  const resp = await fetch('data.json');
  const viewerData: ViewerData = await resp.json();
  DEFAULT_PROJ = viewerData.proj;
  PCA = viewerData.pca;

  // Build label index for PCA vectors
  PCA.labels.forEach((l, i) => { pcaLabelIndex[l] = i; });

  // Init canvas
  canvasWrap = document.getElementById('canvas-wrap')!;
  canvasEl = document.getElementById('canvas') as HTMLCanvasElement;
  ctx = canvasEl.getContext('2d')!;

  // Init poles and projection
  updatePoles(['man', 'woman', 'boy', 'girl']);
  loadProjection(DEFAULT_PROJ);

  // Canvas sizing
  resize();
  window.addEventListener('resize', () => { resize(); draw(); });

  // Zoom
  currentTransform = d3.zoomIdentity;
  zoomBehavior = d3.zoom()
    .scaleExtent([0.3, 80])
    .on('zoom', (event: any) => {
      currentTransform = event.transform;
      document.getElementById('zoom-info')!.textContent = 'Zoom: ' + currentTransform.k.toFixed(1) + 'x';
      draw();
    });
  d3.select(canvasEl).call(zoomBehavior);

  // Hover
  canvasEl.addEventListener('mousemove', (e: MouseEvent) => {
    const rect = canvasEl.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const tooltip = document.getElementById('tooltip')!;

    if (!hitDelaunay) return;
    const idx = hitDelaunay.find(mx, my);
    const sx = hitScreenPts[idx][0], sy = hitScreenPts[idx][1];
    const dist = Math.hypot(mx - sx, my - sy);

    if (dist < 40) {
      hoveredIdx = idx;
      const p = points[idx];
      const regime = hitRegimes[idx];
      tooltip.querySelector('.tt-label')!.textContent = p.label;
      tooltip.querySelector('.tt-coords')!.textContent =
        'x: ' + (p.x >= 0 ? '+' : '') + p.x.toFixed(3) + '  y: ' + (p.y >= 0 ? '+' : '') + p.y.toFixed(3);
      const regimeLabels: Record<Regime, string> = { dense: 'Dense', moderate: 'Moderate', sparse: 'Sparse' };
      const regimeClasses: Record<Regime, string> = { dense: 'regime-dense', moderate: 'regime-moderate', sparse: 'regime-sparse' };
      tooltip.querySelector('.tt-regime')!.innerHTML =
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

  canvasEl.addEventListener('mouseleave', () => {
    hoveredIdx = -1;
    document.getElementById('tooltip')!.style.display = 'none';
    draw();
  });

  // Click
  canvasEl.addEventListener('click', (e: MouseEvent) => {
    const rect = canvasEl.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    if (!hitDelaunay) return;
    const idx = hitDelaunay.find(mx, my);
    const sx = hitScreenPts[idx][0], sy = hitScreenPts[idx][1];
    const dist = Math.hypot(mx - sx, my - sy);

    if (dist < 40) {
      selectedIdx = idx;
      showDetail(idx);
    } else {
      selectedIdx = -1;
      document.getElementById('detail-panel')!.style.display = 'none';
    }
    draw();
  });

  // Search
  const searchInput = document.getElementById('search') as HTMLInputElement;
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (q.length === 0) {
      searchMatches = null;
      draw();
      return;
    }
    searchMatches = new Set<number>();
    points.forEach((p, i) => {
      if (p.label.toLowerCase().indexOf(q) !== -1) searchMatches!.add(i);
    });
    if (searchMatches.size > 0 && searchMatches.size <= 50) {
      const firstIdx = searchMatches.values().next().value!;
      panToPoint(firstIdx, Math.max(currentTransform.k, 3));
    }
    draw();
  });

  // Custom axis inputs
  const axisInputIds = ['x-neg', 'x-pos', 'y-neg', 'y-neg2', 'y-pos', 'y-pos2'];
  const axisInputs = axisInputIds.map(id => document.getElementById(id) as HTMLInputElement);

  axisInputs.forEach(input => {
    input.addEventListener('input', () => {
      const word = input.value.trim().toLowerCase();
      input.classList.remove('valid', 'invalid');
      if (word.length === 0) return;
      if (pcaLabelIndex[word] !== undefined) input.classList.add('valid');
      else input.classList.add('invalid');
    });
  });

  document.getElementById('apply-axes')!.addEventListener('click', () => {
    const xNeg = (document.getElementById('x-neg') as HTMLInputElement).value.trim().toLowerCase();
    const xPos = (document.getElementById('x-pos') as HTMLInputElement).value.trim().toLowerCase();
    const yNeg = (document.getElementById('y-neg') as HTMLInputElement).value.trim().toLowerCase();
    const yNeg2 = (document.getElementById('y-neg2') as HTMLInputElement).value.trim().toLowerCase();
    const yPos = (document.getElementById('y-pos') as HTMLInputElement).value.trim().toLowerCase();
    const yPos2 = (document.getElementById('y-pos2') as HTMLInputElement).value.trim().toLowerCase();

    const status = document.getElementById('axis-status')!;
    const yNegWords = [yNeg, yNeg2].filter(w => w.length > 0);
    const yPosWords = [yPos, yPos2].filter(w => w.length > 0);
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

    requestAnimationFrame(() => {
      const result = projectOntoAxes(xNeg, xPos, yNegWords, yPosWords);
      if (!result) {
        status.style.color = '#e74c3c';
        status.textContent = 'Degenerate axes. Try different words.';
        return;
      }

      const uniquePoles: string[] = [];
      const seen: Record<string, boolean> = {};
      [xNeg, xPos, ...yNegWords, ...yPosWords].forEach(w => {
        if (!seen[w]) { uniquePoles.push(w); seen[w] = true; }
      });
      updatePoles(uniquePoles);
      xAxisLabel = { neg: xNeg, pos: xPos };
      yAxisLabel = { neg: yNegWords.join('+'), pos: yPosWords.join('+') };

      loadProjection(result);
      selectedIdx = -1;
      document.getElementById('detail-panel')!.style.display = 'none';

      status.style.color = '#2ecc71';
      status.textContent = 'Reprojected onto ' + xNeg + '/' + xPos + ' axes';

      currentTransform = d3.zoomIdentity;
      resize();
      draw();
      setTimeout(centerOnPoles, 50);
    });
  });

  document.getElementById('reset-axes')!.addEventListener('click', () => {
    (document.getElementById('x-neg') as HTMLInputElement).value = 'man';
    (document.getElementById('x-pos') as HTMLInputElement).value = 'woman';
    (document.getElementById('y-neg') as HTMLInputElement).value = 'man';
    (document.getElementById('y-neg2') as HTMLInputElement).value = 'woman';
    (document.getElementById('y-pos') as HTMLInputElement).value = 'boy';
    (document.getElementById('y-pos2') as HTMLInputElement).value = 'girl';
    axisInputs.forEach(input => { input.classList.remove('valid', 'invalid'); });

    updatePoles(['man', 'woman', 'boy', 'girl']);
    xAxisLabel = { neg: 'man', pos: 'woman' };
    yAxisLabel = { neg: 'adult', pos: 'young' };

    loadProjection(DEFAULT_PROJ);
    selectedIdx = -1;
    document.getElementById('detail-panel')!.style.display = 'none';
    document.getElementById('axis-status')!.textContent = '';

    currentTransform = d3.zoomIdentity;
    resize();
    draw();
    setTimeout(centerOnPoles, 50);
  });

  axisInputs.forEach(input => {
    input.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') document.getElementById('apply-axes')!.click();
    });
  });

  // Mobile sidebar
  const sidebar = document.getElementById('sidebar')!;
  const sidebarOverlay = document.getElementById('sidebar-overlay')!;
  document.getElementById('sidebar-toggle')!.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('open');
  });
  sidebarOverlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('open');
  });

  // Initial draw
  draw();
  setTimeout(centerOnPoles, 100);
}

document.addEventListener('DOMContentLoaded', init);
