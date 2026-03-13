// LSTM — Interactive Gate Visualizer
// Shows how forget, input, and output gates control memory flow
export {};

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let W = 0, H = 0;

// LSTM parameters (user-editable)
let xVal = 0.5;           // current input
let hPrev = 0.3;          // previous hidden state
let cPrev = 0.7;          // previous cell state

// Gate weights (simplified: single weight per gate for visualization)
let wf = 0.6, bf = -0.1;  // forget gate
let wi = 0.5, bi = 0.2;   // input gate
let wc = 0.4, bc = 0.0;   // candidate
let wo = 0.7, bo = 0.1;   // output gate

// Computed values
let fGate = 0, iGate = 0, cCandidate = 0, oGate = 0;
let cNew = 0, hNew = 0;

// Animation
let animStep = -1; // -1 = show all, 0-4 = step-by-step
const STEP_NAMES = ['Forget Gate', 'Input Gate', 'Candidate', 'Update Cell', 'Output Gate'];

const COLORS = {
  bg: '#0a0a0f',
  node: '#1e1e2a',
  nodeStroke: '#3a3a50',
  forgetGate: '#f43f5e',
  inputGate: '#34d399',
  candidate: '#a78bfa',
  outputGate: '#f59e0b',
  cellState: '#38bdf8',
  hidden: '#7c8cf8',
  text: '#d0d0dc',
  dimText: '#666880',
  posVal: '#34d399',
  negVal: '#f43f5e',
  arrow: '#4a4a60',
  activeArrow: '#d0d0dc',
};

function $(id: string): HTMLElement { return document.getElementById(id)!; }
function sigmoid(x: number): number { return 1 / (1 + Math.exp(-x)); }

// ============================================================
// FORWARD PASS
// ============================================================
function forward(): void {
  const concat = xVal + hPrev; // simplified: just sum for visualization
  fGate = sigmoid(wf * concat + bf);
  iGate = sigmoid(wi * concat + bi);
  cCandidate = Math.tanh(wc * concat + bc);
  oGate = sigmoid(wo * concat + bo);
  cNew = fGate * cPrev + iGate * cCandidate;
  hNew = oGate * Math.tanh(cNew);
}

// ============================================================
// DRAWING
// ============================================================
function drawGateBox(x: number, y: number, w: number, h: number, label: string, value: number, color: string, active: boolean): void {
  ctx.fillStyle = active ? color.replace(')', ',0.12)').replace('rgb(', 'rgba(') : COLORS.node;
  ctx.strokeStyle = active ? color : COLORS.nodeStroke;
  ctx.lineWidth = active ? 2 : 1;

  // Rounded rect
  const r = 6;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Gate label
  ctx.font = 'bold 11px "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + h / 2 - 8);

  // Value
  ctx.font = 'bold 12px "Cascadia Code", "Fira Code", monospace';
  ctx.fillStyle = COLORS.text;
  ctx.fillText(value.toFixed(3), x + w / 2, y + h / 2 + 8);
}

function drawArrow(x1: number, y1: number, x2: number, y2: number, color: string, width: number): void {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 1) return;
  const ux = dx / len, uy = dy / len;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - ux * 8 + uy * 4, y2 - uy * 8 - ux * 4);
  ctx.lineTo(x2 - ux * 8 - uy * 4, y2 - uy * 8 + ux * 4);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawOpCircle(cx: number, cy: number, label: string, color: string, active: boolean): void {
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fillStyle = active ? color.replace(')', ',0.15)').replace('rgb(', 'rgba(') : COLORS.node;
  ctx.fill();
  ctx.strokeStyle = active ? color : COLORS.nodeStroke;
  ctx.lineWidth = active ? 2 : 1;
  ctx.stroke();

  ctx.font = 'bold 14px "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = active ? color : COLORS.dimText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy);
}

