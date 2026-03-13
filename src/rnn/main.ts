// Recurrent Neural Network — Interactive Sequence Visualizer
// Shows how RNNs process sequences step by step, carrying hidden state forward
export {};

type ActivationFn = 'tanh' | 'relu';

let activationFn: ActivationFn = 'tanh';

// Network shape
const N_INPUT = 2;
const N_HIDDEN = 3;
const N_OUTPUT = 1;
const MAX_STEPS = 5;

// Sequence of inputs (each step has N_INPUT values)
let sequence: number[][] = [];
let nSteps = 3;

// Weights (shared across all time steps — the key RNN idea)
let wXH: number[][] = [];  // [N_HIDDEN][N_INPUT]  input→hidden
let wHH: number[][] = [];  // [N_HIDDEN][N_HIDDEN] hidden→hidden (recurrence!)
let bH: number[] = [];     // [N_HIDDEN]
let wHY: number[][] = [];  // [N_OUTPUT][N_HIDDEN] hidden→output
let bY: number[] = [];     // [N_OUTPUT]

// Forward pass state per time step
let hiddenStates: number[][] = [];  // [nSteps][N_HIDDEN]
let outputStates: number[][] = [];  // [nSteps][N_OUTPUT]

// Canvas
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let W = 0, H = 0;

// Currently highlighted time step
let highlightStep = -1;

const NEURON_R = 14;

const COLORS = {
  bg: '#0a0a0f',
  neuron: '#1e1e2a',
  neuronStroke: '#3a3a50',
  inputFill: '#7c8cf8',
  hiddenFill: '#f59e0b',
  outputFill: '#34d399',
  recurrentFill: '#f43f5e',
  posWeight: '#34d399',
  negWeight: '#f43f5e',
  zeroWeight: '#333348',
  text: '#d0d0dc',
  dimText: '#666880',
  labelText: '#9898ac',
  stepBg: '#12121a',
  stepActive: 'rgba(245, 158, 11, 0.08)',
  recurrentArrow: '#f59e0b',
};

function $(id: string): HTMLElement { return document.getElementById(id)!; }

// ============================================================
// ACTIVATION
// ============================================================
function activate(x: number): number {
  switch (activationFn) {
    case 'tanh': return Math.tanh(x);
    case 'relu': return Math.max(0, x);
  }
}

function activationLabel(): string {
  return activationFn === 'tanh' ? 'tanh' : 'ReLU';
}

// ============================================================
// NETWORK
// ============================================================
function randomWeight(): number {
  return Math.round((Math.random() * 1.6 - 0.8) * 100) / 100;
}

function initWeights(): void {
  wXH = [];
  bH = [];
  for (let h = 0; h < N_HIDDEN; h++) {
    wXH[h] = [];
    for (let i = 0; i < N_INPUT; i++) wXH[h][i] = randomWeight();
    bH[h] = randomWeight();
  }
  wHH = [];
  for (let h = 0; h < N_HIDDEN; h++) {
    wHH[h] = [];
    for (let hp = 0; hp < N_HIDDEN; hp++) wHH[h][hp] = randomWeight();
  }
  wHY = [];
  bY = [];
  for (let o = 0; o < N_OUTPUT; o++) {
    wHY[o] = [];
    for (let h = 0; h < N_HIDDEN; h++) wHY[o][h] = randomWeight();
    bY[o] = randomWeight();
  }
}

function initSequence(): void {
  sequence = [];
  for (let t = 0; t < MAX_STEPS; t++) {
    sequence[t] = [];
    for (let i = 0; i < N_INPUT; i++) {
      sequence[t][i] = Math.round((Math.random() * 2 - 1) * 20) / 20;
    }
  }
}

function forward(): void {
  hiddenStates = [];
  outputStates = [];

  for (let t = 0; t < nSteps; t++) {
    const prevH = t > 0 ? hiddenStates[t - 1] : new Array(N_HIDDEN).fill(0);
    const hNew: number[] = [];

    for (let h = 0; h < N_HIDDEN; h++) {
      let sum = bH[h];
      // Input contribution
      for (let i = 0; i < N_INPUT; i++) {
        sum += sequence[t][i] * wXH[h][i];
      }
      // Recurrent contribution (THIS is what makes it an RNN)
      for (let hp = 0; hp < N_HIDDEN; hp++) {
        sum += prevH[hp] * wHH[h][hp];
      }
      hNew[h] = activate(sum);
    }
    hiddenStates[t] = hNew;

    const out: number[] = [];
    for (let o = 0; o < N_OUTPUT; o++) {
      let sum = bY[o];
      for (let h = 0; h < N_HIDDEN; h++) {
        sum += hNew[h] * wHY[o][h];
      }
      out[o] = sum;
    }
    outputStates[t] = out;
  }
}

