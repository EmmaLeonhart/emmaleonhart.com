const COLORS = {
    target: '#facc15',
    weather: '#38bdf8',
    onZone: 'rgba(52, 211, 153, 0.06)',
    midZone: 'rgba(250, 204, 21, 0.04)',
    threshold: 'rgba(136, 136, 160, 0.4)',
    arcColor: 'rgba(250, 204, 21, 0.5)',
    arcText: '#facc15',
    grid: '#16161f',
    axis: '#2a2a3e',
    axisLabel: '#2a2a40',
    positive: '#34d399',
    warning: '#facc15',
    negative: '#f43f5e',
};
// Two thresholds for continuous behavior
const HIGH_ANGLE = Math.PI / 6; // 30° — full blast
const LOW_ANGLE = Math.PI * 5 / 12; // 75° — completely off
const HIGH_COS = Math.cos(HIGH_ANGLE);
const LOW_COS = Math.cos(LOW_ANGLE);
let canvas;
let ctx;
const target = { x: 6, y: 0 };
let weather = { x: 0, y: 5 };
let dragging = false;
let SCALE = 40;
let W = 0, H = 0;
let OX = 0, OY = 0;
const PAD_LEFT = 30;
const PAD_BOTTOM = 24;
const PAD_TOP = 20;
const PAD_RIGHT = 20;
const MAX_VAL = 7;
let droplets = [];
let lastDropletTime = 0;
function toCanvas(v) {
    return { x: OX + v.x * SCALE, y: OY - v.y * SCALE };
}
function toWorld(px, py) {
    return {
        x: Math.round((px - OX) / SCALE),
        y: Math.round(-(py - OY) / SCALE),
    };
}
function dot(a, b) { return a.x * b.x + a.y * b.y; }
function mag(v) { return Math.hypot(v.x, v.y); }
function sprinklerIntensity(cosSim) {
    // Continuous: 0 below LOW_COS, 1 above HIGH_COS, linear between
    if (cosSim >= HIGH_COS)
        return 1.0;
    if (cosSim <= LOW_COS)
        return 0.0;
    return (cosSim - LOW_COS) / (HIGH_COS - LOW_COS);
}
function resize() {
    const container = canvas.parentElement;
    const w = container.clientWidth;
    SCALE = Math.max(25, Math.min(50, (w - PAD_LEFT - PAD_RIGHT) / MAX_VAL));
    const h = PAD_TOP + MAX_VAL * SCALE + PAD_BOTTOM;
    const dpr = window.devicePixelRatio || 1;
    W = w;
    H = h;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    OX = PAD_LEFT;
    OY = H - PAD_BOTTOM;
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
// WATER DROPLET ANIMATION
// ============================================================
function updateDroplets(intensity) {
    const now = performance.now();
    // Spawn new droplets based on intensity
    const spawnRate = intensity * 120; // ms between spawns (lower = more)
    if (intensity > 0.01 && now - lastDropletTime > (150 - spawnRate)) {
        const count = Math.ceil(intensity * 3);
        for (let i = 0; i < count; i++) {
            droplets.push({
                x: W - 70 + Math.random() * 50,
                y: 10 + Math.random() * 10,
                vy: 1 + Math.random() * 2 * intensity,
                opacity: 0.3 + intensity * 0.7,
                size: 1.5 + intensity * 2.5,
            });
        }
        lastDropletTime = now;
    }
    // Update existing droplets
    for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        d.y += d.vy;
        d.vy += 0.15;
        d.opacity -= 0.008;
        if (d.y > H || d.opacity <= 0) {
            droplets.splice(i, 1);
        }
    }
}
function drawDroplets() {
    for (const d of droplets) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${d.opacity})`;
        ctx.fill();
    }
}
// ============================================================
// MAIN DRAW
// ============================================================
function draw() {
    ctx.clearRect(0, 0, W, H);
    const mW = mag(weather), mT = mag(target);
    const dpVal = dot(weather, target);
    const cosSim = mW > 0.001 && mT > 0.001 ? dpVal / (mW * mT) : 0;
    const intensity = sprinklerIntensity(cosSim);
    // Update and draw water animation
    updateDroplets(intensity);
    drawDroplets();
    // Grid
    ctx.lineWidth = 1;
    for (let i = 0; i <= MAX_VAL; i++) {
        const gx = OX + i * SCALE;
        ctx.strokeStyle = i === 0 ? COLORS.axis : COLORS.grid;
        ctx.beginPath();
        ctx.moveTo(gx, OY);
        ctx.lineTo(gx, PAD_TOP);
        ctx.stroke();
    }
    for (let i = 0; i <= MAX_VAL; i++) {
        const gy = OY - i * SCALE;
        ctx.strokeStyle = i === 0 ? COLORS.axis : COLORS.grid;
        ctx.beginPath();
        ctx.moveTo(OX, gy);
        ctx.lineTo(W - PAD_RIGHT, gy);
        ctx.stroke();
    }
    // Three-zone wedges
    const zr = Math.max(W, H) * 1.5;
    ctx.save();
    ctx.beginPath();
    ctx.rect(OX, 0, W, OY);
    ctx.clip();
    // Full-blast zone (0° to HIGH_ANGLE)
    ctx.beginPath();
    ctx.moveTo(OX, OY);
    ctx.arc(OX, OY, zr, -HIGH_ANGLE, 0);
    ctx.closePath();
    ctx.fillStyle = COLORS.onZone;
    ctx.fill();
    // Partial zone (HIGH_ANGLE to LOW_ANGLE)
    ctx.beginPath();
    ctx.moveTo(OX, OY);
    ctx.arc(OX, OY, zr, -LOW_ANGLE, -HIGH_ANGLE);
    ctx.closePath();
    ctx.fillStyle = COLORS.midZone;
    ctx.fill();
    ctx.restore();
    // Threshold lines
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 1.5;
    // High threshold (full blast line)
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
    ctx.beginPath();
    ctx.moveTo(OX, OY);
    ctx.lineTo(OX + Math.cos(HIGH_ANGLE) * zr, OY - Math.sin(HIGH_ANGLE) * zr);
    ctx.stroke();
    // Low threshold (off line)
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.25)';
    ctx.beginPath();
    ctx.moveTo(OX, OY);
    ctx.lineTo(OX + Math.cos(LOW_ANGLE) * zr, OY - Math.sin(LOW_ANGLE) * zr);
    ctx.stroke();
    ctx.setLineDash([]);
    // Zone labels
    ctx.font = '11px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(52, 211, 153, 0.35)';
    ctx.fillText('FULL BLAST', OX + 5.5 * SCALE, OY - 1.0 * SCALE);
    ctx.fillStyle = 'rgba(250, 204, 21, 0.3)';
    const midAngle = (HIGH_ANGLE + LOW_ANGLE) / 2;
    ctx.fillText('PARTIAL', OX + Math.cos(midAngle) * 3.8 * SCALE, OY - Math.sin(midAngle) * 3.8 * SCALE);
    ctx.fillStyle = 'rgba(244, 63, 94, 0.25)';
    ctx.fillText('OFF', OX + 1.2 * SCALE, OY - 5.5 * SCALE);
    // Axis labels
    ctx.font = '12px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = '#4a4a60';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('Sunniness \u2192', W - PAD_RIGHT, OY + 6);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('\u2191 Raininess', OX + 6, PAD_TOP - 2);
    // Axis numbers
    ctx.font = '10px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = COLORS.axisLabel;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 1; i <= MAX_VAL; i++) {
        const px = OX + i * SCALE;
        if (px < W - 5)
            ctx.fillText(String(i), px, OY + 4);
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 1; i <= MAX_VAL; i++) {
        const py = OY - i * SCALE;
        if (py > 5)
            ctx.fillText(String(i), OX - 5, py);
    }
    const pTarget = toCanvas(target);
    const pWeather = toCanvas(weather);
    // Angle arc
    if (mW > 0.1) {
        const angW = Math.atan2(-weather.y, weather.x);
        const angT = 0;
        const start = Math.min(angW, angT);
        const end = Math.max(angW, angT);
        ctx.beginPath();
        ctx.arc(OX, OY, 28, start, end);
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
        ctx.fillText('\u03B8', OX + Math.cos(midAng) * 42, OY + Math.sin(midAng) * 42);
    }
    // Target vector
    drawArrow(OX, OY, pTarget.x, pTarget.y, COLORS.target, 2.5, 'Target');
    // Weather vector
    drawArrow(OX, OY, pWeather.x, pWeather.y, COLORS.weather, 3, 'Weather');
    // Drag handle
    ctx.beginPath();
    ctx.arc(pWeather.x, pWeather.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.weather;
    ctx.fill();
    ctx.strokeStyle = '#0a0a0f';
    ctx.lineWidth = 2;
    ctx.stroke();
    updateUI(cosSim, mW, mT, dpVal, intensity);
    // Request animation frame for continuous droplet animation
    if (intensity > 0.01 || droplets.length > 0) {
        requestAnimationFrame(() => draw());
    }
}
// ============================================================
// UI UPDATE
// ============================================================
function updateUI(cosSim, mW, mT, dpVal, intensity) {
    const thetaDeg = Math.acos(Math.max(-1, Math.min(1, cosSim))) * 180 / Math.PI;
    const pct = Math.round(intensity * 100);
    // Pick color based on intensity
    let resultColor;
    if (intensity > 0.8)
        resultColor = COLORS.positive;
    else if (intensity > 0.01)
        resultColor = COLORS.warning;
    else
        resultColor = COLORS.negative;
    setText('wx', String(weather.x));
    setText('wy', String(weather.y));
    // Cosine similarity work
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
    // Threshold comparison — now shows the intensity mapping
    const thresh = document.getElementById('threshold-compare');
    thresh.innerHTML =
        '<div class="threshold-detail">' +
            '<span style="color:' + resultColor + ';font-weight:600">' + cosSim.toFixed(4) + '</span>' +
            ' \u2192 intensity: <span style="color:' + resultColor + ';font-weight:700">' + pct + '%</span>' +
            '</div>' +
            '<div class="threshold-scale">' +
            '<span style="color:#f43f5e">off &lt; ' + LOW_COS.toFixed(2) + '</span>' +
            '<span style="color:#666880">\u00A0\u00A0|\u00A0\u00A0</span>' +
            '<span style="color:#facc15">partial</span>' +
            '<span style="color:#666880">\u00A0\u00A0|\u00A0\u00A0</span>' +
            '<span style="color:#34d399">' + HIGH_COS.toFixed(2) + ' &lt; full</span>' +
            '</div>';
    // Sprinkler status — continuous
    const status = document.getElementById('sprinkler-status');
    if (intensity > 0.8) {
        status.style.background = '#0f1a14';
        status.style.borderColor = COLORS.positive;
        status.innerHTML =
            '<div class="status-label" style="color:' + COLORS.positive + '">SPRINKLER: FULL BLAST (' + pct + '%)</div>' +
                '<div class="status-detail">Weather direction closely matches "sunny & dry" \u2014 maximum watering.</div>';
    }
    else if (intensity > 0.01) {
        status.style.background = '#1a1a12';
        status.style.borderColor = COLORS.warning;
        status.innerHTML =
            '<div class="status-label" style="color:' + COLORS.warning + '">SPRINKLER: PARTIAL (' + pct + '%)</div>' +
                '<div class="status-detail">Weather is somewhat sunny \u2014 sprinkler runs at reduced intensity. More sun = more water.</div>';
    }
    else {
        status.style.background = '#1a0f11';
        status.style.borderColor = COLORS.negative;
        status.innerHTML =
            '<div class="status-label" style="color:' + COLORS.negative + '">SPRINKLER OFF (0%)</div>' +
                '<div class="status-detail">Weather direction points too far from ideal conditions \u2014 save water.</div>';
    }
    // Intensity bar
    const intensityBar = document.getElementById('intensityBarFill');
    intensityBar.style.width = pct + '%';
    setText('intensityVal', pct + '%');
    // Angle bar
    setText('angleVal', thetaDeg.toFixed(1) + '\u00B0');
    document.getElementById('angleBarFill').style.width = Math.min(100, thetaDeg / 90 * 100) + '%';
    // Insight box
    const ib = document.getElementById('insightBox');
    let msg, bg, border;
    if (mW < 0.01) {
        msg = 'Zero vector \u2014 no weather reading. Cosine similarity is undefined at the origin.';
        bg = '#1a1a12';
        border = '#facc15';
    }
    else if (Math.abs(thetaDeg) < 3) {
        msg = 'Perfect alignment \u2014 the weather points exactly toward "sunny & dry," so the sprinkler runs at 100%. Try making the vector longer or shorter: the intensity stays the same. Cosine similarity ignores magnitude, so a gentle sunny day and a blazing one produce the same water flow.';
        bg = '#0f1a14';
        border = COLORS.positive;
    }
    else if (intensity > 0.01 && intensity < 0.99) {
        msg = `The sprinkler is running at ${pct}% power. Unlike a simple on/off switch, this system responds continuously \u2014 the closer the weather aligns with "sunny & dry," the more water flows. This is how real ML systems work: outputs are gradients, not binary switches.`;
        bg = '#1a1a12';
        border = '#facc15';
    }
    else if (intensity >= 0.99) {
        msg = 'The weather vector is within 30\u00B0 of the target direction \u2014 full blast. The sprinkler responds to direction, not magnitude: a light sunny breeze and intense sun produce the same 100% output, as long as the sun-to-rain ratio matches.';
        bg = '#0f1a14';
        border = COLORS.positive;
    }
    else if (Math.abs(thetaDeg - 90) < 5) {
        msg = 'Perpendicular \u2014 cos \u03B8 = 0. The weather is pure rain, zero sun. Completely orthogonal to the target direction, so the sprinkler stays firmly off.';
        bg = '#1a1a12';
        border = '#facc15';
    }
    else {
        msg = 'The weather vector is more than 75\u00B0 from "sunny & dry." The cosine similarity is below the minimum threshold, so the sprinkler saves water. Drag toward the x-axis to start seeing partial watering kick in.';
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
        x: Math.max(0, Math.min(MAX_VAL, w.x)),
        y: Math.max(0, Math.min(MAX_VAL, w.y)),
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