function draw(): void {
  ctx.clearRect(0, 0, W, H);

  const showAll = animStep === -1;
  const gateW = 80, gateH = 50;
  const midY = H / 2;
  const cellY = midY - 40;
  const gateY = midY + 30;

  // Layout positions
  const leftX = 60;
  const fGateX = W * 0.2;
  const iGateX = W * 0.38;
  const candX = W * 0.38;
  const oGateX = W * 0.62;
  const rightX = W - 60;

  // Cell state highway (top)
  const cellLineY = cellY;
  ctx.setLineDash([]);
  ctx.strokeStyle = showAll || animStep >= 3 ? COLORS.cellState : COLORS.arrow;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(leftX, cellLineY);
  ctx.lineTo(rightX, cellLineY);
  ctx.stroke();

  // Label cell state
  ctx.font = 'bold 11px "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = COLORS.cellState;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText('Cell state (memory highway)', leftX, cellLineY - 8);

  // c(t-1) label
  ctx.font = '10px "Cascadia Code", "Fira Code", monospace';
  ctx.fillStyle = COLORS.dimText;
  ctx.textAlign = 'center';
  ctx.fillText(`c(t-1)=${cPrev.toFixed(2)}`, leftX, cellLineY + 16);

  // c(t) label
  ctx.fillText(`c(t)=${cNew.toFixed(2)}`, rightX, cellLineY + 16);

  // ---- FORGET GATE ----
  const fActive = showAll || animStep === 0;
  drawGateBox(fGateX - gateW / 2, gateY, gateW, gateH, 'Forget (\u03C3)', fGate, COLORS.forgetGate, fActive);

  // Multiply circle on cell line
  const fMulX = fGateX;
  drawOpCircle(fMulX, cellLineY, '\u00D7', COLORS.forgetGate, fActive);

  // Arrow from forget gate to multiply
  drawArrow(fGateX, gateY, fMulX, cellLineY + 14, fActive ? COLORS.forgetGate : COLORS.arrow, 1.5);

  // ---- INPUT GATE ----
  const igActive = showAll || animStep === 1;
  drawGateBox(iGateX - gateW / 2, gateY, gateW, gateH, 'Input (\u03C3)', iGate, COLORS.inputGate, igActive);

  // ---- CANDIDATE ----
  const cActive = showAll || animStep === 2;
  drawGateBox(candX - gateW / 2, gateY + gateH + 10, gateW, gateH, 'Cand (tanh)', cCandidate, COLORS.candidate, cActive);

  // Multiply circle for input gate * candidate
  const iMulX = iGateX + gateW / 2 + 25;
  const iMulY = gateY + gateH / 2 + 5;
  drawOpCircle(iMulX, iMulY, '\u00D7', COLORS.inputGate, igActive || cActive);

  // Arrow from input gate to multiply
  drawArrow(iGateX + gateW / 2, gateY + gateH / 2, iMulX - 14, iMulY, igActive ? COLORS.inputGate : COLORS.arrow, 1.5);

  // Arrow from candidate to multiply
  drawArrow(candX + gateW / 2, gateY + gateH + 10 + gateH / 2, iMulX, iMulY + 14, cActive ? COLORS.candidate : COLORS.arrow, 1.5);

  // Add circle on cell line
  const addX = (fMulX + oGateX) / 2;
  drawOpCircle(addX, cellLineY, '+', COLORS.cellState, showAll || animStep === 3);

  // Arrow from i*c multiply to add on cell line
  drawArrow(iMulX, iMulY - 14, addX, cellLineY + 14, (showAll || animStep === 3) ? COLORS.cellState : COLORS.arrow, 1.5);

  // ---- OUTPUT GATE ----
  const oActive = showAll || animStep === 4;
  drawGateBox(oGateX - gateW / 2, gateY, gateW, gateH, 'Output (\u03C3)', oGate, COLORS.outputGate, oActive);

  // Tanh circle on cell line (before output)
  const tanhX = oGateX;
  drawOpCircle(tanhX, cellLineY + 35, 'tanh', COLORS.outputGate, oActive);

  // Arrow from cell line down to tanh
  drawArrow(tanhX, cellLineY + 3, tanhX, cellLineY + 35 - 14, oActive ? COLORS.outputGate : COLORS.arrow, 1.5);

  // Multiply for output gate
  const oMulX = oGateX + gateW / 2 + 20;
  const oMulY = cellLineY + 35;
  drawOpCircle(oMulX, oMulY, '\u00D7', COLORS.outputGate, oActive);

  // Arrows to output multiply
  drawArrow(oGateX + gateW / 2, gateY + gateH / 2, oMulX, oMulY + 14, oActive ? COLORS.outputGate : COLORS.arrow, 1.5);
  drawArrow(tanhX + 14, cellLineY + 35, oMulX - 14, oMulY, oActive ? COLORS.outputGate : COLORS.arrow, 1.5);

  // h(t) output arrow
  drawArrow(oMulX + 14, oMulY, rightX, oMulY, oActive ? COLORS.hidden : COLORS.arrow, 2);
  ctx.font = '10px "Cascadia Code", "Fira Code", monospace';
  ctx.fillStyle = COLORS.hidden;
  ctx.textAlign = 'center';
  ctx.fillText(`h(t)=${hNew.toFixed(3)}`, rightX, oMulY + 16);

  // Input labels (bottom)
  const inputY = H - 20;
  ctx.font = '10px "Cascadia Code", "Fira Code", monospace';
  ctx.fillStyle = COLORS.dimText;
  ctx.textAlign = 'center';
  ctx.fillText(`[x(t)=${xVal.toFixed(2)}, h(t-1)=${hPrev.toFixed(2)}]`, W / 2, inputY);

  // Arrows from input to gates
  const inputMidX = W / 2;
  const inputStartY = inputY - 10;
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = COLORS.arrow;
  ctx.lineWidth = 1;
  for (const gx of [fGateX, iGateX, oGateX]) {
    ctx.beginPath();
    ctx.moveTo(inputMidX, inputStartY);
    ctx.lineTo(gx, gateY + gateH);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(inputMidX, inputStartY);
  ctx.lineTo(candX, gateY + gateH + 10 + gateH);
  ctx.stroke();
  ctx.setLineDash([]);

  // Step indicator
  if (animStep >= 0) {
    ctx.font = 'bold 12px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = COLORS.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`Step ${animStep + 1}/5: ${STEP_NAMES[animStep]}`, W / 2, 8);
  }
}

// ============================================================
// UI
// ============================================================
function buildMathPanel(): void {
  const panel = $('math-panel');
  let html = '';

  const steps = [
    { name: 'Forget Gate', color: COLORS.forgetGate, formula: `f = \u03C3(W_f · [x, h] + b_f) = \u03C3(${(wf * (xVal + hPrev) + bf).toFixed(3)}) = ${fGate.toFixed(3)}`, desc: `Decides what to throw away from cell state. f=${fGate.toFixed(3)} means keep ${(fGate * 100).toFixed(0)}% of old memory.` },
    { name: 'Input Gate', color: COLORS.inputGate, formula: `i = \u03C3(W_i · [x, h] + b_i) = ${iGate.toFixed(3)}`, desc: `Controls how much new info to let in. i=${iGate.toFixed(3)} means accept ${(iGate * 100).toFixed(0)}% of candidate.` },
    { name: 'Candidate', color: COLORS.candidate, formula: `\u0109 = tanh(W_c · [x, h] + b_c) = ${cCandidate.toFixed(3)}`, desc: 'Proposed new memory content, squashed to [-1, 1] by tanh.' },
    { name: 'Cell Update', color: COLORS.cellState, formula: `c(t) = f · c(t-1) + i · \u0109 = ${fGate.toFixed(2)}×${cPrev.toFixed(2)} + ${iGate.toFixed(2)}×${cCandidate.toFixed(2)} = ${cNew.toFixed(3)}`, desc: 'Old memory × forget + new memory × input. This is the core LSTM operation.' },
    { name: 'Output Gate', color: COLORS.outputGate, formula: `o = \u03C3(W_o · [x, h] + b_o) = ${oGate.toFixed(3)}  →  h(t) = o · tanh(c(t)) = ${hNew.toFixed(3)}`, desc: 'Filters the cell state to produce the output. What the LSTM "says" vs what it "remembers" can differ.' },
  ];

  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    const active = animStep === -1 || animStep === i;
    html += `<div class="gate-card${active ? ' active' : ''}" style="border-left-color:${s.color}">`;
    html += `<div class="gate-name" style="color:${s.color}">${s.name}</div>`;
    html += `<div class="gate-formula">${s.formula}</div>`;
    html += `<div class="gate-desc">${s.desc}</div>`;
    html += `</div>`;
  }

  // Insight
  let insight = '';
  if (fGate < 0.2) {
    insight = 'The forget gate is nearly closed — the LSTM is erasing most of its old memory. This happens when the current input is very different from what the network was tracking.';
  } else if (fGate > 0.9 && iGate < 0.2) {
    insight = 'High forget (keep old) + low input (reject new) = the LSTM is holding onto its existing memory and ignoring the current input. This is how LSTMs can remember information over long sequences.';
  } else if (iGate > 0.8) {
    insight = 'The input gate is wide open — the LSTM is eagerly absorbing new information. Combined with the forget gate, it\'s replacing old memory with new.';
  } else {
    insight = 'The key insight: unlike vanilla RNNs where gradients must flow through many multiplications (causing vanishing gradients), the LSTM cell state acts as a highway — the forget gate\'s multiply-and-add structure lets gradients flow unchanged across many time steps.';
  }
  html += `<div class="insight-box">${insight}</div>`;

  panel.innerHTML = html;
}

