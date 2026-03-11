// Cross Product Interactive Visualizer
// Two draggable 2D vectors showing the parallelogram area and sign
export {};

interface Vec2 {
  x: number;
  y: number;
}

const COLORS = {
  vecA: '#7c8cf8',
  vecB: '#4ecdc4',
  paraPos: 'rgba(124, 140, 248, 0.12)',
  paraNeg: 'rgba(248, 124, 124, 0.12)',
  paraBorderPos: 'rgba(124, 140, 248, 0.35)',
  paraBorderNeg: 'rgba(248, 124, 124, 0.35)',
  grid: '#1a1a25',
  axis: '#2a2a3a',
  bg: '#0a0a0f',
  text: '#d0d0dc',
  textDim: '#707088',
  positive: '#7c8cf8',
  negative: '#f87c7c',
};

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let infoPanel: HTMLElement;

let vecA: Vec2 = { x: 2, y: 0 };
let vecB: Vec2 = { x: 0, y: 2 };

let dragging: 'A' | 'B' | null = null;
let gridSpacing = 40;
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

function cross2d(a: Vec2, b: Vec2): number {
  return a.x * b.y - a.y * b.x;
}

function drawGrid(): void {
  const w = canvas.width / (window.devicePixelRatio || 1);
  const h = canvas.height / (window.devicePixelRatio || 1);

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

  ctx.strokeStyle = COLORS.axis;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, canvasOrigin.y);
  ctx.lineTo(w, canvasOrigin.y);
  ctx.moveTo(canvasOrigin.x, 0);
  ctx.lineTo(canvasOrigin.x, h);
  ctx.stroke();

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

