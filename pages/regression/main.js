let mode = 'linear';
let points = [];
// Fitted parameters
let w = 0;
let b = 0;
let loss = 0;
// Canvas
let canvas;
let ctx;
let W = 0, H = 0;
// Data coordinate range
const X_MIN = -5;
const X_MAX = 5;
const Y_MIN = -0.5;
const Y_MAX = 1.5;
const Y_MIN_LIN = -1.5;
const Y_MAX_LIN = 2.5;
const COLORS = {
    bg: '#0a0a0f',
    panel: '#12121a',
    border: '#1e1e2a',
    text: '#d0d0dc',
    dim: '#666880',
    positive: '#34d399',
    negative: '#f43f5e',
    accent: '#7c8cf8',
    grid: '#1a1a28',
    axis: '#2a2a3e',
    curve: '#7c8cf8',
    decision: '#f59e0b',
};
const POINT_R = 6;
function $(id) { return document.getElementById(id); }
// ============================================================
// COORDINATE TRANSFORMS
// ============================================================
function yMin() { return mode === 'logistic' ? Y_MIN : Y_MIN_LIN; }
function yMax() { return mode === 'logistic' ? Y_MAX : Y_MAX_LIN; }
function dataToCanvasX(x) {
    return ((x - X_MIN) / (X_MAX - X_MIN)) * W;
}
function dataToCanvasY(y) {
    return H - ((y - yMin()) / (yMax() - yMin())) * H;
}
function canvasToDataX(cx) {
    return X_MIN + (cx / W) * (X_MAX - X_MIN);
}
function canvasToDataY(cy) {
    return yMin() + ((H - cy) / H) * (yMax() - yMin());
}
// ============================================================
// SIGMOID
// ============================================================
function sigmoid(z) {
    if (z > 500)
        return 1;
    if (z < -500)
        return 0;
    return 1 / (1 + Math.exp(-z));
}
// ============================================================
// FITTING — LINEAR REGRESSION (closed-form least squares)
// ============================================================
function fitLinear() {
    const n = points.length;
    if (n < 2) {
        w = 0;
        b = n === 1 ? points[0].y : 0;
        loss = 0;
        return;
    }
    // y = w*x + b via normal equations
    let sumX = 0, sumY = 0, sumXX = 0, sumXY = 0;
    for (const p of points) {
        sumX += p.x;
        sumY += p.y;
        sumXX += p.x * p.x;
        sumXY += p.x * p.y;
    }
    const denom = n * sumXX - sumX * sumX;
    if (Math.abs(denom) < 1e-12) {
        w = 0;
        b = sumY / n;
    }
    else {
        w = (n * sumXY - sumX * sumY) / denom;
        b = (sumY - w * sumX) / n;
    }
    // MSE loss
    loss = 0;
    for (const p of points) {
        const pred = w * p.x + b;
        loss += (pred - p.y) ** 2;
    }
    loss /= n;
}
// ============================================================
// FITTING — LOGISTIC REGRESSION (gradient descent on cross-entropy)
// ============================================================
function fitLogistic() {
    const n = points.length;
    if (n < 1) {
        w = 0;
        b = 0;
        loss = 0;
        return;
    }
    // Initialize from current values or small random
    let wCur = 0.01;
    let bCur = 0;
    const lr = 0.5;
    const steps = 200;
    const eps = 1e-7;
    for (let step = 0; step < steps; step++) {
        let dw = 0;
        let db = 0;
        for (const p of points) {
            const pred = sigmoid(wCur * p.x + bCur);
            const err = pred - p.y;
            dw += err * p.x;
            db += err;
        }
        dw /= n;
        db /= n;
        // L2 regularization to prevent explosion
        dw += 0.001 * wCur;
        wCur -= lr * dw;
        bCur -= lr * db;
        // Clamp to prevent overflow
        wCur = Math.max(-20, Math.min(20, wCur));
        bCur = Math.max(-20, Math.min(20, bCur));
    }
    w = wCur;
    b = bCur;
    // Cross-entropy loss
    loss = 0;
    for (const p of points) {
        const pred = sigmoid(w * p.x + b);
        const pClamped = Math.max(eps, Math.min(1 - eps, pred));
        loss += -(p.y * Math.log(pClamped) + (1 - p.y) * Math.log(1 - pClamped));
    }
    loss /= n;
}
// ============================================================
// REFIT
// ============================================================
function refit() {
    if (mode === 'linear') {
        fitLinear();
    }
    else {
        fitLogistic();
    }
}
// ============================================================
// DRAWING
// ============================================================
function drawGrid() {
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    // Vertical grid lines
    for (let x = Math.ceil(X_MIN); x <= Math.floor(X_MAX); x++) {
        const cx = dataToCanvasX(x);
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, H);
        ctx.stroke();
    }
    // Horizontal grid lines
    const yBottom = yMin();
    const yTop = yMax();
    for (let y = Math.ceil(yBottom); y <= Math.floor(yTop); y++) {
        const cy = dataToCanvasY(y);
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(W, cy);
        ctx.stroke();
    }
    // Axes
    ctx.strokeStyle = COLORS.axis;
    ctx.lineWidth = 1.5;
    // X axis (y=0)
    const zeroY = dataToCanvasY(0);
    ctx.beginPath();
    ctx.moveTo(0, zeroY);
    ctx.lineTo(W, zeroY);
    ctx.stroke();
    // Y axis (x=0)
    const zeroX = dataToCanvasX(0);
    ctx.beginPath();
    ctx.moveTo(zeroX, 0);
    ctx.lineTo(zeroX, H);
    ctx.stroke();
    // Axis labels
    ctx.font = '10px "Cascadia Code", "Fira Code", monospace';
    ctx.fillStyle = COLORS.dim;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let x = Math.ceil(X_MIN); x <= Math.floor(X_MAX); x++) {
        if (x === 0)
            continue;
        ctx.fillText(String(x), dataToCanvasX(x), zeroY + 4);
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = Math.ceil(yBottom); y <= Math.floor(yTop); y++) {
        if (y === 0)
            continue;
        ctx.fillText(String(y), zeroX - 6, dataToCanvasY(y));
    }
    // Draw y=0 and y=1 reference lines for logistic mode
    if (mode === 'logistic') {
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = COLORS.dim;
        ctx.lineWidth = 0.8;
        const y1 = dataToCanvasY(1);
        ctx.beginPath();
        ctx.moveTo(0, y1);
        ctx.lineTo(W, y1);
        ctx.stroke();
        ctx.setLineDash([]);
        // Labels
        ctx.font = '10px "Cascadia Code", "Fira Code", monospace';
        ctx.fillStyle = COLORS.dim;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText('P=1', 4, y1 - 2);
        ctx.fillText('P=0', 4, zeroY - 2);
    }
}
function drawFittedCurve() {
    if (points.length < 1)
        return;
    if (mode === 'linear') {
        // Draw regression line across full x range
        ctx.beginPath();
        const x0 = X_MIN;
        const x1 = X_MAX;
        ctx.moveTo(dataToCanvasX(x0), dataToCanvasY(w * x0 + b));
        ctx.lineTo(dataToCanvasX(x1), dataToCanvasY(w * x1 + b));
        ctx.strokeStyle = COLORS.curve;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        // Draw residual lines (from each point to the line)
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1;
        for (const p of points) {
            const pred = w * p.x + b;
            ctx.beginPath();
            ctx.moveTo(dataToCanvasX(p.x), dataToCanvasY(p.y));
            ctx.lineTo(dataToCanvasX(p.x), dataToCanvasY(pred));
            ctx.strokeStyle = p.y >= 0.5 ? COLORS.positive + '60' : COLORS.negative + '60';
            ctx.stroke();
        }
        ctx.setLineDash([]);
    }
    else {
        // Draw sigmoid curve
        ctx.beginPath();
        const steps = 200;
        for (let i = 0; i <= steps; i++) {
            const x = X_MIN + (X_MAX - X_MIN) * (i / steps);
            const y = sigmoid(w * x + b);
            const cx = dataToCanvasX(x);
            const cy = dataToCanvasY(y);
            if (i === 0)
                ctx.moveTo(cx, cy);
            else
                ctx.lineTo(cx, cy);
        }
        ctx.strokeStyle = COLORS.curve;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        // Draw decision boundary (where P=0.5, i.e., w*x + b = 0)
        if (Math.abs(w) > 1e-6) {
            const decisionX = -b / w;
            if (decisionX >= X_MIN && decisionX <= X_MAX) {
                const cx = dataToCanvasX(decisionX);
                ctx.setLineDash([6, 4]);
                ctx.beginPath();
                ctx.moveTo(cx, 0);
                ctx.lineTo(cx, H);
                ctx.strokeStyle = COLORS.decision;
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.setLineDash([]);
                // Label
                ctx.font = 'bold 11px "Cascadia Code", "Fira Code", monospace';
                ctx.fillStyle = COLORS.decision;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(`P=0.5 at x=${decisionX.toFixed(2)}`, cx, 6);
            }
        }
    }
}
function drawPoints() {
    for (const p of points) {
        const cx = dataToCanvasX(p.x);
        const cy = dataToCanvasY(p.y);
        const color = p.y >= 0.5 ? COLORS.positive : COLORS.negative;
        // Glow
        ctx.beginPath();
        ctx.arc(cx, cy, POINT_R + 3, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(cx, cy, POINT_R - 2, cx, cy, POINT_R + 6);
        grad.addColorStop(0, color + '40');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fill();
        // Point circle
        ctx.beginPath();
        ctx.arc(cx, cy, POINT_R, 0, Math.PI * 2);
        ctx.fillStyle = color + 'cc';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
}
function draw() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    drawFittedCurve();
    drawPoints();
    // Empty state message
    if (points.length === 0) {
        ctx.font = '14px "Segoe UI", system-ui, sans-serif';
        ctx.fillStyle = COLORS.dim;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Click to add data points (left = class 0, right = class 1)', W / 2, H / 2);
    }
}
// ============================================================
// UI UPDATES
// ============================================================
function updateParamDisplay() {
    const lossLabel = mode === 'linear' ? 'MSE' : 'Cross-Entropy';
    const formula = mode === 'linear' ? 'y = wx + b' : 'P(y=1) = \u03C3(wx + b)';
    let html = `<span style="color:${COLORS.accent}">${formula}</span><br>`;
    html += `w = <span style="color:${w >= 0 ? COLORS.positive : COLORS.negative}">${w.toFixed(4)}</span> &nbsp; `;
    html += `b = <span style="color:${b >= 0 ? COLORS.positive : COLORS.negative}">${b.toFixed(4)}</span><br>`;
    html += `${lossLabel} = <span style="color:${COLORS.text}">${loss.toFixed(4)}</span>`;
    if (mode === 'logistic' && Math.abs(w) > 1e-6) {
        const boundary = -b / w;
        html += ` &nbsp; boundary = <span style="color:${COLORS.decision}">${boundary.toFixed(2)}</span>`;
    }
    $('param-display').innerHTML = html;
}
function updateMathPanel() {
    const panel = $('math-panel');
    let html = '';
    if (mode === 'linear') {
        html += `<div class="formula-block">`;
        html += `<div class="formula-title">Linear Regression</div>`;
        html += `<div class="formula">y&#x0302; = wx + b</div>`;
        html += `<div class="formula-detail">`;
        html += `Closed-form solution (Normal Equation):<br>`;
        html += `w = (n\u03A3x\u1D62y\u1D62 \u2212 \u03A3x\u1D62\u03A3y\u1D62) / (n\u03A3x\u1D62\u00B2 \u2212 (\u03A3x\u1D62)\u00B2)<br>`;
        html += `b = (\u03A3y\u1D62 \u2212 w\u03A3x\u1D62) / n`;
        html += `</div>`;
        html += `<div class="formula-detail" style="margin-top:8px">`;
        html += `<span style="color:${COLORS.dim}">Loss:</span> MSE = (1/n) \u03A3(y\u0302\u1D62 \u2212 y\u1D62)\u00B2`;
        html += `</div>`;
        html += `</div>`;
    }
    else {
        html += `<div class="formula-block">`;
        html += `<div class="formula-title">Logistic Regression</div>`;
        html += `<div class="formula">P(y=1|x) = \u03C3(wx + b) = 1 / (1 + e<sup>\u2212(wx+b)</sup>)</div>`;
        html += `<div class="formula-detail">`;
        html += `Fitted via gradient descent (200 steps):<br>`;
        html += `\u2207w = (1/n) \u03A3(\u03C3(wx\u1D62+b) \u2212 y\u1D62) \u00B7 x\u1D62<br>`;
        html += `\u2207b = (1/n) \u03A3(\u03C3(wx\u1D62+b) \u2212 y\u1D62)`;
        html += `</div>`;
        html += `<div class="formula-detail" style="margin-top:8px">`;
        html += `<span style="color:${COLORS.dim}">Loss:</span> CE = \u2212(1/n) \u03A3[y\u1D62 log(p\u1D62) + (1\u2212y\u1D62) log(1\u2212p\u1D62)]`;
        html += `</div>`;
        html += `<div class="formula-detail" style="margin-top:8px">`;
        html += `<span style="color:${COLORS.decision}">Decision boundary</span> at P=0.5 \u2192 wx + b = 0 \u2192 x = \u2212b/w`;
        html += `</div>`;
        html += `</div>`;
    }
    panel.innerHTML = html;
}
function updateInsightBox() {
    const box = $('insight-box');
    let text = '';
    if (points.length === 0) {
        text = 'Add data points by clicking on the canvas. Points on the left side (x < 0) are class 0 (red), and points on the right side (x > 0) are class 1 (green). You can also use "Random data" to generate a separable dataset.';
    }
    else if (mode === 'linear') {
        if (points.length < 3) {
            text = 'Linear regression fits a straight line y = wx + b by minimizing the sum of squared residuals (dashed lines). Add more points to see the fit improve.';
        }
        else {
            const hasOutOfRange = points.some(p => {
                const pred = w * p.x + b;
                return pred < 0 || pred > 1;
            });
            if (hasOutOfRange) {
                text = 'Notice that linear regression predicts values outside [0, 1] \u2014 this is a fundamental problem when using it for classification. The model has no concept of "probability" and can produce nonsensical predictions like P = \u22120.3 or P = 1.4. This is exactly why logistic regression was invented.';
            }
            else {
                text = 'Linear regression minimizes the mean squared error (MSE) between predictions and labels. The dashed lines show residuals \u2014 the errors being squared and summed. While simple, it treats class labels as continuous values, which can cause problems at the extremes.';
            }
        }
    }
    else {
        if (points.length < 3) {
            text = 'Logistic regression wraps the linear function in a sigmoid \u03C3(z) = 1/(1+e\u207B\u1DBB), squeezing all outputs into [0, 1]. This makes the output interpretable as a probability. Add more points to see the S-curve take shape.';
        }
        else {
            const allSameClass = points.every(p => p.y === points[0].y);
            if (allSameClass) {
                text = 'All points belong to the same class \u2014 the sigmoid curve will try to push all predictions toward that class by shifting its center far away. Try adding points from the other class to see a meaningful decision boundary.';
            }
            else if (Math.abs(w) > 1e-6) {
                const boundary = -b / w;
                text = `The sigmoid maps every x to a probability P(y=1). The decision boundary at x = ${boundary.toFixed(2)} is where P = 0.5 \u2014 points to the ${w > 0 ? 'right' : 'left'} are classified as class 1. Unlike linear regression, predictions are always bounded between 0 and 1.`;
            }
            else {
                text = 'The weight w is near zero, so the model is essentially predicting a constant probability for all x values. This happens when the data is not linearly separable along the x-axis, or when there are too few points.';
            }
        }
    }
    box.textContent = text;
}
function update() {
    refit();
    draw();
    updateParamDisplay();
    updateMathPanel();
    updateInsightBox();
}
// ============================================================
// RANDOM DATA GENERATION
// ============================================================
function generateRandomData() {
    points = [];
    const n = 20;
    // Class 0: centered around x = -2
    for (let i = 0; i < n / 2; i++) {
        const x = -2 + (Math.random() - 0.5) * 3;
        points.push({ x, y: 0 });
    }
    // Class 1: centered around x = +2
    for (let i = 0; i < n / 2; i++) {
        const x = 2 + (Math.random() - 0.5) * 3;
        points.push({ x, y: 1 });
    }
}
// ============================================================
// CANVAS CLICK HANDLER
// ============================================================
function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const dataX = canvasToDataX(mx);
    const dataY = canvasToDataY(my);
    // Assign class based on which half of y-axis the click is in
    // Above y=0.5 line -> class 1, below -> class 0
    const label = dataY >= 0.5 ? 1 : 0;
    points.push({ x: dataX, y: label });
    update();
}
// ============================================================
// CANVAS SIZING
// ============================================================
function resize() {
    const container = canvas.parentElement;
    const w = container.clientWidth;
    const h = Math.min(400, Math.max(280, w * 0.5));
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
function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    // Mode toggle buttons
    document.querySelectorAll('.ctrl-btn[data-mode]').forEach(btn => {
        btn.addEventListener('click', () => {
            mode = btn.dataset.mode;
            document.querySelectorAll('.ctrl-btn[data-mode]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            update();
        });
    });
    // Clear button
    $('btn-clear').addEventListener('click', () => {
        points = [];
        w = 0;
        b = 0;
        loss = 0;
        update();
    });
    // Random button
    $('btn-random').addEventListener('click', () => {
        generateRandomData();
        update();
    });
    // Canvas click
    canvas.addEventListener('click', handleCanvasClick);
    // Right-click to remove nearest point
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (points.length === 0)
            return;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const dataX = canvasToDataX(mx);
        const dataY = canvasToDataY(my);
        // Find nearest point
        let minDist = Infinity;
        let minIdx = -1;
        for (let i = 0; i < points.length; i++) {
            const dx = points[i].x - dataX;
            const dy = points[i].y - dataY;
            const dist = dx * dx + dy * dy;
            if (dist < minDist) {
                minDist = dist;
                minIdx = i;
            }
        }
        if (minIdx >= 0) {
            points.splice(minIdx, 1);
            update();
        }
    });
    window.addEventListener('resize', () => {
        resize();
        update();
    });
    resize();
    update();
}
document.addEventListener('DOMContentLoaded', init);
export {};
