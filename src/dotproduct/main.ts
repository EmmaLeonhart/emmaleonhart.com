// Dot Product Interactive Visualizer
// Side-by-side canvas + info panel with projection, both formulas, insight box
export {};

interface Vec2 { x: number; y: number; }

const COLORS = {
  vecA: '#f97316',
  vecB: '#38bdf8',
  proj: '#a78bfa',
  projDash: 'rgba(167, 139, 250, 0.5)',
  perpMark: 'rgba(52, 211, 153, 0.6)',
  arcColor: 'rgba(250, 204, 21, 0.5)',
  arcText: '#facc15',
  grid: '#16161f',
  axis: '#2a2a3e',
  bg: '#12121a',
  axisLabel: '#2a2a40',
  positive: '#34d399',
  negative: '#f43f5e',
  zero: '#facc15',
};

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

let vecA: Vec2 = { x: 6, y: 0 };
let vecB: Vec2 = { x: 3, y: 3 };
let dragging: 'A' | 'B' | null = null;

let SCALE = 40;
let W = 0, H = 0;
let CX = 0, CY = 0;

function toCanvas(v: Vec2): Vec2 {
  return { x: CX + v.x * SCALE, y: CY - v.y * SCALE };
}

function toWorld(px: number, py: number): Vec2 {
  return {
    x: Math.round((px - CX) / SCALE),
    y: Math.round(-(py - CY) / SCALE),
  };
}

function dot(a: Vec2, b: Vec2): number { return a.x * b.x + a.y * b.y; }
function mag(v: Vec2): number { return Math.hypot(v.x, v.y); }

function resize(): void {
  const container = canvas.parentElement!;
  const w = Math.min(container.clientWidth, 800);
  const h = Math.min(w, 600);
  const dpr = window.devicePixelRatio || 1;
  W = w;
  H = h;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  CX = W / 2;
  CY = H / 2;
  SCALE = Math.max(30, Math.min(50, W / 16));
  draw();
}

// ============================================================
// DRAWING HELPERS
// ============================================================
function drawArrow(x1: number, y1: number, x2: number, y2: number, color: string, width: number = 2.5, label: string = ''): void {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 1) return;
  const ux = dx / len, uy = dy / len;
  const hw = 10, hh = 5;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - ux * hw + uy * hh, y2 - uy * hw - ux * hh);
  ctx.lineTo(x2 - ux * hw - uy * hh, y2 - uy * hw + ux * hh);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  if (label) {
    ctx.font = 'bold 14px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = color;
    ctx.fillText(label, x2 + ux * 14 + 4, y2 + uy * 14 + 4);
  }
}

function drawDashed(x1: number, y1: number, x2: number, y2: number, color: string): void {
  ctx.beginPath();
  ctx.setLineDash([5, 4]);
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);
}

