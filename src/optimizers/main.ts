// ML Optimizer Comparison — Interactive 2D Loss Surface Visualizer
// Compare how GD, SGD, Momentum, AdaGrad, RMSProp, and Adam navigate different loss landscapes
export {};

function $(id: string): HTMLElement { return document.getElementById(id)!; }

// ============================================================
// TYPES & CONSTANTS
// ============================================================

type SurfaceType = 'bowl' | 'valley' | 'saddle' | 'beale';
type OptType = 'gd' | 'sgd' | 'momentum' | 'adagrad' | 'rmsprop' | 'adam' | 'adamw';

interface OptimizerState {
  name: string;
  key: OptType;
  color: string;
  enabled: boolean;
  x: number;
  y: number;
  trail: { x: number; y: number }[];
  steps: number;
  // momentum / adam
  vx: number; vy: number;
  // adagrad / rmsprop / adam
  gx: number; gy: number;
  // adam second set
  mx: number; my: number;
}

const COLORS = {
  bg:     '#0a0a0f',
  panel:  '#12121a',
  border: '#1e1e2a',
  text:   '#d0d0dc',
  dim:    '#666880',
};

const OPT_DEFS: { key: OptType; name: string; color: string }[] = [
  { key: 'gd',       name: 'Full Batch GD',   color: '#7c8cf8' },
  { key: 'sgd',      name: 'Mini-batch SGD',   color: '#38bdf8' },
  { key: 'momentum', name: 'SGD + Momentum',   color: '#a78bfa' },
  { key: 'adagrad',  name: 'AdaGrad',          color: '#f59e0b' },
  { key: 'rmsprop',  name: 'RMSProp',          color: '#f43f5e' },
  { key: 'adam',      name: 'Adam',             color: '#34d399' },
  { key: 'adamw',    name: 'AdamW',            color: '#fb923c' },
];

const INSIGHTS: Record<SurfaceType, string> = {
  bowl:   'All optimizers converge on a simple convex bowl, but adaptive methods (Adam, RMSProp) take a more direct path. AdamW adds weight decay that pulls parameters toward zero — on a bowl centered at the origin, this actually helps convergence.',
  valley: 'The elongated valley causes vanilla GD to zig-zag. Momentum smooths the oscillation, while Adam adapts the learning rate per dimension. AdamW\'s decoupled weight decay gently shrinks the parameters independently of the gradient, so it doesn\'t distort the adaptive step sizes the way L2 regularization in Adam would.',
  saddle: 'Pure GD gets stuck at the saddle point where the gradient is zero. SGD\'s noise and momentum\'s inertia help escape. Adam combines both advantages. AdamW behaves similarly to Adam here — weight decay has little effect near zero.',
  beale:  'Beale\'s function has a narrow curved valley. Adaptive methods shine because different directions need very different step sizes. AdamW\'s weight decay is decoupled from the gradient, so the adaptive per-dimension learning rates stay clean — unlike L2 in vanilla Adam, which leaks regularization into the moment estimates.',
};

// ============================================================
// CANVAS STATE
// ============================================================

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let W = 0, H = 0;
let dpr = 1;

let surface: SurfaceType = 'bowl';
let lr = 0.05;
let speed = 1;
let playing = true;
let animId = 0;

let surfaceImage: ImageData | null = null;

// Viewport: the x,y range we display
const VIEW: Record<SurfaceType, { xmin: number; xmax: number; ymin: number; ymax: number }> = {
  bowl:   { xmin: -3, xmax: 3, ymin: -3, ymax: 3 },
  valley: { xmin: -3, xmax: 3, ymin: -1.5, ymax: 1.5 },
  saddle: { xmin: -3, xmax: 3, ymin: -3, ymax: 3 },
  beale:  { xmin: -1, xmax: 4, ymin: -1, ymax: 4 },
};

// Starting positions per surface
const START: Record<SurfaceType, { x: number; y: number }> = {
  bowl:   { x: 2.5, y: 2.0 },
  valley: { x: 2.5, y: 1.2 },
  saddle: { x: 0.5, y: 0.05 },
  beale:  { x: 3.5, y: 3.5 },
};

let optimizers: OptimizerState[] = [];

// ============================================================
// LOSS SURFACES & GRADIENTS
// ============================================================

