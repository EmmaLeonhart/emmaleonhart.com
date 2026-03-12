let activationFn = 'relu';
// Network shape
const N_IN = 2;
const N_HID = 3;
const N_OUT = 1;
// Weights & biases (randomized on init)
let wIH = []; // [N_HID][N_IN]
let bH = []; // [N_HID]
let wHO = []; // [N_OUT][N_HID]
let bO = []; // [N_OUT]
// Current input values
let inputs = [0.5, 0.8];
// Forward pass state
let hiddenRaw = [];
let hiddenAct = [];
let outputRaw = [];
let outputVal = [];
// Canvas
let canvas;
let ctx;
let W = 0, H = 0;
// Neuron positions (computed on resize)
let posIn = [];
let posHid = [];
let posOut = [];
const NEURON_R = 18;
const COLORS = {
    bg: '#0a0a0f',
    neuron: '#1e1e2a',
    neuronStroke: '#3a3a50',
    inputFill: '#7c8cf8',
    hiddenFill: '#a78bfa',
    outputFill: '#34d399',
    posWeight: '#34d399',
    negWeight: '#f43f5e',
    zeroWeight: '#333348',
    text: '#d0d0dc',
    dimText: '#666880',
    labelText: '#9898ac',
};
function $(id) { return document.getElementById(id); }
// Slider element refs for syncing after randomize
const weightSliderRefs = {};
// ============================================================
// ACTIVATION FUNCTIONS
// ============================================================
function activate(x) {
    switch (activationFn) {
        case 'relu': return Math.max(0, x);
        case 'sigmoid': return 1 / (1 + Math.exp(-x));
        case 'tanh': return Math.tanh(x);
    }
}
function activationLabel() {
    switch (activationFn) {
        case 'relu': return 'ReLU';
        case 'sigmoid': return 'σ';
        case 'tanh': return 'tanh';
    }
}
function activationFormula(x) {
    switch (activationFn) {
        case 'relu': return `max(0, ${x})`;
        case 'sigmoid': return `1/(1+e^(-${x}))`;
        case 'tanh': return `tanh(${x})`;
    }
}
// ============================================================
// NETWORK
// ============================================================
function randomWeight() {
    return Math.round((Math.random() * 2 - 1) * 100) / 100;
}
function initWeights() {
    wIH = [];
    bH = [];
    for (let h = 0; h < N_HID; h++) {
        wIH[h] = [];
        for (let i = 0; i < N_IN; i++) {
            wIH[h][i] = randomWeight();
        }
        bH[h] = randomWeight();
    }
    wHO = [];
    bO = [];
    for (let o = 0; o < N_OUT; o++) {
        wHO[o] = [];
        for (let h = 0; h < N_HID; h++) {
            wHO[o][h] = randomWeight();
        }
        bO[o] = randomWeight();
    }
}
function forward() {
    hiddenRaw = [];
    hiddenAct = [];
    for (let h = 0; h < N_HID; h++) {
        let sum = bH[h];
        for (let i = 0; i < N_IN; i++) {
            sum += inputs[i] * wIH[h][i];
        }
        hiddenRaw[h] = sum;
        hiddenAct[h] = activate(sum);
    }
    outputRaw = [];
    outputVal = [];
    for (let o = 0; o < N_OUT; o++) {
        let sum = bO[o];
        for (let h = 0; h < N_HID; h++) {
            sum += hiddenAct[h] * wHO[o][h];
        }
        outputRaw[o] = sum;
        outputVal[o] = sum; // no activation on output
    }
}
// ============================================================
// LAYOUT
// ============================================================
function computePositions() {
    const padX = 60;
    const colWidth = (W - padX * 2) / 2;
    const x0 = padX;
    const x1 = padX + colWidth;
    const x2 = padX + colWidth * 2;
    posIn = [];
    for (let i = 0; i < N_IN; i++) {
        const y = H / 2 + (i - (N_IN - 1) / 2) * 70;
        posIn.push({ x: x0, y });
    }
    posHid = [];
    for (let h = 0; h < N_HID; h++) {
        const y = H / 2 + (h - (N_HID - 1) / 2) * 60;
        posHid.push({ x: x1, y });
    }
    posOut = [];
    for (let o = 0; o < N_OUT; o++) {
        const y = H / 2;
        posOut.push({ x: x2, y });
    }
}
// ============================================================
// DRAWING
// ============================================================
function weightColor(w, alpha = 1) {
    if (Math.abs(w) < 0.01)
        return COLORS.zeroWeight;
    const t = Math.min(1, Math.abs(w));
    if (w > 0) {
        const r = Math.round(52 + (52 - 52) * t);
        const g = Math.round(100 + (211 - 100) * t);
        const b = Math.round(80 + (153 - 80) * t);
        return `rgba(${r},${g},${b},${alpha})`;
    }
    else {
        const r = Math.round(120 + (244 - 120) * t);
        const g = Math.round(60 + (63 - 60) * t);
        const b = Math.round(80 + (94 - 80) * t);
        return `rgba(${r},${g},${b},${alpha})`;
    }
}
function signalAlpha(val) {
    return 0.15 + Math.min(1, Math.abs(val)) * 0.85;
}
function drawConnection(from, to, weight, signal) {
    const alpha = signalAlpha(signal * weight);
    const lineWidth = 1 + Math.min(3, Math.abs(weight) * 2.5);
    ctx.beginPath();
    ctx.moveTo(from.x + NEURON_R, from.y);
    ctx.lineTo(to.x - NEURON_R, to.y);
    ctx.strokeStyle = weightColor(weight, alpha);
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    // Weight label at midpoint
    const mx = (from.x + NEURON_R + to.x - NEURON_R) / 2;
    const my = (from.y + to.y) / 2 - 8;
    ctx.font = '10px "Cascadia Code", "Fira Code", monospace';
    ctx.fillStyle = weightColor(weight, 0.8);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(weight.toFixed(2), mx, my);
}
function drawNeuron(pos, val, fillColor, label) {
    // Glow for active neurons
    if (Math.abs(val) > 0.1) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, NEURON_R + 4, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(pos.x, pos.y, NEURON_R - 2, pos.x, pos.y, NEURON_R + 8);
        grad.addColorStop(0, fillColor.replace(')', ',0.25)').replace('rgb(', 'rgba('));
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, NEURON_R, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.neuron;
    ctx.fill();
    ctx.strokeStyle = fillColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    // Value inside
    ctx.font = 'bold 11px "Cascadia Code", "Fira Code", monospace';
    ctx.fillStyle = COLORS.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(val.toFixed(2), pos.x, pos.y);
    // Label below
    ctx.font = '10px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = COLORS.dimText;
    ctx.fillText(label, pos.x, pos.y + NEURON_R + 14);
}
function drawLayerLabel(x, label) {
    ctx.font = '11px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = COLORS.dimText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(label, x, 10);
}
function draw() {
    ctx.clearRect(0, 0, W, H);
    // Layer labels
    if (posIn.length > 0)
        drawLayerLabel(posIn[0].x, 'Input');
    if (posHid.length > 0)
        drawLayerLabel(posHid[0].x, 'Hidden');
    if (posOut.length > 0)
        drawLayerLabel(posOut[0].x, 'Output');
    // Connections: input → hidden
    for (let h = 0; h < N_HID; h++) {
        for (let i = 0; i < N_IN; i++) {
            drawConnection(posIn[i], posHid[h], wIH[h][i], inputs[i]);
        }
    }
    // Connections: hidden → output
    for (let o = 0; o < N_OUT; o++) {
        for (let h = 0; h < N_HID; h++) {
            drawConnection(posHid[h], posOut[o], wHO[o][h], hiddenAct[h]);
        }
    }
    // Neurons: input
    for (let i = 0; i < N_IN; i++) {
        drawNeuron(posIn[i], inputs[i], COLORS.inputFill, `x${i + 1}`);
    }
    // Neurons: hidden
    for (let h = 0; h < N_HID; h++) {
        drawNeuron(posHid[h], hiddenAct[h], COLORS.hiddenFill, `h${h + 1}`);
    }
    // Neurons: output
    for (let o = 0; o < N_OUT; o++) {
        drawNeuron(posOut[o], outputVal[o], COLORS.outputFill, 'y');
    }
}
// ============================================================
// UI
// ============================================================
function makeSlider(container, key, labelHtml, value, min, max, onChange, customUpdate) {
    const row = document.createElement('div');
    row.className = 'slider-row';
    const label = document.createElement('span');
    label.className = 'slider-label';
    label.innerHTML = labelHtml;
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = String(min);
    slider.max = String(max);
    slider.step = '0.05';
    slider.value = String(value);
    const val = document.createElement('span');
    val.className = 'slider-val';
    val.textContent = value.toFixed(2);
    val.style.color = value >= 0 ? COLORS.posWeight : COLORS.negWeight;
    slider.addEventListener('input', () => {
        const v = parseFloat(slider.value);
        val.textContent = v.toFixed(2);
        val.style.color = v >= 0 ? COLORS.posWeight : COLORS.negWeight;
        onChange(v);
        (customUpdate || update)();
    });
    row.appendChild(label);
    row.appendChild(slider);
    row.appendChild(val);
    container.appendChild(row);
    if (key) weightSliderRefs[key] = { slider, val };
}
function buildSliders() {
    const container = $('input-sliders');
    container.innerHTML = '';
    for (let i = 0; i < N_IN; i++) {
        makeSlider(container, null, `x<sub>${i + 1}</sub>`, inputs[i], -1, 1, v => { inputs[i] = v; });
    }
}
function buildHiddenSliders() {
    const container = $('hidden-sliders');
    container.innerHTML = '';
    for (let h = 0; h < N_HID; h++) {
        makeSlider(container, `hid_${h}`, `h<sub>${h+1}</sub>`, hiddenAct[h], -2, 2,
            v => { hiddenAct[h] = v; }, updateOutputOnly);
    }
}
function syncHiddenSliders() {
    for (let h = 0; h < N_HID; h++) {
        const ref = weightSliderRefs[`hid_${h}`];
        if (!ref) continue;
        ref.slider.value = String(hiddenAct[h]);
        ref.val.textContent = hiddenAct[h].toFixed(2);
        ref.val.style.color = hiddenAct[h] >= 0 ? COLORS.posWeight : COLORS.negWeight;
    }
}
function updateOutputOnly() {
    outputRaw = [];
    outputVal = [];
    for (let o = 0; o < N_OUT; o++) {
        let sum = bO[o];
        for (let h = 0; h < N_HID; h++) {
            sum += hiddenAct[h] * wHO[o][h];
        }
        outputRaw[o] = sum;
        outputVal[o] = sum;
    }
    draw();
    buildMathPanel();
    updateOutput();
}
function buildWeightSliders() {
    const container = $('weight-sliders');
    container.innerHTML = '';
    for (let h = 0; h < N_HID; h++) {
        const lbl = document.createElement('div');
        lbl.className = 'section-label' + (h > 0 ? ' nudge' : '');
        lbl.textContent = `Neuron h${h + 1}`;
        container.appendChild(lbl);
        for (let i = 0; i < N_IN; i++) {
            makeSlider(container, `wIH_${h}_${i}`,
                `w<sub>${h+1}${i+1}</sub>`, wIH[h][i], -2, 2,
                v => { wIH[h][i] = v; });
        }
        makeSlider(container, `bH_${h}`,
            `b<sub>${h+1}</sub>`, bH[h], -2, 2,
            v => { bH[h] = v; });
    }
    const outLbl = document.createElement('div');
    outLbl.className = 'section-label nudge';
    outLbl.textContent = 'Output neuron';
    container.appendChild(outLbl);
    for (let h = 0; h < N_HID; h++) {
        makeSlider(container, `wHO_${h}`,
            `v<sub>${h+1}</sub>`, wHO[0][h], -2, 2,
            v => { wHO[0][h] = v; });
    }
    makeSlider(container, 'bO',
        `b<sub>o</sub>`, bO[0], -2, 2,
        v => { bO[0] = v; });
}
function syncWeightSliders() {
    function set(key, v) {
        const ref = weightSliderRefs[key];
        if (!ref) return;
        ref.slider.value = String(v);
        ref.val.textContent = v.toFixed(2);
        ref.val.style.color = v >= 0 ? COLORS.posWeight : COLORS.negWeight;
    }
    for (let h = 0; h < N_HID; h++) {
        for (let i = 0; i < N_IN; i++) set(`wIH_${h}_${i}`, wIH[h][i]);
        set(`bH_${h}`, bH[h]);
    }
    for (let h = 0; h < N_HID; h++) set(`wHO_${h}`, wHO[0][h]);
    set('bO', bO[0]);
}
function valSpan(v) {
    const cls = v > 0.001 ? 'val-pos' : v < -0.001 ? 'val-neg' : 'val-zero';
    return `<span class="${cls}">${v.toFixed(2)}</span>`;
}
function buildMathPanel() {
    const panel = $('math-panel');
    let html = '';
    // Hidden neurons
    for (let h = 0; h < N_HID; h++) {
        const titleColor = COLORS.hiddenFill;
        html += `<div class="neuron-card${h === 0 ? ' highlighted' : ''}">`;
        html += `<div class="neuron-title" style="color:${titleColor}">h${h + 1} — Hidden neuron ${h + 1}</div>`;
        html += `<div class="neuron-math">`;
        // Weighted sum line
        const terms = [];
        for (let i = 0; i < N_IN; i++) {
            const w = wIH[h][i];
            const x = inputs[i];
            terms.push(`${valSpan(w)} × ${valSpan(x)}`);
        }
        const rawSum = hiddenRaw[h];
        html += `z = ${terms.join(' + ')} + ${valSpan(bH[h])}<br>`;
        // Expand products
        const products = [];
        for (let i = 0; i < N_IN; i++) {
            products.push(valSpan(wIH[h][i] * inputs[i]));
        }
        html += `&nbsp; = ${products.join(' + ')} + ${valSpan(bH[h])} = ${valSpan(rawSum)}<br>`;
        // Activation
        html += `${activationLabel()}(${valSpan(rawSum)}) = ${valSpan(hiddenAct[h])}`;
        html += `</div></div>`;
    }
    // Output neuron
    html += `<div class="neuron-card highlighted">`;
    html += `<div class="neuron-title" style="color:${COLORS.outputFill}">y — Output</div>`;
    html += `<div class="neuron-math">`;
    const oTerms = [];
    for (let h = 0; h < N_HID; h++) {
        oTerms.push(`${valSpan(wHO[0][h])} × ${valSpan(hiddenAct[h])}`);
    }
    html += `z = ${oTerms.join(' + ')} + ${valSpan(bO[0])}<br>`;
    const oProducts = [];
    for (let h = 0; h < N_HID; h++) {
        oProducts.push(valSpan(wHO[0][h] * hiddenAct[h]));
    }
    html += `&nbsp; = ${oProducts.join(' + ')} + ${valSpan(bO[0])} = ${valSpan(outputVal[0])}`;
    html += `</div></div>`;
    // Insight box
    let insight = '';
    const allDead = hiddenAct.every(v => Math.abs(v) < 0.001);
    const allSaturated = activationFn === 'sigmoid' && hiddenAct.every(v => v > 0.99 || v < 0.01);
    if (activationFn === 'relu' && allDead) {
        insight = 'All hidden neurons output zero — this is the "dying ReLU" problem. When all pre-activation values are negative, ReLU kills the signal entirely. Try different inputs or randomize weights.';
    }
    else if (allSaturated) {
        insight = 'All sigmoid neurons are saturated (near 0 or 1). Large pre-activation values push sigmoid to its flat regions where gradients vanish — this is why deep networks struggled before ReLU.';
    }
    else if (activationFn === 'relu') {
        const dead = hiddenAct.filter(v => Math.abs(v) < 0.001).length;
        if (dead > 0) {
            insight = `${dead} of ${N_HID} hidden neurons are "dead" (ReLU zeroed them). Only neurons with positive pre-activation values pass signal through. This sparsity is actually a feature — it makes the network more efficient.`;
        }
        else {
            insight = 'All neurons are active. ReLU passes positive values unchanged and blocks negatives. Notice how the output is a linear combination of the active hidden neurons — each one contributes a different "feature" to the final answer.';
        }
    }
    else if (activationFn === 'sigmoid') {
        insight = 'Sigmoid squashes every value to (0, 1). Notice how extreme pre-activation values get compressed near 0 or 1 — this is useful for probabilities but causes vanishing gradients in deep networks.';
    }
    else {
        insight = 'Tanh squashes values to (-1, 1), centered at zero. Unlike sigmoid, negative inputs produce negative outputs, which helps the network learn faster because gradients flow in both directions.';
    }
    html += `<div class="insight-box">${insight}</div>`;
    panel.innerHTML = html;
}
function updateOutput() {
    $('output-val').textContent = outputVal[0].toFixed(4);
    const el = $('output-val');
    el.style.color = outputVal[0] >= 0 ? COLORS.outputFill : '#f43f5e';
}
function update() {
    forward();
    syncHiddenSliders();
    draw();
    buildMathPanel();
    updateOutput();
}
// ============================================================
// CANVAS SIZING
// ============================================================
function resize() {
    const container = canvas.parentElement;
    const w = container.clientWidth;
    const h = Math.min(300, w * 0.45);
    const dpr = window.devicePixelRatio || 1;
    W = w;
    H = h;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    computePositions();
    draw();
}
// ============================================================
// INIT
// ============================================================
function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    initWeights();
    forward();
    buildSliders();
    buildHiddenSliders();
    buildWeightSliders();
    // Activation toggle buttons
    document.querySelectorAll('.ctrl-btn[data-fn]').forEach(btn => {
        btn.addEventListener('click', () => {
            activationFn = btn.dataset.fn;
            document.querySelectorAll('.ctrl-btn[data-fn]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            update();
        });
    });
    // Randomize button — reinit weights then sync sliders
    $('btn-randomize').addEventListener('click', () => {
        initWeights();
        syncWeightSliders();
        update();
    });
    window.addEventListener('resize', resize);
    resize();
    update();
}
document.addEventListener('DOMContentLoaded', init);
export {};
