function $(id) { return document.getElementById(id); }
// ============================================================
// COLORS & CONSTANTS
// ============================================================
const C = {
    bg: '#0a0a0f',
    panel: '#12121a',
    border: '#1e1e2a',
    text: '#d0d0dc',
    dim: '#666880',
    positive: '#34d399',
    negative: '#f43f5e',
    accent: '#7c8cf8',
    l1: '#f59e0b',
    l2: '#7c8cf8',
    elastic: '#a78bfa',
    contour: '#2a2a3a',
    contourHi: '#3a3a50',
    neuronFill: '#1e1e2a',
    neuronStroke: '#3a3a50',
    dropStroke: '#f43f5e',
    activeNeuron: '#a78bfa',
    batchIn: '#f59e0b',
    batchOut: '#34d399',
};
let regType = 'l1';
let vizType = 'dropout';
let activeCategory = 'penalty'; // 'penalty' or 'training'
let lambda = 2.0;
let alpha = 0.5;
let dropoutRate = 0.5;
// Canvas contexts
let c1, ctx1;
let c2, ctx2;
let W1 = 0, H1 = 0, W2 = 0, H2 = 0;
// Dropout state
let droppedNeurons = [];
const NET_LAYERS = [4, 6, 2]; // input, hidden, output
// Batch norm demo values
let batchValues = [];
let batchNormed = [];
let bnGamma = 1.0;
let bnBeta = 0.0;
// Loss function parameters (elliptical contours)
const LOSS_CENTER = [1.8, 1.5]; // optimal unconstrained solution
const LOSS_A = 1.0; // x stretch
const LOSS_B = 2.5; // y stretch (makes ellipses elongated)
const LOSS_ANGLE = -0.4; // rotation in radians
// ============================================================
// INITIALIZATION
// ============================================================
function init() {
    c1 = $('canvas1');
    c2 = $('canvas2');
    ctx1 = c1.getContext('2d');
    ctx2 = c2.getContext('2d');
    resampleDropout();
    resampleBatch();
    bindControls();
    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(loop);
}
function resize() {
    const dpr = window.devicePixelRatio || 1;
    for (const [canvas, ctxRef] of [[c1, ctx1], [c2, ctx2]]) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctxRef.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    W1 = c1.getBoundingClientRect().width;
    H1 = c1.getBoundingClientRect().height;
    W2 = c2.getBoundingClientRect().width;
    H2 = c2.getBoundingClientRect().height;
}
// ============================================================
// CONTROLS
// ============================================================
function bindControls() {
    // Regularization type buttons
    document.querySelectorAll('[data-reg]').forEach(btn => {
        btn.addEventListener('click', () => {
            regType = btn.dataset.reg;
            document.querySelectorAll('[data-reg]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = 'penalty';
            updateCategoryVisibility();
            updateMath();
            updateInsight();
        });
    });
    // Viz type buttons
    document.querySelectorAll('[data-viz]').forEach(btn => {
        btn.addEventListener('click', () => {
            vizType = btn.dataset.viz;
            document.querySelectorAll('[data-viz]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = 'training';
            updateCategoryVisibility();
            updateMath();
            updateInsight();
        });
    });
    // Lambda slider
    const lambdaSlider = $('lambda-slider');
    lambdaSlider.addEventListener('input', () => {
        lambda = parseFloat(lambdaSlider.value);
        $('lambda-value').textContent = lambda.toFixed(1);
    });
    // Alpha slider
    const alphaSlider = $('alpha-slider');
    alphaSlider.addEventListener('input', () => {
        alpha = parseFloat(alphaSlider.value);
        $('alpha-value').textContent = alpha.toFixed(2);
    });
    // Dropout slider
    const dropSlider = $('dropout-slider');
    dropSlider.addEventListener('input', () => {
        dropoutRate = parseFloat(dropSlider.value);
        $('dropout-value').textContent = dropoutRate.toFixed(1);
        resampleDropout();
    });
    // Resample button
    $('btn-resample').addEventListener('click', () => {
        resampleDropout();
        resampleBatch();
    });
    updateCategoryVisibility();
    updateMath();
    updateInsight();
}
function updateCategoryVisibility() {
    const isPenalty = activeCategory === 'penalty';
    // Canvas visibility
    $('wrap1').style.display = isPenalty ? 'block' : 'none';
    $('wrap2').style.display = isPenalty ? 'none' : 'block';
    // Penalty-specific controls
    $('lambda-slider').parentElement.style.display = isPenalty ? 'flex' : 'none';
    $('alpha-wrap').style.display = isPenalty && regType === 'elastic' ? 'flex' : 'none';
    // Training-specific controls
    $('dropout-wrap').style.display = !isPenalty && vizType === 'dropout' ? 'flex' : 'none';
    $('btn-resample').style.display = !isPenalty && vizType === 'dropout' ? 'inline-block' : 'none';
    // Resize after toggling so canvas dimensions are correct
    setTimeout(resize, 0);
}
function updateMath() {
    const el = $('math-panel');
    const formulas = {
        l1: 'L\u2091\u2081 = Loss + \u03bb \u00b7 \u03a3|w\u1d62|',
        l2: 'L\u2091\u2082 = Loss + \u03bb \u00b7 \u03a3w\u1d62\u00b2',
        elastic: 'L\u2091\u2099 = Loss + \u03bb \u00b7 [\u03b1 \u00b7 \u03a3|w\u1d62| + (1\u2013\u03b1) \u00b7 \u03a3w\u1d62\u00b2]',
        dropout: 'p(keep) = 1 \u2013 dropout_rate, scale by 1/(1\u2013p) at train time',
        batchnorm: '\u0177 = \u03b3 \u00b7 (x \u2013 \u03bc) / \u03c3 + \u03b2',
    };
    if (activeCategory === 'penalty') {
        el.innerHTML = `<div><strong>Weight Penalty:</strong> ${formulas[regType]}</div>`;
    } else {
        el.innerHTML = `<div><strong>Training Regularization:</strong> ${formulas[vizType]}</div>`;
    }
}
function updateInsight() {
    const el = $('insight-box');
    const regInsights = {
        l1: 'L1 creates a diamond constraint. Because contours are more likely to touch at corners (where a weight = 0), L1 naturally produces sparse solutions \u2014 some weights become exactly zero.',
        l2: 'L2 creates a circular constraint that shrinks all weights equally toward zero, but never forces them to exactly zero. Good for preventing any single weight from dominating.',
        elastic: 'Combines the sparsity of L1 with the grouping effect of L2. The \u03b1 parameter controls the mix.',
    };
    const vizInsights = {
        dropout: 'By randomly killing neurons during training, dropout forces the network to not rely on any single neuron. It\'s like training an ensemble of thinner networks.',
        batchnorm: 'Normalizing activations keeps them in a well-behaved range, which stabilizes training and allows higher learning rates.',
    };
    if (activeCategory === 'penalty') {
        el.innerHTML = `<p style="margin:0">${regInsights[regType]}</p>`;
    } else {
        el.innerHTML = `<p style="margin:0">${vizInsights[vizType]}</p>`;
    }
}
// ============================================================
// DROPOUT / BATCH NORM STATE
// ============================================================
function resampleDropout() {
    const hiddenCount = NET_LAYERS[1];
    droppedNeurons = [];
    for (let i = 0; i < hiddenCount; i++) {
        droppedNeurons.push(Math.random() < dropoutRate);
    }
}
function resampleBatch() {
    batchValues = [];
    for (let i = 0; i < 8; i++) {
        batchValues.push((Math.random() - 0.3) * 4); // values in roughly [-1.2, 2.8]
    }
    normalizeBatch();
}
function normalizeBatch() {
    const mean = batchValues.reduce((a, b) => a + b, 0) / batchValues.length;
    const variance = batchValues.reduce((a, b) => a + (b - mean) ** 2, 0) / batchValues.length;
    const std = Math.sqrt(variance + 1e-5);
    batchNormed = batchValues.map(v => bnGamma * ((v - mean) / std) + bnBeta);
}
// ============================================================
// CANVAS 1 — WEIGHT PENALTY VISUALIZATION
// ============================================================
function drawCanvas1() {
    ctx1.clearRect(0, 0, W1, H1);
    ctx1.fillStyle = C.bg;
    ctx1.fillRect(0, 0, W1, H1);
    const cx = W1 / 2;
    const cy = H1 / 2;
    const scale = Math.min(W1, H1) / 7; // pixels per unit in weight space
    // Transform from weight space to pixel space
    const toX = (w) => cx + w * scale;
    const toY = (w) => cy - w * scale; // y inverted
    // Draw axes
    ctx1.strokeStyle = C.border;
    ctx1.lineWidth = 1;
    ctx1.beginPath();
    ctx1.moveTo(toX(-3.2), cy);
    ctx1.lineTo(toX(3.2), cy);
    ctx1.moveTo(cx, toY(-3.2));
    ctx1.lineTo(cx, toY(3.2));
    ctx1.stroke();
    // Axis labels
    ctx1.fillStyle = C.dim;
    ctx1.font = '12px monospace';
    ctx1.textAlign = 'center';
    ctx1.fillText('w\u2081', toX(3.0), cy + 18);
    ctx1.fillText('w\u2082', cx + 14, toY(2.8));
    // Draw loss contours (elliptical)
    drawLossContours(ctx1, cx, cy, scale);
    // Draw constraint region
    drawConstraintRegion(ctx1, cx, cy, scale);
    // Draw unconstrained optimum
    ctx1.fillStyle = C.negative;
    ctx1.beginPath();
    ctx1.arc(toX(LOSS_CENTER[0]), toY(LOSS_CENTER[1]), 5, 0, Math.PI * 2);
    ctx1.fill();
    ctx1.fillStyle = C.dim;
    ctx1.font = '10px monospace';
    ctx1.textAlign = 'left';
    ctx1.fillText('unconstrained', toX(LOSS_CENTER[0]) + 8, toY(LOSS_CENTER[1]) + 4);
    // Find and draw constrained optimum
    const opt = findConstrainedOptimum();
    ctx1.fillStyle = C.positive;
    ctx1.beginPath();
    ctx1.arc(toX(opt[0]), toY(opt[1]), 6, 0, Math.PI * 2);
    ctx1.fill();
    ctx1.fillStyle = C.text;
    ctx1.font = '10px monospace';
    ctx1.fillText('constrained', toX(opt[0]) + 9, toY(opt[1]) + 4);
    // Title
    ctx1.fillStyle = C.text;
    ctx1.font = 'bold 13px system-ui, sans-serif';
    ctx1.textAlign = 'center';
    ctx1.fillText('Weight Penalty — Constraint Region', cx, 22);
}
function drawLossContours(ctx, cx, cy, scale) {
    const levels = [0.5, 1.0, 1.5, 2.5, 4.0, 6.0, 9.0];
    const cosA = Math.cos(LOSS_ANGLE);
    const sinA = Math.sin(LOSS_ANGLE);
    for (const level of levels) {
        ctx.strokeStyle = level < 3 ? C.contourHi : C.contour;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const steps = 80;
        for (let i = 0; i <= steps; i++) {
            const t = (i / steps) * Math.PI * 2;
            const rx = Math.sqrt(level) / LOSS_A;
            const ry = Math.sqrt(level) / LOSS_B;
            const ex = rx * Math.cos(t);
            const ey = ry * Math.sin(t);
            // Rotate and translate
            const wx = LOSS_CENTER[0] + ex * cosA - ey * sinA;
            const wy = LOSS_CENTER[1] + ex * sinA + ey * cosA;
            const px = cx + wx * scale;
            const py = cy - wy * scale;
            if (i === 0)
                ctx.moveTo(px, py);
            else
                ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
    }
}
function drawConstraintRegion(ctx, cx, cy, scale) {
    const r = lambda;
    const steps = 120;
    let color;
    let label;
    if (regType === 'l1') {
        color = C.l1;
        label = 'L1 (Lasso)';
    }
    else if (regType === 'l2') {
        color = C.l2;
        label = 'L2 (Ridge)';
    }
    else {
        color = C.elastic;
        label = `Elastic Net (\u03b1=${alpha.toFixed(2)})`;
    }
    // Fill the constraint region with semi-transparent color
    ctx.fillStyle = color + '18';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2;
        let wx, wy;
        if (regType === 'l1') {
            // Diamond: |w1| + |w2| <= r
            wx = r * Math.cos(t) / (Math.abs(Math.cos(t)) + Math.abs(Math.sin(t)));
            wy = r * Math.sin(t) / (Math.abs(Math.cos(t)) + Math.abs(Math.sin(t)));
        }
        else if (regType === 'l2') {
            // Circle: w1^2 + w2^2 <= r
            wx = Math.sqrt(r) * Math.cos(t);
            wy = Math.sqrt(r) * Math.sin(t);
        }
        else {
            // Elastic net: interpolation
            // L1 boundary
            const l1x = r * Math.cos(t) / (Math.abs(Math.cos(t)) + Math.abs(Math.sin(t)));
            const l1y = r * Math.sin(t) / (Math.abs(Math.cos(t)) + Math.abs(Math.sin(t)));
            // L2 boundary
            const l2x = Math.sqrt(r) * Math.cos(t);
            const l2y = Math.sqrt(r) * Math.sin(t);
            wx = alpha * l1x + (1 - alpha) * l2x;
            wy = alpha * l1y + (1 - alpha) * l2y;
        }
        const px = cx + wx * scale;
        const py = cy - wy * scale;
        if (i === 0)
            ctx.moveTo(px, py);
        else
            ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Label
    ctx.fillStyle = color;
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(label, cx + r * scale * 0.4 + 8, cy - r * scale * 0.7);
}
function lossAt(w1, w2) {
    const cosA = Math.cos(LOSS_ANGLE);
    const sinA = Math.sin(LOSS_ANGLE);
    const dx = w1 - LOSS_CENTER[0];
    const dy = w2 - LOSS_CENTER[1];
    const rx = dx * cosA + dy * sinA;
    const ry = -dx * sinA + dy * cosA;
    return (rx * LOSS_A) ** 2 + (ry * LOSS_B) ** 2;
}
function findConstrainedOptimum() {
    // Brute-force search along the constraint boundary
    let bestLoss = Infinity;
    let bestW = [0, 0];
    const steps = 360;
    for (let i = 0; i < steps; i++) {
        const t = (i / steps) * Math.PI * 2;
        let wx, wy;
        if (regType === 'l1') {
            wx = lambda * Math.cos(t) / (Math.abs(Math.cos(t)) + Math.abs(Math.sin(t)));
            wy = lambda * Math.sin(t) / (Math.abs(Math.cos(t)) + Math.abs(Math.sin(t)));
        }
        else if (regType === 'l2') {
            wx = Math.sqrt(lambda) * Math.cos(t);
            wy = Math.sqrt(lambda) * Math.sin(t);
        }
        else {
            const l1x = lambda * Math.cos(t) / (Math.abs(Math.cos(t)) + Math.abs(Math.sin(t)));
            const l1y = lambda * Math.sin(t) / (Math.abs(Math.cos(t)) + Math.abs(Math.sin(t)));
            const l2x = Math.sqrt(lambda) * Math.cos(t);
            const l2y = Math.sqrt(lambda) * Math.sin(t);
            wx = alpha * l1x + (1 - alpha) * l2x;
            wy = alpha * l1y + (1 - alpha) * l2y;
        }
        const loss = lossAt(wx, wy);
        if (loss < bestLoss) {
            bestLoss = loss;
            bestW = [wx, wy];
        }
    }
    // Also check interior — if unconstrained optimum is inside
    const uc = LOSS_CENTER;
    let inside = false;
    if (regType === 'l1')
        inside = Math.abs(uc[0]) + Math.abs(uc[1]) <= lambda;
    else if (regType === 'l2')
        inside = uc[0] ** 2 + uc[1] ** 2 <= lambda;
    else {
        const l1ok = Math.abs(uc[0]) + Math.abs(uc[1]) <= lambda;
        const l2ok = uc[0] ** 2 + uc[1] ** 2 <= lambda;
        inside = alpha > 0.5 ? l1ok : l2ok; // rough check
    }
    if (inside)
        bestW = [uc[0], uc[1]];
    return bestW;
}
// ============================================================
// CANVAS 2 — DROPOUT / BATCH NORM
// ============================================================
function drawCanvas2() {
    ctx2.clearRect(0, 0, W2, H2);
    ctx2.fillStyle = C.bg;
    ctx2.fillRect(0, 0, W2, H2);
    if (vizType === 'dropout') {
        drawDropout();
    }
    else {
        drawBatchNorm();
    }
}
function drawDropout() {
    const title = `Dropout (rate = ${dropoutRate.toFixed(1)})`;
    ctx2.fillStyle = C.text;
    ctx2.font = 'bold 13px system-ui, sans-serif';
    ctx2.textAlign = 'center';
    ctx2.fillText(title, W2 / 2, 22);
    const layerLabels = ['Input', 'Hidden', 'Output'];
    const neuronR = Math.min(16, W2 / 22);
    const layerX = [W2 * 0.2, W2 * 0.5, W2 * 0.8];
    const startY = 50;
    const usableH = H2 - startY - 20;
    // Compute neuron positions
    const positions = [];
    for (let l = 0; l < NET_LAYERS.length; l++) {
        const n = NET_LAYERS[l];
        const spacing = Math.min(usableH / (n + 1), 50);
        const totalH = spacing * (n - 1);
        const baseY = startY + (usableH - totalH) / 2;
        const layer = [];
        for (let i = 0; i < n; i++) {
            layer.push({ x: layerX[l], y: baseY + i * spacing });
        }
        positions.push(layer);
    }
    // Draw connections
    for (let l = 0; l < positions.length - 1; l++) {
        for (let i = 0; i < positions[l].length; i++) {
            const fromDropped = l === 1 && droppedNeurons[i];
            for (let j = 0; j < positions[l + 1].length; j++) {
                const toDropped = l + 1 === 1 ? droppedNeurons[j] : (l === 0 && droppedNeurons[j] ? true : false);
                // For hidden layer: connections from dropped neurons or to dropped neurons are dimmed
                const isDimmed = (l === 1 && fromDropped) || (l === 0 && droppedNeurons[j]) || (l === 1 && l + 1 === 2 && fromDropped);
                ctx2.strokeStyle = isDimmed ? C.bg : C.border;
                ctx2.lineWidth = isDimmed ? 0.5 : 1;
                ctx2.beginPath();
                ctx2.moveTo(positions[l][i].x, positions[l][i].y);
                ctx2.lineTo(positions[l + 1][j].x, positions[l + 1][j].y);
                ctx2.stroke();
            }
        }
    }
    // Draw neurons
    for (let l = 0; l < positions.length; l++) {
        for (let i = 0; i < positions[l].length; i++) {
            const { x, y } = positions[l][i];
            const isDropped = l === 1 && droppedNeurons[i];
            ctx2.beginPath();
            ctx2.arc(x, y, neuronR, 0, Math.PI * 2);
            if (isDropped) {
                ctx2.fillStyle = C.bg;
                ctx2.fill();
                ctx2.strokeStyle = C.dropStroke;
                ctx2.lineWidth = 2;
                ctx2.stroke();
                // Draw X
                const d = neuronR * 0.55;
                ctx2.strokeStyle = C.dropStroke;
                ctx2.lineWidth = 2;
                ctx2.beginPath();
                ctx2.moveTo(x - d, y - d);
                ctx2.lineTo(x + d, y + d);
                ctx2.moveTo(x + d, y - d);
                ctx2.lineTo(x - d, y + d);
                ctx2.stroke();
            }
            else {
                ctx2.fillStyle = l === 0 ? C.accent : l === 1 ? C.activeNeuron : C.positive;
                ctx2.fill();
                ctx2.strokeStyle = C.neuronStroke;
                ctx2.lineWidth = 1.5;
                ctx2.stroke();
            }
        }
        // Layer labels
        ctx2.fillStyle = C.dim;
        ctx2.font = '11px monospace';
        ctx2.textAlign = 'center';
        ctx2.fillText(layerLabels[l], layerX[l], H2 - 8);
    }
    // Keep count
    const kept = droppedNeurons.filter(d => !d).length;
    ctx2.fillStyle = C.dim;
    ctx2.font = '11px monospace';
    ctx2.textAlign = 'center';
    ctx2.fillText(`Hidden: ${kept}/${NET_LAYERS[1]} kept`, W2 / 2, H2 - 24);
}
function drawBatchNorm() {
    ctx2.fillStyle = C.text;
    ctx2.font = 'bold 13px system-ui, sans-serif';
    ctx2.textAlign = 'center';
    ctx2.fillText('Batch Normalization', W2 / 2, 22);
    normalizeBatch();
    const padL = 40;
    const padR = 20;
    const barW = (W2 - padL - padR) / 2 - 30;
    const leftX = padL;
    const rightX = W2 / 2 + 20;
    const topY = 50;
    const barH = H2 - topY - 50;
    // Find range for input values
    const allVals = [...batchValues, ...batchNormed];
    const minV = Math.min(...allVals, -3);
    const maxV = Math.max(...allVals, 3);
    const range = maxV - minV;
    const valToY = (v) => topY + barH - ((v - minV) / range) * barH;
    // Draw zero lines
    ctx2.strokeStyle = C.border;
    ctx2.lineWidth = 1;
    ctx2.setLineDash([4, 4]);
    const zeroY = valToY(0);
    ctx2.beginPath();
    ctx2.moveTo(leftX, zeroY);
    ctx2.lineTo(leftX + barW, zeroY);
    ctx2.moveTo(rightX, zeroY);
    ctx2.lineTo(rightX + barW, zeroY);
    ctx2.stroke();
    ctx2.setLineDash([]);
    // Draw bars — input
    const bw = barW / batchValues.length - 2;
    ctx2.fillStyle = C.dim;
    ctx2.font = '11px monospace';
    ctx2.textAlign = 'center';
    ctx2.fillText('Input activations', leftX + barW / 2, topY - 6);
    for (let i = 0; i < batchValues.length; i++) {
        const v = batchValues[i];
        const x = leftX + i * (bw + 2);
        const y0 = valToY(0);
        const y1 = valToY(v);
        ctx2.fillStyle = v >= 0 ? C.batchIn + 'cc' : C.negative + 'cc';
        ctx2.fillRect(x, Math.min(y0, y1), bw, Math.abs(y1 - y0));
        // Value label
        ctx2.fillStyle = C.dim;
        ctx2.font = '9px monospace';
        ctx2.fillText(v.toFixed(1), x + bw / 2, v >= 0 ? y1 - 4 : y1 + 12);
    }
    // Arrow between sections
    ctx2.fillStyle = C.dim;
    ctx2.font = '20px monospace';
    ctx2.textAlign = 'center';
    ctx2.fillText('\u2192', W2 / 2, topY + barH / 2);
    ctx2.font = '9px monospace';
    ctx2.fillText('\u03b3\u00b7(x\u2013\u03bc)/\u03c3+\u03b2', W2 / 2, topY + barH / 2 + 16);
    // Draw bars — normalized
    ctx2.fillStyle = C.dim;
    ctx2.font = '11px monospace';
    ctx2.fillText('After BatchNorm', rightX + barW / 2, topY - 6);
    for (let i = 0; i < batchNormed.length; i++) {
        const v = batchNormed[i];
        const x = rightX + i * (bw + 2);
        const y0 = valToY(0);
        const y1 = valToY(v);
        ctx2.fillStyle = v >= 0 ? C.batchOut + 'cc' : C.negative + 'cc';
        ctx2.fillRect(x, Math.min(y0, y1), bw, Math.abs(y1 - y0));
        ctx2.fillStyle = C.dim;
        ctx2.font = '9px monospace';
        ctx2.fillText(v.toFixed(1), x + bw / 2, v >= 0 ? y1 - 4 : y1 + 12);
    }
    // Stats
    const mean = batchValues.reduce((a, b) => a + b, 0) / batchValues.length;
    const variance = batchValues.reduce((a, b) => a + (b - mean) ** 2, 0) / batchValues.length;
    ctx2.fillStyle = C.dim;
    ctx2.font = '10px monospace';
    ctx2.textAlign = 'left';
    ctx2.fillText(`\u03bc=${mean.toFixed(2)}  \u03c3\u00b2=${variance.toFixed(2)}  \u03b3=${bnGamma.toFixed(1)}  \u03b2=${bnBeta.toFixed(1)}`, leftX, H2 - 10);
}
// ============================================================
// ANIMATION LOOP
// ============================================================
let frameCount = 0;
let dropTimer = 0;
function loop(t) {
    frameCount++;
    if (activeCategory === 'penalty') {
        drawCanvas1();
    } else {
        // Auto-resample dropout every 90 frames for animation effect
        if (vizType === 'dropout') {
            dropTimer++;
            if (dropTimer >= 90) {
                dropTimer = 0;
                resampleDropout();
            }
        }
        drawCanvas2();
    }
    requestAnimationFrame(loop);
}
// ============================================================
// BOOT
// ============================================================
document.addEventListener('DOMContentLoaded', init);
export {};