function loss(sx: SurfaceType, x: number, y: number): number {
  switch (sx) {
    case 'bowl':   return x * x + y * y;
    case 'valley': return x * x + 10 * y * y;
    case 'saddle': return x * x - y * y;
    case 'beale': {
      const a = 1.5 - x + x * y;
      const b = 2.25 - x + x * y * y;
      const c = 2.625 - x + x * y * y * y;
      return a * a + b * b + c * c;
    }
  }
}

function gradient(sx: SurfaceType, x: number, y: number): [number, number] {
  switch (sx) {
    case 'bowl':   return [2 * x, 2 * y];
    case 'valley': return [2 * x, 20 * y];
    case 'saddle': return [2 * x, -2 * y];
    case 'beale': {
      const a = 1.5 - x + x * y;
      const b = 2.25 - x + x * y * y;
      const c = 2.625 - x + x * y * y * y;
      const da_dx = -1 + y;
      const da_dy = x;
      const db_dx = -1 + y * y;
      const db_dy = 2 * x * y;
      const dc_dx = -1 + y * y * y;
      const dc_dy = 3 * x * y * y;
      const dx = 2 * a * da_dx + 2 * b * db_dx + 2 * c * dc_dx;
      const dy = 2 * a * da_dy + 2 * b * db_dy + 2 * c * dc_dy;
      return [dx, dy];
    }
  }
}

// ============================================================
// COLORMAP — dark blue -> cyan -> yellow -> red
// ============================================================

function heatColor(t: number): [number, number, number] {
  // t in [0, 1], clamped
  t = Math.max(0, Math.min(1, t));
  let r: number, g: number, b: number;
  if (t < 0.25) {
    const s = t / 0.25;
    r = 10; g = 10 + s * 60; b = 40 + s * 120;
  } else if (t < 0.5) {
    const s = (t - 0.25) / 0.25;
    r = 10 + s * 40; g = 70 + s * 130; b = 160 - s * 40;
  } else if (t < 0.75) {
    const s = (t - 0.5) / 0.25;
    r = 50 + s * 180; g = 200 - s * 40; b = 120 - s * 100;
  } else {
    const s = (t - 0.75) / 0.25;
    r = 230 + s * 25; g = 160 - s * 120; b = 20 - s * 15;
  }
  return [Math.round(r), Math.round(g), Math.round(b)];
}

// ============================================================
// PRECOMPUTE SURFACE IMAGE
// ============================================================

function buildSurfaceImage(): void {
  const v = VIEW[surface];
  const cw = Math.round(W * dpr);
  const ch = Math.round(H * dpr);
  const img = ctx.createImageData(cw, ch);
  const data = img.data;

  // Sample loss values to find range for normalization
  let minL = Infinity, maxL = -Infinity;
  const grid: number[] = new Array(cw * ch);
  for (let py = 0; py < ch; py++) {
    const sy = v.ymin + (py / ch) * (v.ymax - v.ymin);
    for (let px = 0; px < cw; px++) {
      const sx = v.xmin + (px / cw) * (v.xmax - v.xmin);
      const l = loss(surface, sx, sy);
      grid[py * cw + px] = l;
      if (l < minL) minL = l;
      if (l > maxL) maxL = l;
    }
  }

  // Use log scale for better contrast
  const logMin = Math.log(1 + Math.max(0, minL));
  const logMax = Math.log(1 + Math.max(0, maxL));
  const range = logMax - logMin || 1;

  for (let i = 0; i < grid.length; i++) {
    const raw = grid[i];
    // For saddle, values can be negative
    const shifted = raw - minL;
    const t = Math.log(1 + shifted) / Math.log(1 + (maxL - minL || 1));
    const [r, g, b] = heatColor(t);
    data[i * 4]     = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  }

  surfaceImage = img;
}

// ============================================================
// CONTOUR LINES (draw on top of heatmap for readability)
// ============================================================

