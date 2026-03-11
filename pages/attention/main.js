const TOKENS = ['The', 'cat', 'is', 'eat', 'ing'];
const DIMS = ['noun', 'verb', 'subj', 'action'];
// Query vectors: what each token is "looking for"
const Q = [
    [2, 0, 1, 0], // The:  looking for its noun
    [0, 2, 0, 2], // cat:  looking for its verb/action
    [0, 2, 0, 1], // is:   looking for main verb
    [2, 0, 2, 0], // eat:  looking for its subject
    [0, 2, 0, 1], // ing:  looking for its verb root
];
// Key vectors: what each token "advertises"
const K = [
    [0, 0, 1, 0], // The:  offers grammatical context
    [2, 0, 2, 0], // cat:  offers noun/subject info
    [0, 1, 0, 0], // is:   offers verb linkage
    [0, 2, 0, 2], // eat:  offers verb/action info
    [0, 1, 0, 0], // ing:  offers aspect info
];
// Value vectors: what information actually gets passed
const V = [
    [0, 0, 0, 0], // The:  determiner, not much content
    [1, 0, 1, 0], // cat:  passes subject/noun info
    [0, 0, 0, 1], // is:   passes tense info
    [0, 1, 0, 1], // eat:  passes action/verb info
    [0, 0, 0, 1], // ing:  passes progressive aspect
];
const D_K = 4;
const Q_INTUITION = [
    'looking for its noun',
    'looking for its verb & action',
    'looking for the main verb',
    'looking for its subject',
    'looking for its verb root',
];
const INSIGHTS = [
    '\u201cThe\u201d is a determiner \u2014 it attends heavily to \u201ccat\u201d because it needs to know which noun it modifies.',
    '\u201ccat\u201d is the subject \u2014 it attends heavily to \u201ceat\u201d because subjects need to find their verb to form meaning.',
    '\u201cis\u201d is an auxiliary \u2014 it attends to \u201ceat\u201d because auxiliaries need to link with the main action verb.',
    '\u201ceat\u201d is the main verb \u2014 it attends heavily to \u201ccat\u201d because verbs need to find their subject.',
    '\u201cing\u201d is a suffix \u2014 it attends to \u201ceat\u201d because it needs to find its root verb to express progressive aspect.',
];
function dot(a, b) {
    let s = 0;
    for (let i = 0; i < a.length; i++)
        s += a[i] * b[i];
    return s;
}
function softmax(v) {
    const mx = Math.max(...v);
    const ex = v.map(x => Math.exp(x - mx));
    const s = ex.reduce((a, b) => a + b, 0);
    return ex.map(x => x / s);
}
function attnRow(i) {
    const scores = TOKENS.map((_, j) => dot(Q[i], K[j]) / Math.sqrt(D_K));
    return softmax(scores);
}
// Precompute full 5x5 attention matrix
const ATT = TOKENS.map((_, i) => attnRow(i));
let sel = 1; // default to "cat"
function $(id) { return document.getElementById(id); }
function wColor(w) {
    const t = Math.pow(Math.min(1, w * 1.5), 0.6);
    const r = Math.round(102 + (52 - 102) * t);
    const g = Math.round(104 + (211 - 104) * t);
    const b = Math.round(128 + (153 - 128) * t);
    return `rgb(${r},${g},${b})`;
}
function pick(i) {
    sel = i;
    render();
}
function render() {
    const i = sel;
    const w = ATT[i];
    const raw = TOKENS.map((_, j) => dot(Q[i], K[j]));
    const sc = raw.map(s => s / Math.sqrt(D_K));
    const out = DIMS.map((_, d) => w.reduce((s, wt, j) => s + wt * V[j][d], 0));
    const maxW = Math.max(...w);
    const maxRaw = Math.max(...raw);
    // Token chips
    document.querySelectorAll('.token-chip').forEach((c, idx) => c.classList.toggle('selected', idx === i));
    // Left panel: attention bars
    let bh = `<div class="panel-label">\u201c${TOKENS[i]}\u201d attends to:</div>`;
    w.forEach((wt, j) => {
        const pct = wt * 100;
        const bw = (wt / maxW) * 100;
        const c = wColor(wt);
        bh += `<div class="attn-row${wt === maxW ? ' peak' : ''}">` +
            `<span class="attn-name">${TOKENS[j]}</span>` +
            `<div class="attn-track"><div class="attn-fill" style="width:${bw}%;background:${c}"></div></div>` +
            `<span class="attn-pct" style="color:${c}">${pct.toFixed(1)}%</span></div>`;
    });
    $('attn-bars').innerHTML = bh;
    // Right panel: math breakdown
    let m = `<div class="section-label">Query: what \u201c${TOKENS[i]}\u201d is looking for</div><div class="vec-row">`;
    DIMS.forEach((d, idx) => {
        const v = Q[i][idx];
        m += `<span class="vec-cell${v > 0 ? ' active' : ''}"><span class="dl">${d}</span><span class="dv">${v}</span></span>`;
    });
    m += `</div><div class="intuition">${Q_INTUITION[i]}</div>`;
    m += `<div class="section-label">Key dot products (Q \u00B7 K)</div><div class="dots-row">`;
    TOKENS.forEach((t, j) => {
        m += `<span class="dot-cell${raw[j] === maxRaw ? ' dot-peak' : ''}"><span class="dt">${t}</span><span class="dn">${raw[j]}</span></span>`;
    });
    m += `</div>`;
    m += `<div class="section-label">\u00F7 \u221A${D_K} \u2192 softmax</div><div class="flow-row">`;
    sc.forEach(s => { m += `<span class="fv">${s.toFixed(1)}</span>`; });
    m += `</div><div class="flow-arrow">\u2193 softmax</div><div class="flow-row">`;
    w.forEach(wt => {
        m += `<span class="fv" style="color:${wColor(wt)};font-weight:600">${(wt * 100).toFixed(1)}%</span>`;
    });
    m += `</div>`;
    m += `<div class="section-label">Output (weighted V sum)</div><div class="vec-row">`;
    DIMS.forEach((d, idx) => {
        m += `<span class="vec-cell${out[idx] > 0.3 ? ' active' : ''}"><span class="dl">${d}</span><span class="dv">${out[idx].toFixed(2)}</span></span>`;
    });
    m += `</div><div class="insight-box">${INSIGHTS[i]}</div>`;
    $('math-panel').innerHTML = m;
    // Heatmap cells
    document.querySelectorAll('.hm-cell').forEach(cell => {
        const el = cell;
        const r = +el.dataset.row;
        const c = +el.dataset.col;
        const wt = ATT[r][c];
        const a = 0.08 + wt * 0.92;
        el.style.background = `rgba(52,211,153,${a.toFixed(2)})`;
        el.textContent = (wt * 100).toFixed(0);
        el.style.color = wt > 0.3 ? '#0a0a0f' : '#8888a0';
        el.style.fontWeight = wt > 0.3 ? '700' : '400';
        el.classList.toggle('hm-sel', r === i);
    });
    document.querySelectorAll('.hm-rh').forEach((h, idx) => h.classList.toggle('hm-active', idx === i));
}
function init() {
    // Build token chips
    const chips = $('token-chips');
    TOKENS.forEach((t, i) => {
        const b = document.createElement('button');
        b.className = 'token-chip';
        b.textContent = t;
        b.addEventListener('click', () => pick(i));
        chips.appendChild(b);
    });
    // Build heatmap grid
    const grid = $('heatmap');
    grid.appendChild(Object.assign(document.createElement('div'), { className: 'hm-corner' }));
    TOKENS.forEach(t => {
        const h = document.createElement('div');
        h.className = 'hm-ch';
        h.textContent = t;
        grid.appendChild(h);
    });
    TOKENS.forEach((t, i) => {
        const rh = document.createElement('div');
        rh.className = 'hm-rh';
        rh.textContent = t;
        rh.addEventListener('click', () => pick(i));
        grid.appendChild(rh);
        TOKENS.forEach((_, j) => {
            const cell = document.createElement('div');
            cell.className = 'hm-cell';
            cell.dataset.row = String(i);
            cell.dataset.col = String(j);
            cell.addEventListener('click', () => pick(i));
            grid.appendChild(cell);
        });
    });
    render();
}
document.addEventListener('DOMContentLoaded', init);
export {};