// ============================================================
// MAIN DRAW
// ============================================================
function draw(): void {
  ctx.clearRect(0, 0, W, H);

  // Grid
  ctx.lineWidth = 1;
  for (let gx = CX % SCALE; gx <= W; gx += SCALE) {
    ctx.strokeStyle = Math.abs(gx - CX) < 1 ? COLORS.axis : COLORS.grid;
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
  }
  for (let gy = CY % SCALE; gy <= H; gy += SCALE) {
    ctx.strokeStyle = Math.abs(gy - CY) < 1 ? COLORS.axis : COLORS.grid;
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
  }

  // Axis numbers
  ctx.font = '10px "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = COLORS.axisLabel;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let i = -7; i <= 7; i++) {
    if (i === 0) continue;
    const px = CX + i * SCALE;
    if (px > 5 && px < W - 5) ctx.fillText(String(i), px, CY + 4);
  }
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i = -7; i <= 7; i++) {
    if (i === 0) continue;
    const py = CY - i * SCALE;
    if (py > 5 && py < H - 5) ctx.fillText(String(i), CX - 5, py);
  }

  const pA = toCanvas(vecA);
  const pB = toCanvas(vecB);
  const mA = mag(vecA), mB = mag(vecB);
  const dpVal = dot(vecA, vecB);

  // --- Projection of A onto B ---
  if (mB > 0.001) {
    const bUnit: Vec2 = { x: vecB.x / mB, y: vecB.y / mB };
    const projLen = dpVal / mB;
    const projWorld: Vec2 = { x: bUnit.x * projLen, y: bUnit.y * projLen };
    const projPt = toCanvas(projWorld);

    // Projection vector along B
    if (Math.abs(projLen) > 0.05) {
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(projPt.x, projPt.y);
      ctx.strokeStyle = COLORS.proj;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Arrowhead on projection
      const px = projPt.x - CX, py = projPt.y - CY;
      const pl = Math.hypot(px, py);
      if (pl > 8) {
        const pux = px / pl, puy = py / pl;
        ctx.beginPath();
        ctx.moveTo(projPt.x, projPt.y);
        ctx.lineTo(projPt.x - pux * 9 + puy * 4, projPt.y - puy * 9 - pux * 4);
        ctx.lineTo(projPt.x - pux * 9 - puy * 4, projPt.y - puy * 9 + pux * 4);
        ctx.closePath();
        ctx.fillStyle = COLORS.proj;
        ctx.fill();
      }

      // Label projection value
      ctx.font = '11px "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = COLORS.proj;
      const midPx = (CX + projPt.x) / 2;
      const midPy = (CY + projPt.y) / 2;
      const perpX = -(projPt.y - CY) / pl * 18;
      const perpY = (projPt.x - CX) / pl * 18;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('proj = ' + projLen.toFixed(2), midPx + perpX, midPy + perpY);
    }

    // Dashed drop line from A tip to projection foot
    drawDashed(pA.x, pA.y, projPt.x, projPt.y, COLORS.projDash);

    // Right-angle marker when near perpendicular
    const cosT = mA > 0 && mB > 0 ? dpVal / (mA * mB) : 1;
    const theta = Math.acos(Math.max(-1, Math.min(1, cosT)));
    if (Math.abs(theta - Math.PI / 2) < 0.12) {
      const nx = bUnit.x * 10, ny = -bUnit.y * 10;
      const ox = bUnit.y * 10, oy = bUnit.x * 10;
      ctx.beginPath();
      ctx.strokeStyle = COLORS.perpMark;
      ctx.lineWidth = 1.5;
      ctx.moveTo(projPt.x + nx, projPt.y + ny);
      ctx.lineTo(projPt.x + nx - ox, projPt.y + ny - oy);
      ctx.lineTo(projPt.x - ox, projPt.y - oy);
      ctx.stroke();
    }
  }

  // Angle arc
  if (mA > 0.1 && mB > 0.1) {
    const angA = Math.atan2(-vecA.y, vecA.x);
    const angB = Math.atan2(-vecB.y, vecB.x);
    ctx.beginPath();
    ctx.arc(CX, CY, 28, Math.min(angA, angB), Math.max(angA, angB));
    ctx.strokeStyle = COLORS.arcColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    const midAng = (angA + angB) / 2;
    ctx.font = '12px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = COLORS.arcText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u03B8', CX + Math.cos(midAng) * 42, CY + Math.sin(midAng) * 42);
  }

  // Vectors
  drawArrow(CX, CY, pA.x, pA.y, COLORS.vecA, 3, 'A');
  drawArrow(CX, CY, pB.x, pB.y, COLORS.vecB, 3, 'B');

  // Drag handles
  for (const [p, col] of [[pA, COLORS.vecA], [pB, COLORS.vecB]] as [Vec2, string][]) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
    ctx.strokeStyle = '#0a0a0f';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  updateUI(dpVal, mA, mB);
}