function drawContours(): void {
  const v = VIEW[surface];
  const nLevels = 12;

  // Find loss range
  let minL = Infinity, maxL = -Infinity;
  const step = 40;
  for (let py = 0; py < H; py += step) {
    const sy = v.ymin + (py / H) * (v.ymax - v.ymin);
    for (let px = 0; px < W; px += step) {
      const sx = v.xmin + (px / W) * (v.xmax - v.xmin);
      const l = loss(surface, sx, sy);
      if (l < minL) minL = l;
      if (l > maxL) maxL = l;
    }
  }

  // Draw contour levels using marching squares (simplified: just draw dots where loss crosses level)
  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 0.5;

  const logRange = Math.log(1 + maxL - minL) || 1;

  for (let li = 1; li < nLevels; li++) {
    const t = li / nLevels;
    const level = minL + Math.exp(t * logRange) - 1;
    ctx.beginPath();
    const res = 3;
    for (let py = 0; py < H - res; py += res) {
      const sy0 = v.ymin + (py / H) * (v.ymax - v.ymin);
      const sy1 = v.ymin + ((py + res) / H) * (v.ymax - v.ymin);
      for (let px = 0; px < W - res; px += res) {
        const sx0 = v.xmin + (px / W) * (v.xmax - v.xmin);
        const sx1 = v.xmin + ((px + res) / W) * (v.xmax - v.xmin);
        const v00 = loss(surface, sx0, sy0);
        const v10 = loss(surface, sx1, sy0);
        const v01 = loss(surface, sx0, sy1);
        const v11 = loss(surface, sx1, sy1);
        // Check if contour crosses any edge
        const edges: [number, number, number, number][] = [
          [v00, v10, px, py], [v10, v11, px + res, py],
          [v01, v11, px, py + res], [v00, v01, px, py],
        ];
        for (const [va, vb] of edges) {
          if ((va - level) * (vb - level) < 0) {
            const frac = (level - va) / (vb - va);
            // Approximate position
            ctx.moveTo(px + frac * res, py);
            ctx.lineTo(px + frac * res + 0.5, py + 0.5);
          }
        }
      }
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1.0;
}

// ============================================================
// COORDINATE TRANSFORMS
// ============================================================

function worldToCanvas(wx: number, wy: number): [number, number] {
  const v = VIEW[surface];
  const px = ((wx - v.xmin) / (v.xmax - v.xmin)) * W;
  const py = ((wy - v.ymin) / (v.ymax - v.ymin)) * H;
  return [px, py];
}

// ============================================================
// OPTIMIZER LOGIC
// ============================================================

function makeOptimizer(def: typeof OPT_DEFS[0]): OptimizerState {
  const s = START[surface];
  return {
    name: def.name, key: def.key, color: def.color,
    enabled: true,
    x: s.x, y: s.y,
    trail: [{ x: s.x, y: s.y }],
    steps: 0,
    vx: 0, vy: 0,
    gx: 0, gy: 0,
    mx: 0, my: 0,
  };
}

function resetOptimizers(): void {
  const enabledState = new Map<OptType, boolean>();
  for (const o of optimizers) enabledState.set(o.key, o.enabled);
  optimizers = OPT_DEFS.map(d => {
    const o = makeOptimizer(d);
    if (enabledState.has(d.key)) o.enabled = enabledState.get(d.key)!;
    return o;
  });
}

function stepOptimizer(o: OptimizerState): void {
  if (!o.enabled) return;
  const [gx, gy] = gradient(surface, o.x, o.y);
  const eps = 1e-8;
  const beta = 0.9;
  const beta1 = 0.9, beta2 = 0.999;
  const gamma = 0.9;

  switch (o.key) {
    case 'gd':
      o.x -= lr * gx;
      o.y -= lr * gy;
      break;

    case 'sgd': {
      const noise = 0.3;
      const nx = gx + (Math.random() - 0.5) * noise * (Math.abs(gx) + 0.1);
      const ny = gy + (Math.random() - 0.5) * noise * (Math.abs(gy) + 0.1);
      o.x -= lr * nx;
      o.y -= lr * ny;
      break;
    }

    case 'momentum':
      o.vx = beta * o.vx + gx;
      o.vy = beta * o.vy + gy;
      o.x -= lr * o.vx;
      o.y -= lr * o.vy;
      break;

    case 'adagrad':
      o.gx += gx * gx;
      o.gy += gy * gy;
      o.x -= lr * gx / (Math.sqrt(o.gx) + eps);
      o.y -= lr * gy / (Math.sqrt(o.gy) + eps);
      break;

    case 'rmsprop':
      o.gx = gamma * o.gx + (1 - gamma) * gx * gx;
      o.gy = gamma * o.gy + (1 - gamma) * gy * gy;
      o.x -= lr * gx / (Math.sqrt(o.gx) + eps);
      o.y -= lr * gy / (Math.sqrt(o.gy) + eps);
      break;

    case 'adam': {
      o.steps++;
      const t = o.steps;
      o.mx = beta1 * o.mx + (1 - beta1) * gx;
      o.my = beta1 * o.my + (1 - beta1) * gy;
      o.gx = beta2 * o.gx + (1 - beta2) * gx * gx;
      o.gy = beta2 * o.gy + (1 - beta2) * gy * gy;
      const mxh = o.mx / (1 - Math.pow(beta1, t));
      const myh = o.my / (1 - Math.pow(beta1, t));
      const vxh = o.gx / (1 - Math.pow(beta2, t));
      const vyh = o.gy / (1 - Math.pow(beta2, t));
      o.x -= lr * mxh / (Math.sqrt(vxh) + eps);
      o.y -= lr * myh / (Math.sqrt(vyh) + eps);
      break;
    }

    case 'adamw': {
      // AdamW: decoupled weight decay — decay is applied directly to params,
      // NOT through the gradient like L2 regularization in Adam
      const wd = 0.01;
      o.steps++;
      const tw = o.steps;
      o.mx = beta1 * o.mx + (1 - beta1) * gx;
      o.my = beta1 * o.my + (1 - beta1) * gy;
      o.gx = beta2 * o.gx + (1 - beta2) * gx * gx;
      o.gy = beta2 * o.gy + (1 - beta2) * gy * gy;
      const mxhw = o.mx / (1 - Math.pow(beta1, tw));
      const myhw = o.my / (1 - Math.pow(beta1, tw));
      const vxhw = o.gx / (1 - Math.pow(beta2, tw));
      const vyhw = o.gy / (1 - Math.pow(beta2, tw));
      // Weight decay step: shrink params toward zero BEFORE the Adam update
      o.x -= lr * wd * o.x;
      o.y -= lr * wd * o.y;
      // Adam update step
      o.x -= lr * mxhw / (Math.sqrt(vxhw) + eps);
      o.y -= lr * myhw / (Math.sqrt(vyhw) + eps);
      break;
    }
  }

  // Clamp to view bounds
  const v = VIEW[surface];
  o.x = Math.max(v.xmin, Math.min(v.xmax, o.x));
  o.y = Math.max(v.ymin, Math.min(v.ymax, o.y));

  if (o.key !== 'adam' && o.key !== 'adamw') o.steps++;
  o.trail.push({ x: o.x, y: o.y });
}

// ============================================================
// DRAWING
// ============================================================

function draw(): void {
  ctx.save();

  // putImageData ignores transforms — write directly to backing store
  if (surfaceImage) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.putImageData(surfaceImage, 0, 0);
  }

  // All subsequent drawing uses DPR scaling
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Contour lines
  drawContours();

  // Axis labels
  const v = VIEW[surface];
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.fillStyle = COLORS.dim;
  ctx.textAlign = 'center';
  for (let i = 0; i <= 4; i++) {
    const wx = v.xmin + (i / 4) * (v.xmax - v.xmin);
    const [px] = worldToCanvas(wx, 0);
    ctx.fillText(wx.toFixed(1), px, H - 4);
  }
  ctx.textAlign = 'left';
  for (let i = 0; i <= 4; i++) {
    const wy = v.ymin + (i / 4) * (v.ymax - v.ymin);
    const [, py] = worldToCanvas(0, wy);
    ctx.fillText(wy.toFixed(1), 4, py - 2);
  }

  // Draw origin crosshair
  const [ox, oy] = worldToCanvas(0, 0);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(ox, 0); ctx.lineTo(ox, H);
  ctx.moveTo(0, oy); ctx.lineTo(W, oy);
  ctx.stroke();

  // Draw optimizer trails and positions
  for (const o of optimizers) {
    if (!o.enabled || o.trail.length < 2) continue;

    // Trail
    ctx.strokeStyle = o.color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    const [sx, sy] = worldToCanvas(o.trail[0].x, o.trail[0].y);
    ctx.moveTo(sx, sy);
    for (let i = 1; i < o.trail.length; i++) {
      const [tx, ty] = worldToCanvas(o.trail[i].x, o.trail[i].y);
      ctx.lineTo(tx, ty);
    }
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Current position dot
    const last = o.trail[o.trail.length - 1];
    const [cx, cy] = worldToCanvas(last.x, last.y);
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = o.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillStyle = o.color;
    ctx.textAlign = 'left';
    ctx.fillText(o.name, cx + 8, cy - 6);
  }

  // Start marker
  const sp = START[surface];
  const [spx, spy] = worldToCanvas(sp.x, sp.y);
  ctx.beginPath();
  ctx.arc(spx, spy, 7, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('START', spx, spy - 12);

  // Surface name overlay
  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.textAlign = 'right';
  const surfaceLabels: Record<SurfaceType, string> = {
    bowl: 'f(x,y) = x\u00B2 + y\u00B2',
    valley: 'f(x,y) = x\u00B2 + 10y\u00B2',
    saddle: 'f(x,y) = x\u00B2 \u2212 y\u00B2',
    beale: 'Beale\'s function',
  };
  ctx.fillText(surfaceLabels[surface], W - 10, 22);

  ctx.restore();
}

// ============================================================
// INFO PANEL & INSIGHT
// ============================================================

function updateInfo(): void {
  const panel = $('info-panel');
  const active = optimizers.filter(o => o.enabled);
  if (active.length === 0) {
    panel.innerHTML = '<div style="color:' + COLORS.dim + '">Enable an optimizer to begin</div>';
    return;
  }

  let bestLoss = Infinity;
  let bestKey = '';
  for (const o of active) {
    const l = loss(surface, o.x, o.y);
    if (l < bestLoss) { bestLoss = l; bestKey = o.key; }
  }

  let html = '';
  for (const o of active) {
    const l = loss(surface, o.x, o.y);
    const isBest = o.key === bestKey;
    const winBadge = isBest ? ' <span style="color:#34d399;font-size:10px">\u2714 lowest</span>' : '';
    html += '<div style="display:flex;align-items:center;gap:8px;padding:3px 0;'
      + (isBest ? 'background:rgba(52,211,153,0.06);border-radius:4px;padding:3px 6px;margin:-1px -6px' : '')
      + '">'
      + '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + o.color + '"></span>'
      + '<span style="color:' + o.color + ';min-width:130px">' + o.name + '</span>'
      + '<span style="color:' + COLORS.dim + ';font-size:11px">loss=' + l.toFixed(4) + '</span>'
      + '<span style="color:' + COLORS.dim + ';font-size:11px">steps=' + o.steps + '</span>'
      + winBadge
      + '</div>';
  }
  panel.innerHTML = html;
}

function updateInsight(): void {
  $('insight-box').textContent = INSIGHTS[surface];
}

// ============================================================
// ANIMATION LOOP
// ============================================================

function tick(): void {
  if (playing) {
    for (let s = 0; s < speed; s++) {
      for (const o of optimizers) stepOptimizer(o);
    }
  }
  draw();
  updateInfo();
  animId = requestAnimationFrame(tick);
}

// ============================================================
// RESIZE
// ============================================================

function resize(): void {
  dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  W = rect.width;
  H = rect.height;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  buildSurfaceImage();
}

// ============================================================
// EVENT WIRING
// ============================================================

function init(): void {
  canvas = document.querySelector('canvas')!;
  ctx = canvas.getContext('2d')!;

  resize();
  resetOptimizers();
  updateInsight();

  window.addEventListener('resize', () => {
    resize();
  });

  // Surface buttons
  document.querySelectorAll('.ctrl-btn[data-surface]').forEach(btn => {
    btn.addEventListener('click', () => {
      surface = (btn as HTMLElement).dataset.surface as SurfaceType;
      document.querySelectorAll('.ctrl-btn[data-surface]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      buildSurfaceImage();
      resetOptimizers();
      updateInsight();
    });
  });

  // Optimizer toggle buttons
  document.querySelectorAll('.opt-btn[data-opt]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = (btn as HTMLElement).dataset.opt as OptType;
      const o = optimizers.find(op => op.key === key);
      if (o) {
        o.enabled = !o.enabled;
        btn.classList.toggle('active', o.enabled);
      }
    });
  });

  // Learning rate slider
  const lrSlider = $('lr-slider') as HTMLInputElement;
  lrSlider.addEventListener('input', () => {
    lr = parseFloat(lrSlider.value);
    ($('lr-val') as HTMLElement).textContent = lr.toFixed(3);
  });

  // Speed slider
  const speedSlider = $('speed-slider') as HTMLInputElement;
  speedSlider.addEventListener('input', () => {
    speed = parseInt(speedSlider.value, 10);
  });

  // Play/Pause
  $('btn-play').addEventListener('click', () => {
    playing = !playing;
    $('btn-play').textContent = playing ? 'Pause' : 'Play';
  });

  // Reset
  $('btn-reset').addEventListener('click', () => {
    resetOptimizers();
  });

  tick();
}

document.addEventListener('DOMContentLoaded', init);