// ============================================================
// DRAWING
// ============================================================
function weightColor(w: number, alpha: number = 1): string {
  if (Math.abs(w) < 0.01) return COLORS.zeroWeight;
  const t = Math.min(1, Math.abs(w));
  if (w > 0) {
    return `rgba(52,${Math.round(100 + 111 * t)},${Math.round(80 + 73 * t)},${alpha})`;
  } else {
    return `rgba(${Math.round(120 + 124 * t)},${Math.round(60 + 3 * t)},${Math.round(80 + 14 * t)},${alpha})`;
  }
}

function drawArrowLine(x1: number, y1: number, x2: number, y2: number, color: string, width: number): void {
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

  // Arrowhead
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - ux * 7 + uy * 3.5, y2 - uy * 7 - ux * 3.5);
  ctx.lineTo(x2 - ux * 7 - uy * 3.5, y2 - uy * 7 + ux * 3.5);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawCurvedArrow(x1: number, y1: number, x2: number, y2: number, color: string, width: number, curveUp: boolean = true): void {
  const mx = (x1 + x2) / 2;
  const cy = curveUp ? Math.min(y1, y2) - 30 : Math.max(y1, y2) + 30;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(mx, cy, x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash([4, 3]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Arrowhead at end
  // Approximate tangent at endpoint
  const t = 0.95;
  const tx = 2 * (1 - t) * (mx - x1) + 2 * t * (x2 - mx);
  const ty = 2 * (1 - t) * (cy - y1) + 2 * t * (y2 - cy);
  const tLen = Math.hypot(tx, ty);
  if (tLen > 0.1) {
    const ux = tx / tLen, uy = ty / tLen;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - ux * 7 + uy * 3.5, y2 - uy * 7 - ux * 3.5);
    ctx.lineTo(x2 - ux * 7 - uy * 3.5, y2 - uy * 7 + ux * 3.5);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
}

function drawNeuron(x: number, y: number, val: number, fillColor: string, label: string): void {
  // Glow
  if (Math.abs(val) > 0.1) {
    ctx.beginPath();
    ctx.arc(x, y, NEURON_R + 3, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(x, y, NEURON_R - 2, x, y, NEURON_R + 6);
    grad.addColorStop(0, fillColor.replace(')', ',0.2)').replace('rgb(', 'rgba('));
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(x, y, NEURON_R, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.neuron;
  ctx.fill();
  ctx.strokeStyle = fillColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = 'bold 9px "Cascadia Code", "Fira Code", monospace';
  ctx.fillStyle = COLORS.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(val.toFixed(2), x, y);

  if (label) {
    ctx.font = '8px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = COLORS.dimText;
    ctx.fillText(label, x, y + NEURON_R + 10);
  }
}

function draw(): void {
  ctx.clearRect(0, 0, W, H);

  const stepWidth = W / nSteps;
  const layerY = [H * 0.18, H * 0.52, H * 0.86];

  // Draw time step columns
  for (let t = 0; t < nSteps; t++) {
    const sx = t * stepWidth;

    // Step background
    if (t === highlightStep) {
      ctx.fillStyle = COLORS.stepActive;
      ctx.fillRect(sx, 0, stepWidth, H);
    }

    // Step separator
    if (t > 0) {
      ctx.strokeStyle = '#1e1e2a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, H);
      ctx.stroke();
    }

    // Time step label
    ctx.font = '10px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = COLORS.dimText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`t=${t}`, sx + stepWidth / 2, 4);

    const cx = sx + stepWidth / 2;

    // Input neurons
    const inputXs: number[] = [];
    for (let i = 0; i < N_INPUT; i++) {
      const ix = cx + (i - (N_INPUT - 1) / 2) * 32;
      inputXs.push(ix);
      drawNeuron(ix, layerY[0], sequence[t][i], COLORS.inputFill, `x${i + 1}`);
    }

    // Hidden neurons
    const hiddenXs: number[] = [];
    for (let h = 0; h < N_HIDDEN; h++) {
      const hx = cx + (h - (N_HIDDEN - 1) / 2) * 32;
      hiddenXs.push(hx);
    }

    // Input → Hidden connections
    for (let h = 0; h < N_HIDDEN; h++) {
      for (let i = 0; i < N_INPUT; i++) {
        const alpha = 0.15 + Math.min(1, Math.abs(sequence[t][i] * wXH[h][i])) * 0.5;
        drawArrowLine(inputXs[i], layerY[0] + NEURON_R, hiddenXs[h], layerY[1] - NEURON_R,
          weightColor(wXH[h][i], alpha), 1);
      }
    }

    // Draw hidden neurons
    for (let h = 0; h < N_HIDDEN; h++) {
      drawNeuron(hiddenXs[h], layerY[1], hiddenStates[t]?.[h] ?? 0, COLORS.hiddenFill, `h${h + 1}`);
    }

    // Hidden → Output connections
    const oy = layerY[2];
    for (let h = 0; h < N_HIDDEN; h++) {
      const hVal = hiddenStates[t]?.[h] ?? 0;
      const alpha = 0.15 + Math.min(1, Math.abs(hVal * wHY[0][h])) * 0.5;
      drawArrowLine(hiddenXs[h], layerY[1] + NEURON_R, cx, oy - NEURON_R,
        weightColor(wHY[0][h], alpha), 1);
    }

    // Output neuron
    drawNeuron(cx, oy, outputStates[t]?.[0] ?? 0, COLORS.outputFill, `y${t}`);

    // Recurrent arrow to NEXT time step
    if (t < nSteps - 1) {
      const nextSx = (t + 1) * stepWidth;
      const nextCx = nextSx + stepWidth / 2;
      const nextHiddenXs: number[] = [];
      for (let h = 0; h < N_HIDDEN; h++) {
        nextHiddenXs.push(nextCx + (h - (N_HIDDEN - 1) / 2) * 32);
      }

      // Draw one curved arrow from middle hidden to next middle hidden
      const fromX = hiddenXs[Math.floor(N_HIDDEN / 2)];
      const toX = nextHiddenXs[Math.floor(N_HIDDEN / 2)];
      drawCurvedArrow(fromX + NEURON_R, layerY[1], toX - NEURON_R, layerY[1],
        COLORS.recurrentArrow, 2, true);

      // Label
      ctx.font = '8px "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = COLORS.recurrentArrow;
      ctx.textAlign = 'center';
      ctx.fillText('h(t) → h(t+1)', (fromX + toX) / 2, layerY[1] - 36);
    }
  }

  // Layer labels on the left
  ctx.font = '10px "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = COLORS.dimText;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('Input', 48, layerY[0]);
  ctx.fillText('Hidden', 48, layerY[1]);
  ctx.fillText('Output', 48, layerY[2]);
}

// ============================================================
// UI
// ============================================================
function valSpan(v: number): string {
  const cls = v > 0.001 ? 'val-pos' : v < -0.001 ? 'val-neg' : 'val-zero';
  return `<span class="${cls}">${v.toFixed(2)}</span>`;
}

function buildInputSliders(): void {
  const container = $('input-sliders');
  container.innerHTML = '';

  for (let t = 0; t < nSteps; t++) {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step-inputs';

    const stepLabel = document.createElement('div');
    stepLabel.className = 'step-label';
    stepLabel.textContent = `t=${t}`;
    stepDiv.appendChild(stepLabel);

    for (let i = 0; i < N_INPUT; i++) {
      const row = document.createElement('div');
      row.className = 'slider-row';

      const label = document.createElement('span');
      label.className = 'slider-label';
      label.textContent = `x${i + 1}`;

      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = '-1';
      slider.max = '1';
      slider.step = '0.05';
      slider.value = String(sequence[t][i]);

      const val = document.createElement('span');
      val.className = 'slider-val';
      val.textContent = sequence[t][i].toFixed(2);
      val.style.color = sequence[t][i] >= 0 ? COLORS.posWeight : COLORS.negWeight;

      const tCap = t, iCap = i;
      slider.addEventListener('input', () => {
        sequence[tCap][iCap] = parseFloat(slider.value);
        val.textContent = sequence[tCap][iCap].toFixed(2);
        val.style.color = sequence[tCap][iCap] >= 0 ? COLORS.posWeight : COLORS.negWeight;
        update();
      });

      row.appendChild(label);
      row.appendChild(slider);
      row.appendChild(val);
      stepDiv.appendChild(row);
    }

    container.appendChild(stepDiv);
  }
}

function buildMathPanel(): void {
  const panel = $('math-panel');
  let html = '';

  for (let t = 0; t < nSteps; t++) {
    const isActive = t === highlightStep;
    html += `<div class="step-card${isActive ? ' active' : ''}" data-step="${t}">`;
    html += `<div class="step-title">t = ${t}</div>`;

    // Hidden state computation
    const prevH = t > 0 ? hiddenStates[t - 1] : new Array(N_HIDDEN).fill(0);
    for (let h = 0; h < N_HIDDEN; h++) {
      html += `<div class="neuron-line">`;
      html += `<span style="color:${COLORS.hiddenFill}">h${h + 1}</span> = ${activationLabel()}(`;

      // Input terms
      const terms: string[] = [];
      for (let i = 0; i < N_INPUT; i++) {
        terms.push(`${valSpan(wXH[h][i])}·${valSpan(sequence[t][i])}`);
      }
      // Recurrent terms
      for (let hp = 0; hp < N_HIDDEN; hp++) {
        terms.push(`<span style="color:${COLORS.recurrentFill}">${valSpan(wHH[h][hp])}</span>·${valSpan(prevH[hp])}`);
      }
      html += terms.join(' + ');
      html += ` + ${valSpan(bH[h])}) = ${valSpan(hiddenStates[t]?.[h] ?? 0)}`;
      html += `</div>`;
    }

    // Output
    html += `<div class="neuron-line out-line">`;
    html += `<span style="color:${COLORS.outputFill}">y${t}</span> = `;
    const oTerms: string[] = [];
    for (let h = 0; h < N_HIDDEN; h++) {
      oTerms.push(`${valSpan(wHY[0][h])}·${valSpan(hiddenStates[t]?.[h] ?? 0)}`);
    }
    html += oTerms.join(' + ') + ` + ${valSpan(bY[0])} = ${valSpan(outputStates[t]?.[0] ?? 0)}`;
    html += `</div>`;
    html += `</div>`;
  }

  // Insight
  let insight = '';
  if (nSteps >= 2) {
    const h0 = hiddenStates[0] || [];
    const hLast = hiddenStates[nSteps - 1] || [];
    const drift = h0.reduce((s, v, i) => s + Math.abs(v - (hLast[i] || 0)), 0) / N_HIDDEN;
    if (drift < 0.05) {
      insight = 'The hidden state barely changed across time steps. The recurrent weights are too small to carry meaningful memory — try randomizing weights.';
    } else if (activationFn === 'tanh' && hLast.every(v => Math.abs(v) > 0.95)) {
      insight = 'Hidden states are saturated near ±1. With tanh, large accumulated values hit the ceiling — this is the vanishing gradient problem that makes long-range learning hard for vanilla RNNs.';
    } else {
      insight = 'Watch how each hidden state h(t) depends on BOTH the current input AND the previous hidden state h(t-1). This is how RNNs have "memory" — information from earlier inputs flows forward through the recurrent connections (shown in orange).';
    }
  } else {
    insight = 'With only one time step, the RNN acts like a regular feedforward network. Add more steps to see the recurrent connections carry information forward.';
  }
  html += `<div class="insight-box">${insight}</div>`;

  panel.innerHTML = html;

  // Click handlers for step cards
  panel.querySelectorAll('.step-card').forEach(card => {
    card.addEventListener('click', () => {
      const step = parseInt((card as HTMLElement).dataset.step || '-1');
      highlightStep = highlightStep === step ? -1 : step;
      update();
    });
  });
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
  const h = Math.min(340, w * 0.5);
  const dpr = window.devicePixelRatio || 1;
  W = w;
  H = h;
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

  initWeights();
  initSequence();
  forward();
  buildInputSliders();

  // Activation toggle
  document.querySelectorAll('.ctrl-btn[data-fn]').forEach(btn => {
    btn.addEventListener('click', () => {
      activationFn = (btn as HTMLElement).dataset.fn as ActivationFn;
      document.querySelectorAll('.ctrl-btn[data-fn]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      update();
    });
  });

  // Step count buttons
  document.querySelectorAll('.ctrl-btn[data-steps]').forEach(btn => {
    btn.addEventListener('click', () => {
      nSteps = parseInt((btn as HTMLElement).dataset.steps || '3');
      document.querySelectorAll('.ctrl-btn[data-steps]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      highlightStep = -1;
      buildInputSliders();
      update();
    });
  });

  // Randomize
  $('btn-randomize').addEventListener('click', () => {
    initWeights();
    initSequence();
    buildInputSliders();
    update();
  });

  window.addEventListener('resize', resize);
  resize();
  update();
}

document.addEventListener('DOMContentLoaded', init);