// ============================================================
// UI UPDATE
// ============================================================
function updateUI(dpVal: number, mA: number, mB: number): void {
  const cosT = mA > 0 && mB > 0 ? dpVal / (mA * mB) : 1;
  const thetaDeg = Math.acos(Math.max(-1, Math.min(1, cosT))) * 180 / Math.PI;

  setText('ax', String(vecA.x));
  setText('ay', String(vecA.y));
  setText('bx', String(vecB.x));
  setText('by', String(vecB.y));

  // Build step-by-step algebraic work
  const px = vecA.x * vecB.x;
  const py = vecA.y * vecB.y;
  const resultColor = dpVal > 0 ? COLORS.positive : dpVal < 0 ? COLORS.negative : COLORS.zero;

  const work = document.getElementById('work')!;
  work.innerHTML =
    '<div class="work-step dim">' +
      '<span class="term"><span class="dot-a">a<sub>x</sub></span> \u00B7 <span class="dot-b">b<sub>x</sub></span></span>' +
      '<span class="op">+</span>' +
      '<span class="term"><span class="dot-a">a<sub>y</sub></span> \u00B7 <span class="dot-b">b<sub>y</sub></span></span>' +
    '</div>' +
    '<div class="work-step">' +
      '<span class="term"><span class="dot-a">' + vecA.x + '</span> \u00B7 <span class="dot-b">' + vecB.x + '</span></span>' +
      '<span class="op">+</span>' +
      '<span class="term"><span class="dot-a">' + vecA.y + '</span> \u00B7 <span class="dot-b">' + vecB.y + '</span></span>' +
    '</div>' +
    '<div class="work-step">' +
      '<span class="term">' + px + '</span>' +
      '<span class="op">+</span>' +
      '<span class="term">' + py + '</span>' +
    '</div>' +
    '<div class="work-result" style="color:' + resultColor + '">' + dpVal + '</div>';

  // Build geometric breakdown
  const ax2 = vecA.x * vecA.x, ay2 = vecA.y * vecA.y;
  const bx2 = vecB.x * vecB.x, by2 = vecB.y * vecB.y;
  const sumA = ax2 + ay2, sumB = bx2 + by2;
  const cosVal = mA > 0 && mB > 0 ? cosT : 0;

  const geo = document.getElementById('geo')!;
  geo.innerHTML =
    // Magnitude A via Pythagorean theorem
    '<div class="geo-line">' +
      '<span class="label"><span class="dot-a">|A|</span></span>' +
      '<span class="eq">= \u221A(</span>' +
      '<span class="dot-a">' + vecA.x + '</span>\u00B2 + ' +
      '<span class="dot-a">' + vecA.y + '</span>\u00B2' +
      '<span class="eq">) = \u221A(' + ax2 + ' + ' + ay2 + ') = \u221A' + sumA + ' = </span>' +
      '<span class="dot-a">' + mA.toFixed(2) + '</span>' +
    '</div>' +
    // Magnitude B via Pythagorean theorem
    '<div class="geo-line">' +
      '<span class="label"><span class="dot-b">|B|</span></span>' +
      '<span class="eq">= \u221A(</span>' +
      '<span class="dot-b">' + vecB.x + '</span>\u00B2 + ' +
      '<span class="dot-b">' + vecB.y + '</span>\u00B2' +
      '<span class="eq">) = \u221A(' + bx2 + ' + ' + by2 + ') = \u221A' + sumB + ' = </span>' +
      '<span class="dot-b">' + mB.toFixed(2) + '</span>' +
    '</div>' +
    // Cosine similarity
    '<div class="geo-line" style="margin-top:8px">' +
      '<span class="label">cos \u03B8</span>' +
      '<span class="eq">= A\u00B7B / (<span class="dot-a">|A|</span> \u00D7 <span class="dot-b">|B|</span>)</span>' +
    '</div>' +
    '<div class="geo-line">' +
      '<span class="label"></span>' +
      '<span class="eq">= ' + dpVal + ' / (' + mA.toFixed(2) + ' \u00D7 ' + mB.toFixed(2) + ') = </span>' +
      '<strong>' + cosVal.toFixed(4) + '</strong>' +
    '</div>' +
    // Geometric check: |A| × |B| × cos θ = same answer
    '<div class="geo-check">' +
      '<span class="dot-a">|A|</span> \u00D7 <span class="dot-b">|B|</span> \u00D7 cos \u03B8 = ' +
      mA.toFixed(2) + ' \u00D7 ' + mB.toFixed(2) + ' \u00D7 ' + cosVal.toFixed(4) +
      ' = <strong style="color:' + resultColor + '">' + dpVal + '</strong>' +
    '</div>';

  // Angle
  setText('angleVal', thetaDeg.toFixed(1) + '\u00B0');
  (document.getElementById('angleBarFill') as HTMLElement).style.width = (thetaDeg / 180 * 100) + '%';

  // Insight box
  const ib = document.getElementById('insightBox')!;
  let msg: string, bg: string, border: string;
  if (Math.abs(thetaDeg - 90) < 5) {
    msg = '\u22A5 Perpendicular \u2014 all of A\u2019s magnitude is sideways to B. No matter how big the vectors are, zero alignment means zero dot product.';
    bg = '#1a1a12'; border = COLORS.zero;
  } else if (dpVal > 0) {
    msg = '\u2713 Positive \u2014 A and B point in similar directions. The result depends on both alignment (cos \u03B8) and magnitude (|A|\u00D7|B|) \u2014 more magnitude can make up for less alignment.';
    bg = '#0f1a14'; border = COLORS.positive;
  } else {
    msg = '\u2717 Negative \u2014 A and B point in opposite directions. The magnitudes still scale the result, but the sign flips because cos \u03B8 is negative.';
    bg = '#1a0f11'; border = COLORS.negative;
  }
  ib.style.background = bg;
  ib.style.borderLeft = '3px solid ' + border;
  ib.textContent = msg;
}