function update(): void {
  forward();
  draw();
  buildMathPanel();
}

// ============================================================
// CANVAS SIZING
// ============================================================
function resize(): void {
  const container = canvas.parentElement!;
  const w = container.clientWidth;
  const h = Math.min(340, w * 0.52);
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

  forward();

  // Sliders
  const makeSlider = (id: string, getter: () => number, setter: (v: number) => void) => {
    const slider = $(id) as HTMLInputElement;
    const valEl = $(id + '-val');
    slider.value = String(getter());
    valEl.textContent = getter().toFixed(2);
    slider.addEventListener('input', () => {
      setter(parseFloat(slider.value));
      valEl.textContent = getter().toFixed(2);
      update();
    });
  };

  makeSlider('slider-x', () => xVal, v => xVal = v);
  makeSlider('slider-h', () => hPrev, v => hPrev = v);
  makeSlider('slider-c', () => cPrev, v => cPrev = v);

  // Step buttons
  $('btn-all').addEventListener('click', () => { animStep = -1; update(); });
  $('btn-prev-step').addEventListener('click', () => {
    animStep = Math.max(0, animStep - 1);
    update();
  });
  $('btn-next-step').addEventListener('click', () => {
    animStep = Math.min(4, animStep + 1);
    update();
  });

  // Randomize weights
  $('btn-randomize').addEventListener('click', () => {
    const rw = () => Math.round((Math.random() * 2 - 1) * 100) / 100;
    wf = rw(); bf = rw();
    wi = rw(); bi = rw();
    wc = rw(); bc = rw();
    wo = rw(); bo = rw();
    update();
  });

  window.addEventListener('resize', resize);
  resize();
  update();
}

document.addEventListener('DOMContentLoaded', init);
