// Feature Transforms — Interactive Visualizer
// Shows how transforming features (polynomial, etc.) lets linear models fit nonlinear data
export {};

interface Point { x: number; y: number; cls: number; }

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let W = 0, H = 0;

let points: Point[] = [];
let degree = 1;
let coeffs: number[] = [];

const COLORS = {
  bg: '#0a0a0f',
  grid: '#16161f',
  axis: '#2a2a3e',
  point0: '#f43f5e',
  point1: '#34d399',
  fit: '#7c8cf8',
  fitFill: 'rgba(124, 140, 248, 0.08)',
  text: '#d0d0dc',
  dimText: '#666880',
  accent: '#7c8cf8',
  warning: '#f59e0b',
};

const PAD = 40;
const DATA_RANGE = 6; // -3 to 3

function $(id: string): HTMLElement { return document.getElementById(id)!; }

// ============================================================
// DATA
// ============================================================
function generateSineData(): void {
  points = [];
  for (let i = 0; i < 25; i++) {
    const x = (Math.random() * DATA_RANGE) - DATA_RANGE / 2;
    const y = Math.sin(x * 1.2) + (Math.random() - 0.5) * 0.4;
    points.push({ x, y, cls: 0 });
  }
}

function generateQuadraticData(): void {
  points = [];
  for (let i = 0; i < 25; i++) {
    const x = (Math.random() * DATA_RANGE) - DATA_RANGE / 2;
    const y = 0.3 * x * x - 0.5 + (Math.random() - 0.5) * 0.5;
    points.push({ x, y, cls: 0 });
  }
}

function generateLinearData(): void {
  points = [];
  for (let i = 0; i < 20; i++) {
    const x = (Math.random() * DATA_RANGE) - DATA_RANGE / 2;
    const y = 0.5 * x + 0.3 + (Math.random() - 0.5) * 0.6;
    points.push({ x, y, cls: 0 });
  }
}

// ============================================================
// POLYNOMIAL FITTING (least squares via normal equation)
// ============================================================
function fitPolynomial(): void {
  if (points.length < degree + 1) {
    coeffs = new Array(degree + 1).fill(0);
    return;
  }

  const n = points.length;
  const d = degree + 1;

  // Build Vandermonde matrix X and vector y
  // X[i][j] = points[i].x^j
  // Solve X^T X c = X^T y

  const XtX: number[][] = [];
  const Xty: number[] = [];

  for (let j = 0; j < d; j++) {
    XtX[j] = [];
    for (let k = 0; k < d; k++) {
      let sum = 0;
      for (let i = 0; i < n; i++) {
        sum += Math.pow(points[i].x, j) * Math.pow(points[i].x, k);
      }
      // Ridge regularization to prevent ill-conditioning
      XtX[j][k] = sum + (j === k ? 0.001 : 0);
    }
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += Math.pow(points[i].x, j) * points[i].y;
    }
    Xty[j] = sum;
  }

  // Solve via Gaussian elimination
  coeffs = solveLinear(XtX, Xty);
}

function solveLinear(A: number[][], b: number[]): number[] {
  const n = A.length;
  // Augmented matrix
  const aug: number[][] = [];
  for (let i = 0; i < n; i++) {
    aug[i] = [...A[i], b[i]];
  }

  // Forward elimination with partial pivoting
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    let maxVal = Math.abs(aug[col][col]);
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > maxVal) {
        maxVal = Math.abs(aug[row][col]);
        maxRow = row;
      }
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    if (Math.abs(aug[col][col]) < 1e-12) continue;

    for (let row = col + 1; row < n; row++) {
      const factor = aug[row][col] / aug[col][col];
      for (let j = col; j <= n; j++) {
        aug[row][j] -= factor * aug[col][j];
      }
    }
  }

  // Back substitution
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = aug[i][n];
    for (let j = i + 1; j < n; j++) {
      sum -= aug[i][j] * x[j];
    }
    x[i] = Math.abs(aug[i][i]) > 1e-12 ? sum / aug[i][i] : 0;
  }
  return x;
}

function evalPoly(x: number): number {
  let val = 0;
  for (let j = 0; j < coeffs.length; j++) {
    val += coeffs[j] * Math.pow(x, j);
  }
  return val;
}

