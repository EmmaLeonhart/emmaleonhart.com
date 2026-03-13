let canvas;
let ctx;
let W = 0, H = 0;
let nodes = [];
let showBackward = false;
let highlightNode = -1;
// User-editable inputs
let inputX = 0.5;
let inputW = 0.8;
let inputB = -0.2;
let trueY = 1.0;
const NODE_R = 22;
const COLORS = {
    bg: '#0a0a0f',
    node: '#1e1e2a',
    nodeStroke: '#3a3a50',
    inputFill: '#7c8cf8',
    opFill: '#a78bfa',
    lossFill: '#f43f5e',
    outputFill: '#34d399',
    forwardArrow: '#7c8cf8',
    backwardArrow: '#f59e0b',
    text: '#d0d0dc',
    dimText: '#666880',
    posVal: '#34d399',
    negVal: '#f43f5e',
};
function $(id) { return document.getElementById(id); }
// ============================================================
// COMPUTATIONAL GRAPH
// ============================================================
function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}
function buildGraph() {
    // Simple graph: y = sigmoid(w*x + b), loss = (y - target)²
    // Nodes:
    // 0: x (input)
    // 1: w (weight)
    // 2: b (bias)
    // 3: w*x (multiply)
    // 4: w*x + b (add)
    // 5: sigmoid(w*x + b) = ŷ (activation)
    // 6: target (input)
    // 7: ŷ - target (subtract)
    // 8: (ŷ - target)² = loss (square)
    nodes = [
        { id: 'x', label: 'x', op: 'input', value: 0, grad: 0, x: 0, y: 0, inputs: [] },
        { id: 'w', label: 'w', op: 'input', value: 0, grad: 0, x: 0, y: 0, inputs: [] },
        { id: 'b', label: 'b', op: 'input', value: 0, grad: 0, x: 0, y: 0, inputs: [] },
        { id: 'wx', label: 'w·x', op: 'mul', value: 0, grad: 0, x: 0, y: 0, inputs: [1, 0] },
        { id: 'z', label: 'z=wx+b', op: 'add', value: 0, grad: 0, x: 0, y: 0, inputs: [3, 2] },
        { id: 'yhat', label: '\u03C3(z)', op: 'sigmoid', value: 0, grad: 0, x: 0, y: 0, inputs: [4] },
        { id: 'target', label: 'y', op: 'input', value: 0, grad: 0, x: 0, y: 0, inputs: [] },
        { id: 'diff', label: '\u0177-y', op: 'sub', value: 0, grad: 0, x: 0, y: 0, inputs: [5, 6] },
        { id: 'loss', label: 'L=(\u0177-y)\u00B2', op: 'square', value: 0, grad: 0, x: 0, y: 0, inputs: [7] },
    ];
}
function forwardPass() {
    nodes[0].value = inputX;
    nodes[1].value = inputW;
    nodes[2].value = inputB;
    nodes[3].value = nodes[1].value * nodes[0].value;
    nodes[4].value = nodes[3].value + nodes[2].value;
    nodes[5].value = sigmoid(nodes[4].value);
    nodes[6].value = trueY;
    nodes[7].value = nodes[5].value - nodes[6].value;
    nodes[8].value = nodes[7].value * nodes[7].value;
}
function backwardPass() {
    // Reset all gradients
    for (const n of nodes)
        n.grad = 0;
    // dL/dL = 1
    nodes[8].grad = 1;
    // dL/d(ŷ-y) = 2(ŷ-y)
    nodes[7].grad = 2 * nodes[7].value;
    // dL/dŷ = dL/d(ŷ-y) * 1
    nodes[5].grad = nodes[7].grad * 1;
    // dL/dy_target = dL/d(ŷ-y) * (-1)
    nodes[6].grad = nodes[7].grad * (-1);
    // dL/dz = dL/dŷ * σ'(z) = dL/dŷ * σ(z)(1-σ(z))
    const sigZ = nodes[5].value;
    nodes[4].grad = nodes[5].grad * sigZ * (1 - sigZ);
    // dL/d(wx) = dL/dz * 1
    nodes[3].grad = nodes[4].grad * 1;
    // dL/db = dL/dz * 1
    nodes[2].grad = nodes[4].grad * 1;
    // dL/dw = dL/d(wx) * x
    nodes[1].grad = nodes[3].grad * nodes[0].value;
    // dL/dx = dL/d(wx) * w
    nodes[0].grad = nodes[3].grad * nodes[1].value;
}
function computePositions() {
    // Layout: 5 columns
    const cols = [
        [0, 1, 2, 6], // inputs
        [3], // multiply
        [4], // add
        [5, 7], // sigmoid, subtract
        [8], // loss
    ];
    const colX = (i) => 80 + i * ((W - 160) / (cols.length - 1));
    for (let c = 0; c < cols.length; c++) {
        const group = cols[c];
        const x = colX(c);
        for (let i = 0; i < group.length; i++) {
            const nodeIdx = group[i];
            const spacing = H / (group.length + 1);
            nodes[nodeIdx].x = x;
            nodes[nodeIdx].y = spacing * (i + 1);
        }
    }
}
// ============================================================
// DRAWING
// ============================================================
function valColor(v) {
    if (v > 0.001)
        return COLORS.posVal;
    if (v < -0.001)
        return COLORS.negVal;
    return COLORS.dimText;
}
function nodeColor(n) {
    if (n.op === 'input')
        return COLORS.inputFill;
    if (n.op === 'square' || n.op === 'sub')
        return COLORS.lossFill;
    if (n.op === 'sigmoid')
        return COLORS.outputFill;
    return COLORS.opFill;
}
function drawArrowBetween(from, to, color, width, dashed, label, above) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy);
    if (len < 1)
        return;
    const ux = dx / len, uy = dy / len;
    const x1 = from.x + ux * (NODE_R + 2);
    const y1 = from.y + uy * (NODE_R + 2);
    const x2 = to.x - ux * (NODE_R + 2);
    const y2 = to.y - uy * (NODE_R + 2);
    ctx.beginPath();
    if (dashed)
        ctx.setLineDash([4, 3]);
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.setLineDash([]);
    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - ux * 8 + uy * 4, y2 - uy * 8 - ux * 4);
    ctx.lineTo(x2 - ux * 8 - uy * 4, y2 - uy * 8 + ux * 4);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    // Label
    if (label) {
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2 + (above ? -10 : 12);
        ctx.font = '9px "Cascadia Code", "Fira Code", monospace';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, mx, my);
    }
}
function drawNode(n, idx) {
    const color = nodeColor(n);
    const isHighlight = idx === highlightNode;
    // Glow
    if (isHighlight) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, NODE_R + 5, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(n.x, n.y, NODE_R - 2, n.x, n.y, NODE_R + 10);
        grad.addColorStop(0, color.replace(')', ',0.3)').replace('rgb(', 'rgba('));
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(n.x, n.y, NODE_R, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.node;
    ctx.fill();
    ctx.strokeStyle = isHighlight ? color : COLORS.nodeStroke;
    ctx.lineWidth = isHighlight ? 2.5 : 1.5;
    ctx.stroke();
    // Label
    ctx.font = 'bold 10px "Cascadia Code", "Fira Code", monospace';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(n.label, n.x, n.y - 5);
    // Value
    ctx.font = '9px "Cascadia Code", "Fira Code", monospace';
    ctx.fillStyle = valColor(n.value);
    ctx.fillText(n.value.toFixed(3), n.x, n.y + 7);
    // Gradient (below node, if backward mode)
    if (showBackward) {
        ctx.font = '8px "Cascadia Code", "Fira Code", monospace';
        ctx.fillStyle = COLORS.backwardArrow;
        ctx.fillText('\u2202L=' + n.grad.toFixed(3), n.x, n.y + NODE_R + 12);
    }
}
function draw() {
    ctx.clearRect(0, 0, W, H);
    // Title
    ctx.font = '11px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = COLORS.dimText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(showBackward ? 'Backward Pass (gradients flow right \u2192 left)' : 'Forward Pass (values flow left \u2192 right)', W / 2, 6);
    // Draw edges (forward)
    for (let i = 0; i < nodes.length; i++) {
        for (const inputIdx of nodes[i].inputs) {
            drawArrowBetween(nodes[inputIdx], nodes[i], COLORS.forwardArrow, 1.5, false, nodes[inputIdx].value.toFixed(2), true);
        }
    }
    // Draw backward edges
    if (showBackward) {
        for (let i = 0; i < nodes.length; i++) {
            for (const inputIdx of nodes[i].inputs) {
                drawArrowBetween(nodes[i], nodes[inputIdx], COLORS.backwardArrow, 1.5, true, '\u2202=' + nodes[inputIdx].grad.toFixed(3), false);
            }
        }
    }
    // Draw nodes on top
    for (let i = 0; i < nodes.length; i++) {
        drawNode(nodes[i], i);
    }
}
// ============================================================
// UI
// ============================================================
function buildMathPanel() {
    const panel = $('math-panel');
    let html = '';
    // Forward pass equations
    html += `<div class="eq-section">`;
    html += `<div class="eq-title" style="color:${COLORS.forwardArrow}">Forward Pass</div>`;
    html += `<div class="eq-line">w·x = ${valStr(inputW)} × ${valStr(inputX)} = ${valStr(inputW * inputX)}</div>`;
    html += `<div class="eq-line">z = w·x + b = ${valStr(inputW * inputX)} + ${valStr(inputB)} = ${valStr(nodes[4]?.value ?? 0)}</div>`;
    html += `<div class="eq-line">\u0177 = \u03C3(z) = 1/(1+e<sup>-${(nodes[4]?.value ?? 0).toFixed(2)}</sup>) = ${valStr(nodes[5]?.value ?? 0)}</div>`;
    html += `<div class="eq-line">L = (\u0177 - y)\u00B2 = (${(nodes[5]?.value ?? 0).toFixed(3)} - ${trueY.toFixed(1)})\u00B2 = ${valStr(nodes[8]?.value ?? 0)}</div>`;
    html += `</div>`;
    if (showBackward) {
        html += `<div class="eq-section">`;
        html += `<div class="eq-title" style="color:${COLORS.backwardArrow}">Backward Pass (Chain Rule)</div>`;
        html += `<div class="eq-line">\u2202L/\u2202L = <span class="val-pos">1</span></div>`;
        html += `<div class="eq-line">\u2202L/\u2202(\u0177-y) = 2(\u0177-y) = ${valStr(2 * (nodes[7]?.value ?? 0))}</div>`;
        const sigZ = nodes[5]?.value ?? 0;
        html += `<div class="eq-line">\u2202L/\u2202z = \u2202L/\u2202\u0177 · \u03C3'(z) = ${valStr(nodes[5]?.grad ?? 0)} × ${valStr(sigZ * (1 - sigZ))} = ${valStr(nodes[4]?.grad ?? 0)}</div>`;
        html += `<div class="eq-line important">\u2202L/\u2202w = \u2202L/\u2202z · x = ${valStr(nodes[4]?.grad ?? 0)} × ${valStr(inputX)} = <span class="grad-val">${valStr(nodes[1]?.grad ?? 0)}</span></div>`;
        html += `<div class="eq-line important">\u2202L/\u2202b = \u2202L/\u2202z · 1 = <span class="grad-val">${valStr(nodes[2]?.grad ?? 0)}</span></div>`;
        html += `</div>`;
        // Weight update
        const lr = 0.1;
        html += `<div class="eq-section">`;
        html += `<div class="eq-title" style="color:${COLORS.posVal}">Weight Update (lr=${lr})</div>`;
        html += `<div class="eq-line">w\u2032 = w - lr·\u2202L/\u2202w = ${valStr(inputW)} - ${lr}×${valStr(nodes[1]?.grad ?? 0)} = ${valStr(inputW - lr * (nodes[1]?.grad ?? 0))}</div>`;
        html += `<div class="eq-line">b\u2032 = b - lr·\u2202L/\u2202b = ${valStr(inputB)} - ${lr}×${valStr(nodes[2]?.grad ?? 0)} = ${valStr(inputB - lr * (nodes[2]?.grad ?? 0))}</div>`;
        html += `</div>`;
    }
    // Insight
    let insight = '';
    if (!showBackward) {
        insight = 'The computational graph shows how data flows forward through operations. Each node computes one simple operation. Click "Show backward pass" to see how gradients flow in reverse using the chain rule.';
    }
    else {
        const sigZ = nodes[5]?.value ?? 0;
        if (sigZ > 0.95 || sigZ < 0.05) {
            insight = `\u03C3(z) = ${sigZ.toFixed(3)} is near saturation. The sigmoid derivative \u03C3'(z) = ${(sigZ * (1 - sigZ)).toFixed(4)} is tiny, so gradients for w and b are almost zero. This is the vanishing gradient problem — the network can barely learn when activations are saturated.`;
        }
        else {
            insight = 'Each gradient is computed by multiplying local derivatives along the path from the loss back to each parameter — this IS the chain rule. The key insight: backpropagation is just automatic chain rule application on the computational graph, nothing magical.';
        }
    }
    html += `<div class="insight-box">${insight}</div>`;
    panel.innerHTML = html;
}
function valStr(v) {
    const cls = v > 0.001 ? 'val-pos' : v < -0.001 ? 'val-neg' : 'val-zero';
    return `<span class="${cls}">${v.toFixed(3)}</span>`;
}
function update() {
    forwardPass();
    if (showBackward)
        backwardPass();
    computePositions();
    draw();
    buildMathPanel();
}
// ============================================================
// CANVAS SIZING
// ============================================================
function resize() {
    const container = canvas.parentElement;
    const w = container.clientWidth;
    const h = Math.min(320, w * 0.45);
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
    buildGraph();
    forwardPass();
    // Input sliders
    const makeSlider = (id, getter, setter) => {
        const slider = $(id);
        const valEl = $(id + '-val');
        slider.value = String(getter());
        valEl.textContent = getter().toFixed(2);
        slider.addEventListener('input', () => {
            setter(parseFloat(slider.value));
            valEl.textContent = getter().toFixed(2);
            update();
        });
    };
    makeSlider('slider-x', () => inputX, v => inputX = v);
    makeSlider('slider-w', () => inputW, v => inputW = v);
    makeSlider('slider-b', () => inputB, v => inputB = v);
    // True label toggle
    document.querySelectorAll('.ctrl-btn[data-label]').forEach(btn => {
        btn.addEventListener('click', () => {
            trueY = parseFloat(btn.dataset.label || '1');
            document.querySelectorAll('.ctrl-btn[data-label]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            update();
        });
    });
    // Forward/backward toggle
    $('btn-forward').addEventListener('click', () => {
        showBackward = false;
        $('btn-forward').classList.add('active');
        $('btn-backward').classList.remove('active');
        update();
    });
    $('btn-backward').addEventListener('click', () => {
        showBackward = true;
        $('btn-backward').classList.add('active');
        $('btn-forward').classList.remove('active');
        update();
    });
    // Step button (apply gradient update)
    $('btn-step').addEventListener('click', () => {
        forwardPass();
        backwardPass();
        const lr = 0.1;
        inputW -= lr * nodes[1].grad;
        inputB -= lr * nodes[2].grad;
        // Clamp
        inputW = Math.max(-3, Math.min(3, inputW));
        inputB = Math.max(-3, Math.min(3, inputB));
        // Update sliders
        $(('slider-w')).value = String(inputW);
        $('slider-w-val').textContent = inputW.toFixed(2);
        $(('slider-b')).value = String(inputB);
        $('slider-b-val').textContent = inputB.toFixed(2);
        update();
    });
    // Canvas hover for node highlighting
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const px = (e.clientX - rect.left) * W / rect.width;
        const py = (e.clientY - rect.top) * H / rect.height;
        let found = -1;
        for (let i = 0; i < nodes.length; i++) {
            if (Math.hypot(px - nodes[i].x, py - nodes[i].y) < NODE_R + 5) {
                found = i;
                break;
            }
        }
        if (found !== highlightNode) {
            highlightNode = found;
            draw();
        }
        canvas.style.cursor = found >= 0 ? 'pointer' : 'default';
    });
    window.addEventListener('resize', resize);
    resize();
    update();
}
document.addEventListener('DOMContentLoaded', init);
export {};