function drawParallelogram(): void {
  const c = cross2d(vecA, vecB);
  if (Math.abs(c) < 1e-9) return;

  const o = toCanvas({ x: 0, y: 0 });
  const a = toCanvas(vecA);
  const b = toCanvas(vecB);
  const ab = toCanvas({ x: vecA.x + vecB.x, y: vecA.y + vecB.y });

  const isPositive = c > 0;

  ctx.fillStyle = isPositive ? COLORS.paraPos : COLORS.paraNeg;
  ctx.strokeStyle = isPositive ? COLORS.paraBorderPos : COLORS.paraBorderNeg;
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(o.x, o.y);
  ctx.lineTo(a.x, a.y);
  ctx.lineTo(ab.x, ab.y);
  ctx.lineTo(b.x, b.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
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

function drawDirectionArc(): void {
  const c = cross2d(vecA, vecB);
  if (Math.abs(c) < 1e-9) return;
  if (mag(vecA) < 1e-9 || mag(vecB) < 1e-9) return;

  const angleA = Math.atan2(vecA.y, vecA.x);
  const angleB = Math.atan2(vecB.y, vecB.x);
  const radius = 20;

  const isPositive = c > 0;
  ctx.strokeStyle = isPositive ? 'rgba(124, 140, 248, 0.4)' : 'rgba(248, 124, 124, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  // Draw arc from A to B in the direction of the cross product sign
  if (isPositive) {
    ctx.arc(canvasOrigin.x, canvasOrigin.y, radius, -angleA, -angleB, false);
  } else {
    ctx.arc(canvasOrigin.x, canvasOrigin.y, radius, -angleA, -angleB, true);
  }
  ctx.stroke();

  // Small direction arrow on arc
  const midAngle = isPositive
    ? -angleA + (-angleB + angleA + 2 * Math.PI) % (2 * Math.PI) / 2
    : -angleA - (angleA - angleB + 2 * Math.PI) % (2 * Math.PI) / 2;
  const arrowX = canvasOrigin.x + radius * Math.cos(midAngle);
  const arrowY = canvasOrigin.y + radius * Math.sin(midAngle);
  const tangent = isPositive ? midAngle + Math.PI / 2 : midAngle - Math.PI / 2;

  ctx.fillStyle = ctx.strokeStyle;
  ctx.beginPath();
  ctx.moveTo(arrowX + 5 * Math.cos(tangent), arrowY + 5 * Math.sin(tangent));
  ctx.lineTo(arrowX + 5 * Math.cos(tangent + 2.3), arrowY + 5 * Math.sin(tangent + 2.3));
  ctx.lineTo(arrowX + 5 * Math.cos(tangent - 2.3), arrowY + 5 * Math.sin(tangent - 2.3));
  ctx.closePath();
  ctx.fill();
}

function drawHandles(): void {
  const pA = toCanvas(vecA);
  const pB = toCanvas(vecB);

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

  ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = COLORS.vecA;
  ctx.fillText('A', pA.x + 12, pA.y - 8);
  ctx.fillStyle = COLORS.vecB;
  ctx.fillText('B', pB.x + 12, pB.y - 8);
}

function drawResultVector(): void {
  const c = cross2d(vecA, vecB);
  if (Math.abs(c) < 1e-9) return;

  // Show the z-axis result as a label at the origin
  const label = c > 0 ? 'z = +' + Math.abs(c).toFixed(0) + ' (out)' : 'z = ' + c.toFixed(0) + ' (in)';
  const color = c > 0 ? COLORS.positive : COLORS.negative;

  ctx.fillStyle = color;
  ctx.font = 'bold 12px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(label, canvasOrigin.x, canvasOrigin.y + 8);
}

function draw(): void {
  const w = canvas.width / (window.devicePixelRatio || 1);
  const h = canvas.height / (window.devicePixelRatio || 1);

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);

  drawGrid();
  drawParallelogram();
  drawDirectionArc();

  const o = toCanvas({ x: 0, y: 0 });
  drawArrow(o, toCanvas(vecA), COLORS.vecA);
  drawArrow(o, toCanvas(vecB), COLORS.vecB);

  drawResultVector();
  drawHandles();
  updateInfo();
}

function updateInfo(): void {
  const c = cross2d(vecA, vecB);
  const mA = mag(vecA);
  const mB = mag(vecB);
  const area = Math.abs(c);

  const signLabel = c > 0
    ? '<span style="color:#7c8cf8">positive</span> (A &rarr; B is counterclockwise)'
    : c < 0
      ? '<span style="color:#f87c7c">negative</span> (A &rarr; B is clockwise)'
      : 'zero (vectors are parallel)';

  const angleBetween = (mA > 1e-9 && mB > 1e-9)
    ? ((Math.asin(Math.min(1, area / (mA * mB)))) * 180 / Math.PI).toFixed(1)
    : '0.0';

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
        A &times; B = (${vecA.x})(${vecB.y}) &minus; (${vecA.y})(${vecB.x}) = <strong style="color:${c >= 0 ? COLORS.positive : COLORS.negative}">${c}</strong>
      </div>
      <div class="info-detail">
        Sign: ${signLabel}
      </div>
      <div class="info-detail">
        |A &times; B| = ${area} &nbsp;(area of parallelogram)
      </div>
      <div class="info-detail">
        sin(&theta;) = ${area.toFixed(3)} / (${mA.toFixed(3)} &times; ${mB.toFixed(3)}) &nbsp;&rarr;&nbsp; &theta; &asymp; ${angleBetween}&deg;
      </div>
      <div class="info-detail" style="margin-top: 8px; color: #8888a0;">
        In 3D, A &times; B points along the z-axis: ${c > 0 ? 'out of the screen (+z)' : c < 0 ? 'into the screen (&minus;z)' : 'zero vector'}
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
    canvas.style.cursor = hitTest(px, py) ? 'grab' : 'default';
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

  canvas.addEventListener('mousedown', (e) => {
    onPointerDown(getPointerPos(e).x, getPointerPos(e).y);
  });
  window.addEventListener('mousemove', (e) => {
    const pos = getPointerPos(e);
    onPointerMove(pos.x, pos.y);
  });
  window.addEventListener('mouseup', () => onPointerUp());

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
