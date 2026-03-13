// Loss Functions — Interactive Visualizer
// Compare Step, MSE, Cross-Entropy, Sigmoid, and Softmax+CE
export {};

function $(id: string): HTMLElement { return document.getElementById(id)!; }

// ============================================================
// CONSTANTS & STATE
// ============================================================

const COLORS = {
  bg:       '#0a0a0f',
  panel:    '#12121a',
  border:   '#1e1e2a',
  text:     '#d0d0dc',
  dim:      '#666880',
  positive: '#34d399',
  negative: '#f43f5e',
  accent:   '#7c8cf8',
  grid:     '#1a1a28',
  axis:     '#3a3a50',
};

const LOSS_COLORS: Record<string, string> = {
  'step':         '#f43f5e',
  'mse':          '#7c8cf8',
  'sigmoid':      '#a78bfa',
  'cross-entropy': '#f59e0b',
  'softmax-ce':   '#34d399',
};

const LOSS_NAMES: Record<string, string> = {
  'step':         'Step (0/1) Loss',
  'mse':          'MSE Loss',
  'sigmoid':      'Sigmoid \u03c3(\u0177)',
  'cross-entropy': 'Cross-Entropy',
  'softmax-ce':   'Softmax + CE',
};

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let W = 0, H = 0;

// Plot region within canvas (in CSS pixels)
const MARGIN = { top: 30, right: 30, bottom: 50, left: 60 };

// X range: raw logit from -3 to 3
const X_MIN = -3, X_MAX = 3;
// Y range: loss from 0 to 4
const Y_MIN = 0, Y_MAX = 4;

let prediction = 0.5;      // current logit value (x-axis)
let trueLabel = 1;          // 0 or 1
let dragging = false;

let activeLosses: Record<string, boolean> = {
  'step': true,
  'mse': true,
  'sigmoid': true,
  'cross-entropy': true,
  'softmax-ce': false,
};

// ============================================================
// MATH HELPERS
// ============================================================

function sigmoid(x: number): number {
  if (x > 20) return 1;
  if (x < -20) return 0;
  return 1 / (1 + Math.exp(-x));
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Step (0/1) loss: 0 if prediction agrees with label, 1 otherwise */
function stepLoss(logit: number, y: number): number {
  const predicted = sigmoid(logit) >= 0.5 ? 1 : 0;
  return predicted === y ? 0 : 1;
}

/** MSE: (y - sigma(logit))^2 */
function mseLoss(logit: number, y: number): number {
  const p = sigmoid(logit);
  return (y - p) * (y - p);
}

/** Binary cross-entropy: -[y*log(p) + (1-y)*log(1-p)] */
function crossEntropyLoss(logit: number, y: number): number {
  const p = clamp(sigmoid(logit), 1e-7, 1 - 1e-7);
  return -(y * Math.log(p) + (1 - y) * Math.log(1 - p));
}

/** Softmax + CE for 2 classes reduces to sigmoid + CE */
function softmaxCELoss(logit: number, y: number): number {
  // For binary: softmax([logit, 0]) = [sigmoid(logit), sigmoid(-logit)]
  // CE = -log(p_correct)
  // This is identical to binary cross-entropy
  return crossEntropyLoss(logit, y);
}

/** Sigmoid output (not a loss, but a reference curve) */
function sigmoidOutput(logit: number): number {
  return sigmoid(logit);
}

type LossFn = (logit: number, y: number) => number;

const LOSS_FNS: Record<string, LossFn> = {
  'step':          stepLoss,
  'mse':           mseLoss,
  'sigmoid':       (logit, _y) => sigmoidOutput(logit),
  'cross-entropy': crossEntropyLoss,
  'softmax-ce':    softmaxCELoss,
};

// ============================================================
// COORDINATE TRANSFORMS
// ============================================================

function plotLeft(): number { return MARGIN.left; }
function plotTop(): number { return MARGIN.top; }
function plotWidth(): number { return W - MARGIN.left - MARGIN.right; }
function plotHeight(): number { return H - MARGIN.top - MARGIN.bottom; }

function xToCanvas(x: number): number {
  return plotLeft() + ((x - X_MIN) / (X_MAX - X_MIN)) * plotWidth();
}

function yToCanvas(y: number): number {
  return plotTop() + plotHeight() - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * plotHeight();
}

function canvasToX(cx: number): number {
  return X_MIN + ((cx - plotLeft()) / plotWidth()) * (X_MAX - X_MIN);
}

// ============================================================
// DRAWING
// ============================================================

function clear(): void {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);
}