function setText(id: string, text: string): void {
  document.getElementById(id)!.textContent = text;
}

// ============================================================
// INTERACTION
// ============================================================
function getPointerPos(e: MouseEvent | Touch): Vec2 {
  const rect = canvas.getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  return { x: cx * W / rect.width, y: cy * H / rect.height };
}

function hitTest(px: number, py: number): 'A' | 'B' | null {
  const pA = toCanvas(vecA);
  const pB = toCanvas(vecB);
  const dA = Math.hypot(px - pA.x, py - pA.y);
  const dB = Math.hypot(px - pB.x, py - pB.y);
  if (dA < 20 && dA <= dB) return 'A';
  if (dB < 20) return 'B';
  return null;
}

function onPointerDown(e: MouseEvent | TouchEvent): void {
  e.preventDefault();
  const p = getPointerPos('touches' in e ? e.touches[0] : e);
  dragging = hitTest(p.x, p.y);
}

function onPointerMove(e: MouseEvent | TouchEvent): void {
  if (!dragging) {
    if ('clientX' in e) {
      const p = getPointerPos(e);
      canvas.style.cursor = hitTest(p.x, p.y) ? 'grab' : 'crosshair';
    }
    return;
  }
  e.preventDefault();
  const p = getPointerPos('touches' in e ? e.touches[0] : e);
  const w = toWorld(p.x, p.y);
  const clamped: Vec2 = {
    x: Math.max(-7, Math.min(7, w.x)),
    y: Math.max(-7, Math.min(7, w.y)),
  };
  if (dragging === 'A') vecA = clamped;
  else vecB = clamped;
  canvas.style.cursor = 'grabbing';
  draw();
}

function onPointerUp(): void {
  dragging = null;
  canvas.style.cursor = 'crosshair';
}

// ============================================================
// INIT
// ============================================================
function init(): void {
  canvas = document.getElementById('canvas') as HTMLCanvasElement;
  ctx = canvas.getContext('2d')!;

  canvas.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);
  canvas.addEventListener('touchstart', onPointerDown, { passive: false });
  canvas.addEventListener('touchmove', onPointerMove, { passive: false });
  canvas.addEventListener('touchend', onPointerUp);

  window.addEventListener('resize', resize);
  resize();
}

document.addEventListener('DOMContentLoaded', init);
