// Dot Product Interactive Visualizer
// Two draggable 2D vectors with real-time dot product, angle, and projection display
export {};

interface Vec2 {
  x: number;
  y: number;
}

const COLORS = {
  vecA: '#7c8cf8',
  vecB: '#4ecdc4',
  projection: 'rgba(124, 140, 248, 0.4)',
  projectionLine: 'rgba(124, 140, 248, 0.6)',
  grid: '#1a1a25',
  axis: '#2a2a3a',
  bg: '#0a0a0f',
  text: '#d0d0dc',
  textDim: '#707088',
  arcColor: 'rgba(255, 255, 255, 0.25)',
};

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let infoPanel: HTMLElement;

// Vectors in grid units (1 unit = gridSpacing pixels)
let vecA: Vec2 = { x: 3, y: 2 };
let vecB: Vec2 = { x: -1, y: 3 };

let dragging: 'A' | 'B' | null = null;
let gridSpacing = 40; // pixels per grid unit
let canvasOrigin: Vec2 = { x: 0, y: 0 };

function resize(): void {
  const container = canvas.parentElement!;
  const w = Math.min(container.clientWidth, 800);
  const h = Math.min(w, 600);
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  canvasOrigin = { x: w / 2, y: h / 2 };
  gridSpacing = Math.max(30, Math.min(50, w / 16));
  draw();
}

function toCanvas(v: Vec2): Vec2 {
  return { x: canvasOrigin.x + v.x * gridSpacing, y: canvasOrigin.y - v.y * gridSpacing };
}

function toGrid(cx: number, cy: number): Vec2 {
  return {
    x: Math.round((cx - canvasOrigin.x) / gridSpacing),
    y: Math.round(-(cy - canvasOrigin.y) / gridSpacing),
  };
}

function mag(v: Vec2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

function dot(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y;
}

function angleBetween(a: Vec2, b: Vec2): number {
  const ma = mag(a);
  const mb = mag(b);
  if (ma < 1e-9 || mb < 1e-9) return 0;
  const cosTheta = Math.max(-1, Math.min(1, dot(a, b) / (ma * mb)));
  return Math.acos(cosTheta);
}

function drawGrid(): void {
  const w = canvas.width / (window.devicePixelRatio || 1);
  const h = canvas.height / (window.devicePixelRatio || 1);

  // Grid lines
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = canvasOrigin.x % gridSpacing; x < w; x += gridSpacing) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = canvasOrigin.y % gridSpacing; y < h; y += gridSpacing) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();

  // Axes
  ctx.strokeStyle = COLORS.axis;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, canvasOrigin.y);
  ctx.lineTo(w, canvasOrigin.y);
  ctx.moveTo(canvasOrigin.x, 0);
  ctx.lineTo(canvasOrigin.x, h);
  ctx.stroke();

  // Axis labels
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '11px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let gx = -10; gx <= 10; gx++) {
    if (gx === 0) continue;
    const px = canvasOrigin.x + gx * gridSpacing;
    if (px > 10 && px < w - 10) {
      ctx.fillText(String(gx), px, canvasOrigin.y + 4);
    }
  }
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let gy = -10; gy <= 10; gy++) {
    if (gy === 0) continue;
    const py = canvasOrigin.y - gy * gridSpacing;
    if (py > 10 && py < h - 10) {
      ctx.fillText(String(gy), canvasOrigin.x - 6, py);
    }
  }
}

function drawArrow(from: Vec2, to: Vec2, color: string, lineWidth: number = 2.5): void {
  const headLen = 12;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - headLen * Math.cos(angle - 0.4), to.y - headLen * Math.sin(angle - 0.4));
  ctx.lineTo(to.x - headLen * Math.cos(angle + 0.4), to.y - headLen * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();
}