function drawGrid(): void {
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;

  // Vertical grid lines
  for (let x = Math.ceil(X_MIN); x <= X_MAX; x++) {
    const cx = xToCanvas(x);
    ctx.beginPath();
    ctx.moveTo(cx, plotTop());
    ctx.lineTo(cx, plotTop() + plotHeight());
    ctx.stroke();
  }

  // Horizontal grid lines
  for (let y = Y_MIN; y <= Y_MAX; y += 0.5) {
    const cy = yToCanvas(y);
    ctx.beginPath();
    ctx.moveTo(plotLeft(), cy);
    ctx.lineTo(plotLeft() + plotWidth(), cy);
    ctx.stroke();
  }
}

function drawAxes(): void {
  ctx.strokeStyle = COLORS.axis;
  ctx.lineWidth = 1.5;

  // X axis
  const y0 = yToCanvas(0);
  ctx.beginPath();
  ctx.moveTo(plotLeft(), y0);
  ctx.lineTo(plotLeft() + plotWidth(), y0);
  ctx.stroke();

  // Y axis
  ctx.beginPath();
  ctx.moveTo(plotLeft(), plotTop());
  ctx.lineTo(plotLeft(), plotTop() + plotHeight());
  ctx.stroke();

  // Labels
  ctx.fillStyle = COLORS.dim;
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';

  for (let x = Math.ceil(X_MIN); x <= X_MAX; x++) {
    ctx.fillText(x.toString(), xToCanvas(x), plotTop() + plotHeight() + 18);
  }
  ctx.fillText('logit (\u0177)', plotLeft() + plotWidth() / 2, plotTop() + plotHeight() + 40);

  ctx.textAlign = 'right';
  for (let y = Y_MIN; y <= Y_MAX; y += 1) {
    ctx.fillText(y.toFixed(0), plotLeft() - 8, yToCanvas(y) + 4);
  }

  ctx.save();
  ctx.translate(14, plotTop() + plotHeight() / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillText('loss / value', 0, 0);
  ctx.restore();
}

function drawCurve(key: string): void {
  const fn = LOSS_FNS[key];
  const color = LOSS_COLORS[key];
  const steps = 300;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();

  let started = false;
  for (let i = 0; i <= steps; i++) {
    const x = X_MIN + (i / steps) * (X_MAX - X_MIN);
    let y = fn(x, trueLabel);
    y = clamp(y, Y_MIN, Y_MAX + 0.5);

    const cx = xToCanvas(x);
    const cy = yToCanvas(y);

    // For step loss, draw as a step function
    if (key === 'step' && i > 0) {
      const prevX = X_MIN + ((i - 1) / steps) * (X_MAX - X_MIN);
      const prevY = fn(prevX, trueLabel);
      if (Math.abs(y - prevY) > 0.5) {
        // vertical jump
        ctx.lineTo(cx, yToCanvas(clamp(prevY, Y_MIN, Y_MAX)));
      }
    }

    if (!started) { ctx.moveTo(cx, cy); started = true; }
    else ctx.lineTo(cx, cy);
  }
  ctx.stroke();
}

function drawPredictionLine(): void {
  const cx = xToCanvas(prediction);

  // Dashed vertical line
  ctx.strokeStyle = COLORS.text;
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(cx, plotTop());
  ctx.lineTo(cx, plotTop() + plotHeight());
  ctx.stroke();
  ctx.setLineDash([]);

  // Dots on each active curve
  for (const key of Object.keys(activeLosses)) {
    if (!activeLosses[key]) continue;
    const fn = LOSS_FNS[key];
    const y = clamp(fn(prediction, trueLabel), Y_MIN, Y_MAX);
    const cy = yToCanvas(y);

    ctx.fillStyle = LOSS_COLORS[key];
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();

    // Value label next to dot
    ctx.fillStyle = LOSS_COLORS[key];
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(fn(prediction, trueLabel).toFixed(3), cx + 10, cy + 4);
  }

  // Draggable handle at bottom
  ctx.fillStyle = COLORS.text;
  ctx.beginPath();
  ctx.arc(cx, plotTop() + plotHeight(), 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.bg;
  ctx.beginPath();
  ctx.arc(cx, plotTop() + plotHeight(), 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawLegend(): void {
  let x = plotLeft() + 10;
  const y = plotTop() + 16;

  ctx.font = '11px monospace';
  for (const key of Object.keys(LOSS_NAMES)) {
    if (!activeLosses[key]) continue;
    ctx.fillStyle = LOSS_COLORS[key];
    ctx.fillRect(x, y - 8, 12, 3);
    ctx.fillStyle = COLORS.dim;
    ctx.textAlign = 'left';
    ctx.fillText(LOSS_NAMES[key], x + 16, y);
    x += ctx.measureText(LOSS_NAMES[key]).width + 30;
  }
}

function draw(): void {
  clear();
  drawGrid();
  drawAxes();

  for (const key of Object.keys(activeLosses)) {
    if (activeLosses[key]) drawCurve(key);
  }

  drawPredictionLine();
  drawLegend();
}

// ============================================================
// UI UPDATES
// ============================================================

function updateMathPanel(): void {
  const panel = $('math-panel');
  const p = sigmoid(prediction);
  const lines: string[] = [];

  const active = Object.keys(activeLosses).filter(k => activeLosses[k]);

  for (const key of active) {
    const val = LOSS_FNS[key](prediction, trueLabel);
    const color = LOSS_COLORS[key];
    let formula = '';
    let diff = true;

    switch (key) {
      case 'step':
        formula = `L = { 0 if correct, 1 if wrong }`;
        diff = false;
        break;
      case 'mse':
        formula = `L = (y - \u03c3(\u0177))\u00b2 = (${trueLabel} - ${p.toFixed(3)})\u00b2`;
        break;
      case 'sigmoid':
        formula = `\u03c3(\u0177) = 1 / (1 + e^(-\u0177)) = ${p.toFixed(4)}`;
        break;
      case 'cross-entropy':
        formula = `L = -[y\u00b7log(p) + (1-y)\u00b7log(1-p)]`;
        break;
      case 'softmax-ce':
        formula = `L = -log(softmax(\u0177)_y) \u2261 -log(\u03c3(\u0177))  [binary]`;
        break;
    }

    const diffTag = diff
      ? `<span style="color:${COLORS.positive}">differentiable</span>`
      : `<span style="color:${COLORS.negative}">not differentiable</span>`;

    lines.push(
      `<div style="margin-bottom:8px;border-left:3px solid ${color};padding-left:10px;">` +
      `<strong style="color:${color}">${LOSS_NAMES[key]}</strong> ${diffTag}<br>` +
      `<code style="color:${COLORS.dim}">${formula}</code><br>` +
      `<span style="color:${COLORS.text}">= ${val.toFixed(4)}</span></div>`
    );
  }

  panel.innerHTML = lines.join('');
}

function updateInsightBox(): void {
  const box = $('insight-box');
  const p = sigmoid(prediction);
  const correct = (trueLabel === 1 && p > 0.5) || (trueLabel === 0 && p < 0.5);
  const confident = Math.abs(prediction) > 2;
  const near = Math.abs(prediction) < 0.3;
  const ce = crossEntropyLoss(prediction, trueLabel);
  const mse = mseLoss(prediction, trueLabel);

  let msg = '';

  if (correct && confident) {
    msg = `<strong>Confident correct prediction.</strong> All smooth losses approach 0. ` +
      `MSE (${mse.toFixed(3)}) and cross-entropy (${ce.toFixed(3)}) both reward confident correct answers, ` +
      `but CE approaches 0 faster because log(1) = 0 exactly.`;
  } else if (!correct && confident) {
    msg = `<strong>Confident WRONG prediction.</strong> Cross-entropy (${ce.toFixed(2)}) explodes ` +
      `because -log(p) \u2192 \u221e as p \u2192 0. MSE is capped at 1.0 since (\u0394p)\u00b2 \u2264 1. ` +
      `This steep CE gradient is why neural nets learn faster with cross-entropy than MSE for classification.`;
  } else if (near) {
    msg = `<strong>Near decision boundary.</strong> The sigmoid output is ~0.5, meaning maximum uncertainty. ` +
      `MSE = ${mse.toFixed(3)}, CE = ${ce.toFixed(3)}. Both penalize this, but CE's gradient is steeper here, ` +
      `pushing the model away from the boundary more aggressively.`;
  } else if (!correct) {
    msg = `<strong>Wrong but not confident.</strong> Step loss jumps to 1 immediately, giving no gradient signal. ` +
      `MSE and CE provide smooth gradients that tell the optimizer which direction to move. ` +
      `This is why we cannot train with step loss \u2014 it has zero gradient almost everywhere.`;
  } else {
    msg = `<strong>Correct prediction.</strong> Step loss = 0, smooth losses are small. ` +
      `The key difference: step loss cannot tell the optimizer "how close" the prediction is to flipping. ` +
      `MSE and CE encode distance from the boundary, enabling gradient descent.`;
  }

  if (activeLosses['softmax-ce'] && activeLosses['cross-entropy']) {
    msg += `<br><br><em style="color:${COLORS.positive}">Note:</em> The softmax+CE curve exactly overlaps ` +
      `cross-entropy. For 2 classes, softmax([z, 0]) = [\u03c3(z), \u03c3(-z)], so -log(softmax_y) = ` +
      `-log(\u03c3(z)) = binary CE. They are mathematically identical.`;
  }

  box.innerHTML = msg;
}

function updatePredictionDisplay(): void {
  $('prediction-val').textContent = `\u0177 = ${prediction.toFixed(2)}  (\u03c3 = ${sigmoid(prediction).toFixed(3)})`;
}

function updateAll(): void {
  draw();
  updateMathPanel();
  updateInsightBox();
  updatePredictionDisplay();
}

// ============================================================
// CANVAS SETUP & RESIZE
// ============================================================

function setupCanvas(): void {
  canvas = document.querySelector('canvas')!;
  ctx = canvas.getContext('2d')!;
  resize();
}

function resize(): void {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  W = rect.width;
  H = rect.height;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  updateAll();
}

// ============================================================
// EVENT HANDLERS
// ============================================================

function getCanvasPos(e: MouseEvent | Touch): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function onPointerDown(e: MouseEvent): void {
  const pos = getCanvasPos(e);
  // Check if near the prediction line or handle
  const predCx = xToCanvas(prediction);
  if (Math.abs(pos.x - predCx) < 20) {
    dragging = true;
    canvas.style.cursor = 'grabbing';
    e.preventDefault();
  }
}

function onPointerMove(e: MouseEvent): void {
  if (!dragging) {
    // Hover cursor hint
    const pos = getCanvasPos(e);
    const predCx = xToCanvas(prediction);
    canvas.style.cursor = Math.abs(pos.x - predCx) < 20 ? 'grab' : 'crosshair';
    return;
  }
  const pos = getCanvasPos(e);
  prediction = clamp(canvasToX(pos.x), X_MIN, X_MAX);
  updateAll();
}

function onPointerUp(): void {
  dragging = false;
  canvas.style.cursor = 'crosshair';
}

function onTouchStart(e: TouchEvent): void {
  const pos = getCanvasPos(e.touches[0]);
  const predCx = xToCanvas(prediction);
  if (Math.abs(pos.x - predCx) < 30) {
    dragging = true;
    e.preventDefault();
  }
}

function onTouchMove(e: TouchEvent): void {
  if (!dragging) return;
  e.preventDefault();
  const pos = getCanvasPos(e.touches[0]);
  prediction = clamp(canvasToX(pos.x), X_MIN, X_MAX);
  updateAll();
}

function setupInteraction(): void {
  canvas.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', () => { dragging = false; });

  // Loss toggle buttons
  document.querySelectorAll('.loss-btn').forEach(btn => {
    const el = btn as HTMLElement;
    const key = el.dataset.loss!;
    el.style.borderColor = LOSS_COLORS[key];
    if (activeLosses[key]) el.classList.add('active');

    el.addEventListener('click', () => {
      activeLosses[key] = !activeLosses[key];
      el.classList.toggle('active');
      updateAll();
    });
  });

  // True label buttons
  $('btn-label-1').addEventListener('click', () => {
    trueLabel = 1;
    $('btn-label-1').classList.add('active');
    $('btn-label-0').classList.remove('active');
    updateAll();
  });

  $('btn-label-0').addEventListener('click', () => {
    trueLabel = 0;
    $('btn-label-0').classList.remove('active');
    $('btn-label-1').classList.add('active');
    updateAll();
  });

  // Initial button state
  $('btn-label-1').classList.add('active');

  window.addEventListener('resize', resize);
}

// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  setupCanvas();
  setupInteraction();
  updateAll();
});