function computeMSE(): number {
  if (points.length === 0) return 0;
  let sum = 0;
  for (const p of points) {
    const err = p.y - evalPoly(p.x);
    sum += err * err;
  }
  return sum / points.length;
}

// ============================================================
// COORDINATE TRANSFORMS
// ============================================================
function toCanvasX(x: number): number {
  return PAD + (x + DATA_RANGE / 2) / DATA_RANGE * (W - 2 * PAD);
}

function toCanvasY(y: number): number {
  return (H - PAD) - (y + DATA_RANGE / 2) / DATA_RANGE * (H - 2 * PAD);
}

function toWorldX(px: number): number {
  return (px - PAD) / (W - 2 * PAD) * DATA_RANGE - DATA_RANGE / 2;
}

function toWorldY(py: number): number {
  return -((py - (H - PAD)) / (H - 2 * PAD) * DATA_RANGE - DATA_RANGE / 2);
}

// ============================================================
// DRAWING
// ============================================================
function draw(): void {
  ctx.clearRect(0, 0, W, H);

  // Grid
  ctx.lineWidth = 1;
  for (let i = -3; i <= 3; i++) {
    const gx = toCanvasX(i);
    ctx.strokeStyle = i === 0 ? COLORS.axis : COLORS.grid;
    ctx.beginPath(); ctx.moveTo(gx, PAD); ctx.lineTo(gx, H - PAD); ctx.stroke();
    const gy = toCanvasY(i);
    ctx.strokeStyle = i === 0 ? COLORS.axis : COLORS.grid;
    ctx.beginPath(); ctx.moveTo(PAD, gy); ctx.lineTo(W - PAD, gy); ctx.stroke();

    // Labels
    ctx.font = '10px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = COLORS.dimText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    if (i !== 0) ctx.fillText(String(i), gx, H - PAD + 4);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    if (i !== 0) ctx.fillText(String(i), PAD - 5, gy);
  }

  // Axis labels
  ctx.font = '11px "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = '#4a4a60';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText('x \u2192', W - PAD, H - PAD + 6);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText('\u2191 y', PAD + 6, PAD - 2);

  // Draw fitted curve
  if (coeffs.length > 0) {
    ctx.beginPath();
    let firstPoint = true;
    for (let px = PAD; px <= W - PAD; px += 2) {
      const x = toWorldX(px);
      const y = evalPoly(x);
      const py = toCanvasY(y);
      if (py > PAD - 20 && py < H - PAD + 20) {
        if (firstPoint) { ctx.moveTo(px, py); firstPoint = false; }
        else ctx.lineTo(px, py);
      } else {
        firstPoint = true;
      }
    }
    ctx.strokeStyle = COLORS.fit;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // Data points
  for (const p of points) {
    const px = toCanvasX(p.x);
    const py = toCanvasY(p.y);
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.point1;
    ctx.fill();
    ctx.strokeStyle = '#0a0a0f';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Degree label on canvas
  ctx.font = 'bold 12px "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = COLORS.fit;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`Degree ${degree} polynomial`, PAD + 8, PAD + 4);
}

// ============================================================
// UI
// ============================================================
function buildMathPanel(): void {
  const panel = $('math-panel');
  let html = '';

  // Feature transform
  html += `<div class="formula-card">`;
  html += `<div class="formula-title">Feature transform \u03C6(x):</div>`;
  html += `<div class="formula-body">`;
  const features: string[] = ['1'];
  for (let d = 1; d <= degree; d++) {
    features.push(d === 1 ? 'x' : `x<sup>${d}</sup>`);
  }
  html += `\u03C6(x) = [${features.join(', ')}]`;
  html += `</div></div>`;

  // Fitted model
  html += `<div class="formula-card">`;
  html += `<div class="formula-title">Fitted model:</div>`;
  html += `<div class="formula-body">y = `;
  const terms: string[] = [];
  for (let j = 0; j < coeffs.length; j++) {
    const c = coeffs[j];
    const cls = Math.abs(c) > 0.001 ? (c > 0 ? 'val-pos' : 'val-neg') : 'val-zero';
    let term = `<span class="${cls}">${c.toFixed(3)}</span>`;
    if (j === 1) term += '·x';
    else if (j > 1) term += `·x<sup>${j}</sup>`;
    terms.push(term);
  }
  html += terms.join(' + ') || '0';
  html += `</div></div>`;

  // MSE
  const mse = computeMSE();
  html += `<div class="formula-card">`;
  html += `<div class="formula-title">Mean Squared Error:</div>`;
  html += `<div class="formula-body">MSE = <span class="${mse < 0.1 ? 'val-pos' : mse < 0.5 ? 'val-warn' : 'val-neg'}">${mse.toFixed(4)}</span></div>`;
  html += `</div>`;

  // Insight
  let insight = '';
  const n = points.length;
  if (n === 0) {
    insight = 'Click on the canvas to add data points, or use the preset buttons to generate sample data.';
  } else if (degree === 1 && mse > 0.3) {
    insight = 'A straight line can\'t capture this pattern. Increase the degree to add polynomial features — this lets the linear model "see" curvature by creating new features like x², x³.';
  } else if (degree >= n && n > 2) {
    insight = `With degree \u2265 number of points, the polynomial passes through every point perfectly (MSE \u2248 0). But this is overfitting — the curve will be wildly wrong between data points. This is why regularization matters.`;
  } else if (degree > 6 && mse < 0.05) {
    insight = 'High-degree polynomial with low error. Watch for overfitting — the curve may oscillate wildly between data points (Runge\'s phenomenon). A lower degree might generalize better.';
  } else if (mse < 0.05) {
    insight = 'Good fit! The polynomial captures the data pattern well. The key insight: by transforming x into [1, x, x², ...], we turned a nonlinear problem into a linear one — we\'re just doing linear regression in a higher-dimensional feature space.';
  } else {
    insight = `Feature transforms are the bridge between linear models and nonlinear data. Each degree adds a new dimension: degree 1 = line, degree 2 = parabola, degree 3 = cubic. The model is still "linear" in the features — it just uses polynomial features instead of raw x.`;
  }
  html += `<div class="insight-box">${insight}</div>`;

  panel.innerHTML = html;
}

function update(): void {
  fitPolynomial();
  draw();
  buildMathPanel();
}

// ============================================================
// INTERACTION
// ============================================================
function onCanvasClick(e: MouseEvent): void {
  const rect = canvas.getBoundingClientRect();
  const px = (e.clientX - rect.left) * W / rect.width;
  const py = (e.clientY - rect.top) * H / rect.height;
  const x = toWorldX(px);
  const y = toWorldY(py);

  if (x >= -DATA_RANGE / 2 && x <= DATA_RANGE / 2 && y >= -DATA_RANGE / 2 && y <= DATA_RANGE / 2) {
    points.push({ x: Math.round(x * 20) / 20, y: Math.round(y * 20) / 20, cls: 0 });
    update();
  }
}

// ============================================================
// CANVAS SIZING
// ============================================================
function resize(): void {
  const container = canvas.parentElement!;
  const w = container.clientWidth;
  const h = Math.min(400, w * 0.65);
  const dpr = window.devicePixelRatio || 1;
  W = w; H = h;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}

// ============================================================
// INIT
// ============================================================
function init(): void {
  canvas = document.getElementById('canvas') as HTMLCanvasElement;
  ctx = canvas.getContext('2d')!;

  generateSineData();
  fitPolynomial();

  canvas.addEventListener('click', onCanvasClick);
  canvas.style.cursor = 'crosshair';

  // Degree buttons
  document.querySelectorAll('.ctrl-btn[data-degree]').forEach(btn => {
    btn.addEventListener('click', () => {
      degree = parseInt((btn as HTMLElement).dataset.degree || '1');
      document.querySelectorAll('.ctrl-btn[data-degree]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      update();
    });
  });

  // Preset data buttons
  $('btn-sine').addEventListener('click', () => { generateSineData(); update(); });
  $('btn-quadratic').addEventListener('click', () => { generateQuadraticData(); update(); });
  $('btn-linear').addEventListener('click', () => { generateLinearData(); update(); });
  $('btn-clear').addEventListener('click', () => { points = []; update(); });

  window.addEventListener('resize', resize);
  resize();
  update();
}

document.addEventListener('DOMContentLoaded', init);
