const COLORS = {
    target: '#facc15',
    weather: '#38bdf8',
    onZone: 'rgba(52, 211, 153, 0.06)',
    threshold: 'rgba(136, 136, 160, 0.4)',
    arcColor: 'rgba(250, 204, 21, 0.5)',
    arcText: '#facc15',
    grid: '#16161f',
    axis: '#2a2a3e',
    axisLabel: '#2a2a40',
    positive: '#34d399',
    negative: '#f43f5e',
};
const THRESHOLD_ANGLE = Math.PI / 4;
const THRESHOLD_COS = Math.cos(THRESHOLD_ANGLE); // ≈ 0.7071
let canvas;
let ctx;
const target = { x: 6, y: 0 };
let weather = { x: 4, y: 3 };
let dragging = false;
let SCALE = 40;
let W = 0, H = 0;
let CX = 0, CY = 0;
function toCanvas(v) {
    return { x: CX + v.x * SCALE, y: CY - v.y * SCALE };
}
function toWorld(px, py) {
    return {
        x: Math.round((px - CX) / SCALE),
        y: Math.round(-(py - CY) / SCALE),
    };
}
function dot(a, b) { return a.x * b.x + a.y * b.y; }
function mag(v) { return Math.hypot(v.x, v.y); }
function resize() {
    const container = canvas.parentElement;
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
function drawArrow(x1, y1, x2, y2, color, width = 2.5, label = '') {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len < 1)
        return;
    const ux = dx / len, uy = dy / len;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - ux * 10 + uy * 5, y2 - uy * 10 - ux * 5);
    ctx.lineTo(x2 - ux * 10 - uy * 5, y2 - uy * 10 + ux * 5);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    if (label) {
        ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
        ctx.fillStyle = color;
        ctx.fillText(label, x2 + ux * 14 + 4, y2 + uy * 14 + 4);
    }
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
    // Decision zone wedge (symmetric about x-axis)
    const zr = Math.max(W, H);
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.arc(CX, CY, zr, -THRESHOLD_ANGLE, THRESHOLD_ANGLE);
    ctx.closePath();
    ctx.fillStyle = COLORS.onZone;
    ctx.fill();
    // Threshold lines (dashed)
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = COLORS.threshold;
    ctx.lineWidth = 1.5;
    for (const sign of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.lineTo(CX + Math.cos(sign * THRESHOLD_ANGLE) * zr, CY + Math.sin(sign * THRESHOLD_ANGLE) * zr);
        ctx.stroke();
    }
    ctx.setLineDash([]);
    // Zone labels in first quadrant
    ctx.font = '11px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(52, 211, 153, 0.35)';
    ctx.fillText('ON ZONE', CX + 130, CY - 25);
    ctx.fillStyle = 'rgba(244, 63, 94, 0.25)';
    ctx.fillText('OFF ZONE', CX + 70, CY - 130);
    // Axis labels
    ctx.font = '12px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = '#4a4a60';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('Sunniness \u2192', W - 10, CY + 8);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('\u2191 Raininess', CX + 8, 20);
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
    const pTarget = toCanvas(target);
    const pWeather = toCanvas(weather);
    const mW = mag(weather), mT = mag(target);
    const dpVal = dot(weather, target);
    const cosSim = mW > 0.001 && mT > 0.001 ? dpVal / (mW * mT) : 0;
    // Angle arc
    if (mW > 0.1) {
        const angW = Math.atan2(-weather.y, weather.x);
        const angT = 0;
        const start = Math.min(angW, angT);
        const end = Math.max(angW, angT);
        ctx.beginPath();
        ctx.arc(CX, CY, 28, start, end);
        ctx.strokeStyle = COLORS.arcColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        const midAng = (angW + angT) / 2;
        ctx.font = '12px "Segoe UI", system-ui, sans-serif';
        ctx.fillStyle = COLORS.arcText;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u03B8', CX + Math.cos(midAng) * 42, CY + Math.sin(midAng) * 42);
    }
    // Target vector (fixed, yellow)
    drawArrow(CX, CY, pTarget.x, pTarget.y, COLORS.target, 2.5, 'Target');
    // Weather vector (draggable, blue)
    drawArrow(CX, CY, pWeather.x, pWeather.y, COLORS.weather, 3, 'Weather');
    // Drag handle on weather
    ctx.beginPath();
    ctx.arc(pWeather.x, pWeather.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.weather;
    ctx.fill();
    ctx.strokeStyle = '#0a0a0f';
    ctx.lineWidth = 2;
    ctx.stroke();
    updateUI(cosSim, mW, mT, dpVal);
}
// ============================================================
// UI UPDATE
// ============================================================
function updateUI(cosSim, mW, mT, dpVal) {
    const thetaDeg = Math.acos(Math.max(-1, Math.min(1, cosSim))) * 180 / Math.PI;
    const isOn = cosSim >= THRESHOLD_COS;
    const resultColor = isOn ? COLORS.positive : COLORS.negative;
    setText('wx', String(weather.x));
    setText('wy', String(weather.y));
    // Step-by-step cosine similarity
    const work = document.getElementById('work');
    const denom = mW * mT;
    work.innerHTML =
        '<div class="work-step dim">' +
            'cos \u03B8 = <span class="dot-w">W</span> \u00B7 <span class="dot-t">T</span> / (<span class="dot-w">|W|</span> \u00D7 <span class="dot-t">|T|</span>)' +
            '</div>' +
            '<div class="work-step">' +
            '<span class="dot-w">' + weather.x + '</span>\u00D7<span class="dot-t">' + target.x + '</span> + ' +
            '<span class="dot-w">' + weather.y + '</span>\u00D7<span class="dot-t">' + target.y + '</span>' +
            ' = ' + dpVal +
            '</div>' +
            '<div class="work-step dim">' +
            '<span class="dot-w">|W|</span> \u00D7 <span class="dot-t">|T|</span> = ' +
            mW.toFixed(2) + ' \u00D7 ' + mT.toFixed(2) + ' = ' + denom.toFixed(2) +
            '</div>' +
            '<div class="work-result" style="color:' + resultColor + '">' +
            'cos \u03B8 = ' + cosSim.toFixed(4) +
            '</div>';
    // Threshold comparison
    const thresh = document.getElementById('threshold-compare');
    thresh.innerHTML =
        '<span style="color:' + resultColor + ';font-weight:600">' + cosSim.toFixed(4) + '</span>' +
            ' ' + (isOn ? '\u2265' : '<') + ' ' +
            '<span style="color:#8888a0">' + THRESHOLD_COS.toFixed(4) + '</span>' +
            '<span style="color:#666880"> (45\u00B0 threshold)</span>';
    // Sprinkler status
    const status = document.getElementById('sprinkler-status');
    if (isOn) {
        status.style.background = '#0f1a14';
        status.style.borderColor = COLORS.positive;
        status.innerHTML =
            '<div class="status-label" style="color:' + COLORS.positive + '">SPRINKLER ON</div>' +
                '<div class="status-detail">Weather direction aligns with "sunny & dry" \u2014 water the lawn.</div>';
    }
    else {
        status.style.background = '#1a0f11';
        status.style.borderColor = COLORS.negative;
        status.innerHTML =
            '<div class="status-label" style="color:' + COLORS.negative + '">SPRINKLER OFF</div>' +
                '<div class="status-detail">Weather direction points away from ideal conditions \u2014 save water.</div>';
    }
    // Angle
    setText('angleVal', thetaDeg.toFixed(1) + '\u00B0');
    document.getElementById('angleBarFill').style.width = (thetaDeg / 180 * 100) + '%';
    // Insight box
    const ib = document.getElementById('insightBox');
    let msg, bg, border;
    if (mW < 0.01) {
        msg = 'Zero vector \u2014 no weather reading. Cosine similarity is undefined at the origin.';
        bg = '#1a1a12';
        border = '#facc15';
    }
    else if (Math.abs(thetaDeg) < 3) {
        msg = 'Perfect alignment \u2014 the weather points exactly toward "sunny & dry." Try making the vector longer or shorter: cos \u03B8 stays the same. Cosine similarity ignores magnitude entirely.';
        bg = '#0f1a14';
        border = COLORS.positive;
    }
    else if (Math.abs(thetaDeg - 45) < 3) {
        msg = 'Right at the 45\u00B0 decision boundary. The weather is equally sunny and rainy. A tiny nudge either way flips the sprinkler \u2014 this is exactly how AI classification boundaries work.';
        bg = '#1a1a12';
        border = '#facc15';
    }
    else if (isOn) {
        msg = 'The weather vector is within 45\u00B0 of the target direction. Cosine similarity measures direction, not intensity \u2014 a gentle sunny day and a blazing one get the same score if the sun-to-rain ratio matches.';
        bg = '#0f1a14';
        border = COLORS.positive;
    }
    else if (Math.abs(thetaDeg - 90) < 5) {
        msg = 'Perpendicular \u2014 cos \u03B8 = 0. The weather is orthogonal to the target: no directional relationship at all.';
        bg = '#1a1a12';
        border = '#facc15';
    }
    else if (cosSim < 0) {
        msg = 'Negative cosine similarity \u2014 the weather points opposite to "sunny & dry." In AI terms, this is the strongest possible disagreement between two directions.';
        bg = '#1a0f11';
        border = COLORS.negative;
    }
    else {
        msg = 'The weather vector points too far from "sunny & dry." The cosine similarity dropped below the threshold, so the AI keeps the sprinkler off. Drag closer to the x-axis to turn it on.';
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
    return {
        x: (e.clientX - rect.left) * W / rect.width,
        y: (e.clientY - rect.top) * H / rect.height,
    };
}
function hitTest(px, py) {
    const pW = toCanvas(weather);
    return Math.hypot(px - pW.x, py - pW.y) < 20;
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
    weather = {
        x: Math.max(-7, Math.min(7, w.x)),
        y: Math.max(-7, Math.min(7, w.y)),
    };
    canvas.style.cursor = 'grabbing';
    draw();
}
function onPointerUp() {
    dragging = false;
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