function drawProjection(): void {
  const magB = mag(vecB);
  if (magB < 1e-9 || mag(vecA) < 1e-9) return;

  // Scalar projection of A onto B
  const scalar = dot(vecA, vecB) / magB;
  const unitB: Vec2 = { x: vecB.x / magB, y: vecB.y / magB };
  const projPoint: Vec2 = { x: unitB.x * scalar, y: unitB.y * scalar };

  const canvasA = toCanvas(vecA);
  const canvasProj = toCanvas(projPoint);

  // Dashed line from A tip to projection point
  ctx.strokeStyle = COLORS.projectionLine;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(canvasA.x, canvasA.y);
  ctx.lineTo(canvasProj.x, canvasProj.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Projection vector (thick, semi-transparent)
  const originPt = toCanvas({ x: 0, y: 0 });
  ctx.strokeStyle = COLORS.projection;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(originPt.x, originPt.y);
  ctx.lineTo(canvasProj.x, canvasProj.y);
  ctx.stroke();

  // Small square at the right angle
  const perpLen = 6;
  const perpX = -unitB.y;
  const perpY = unitB.x;
  ctx.strokeStyle = COLORS.projectionLine;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(canvasProj.x + perpX * perpLen, canvasProj.y - perpY * perpLen);
  ctx.lineTo(
    canvasProj.x + perpX * perpLen - unitB.x * perpLen * (gridSpacing / gridSpacing),
    canvasProj.y - perpY * perpLen + unitB.y * perpLen * (gridSpacing / gridSpacing)
  );
  ctx.lineTo(
    canvasProj.x - unitB.x * perpLen,
    canvasProj.y + unitB.y * perpLen
  );
  ctx.stroke();
}

function drawAngleArc(): void {
  const ma = mag(vecA);
  const mb = mag(vecB);
  if (ma < 1e-9 || mb < 1e-9) return;

  const angleA = Math.atan2(vecA.y, vecA.x);
  const angleB = Math.atan2(vecB.y, vecB.x);
  const radius = 25;

  // Draw arc from angleB to angleA (canvas y is flipped)
  ctx.strokeStyle = COLORS.arcColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(canvasOrigin.x, canvasOrigin.y, radius, -angleA, -angleB);
  ctx.stroke();
}

function drawHandles(): void {
  const pA = toCanvas(vecA);
  const pB = toCanvas(vecB);

  // Handle circles
  for (const [p, color] of [[pA, COLORS.vecA], [pB, COLORS.vecB]] as [Vec2, string][]) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.bg;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Labels
  ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = COLORS.vecA;
  ctx.fillText('A', pA.x + 12, pA.y - 8);
  ctx.fillStyle = COLORS.vecB;
  ctx.fillText('B', pB.x + 12, pB.y - 8);
}

function draw(): void {
  const w = canvas.width / (window.devicePixelRatio || 1);
  const h = canvas.height / (window.devicePixelRatio || 1);

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);

  drawGrid();
  drawProjection();
  drawAngleArc();

  // Draw vectors
  const o = toCanvas({ x: 0, y: 0 });
  drawArrow(o, toCanvas(vecA), COLORS.vecA);
  drawArrow(o, toCanvas(vecB), COLORS.vecB);

  drawHandles();
  updateInfo();
}

function updateInfo(): void {
  const d = dot(vecA, vecB);
  const mA = mag(vecA);
  const mB = mag(vecB);
  const theta = angleBetween(vecA, vecB);
  const thetaDeg = (theta * 180) / Math.PI;
  const scalarProj = mB > 1e-9 ? d / mB : 0;

  const sign = d > 0 ? '+' : d < 0 ? '-' : '';
  const relationship = d > 0.01 ? 'acute (same general direction)' :
    d < -0.01 ? 'obtuse (opposing directions)' :
      'perpendicular';

  infoPanel.innerHTML = `
    <div class="info-grid">
      <div class="info-vec" style="border-color: ${COLORS.vecA}">
        <strong>A</strong> = (${vecA.x}, ${vecA.y})<br>
        |A| = ${mA.toFixed(3)}
      </div>
      <div class="info-vec" style="border-color: ${COLORS.vecB}">
        <strong>B</strong> = (${vecB.x}, ${vecB.y})<br>
        |B| = ${mB.toFixed(3)}
      </div>
    </div>
    <div class="info-result">
      <div class="info-main">
        A &middot; B = (${vecA.x})(${vecB.x}) + (${vecA.y})(${vecB.y}) = <strong>${d}</strong>
      </div>
      <div class="info-detail">
        &theta; = ${thetaDeg.toFixed(1)}&deg; &mdash; ${relationship}
      </div>
      <div class="info-detail">
        proj<sub>B</sub> A = ${scalarProj.toFixed(3)} &nbsp;(scalar projection of A onto B)
      </div>
    </div>
  `;
}

function getPointerPos(e: MouseEvent | Touch): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function hitTest(px: number, py: number): 'A' | 'B' | null {
  const pA = toCanvas(vecA);
  const pB = toCanvas(vecB);
  const threshold = 20;

  const dA = Math.hypot(px - pA.x, py - pA.y);
  const dB = Math.hypot(px - pB.x, py - pB.y);

  if (dA < threshold && dA <= dB) return 'A';
  if (dB < threshold) return 'B';
  return null;
}

function onPointerDown(px: number, py: number): void {
  dragging = hitTest(px, py);
}

function onPointerMove(px: number, py: number): void {
  if (!dragging) {
    const hit = hitTest(px, py);
    canvas.style.cursor = hit ? 'grab' : 'default';
    return;
  }
  canvas.style.cursor = 'grabbing';
  const grid = toGrid(px, py);
  if (dragging === 'A') {
    vecA = grid;
  } else {
    vecB = grid;
  }
  draw();
}

function onPointerUp(): void {
  dragging = null;
  canvas.style.cursor = 'default';
}

function init(): void {
  canvas = document.getElementById('canvas') as HTMLCanvasElement;
  ctx = canvas.getContext('2d')!;
  infoPanel = document.getElementById('info')!;

  // Mouse events
  canvas.addEventListener('mousedown', (e) => {
    const pos = getPointerPos(e);
    onPointerDown(pos.x, pos.y);
  });
  window.addEventListener('mousemove', (e) => {
    const pos = getPointerPos(e);
    onPointerMove(pos.x, pos.y);
  });
  window.addEventListener('mouseup', () => onPointerUp());

  // Touch events
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const pos = getPointerPos(e.touches[0]);
    onPointerDown(pos.x, pos.y);
  }, { passive: false });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const pos = getPointerPos(e.touches[0]);
    onPointerMove(pos.x, pos.y);
  }, { passive: false });
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    onPointerUp();
  });

  window.addEventListener('resize', resize);
  resize();
}

document.addEventListener('DOMContentLoaded', init);
