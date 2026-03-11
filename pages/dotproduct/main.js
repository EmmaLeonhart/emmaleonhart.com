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
let canvas;
let ctx;
let vecA = { x: 4, y: 2 };
let vecB = { x: 2, y: 3 };
let dragging = null;
const SCALE = 40;
let W = 0, H = 0;
let CX = 0, CY = 0;
function toCanvas(v) {
    return { x: CX + v.x * SCALE, y: CY - v.y * SCALE };
}
function toWorld(px, py) {
    return {
        x: Math.round((px - CX) / SCALE * 2) / 2,
        y: Math.round(-(py - CY) / SCALE * 2) / 2,
    };
}
function dot(a, b) { return a.x * b.x + a.y * b.y; }
function mag(v) { return Math.hypot(v.x, v.y); }
function resize() {
    const wrap = canvas.parentElement;
    const size = Math.min(wrap.clientWidth, 560);
    const dpr = window.devicePixelRatio || 1;
    W = size;
    H = size;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    CX = W / 2;
    CY = H / 2;
    draw();
}
// ============================================================
// DRAWING HELPERS
// ============================================================
function drawArrow(x1, y1, x2, y2, color, width = 2.5, label = '') {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len < 1)
        return;
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
function drawDashed(x1, y1, x2, y2, color) {
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
function draw() {
    ctx.clearRect(0, 0, W, H);
    // Grid
    ctx.lineWidth = 1;
    for (let gx = CX % SCALE; gx <= W; gx += SCALE) {
        ctx.strokeStyle = Math.abs(gx - CX) < 1 ? COLORS.axis : COLORS.grid;
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, H);
        ctx.stroke();
    }
    for (let gy = CY % SCALE; gy <= H; gy += SCALE) {
        ctx.strokeStyle = Math.abs(gy - CY) < 1 ? COLORS.axis : COLORS.grid;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
        ctx.stroke();
    }
    // Axis numbers
    ctx.font = '10px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = COLORS.axisLabel;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = -7; i <= 7; i++) {
        if (i === 0)
            continue;
        const px = CX + i * SCALE;
        if (px > 5 && px < W - 5)
            ctx.fillText(String(i), px, CY + 4);
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = -7; i <= 7; i++) {
        if (i === 0)
            continue;
        const py = CY - i * SCALE;
        if (py > 5 && py < H - 5)
            ctx.fillText(String(i), CX - 5, py);
    }
    const pA = toCanvas(vecA);
    const pB = toCanvas(vecB);
    const mA = mag(vecA), mB = mag(vecB);
    const dpVal = dot(vecA, vecB);
    // --- Projection of A onto B ---
    if (mB > 0.001) {
        const bUnit = { x: vecB.x / mB, y: vecB.y / mB };
        const projLen = dpVal / mB;
        const projWorld = { x: bUnit.x * projLen, y: bUnit.y * projLen };
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
    for (const [p, col] of [[pA, COLORS.vecA], [pB, COLORS.vecB]]) {
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
function updateUI(dpVal, mA, mB) {
    const cosT = mA > 0 && mB > 0 ? dpVal / (mA * mB) : 1;
    const thetaDeg = Math.acos(Math.max(-1, Math.min(1, cosT))) * 180 / Math.PI;
    setText('ax', vecA.x.toFixed(1));
    setText('ay', vecA.y.toFixed(1));
    setText('bx', vecB.x.toFixed(1));
    setText('by', vecB.y.toFixed(1));
    setText('am', mA.toFixed(2));
    setText('bm', mB.toFixed(2));
    const resultEl = document.getElementById('resultBig');
    resultEl.textContent = dpVal.toFixed(2);
    resultEl.style.color = dpVal > 0.05 ? COLORS.positive : dpVal < -0.05 ? COLORS.negative : COLORS.zero;
    setText('fAlg', `(${vecA.x.toFixed(1)})(${vecB.x.toFixed(1)}) + (${vecA.y.toFixed(1)})(${vecB.y.toFixed(1)}) = ${dpVal.toFixed(2)}`);
    setText('fGeo', `${mA.toFixed(2)} \u00D7 ${mB.toFixed(2)} \u00D7 cos(${thetaDeg.toFixed(1)}\u00B0) = ${dpVal.toFixed(2)}`);
    setText('angleVal', thetaDeg.toFixed(1) + '\u00B0');
    document.getElementById('angleBarFill').style.width = (thetaDeg / 180 * 100) + '%';
    // Insight box
    const ib = document.getElementById('insightBox');
    let msg, bg, border;
    if (Math.abs(thetaDeg - 90) < 5) {
        msg = '\u22A5 Nearly perpendicular \u2014 dot product \u2248 0. A casts no shadow onto B.';
        bg = '#1a1a12';
        border = COLORS.zero;
    }
    else if (dpVal > 0) {
        msg = '\u2713 Positive: A\'s shadow falls along B (same side). \u03B8 < 90\u00B0.';
        bg = '#0f1a14';
        border = COLORS.positive;
    }
    else {
        msg = '\u2717 Negative: A\'s shadow falls opposite to B. \u03B8 > 90\u00B0.';
        bg = '#1a0f11';
        border = COLORS.negative;
    }
    ib.style.background = bg;
    ib.style.borderLeft = '3px solid ' + border;
    ib.textContent = msg;
}
function setText(id, text) {
    document.getElementById(id).textContent = text;
}
// ============================================================
// INTERACTION
// ============================================================
function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    return { x: cx * W / rect.width, y: cy * H / rect.height };
}
function hitTest(px, py) {
    const pA = toCanvas(vecA);
    const pB = toCanvas(vecB);
    const dA = Math.hypot(px - pA.x, py - pA.y);
    const dB = Math.hypot(px - pB.x, py - pB.y);
    if (dA < 20 && dA <= dB)
        return 'A';
    if (dB < 20)
        return 'B';
    return null;
}
function onPointerDown(e) {
    e.preventDefault();
    const p = getPointerPos('touches' in e ? e.touches[0] : e);
    dragging = hitTest(p.x, p.y);
}
function onPointerMove(e) {
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
    const clamped = {
        x: Math.max(-7, Math.min(7, w.x)),
        y: Math.max(-7, Math.min(7, w.y)),
    };
    if (dragging === 'A')
        vecA = clamped;
    else
        vecB = clamped;
    canvas.style.cursor = 'grabbing';
    draw();
}
function onPointerUp() {
    dragging = null;
    canvas.style.cursor = 'crosshair';
}
// ============================================================
// INIT
// ============================================================
function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
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
export {};
