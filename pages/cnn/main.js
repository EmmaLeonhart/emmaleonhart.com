// Grid sizes
const INPUT_SIZE = 7;
const KERNEL_SIZE = 3;
const OUTPUT_SIZE = INPUT_SIZE - KERNEL_SIZE + 1; // 5 for stride=1, no padding
// State
let inputGrid = [];
let kernel = [];
let outputGrid = [];
// Current kernel position (top-left corner)
let kernelRow = 0;
let kernelCol = 0;
// Animation
let animating = false;
let animTimer = null;
// Canvas
let canvas;
let ctx;
let W = 0, H = 0;
const COLORS = {
    bg: '#0a0a0f',
    cellBg: '#12121a',
    cellBorder: '#1e1e2a',
    inputHighlight: 'rgba(124, 140, 248, 0.25)',
    kernelHighlight: 'rgba(245, 158, 11, 0.3)',
    outputHighlight: 'rgba(52, 211, 153, 0.3)',
    outputActive: '#34d399',
    inputFill: '#7c8cf8',
    kernelFill: '#f59e0b',
    outputFill: '#34d399',
    posWeight: '#34d399',
    negWeight: '#f43f5e',
    zeroWeight: '#333348',
    text: '#d0d0dc',
    dimText: '#666880',
    labelText: '#9898ac',
    multiply: '#a78bfa',
};
function $(id) { return document.getElementById(id); }
// ============================================================
// NETWORK
// ============================================================
function randomVal() {
    return Math.round((Math.random() * 2 - 1) * 10) / 10;
}
function initInput() {
    inputGrid = [];
    for (let r = 0; r < INPUT_SIZE; r++) {
        inputGrid[r] = [];
        for (let c = 0; c < INPUT_SIZE; c++) {
            inputGrid[r][c] = Math.round(Math.random() * 10) / 10;
        }
    }
}
function initKernel() {
    kernel = [];
    for (let r = 0; r < KERNEL_SIZE; r++) {
        kernel[r] = [];
        for (let c = 0; c < KERNEL_SIZE; c++) {
            kernel[r][c] = randomVal();
        }
    }
}
function setEdgeDetectKernel() {
    kernel = [
        [-1, -1, -1],
        [-1, 8, -1],
        [-1, -1, -1],
    ];
}
function setSharpenKernel() {
    kernel = [
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0],
    ];
}
function setBlurKernel() {
    const v = Math.round(1 / 9 * 100) / 100;
    kernel = [
        [v, v, v],
        [v, v, v],
        [v, v, v],
    ];
}
function convolve() {
    outputGrid = [];
    for (let r = 0; r < OUTPUT_SIZE; r++) {
        outputGrid[r] = [];
        for (let c = 0; c < OUTPUT_SIZE; c++) {
            let sum = 0;
            for (let kr = 0; kr < KERNEL_SIZE; kr++) {
                for (let kc = 0; kc < KERNEL_SIZE; kc++) {
                    sum += inputGrid[r + kr][c + kc] * kernel[kr][kc];
                }
            }
            outputGrid[r][c] = Math.round(sum * 100) / 100;
        }
    }
}
// ============================================================
// DRAWING
// ============================================================
function valColor(v) {
    if (v > 0.001)
        return COLORS.posWeight;
    if (v < -0.001)
        return COLORS.negWeight;
    return COLORS.zeroWeight;
}
function intensityColor(v, baseColor) {
    const intensity = Math.min(1, Math.abs(v));
    // Parse the base color — just use alpha blending
    return baseColor.replace(')', `,${0.1 + intensity * 0.6})`).replace('rgb(', 'rgba(');
}
function draw() {
    ctx.clearRect(0, 0, W, H);
    // Layout: Input grid | gap | Kernel | gap | Output grid
    const cellSize = Math.min(36, (W - 180) / (INPUT_SIZE + KERNEL_SIZE + OUTPUT_SIZE + 4));
    const gap = cellSize * 1.2;
    const inputW = INPUT_SIZE * cellSize;
    const kernelW = KERNEL_SIZE * cellSize;
    const outputW = OUTPUT_SIZE * cellSize;
    const totalW = inputW + gap + kernelW + gap + outputW;
    const startX = (W - totalW) / 2;
    const inputX = startX;
    const kernelX = startX + inputW + gap;
    const outputX = startX + inputW + gap + kernelW + gap;
    const gridY = 40;
    // Labels
    ctx.font = '11px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = COLORS.inputFill;
    ctx.fillText('Input', inputX + inputW / 2, 8);
    ctx.fillStyle = COLORS.kernelFill;
    ctx.fillText('Kernel (Filter)', kernelX + kernelW / 2, 8);
    ctx.fillStyle = COLORS.outputFill;
    ctx.fillText('Feature Map', outputX + outputW / 2, 8);
    // Convolution symbols
    ctx.font = 'bold 18px "Segoe UI", system-ui, sans-serif';
    ctx.fillStyle = COLORS.dimText;
    ctx.textBaseline = 'middle';
    ctx.fillText('*', inputX + inputW + gap / 2, gridY + (INPUT_SIZE * cellSize) / 2);
    ctx.fillText('=', kernelX + kernelW + gap / 2, gridY + (INPUT_SIZE * cellSize) / 2);
    // Draw input grid
    for (let r = 0; r < INPUT_SIZE; r++) {
        for (let c = 0; c < INPUT_SIZE; c++) {
            const x = inputX + c * cellSize;
            const y = gridY + r * cellSize;
            // Highlight kernel receptive field
            const inKernel = r >= kernelRow && r < kernelRow + KERNEL_SIZE &&
                c >= kernelCol && c < kernelCol + KERNEL_SIZE;
            ctx.fillStyle = inKernel ? COLORS.inputHighlight : COLORS.cellBg;
            ctx.fillRect(x, y, cellSize, cellSize);
            ctx.strokeStyle = inKernel ? COLORS.inputFill : COLORS.cellBorder;
            ctx.lineWidth = inKernel ? 1.5 : 0.5;
            ctx.strokeRect(x, y, cellSize, cellSize);
            // Value
            ctx.font = `${inKernel ? 'bold ' : ''}9px "Cascadia Code", "Fira Code", monospace`;
            ctx.fillStyle = inKernel ? COLORS.text : COLORS.dimText;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(inputGrid[r][c].toFixed(1), x + cellSize / 2, y + cellSize / 2);
        }
    }
    // Draw kernel grid
    for (let r = 0; r < KERNEL_SIZE; r++) {
        for (let c = 0; c < KERNEL_SIZE; c++) {
            const x = kernelX + c * cellSize;
            const y = gridY + r * cellSize + (INPUT_SIZE - KERNEL_SIZE) * cellSize / 2;
            ctx.fillStyle = COLORS.kernelHighlight;
            ctx.fillRect(x, y, cellSize, cellSize);
            ctx.strokeStyle = COLORS.kernelFill;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x, y, cellSize, cellSize);
            ctx.font = 'bold 9px "Cascadia Code", "Fira Code", monospace';
            ctx.fillStyle = valColor(kernel[r][c]);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(kernel[r][c].toFixed(1), x + cellSize / 2, y + cellSize / 2);
        }
    }
    // Draw output grid
    const outputYOffset = gridY + (INPUT_SIZE - OUTPUT_SIZE) * cellSize / 2;
    for (let r = 0; r < OUTPUT_SIZE; r++) {
        for (let c = 0; c < OUTPUT_SIZE; c++) {
            const x = outputX + c * cellSize;
            const y = outputYOffset + r * cellSize;
            const isActive = r === kernelRow && c === kernelCol;
            ctx.fillStyle = isActive ? COLORS.outputHighlight : COLORS.cellBg;
            ctx.fillRect(x, y, cellSize, cellSize);
            ctx.strokeStyle = isActive ? COLORS.outputFill : COLORS.cellBorder;
            ctx.lineWidth = isActive ? 2 : 0.5;
            ctx.strokeRect(x, y, cellSize, cellSize);
            ctx.font = `${isActive ? 'bold ' : ''}9px "Cascadia Code", "Fira Code", monospace`;
            ctx.fillStyle = isActive ? COLORS.text : valColor(outputGrid[r]?.[c] ?? 0);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText((outputGrid[r]?.[c] ?? 0).toFixed(1), x + cellSize / 2, y + cellSize / 2);
        }
    }
    // Connection lines from input receptive field to output cell
    const outCellX = outputX + kernelCol * cellSize + cellSize / 2;
    const outCellY = outputYOffset + kernelRow * cellSize + cellSize / 2;
    // Lines from kernel corners to output
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.2)';
    ctx.lineWidth = 1;
    const rfLeft = inputX + kernelCol * cellSize;
    const rfTop = gridY + kernelRow * cellSize;
    const rfRight = rfLeft + KERNEL_SIZE * cellSize;
    const rfBot = rfTop + KERNEL_SIZE * cellSize;
    ctx.beginPath();
    ctx.moveTo(rfRight, rfTop);
    ctx.lineTo(outCellX, outCellY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rfRight, rfBot);
    ctx.lineTo(outCellX, outCellY);
    ctx.stroke();
    ctx.setLineDash([]);
}
// ============================================================
// UI
// ============================================================
function buildMathPanel() {
    const panel = $('math-panel');
    let html = '';
    html += `<div class="conv-title">Output[${kernelRow}][${kernelCol}] computation:</div>`;
    html += `<div class="conv-grid">`;
    let sum = 0;
    const products = [];
    for (let kr = 0; kr < KERNEL_SIZE; kr++) {
        for (let kc = 0; kc < KERNEL_SIZE; kc++) {
            const iv = inputGrid[kernelRow + kr][kernelCol + kc];
            const kv = kernel[kr][kc];
            const prod = iv * kv;
            sum += prod;
            products.push({ input: iv, kernel: kv, product: prod });
        }
    }
    // Show element-wise multiplication
    html += `<table class="mul-table">`;
    for (let kr = 0; kr < KERNEL_SIZE; kr++) {
        html += '<tr>';
        for (let kc = 0; kc < KERNEL_SIZE; kc++) {
            const idx = kr * KERNEL_SIZE + kc;
            const p = products[idx];
            const cls = p.product > 0.001 ? 'val-pos' : p.product < -0.001 ? 'val-neg' : 'val-zero';
            html += `<td>`;
            html += `<span class="mul-input">${p.input.toFixed(1)}</span>`;
            html += `<span class="mul-op">×</span>`;
            html += `<span class="mul-kernel">${p.kernel.toFixed(1)}</span>`;
            html += `<span class="mul-eq">=</span>`;
            html += `<span class="${cls}">${p.product.toFixed(2)}</span>`;
            html += `</td>`;
        }
        html += '</tr>';
    }
    html += `</table>`;
    // Sum line
    const sumCls = sum > 0.001 ? 'val-pos' : sum < -0.001 ? 'val-neg' : 'val-zero';
    html += `<div class="sum-line">Sum = <span class="${sumCls}">${sum.toFixed(2)}</span></div>`;
    html += `</div>`;
    // Insight
    let insight = '';
    const maxOut = Math.max(...outputGrid.flat().map(Math.abs));
    const minOut = Math.min(...outputGrid.flat());
    const maxOutVal = Math.max(...outputGrid.flat());
    if (kernel.flat().every(v => Math.abs(v - kernel[0][0]) < 0.01)) {
        insight = 'This is a uniform kernel — it computes the average of each patch (blur/smoothing). Every input pixel in the receptive field contributes equally.';
    }
    else if (Math.abs(kernel.flat().reduce((a, b) => a + b, 0)) < 0.1) {
        insight = 'The kernel weights sum to ~0. This means it detects differences (edges/gradients) rather than absolute values. Uniform regions produce near-zero output.';
    }
    else {
        insight = `The kernel slides across the input, computing a weighted sum at each position. Each output cell "sees" only a ${KERNEL_SIZE}×${KERNEL_SIZE} local region — this is the receptive field. Click output cells or use the arrow keys to move the kernel.`;
    }
    html += `<div class="insight-box">${insight}</div>`;
    panel.innerHTML = html;
}
function buildKernelSliders() {
    const container = $('kernel-sliders');
    container.innerHTML = '';
    for (let r = 0; r < KERNEL_SIZE; r++) {
        const row = document.createElement('div');
        row.className = 'kernel-slider-row';
        for (let c = 0; c < KERNEL_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'kernel-cell';
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.min = '-2';
            slider.max = '2';
            slider.step = '0.1';
            slider.value = String(kernel[r][c]);
            slider.className = 'kernel-slider';
            const val = document.createElement('span');
            val.className = 'kernel-val';
            val.textContent = kernel[r][c].toFixed(1);
            val.style.color = valColor(kernel[r][c]);
            const rCap = r, cCap = c;
            slider.addEventListener('input', () => {
                kernel[rCap][cCap] = parseFloat(slider.value);
                val.textContent = kernel[rCap][cCap].toFixed(1);
                val.style.color = valColor(kernel[rCap][cCap]);
                update();
            });
            cell.appendChild(slider);
            cell.appendChild(val);
            row.appendChild(cell);
        }
        container.appendChild(row);
    }
}
function update() {
    convolve();
    draw();
    buildMathPanel();
}
function moveKernel(dr, dc) {
    kernelRow = Math.max(0, Math.min(OUTPUT_SIZE - 1, kernelRow + dr));
    kernelCol = Math.max(0, Math.min(OUTPUT_SIZE - 1, kernelCol + dc));
    update();
}
function startAnimation() {
    if (animating)
        return;
    animating = true;
    $('btn-animate').textContent = 'Stop';
    kernelRow = 0;
    kernelCol = 0;
    update();
    animTimer = window.setInterval(() => {
        kernelCol++;
        if (kernelCol >= OUTPUT_SIZE) {
            kernelCol = 0;
            kernelRow++;
        }
        if (kernelRow >= OUTPUT_SIZE) {
            stopAnimation();
            return;
        }
        update();
    }, 500);
}
function stopAnimation() {
    animating = false;
    $('btn-animate').textContent = 'Animate slide';
    if (animTimer !== null) {
        clearInterval(animTimer);
        animTimer = null;
    }
}
// ============================================================
// CANVAS SIZING
// ============================================================
function resize() {
    const container = canvas.parentElement;
    const w = container.clientWidth;
    const h = Math.min(340, w * 0.52);
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
    initInput();
    initKernel();
    convolve();
    buildKernelSliders();
    // Preset kernel buttons
    $('btn-edge').addEventListener('click', () => { setEdgeDetectKernel(); buildKernelSliders(); update(); });
    $('btn-sharpen').addEventListener('click', () => { setSharpenKernel(); buildKernelSliders(); update(); });
    $('btn-blur').addEventListener('click', () => { setBlurKernel(); buildKernelSliders(); update(); });
    $('btn-randomize').addEventListener('click', () => { initKernel(); buildKernelSliders(); update(); });
    $('btn-randomize-input').addEventListener('click', () => { initInput(); update(); });
    // Animation
    $('btn-animate').addEventListener('click', () => {
        if (animating)
            stopAnimation();
        else
            startAnimation();
    });
    // Arrow keys to move kernel
    document.addEventListener('keydown', (e) => {
        if (animating)
            return;
        switch (e.key) {
            case 'ArrowUp':
                moveKernel(-1, 0);
                e.preventDefault();
                break;
            case 'ArrowDown':
                moveKernel(1, 0);
                e.preventDefault();
                break;
            case 'ArrowLeft':
                moveKernel(0, -1);
                e.preventDefault();
                break;
            case 'ArrowRight':
                moveKernel(0, 1);
                e.preventDefault();
                break;
        }
    });
    // Click on canvas to select kernel position
    canvas.addEventListener('click', (e) => {
        if (animating)
            return;
        const rect = canvas.getBoundingClientRect();
        const px = (e.clientX - rect.left) * W / rect.width;
        const py = (e.clientY - rect.top) * H / rect.height;
        // Check if click is in input grid area
        const cellSize = Math.min(36, (W - 180) / (INPUT_SIZE + KERNEL_SIZE + OUTPUT_SIZE + 4));
        const inputW = INPUT_SIZE * cellSize;
        const kernelW = KERNEL_SIZE * cellSize;
        const outputW = OUTPUT_SIZE * cellSize;
        const totalW = inputW + cellSize * 1.2 + kernelW + cellSize * 1.2 + outputW;
        const startX = (W - totalW) / 2;
        const outputX = startX + inputW + cellSize * 1.2 + kernelW + cellSize * 1.2;
        const outputYOffset = 40 + (INPUT_SIZE - OUTPUT_SIZE) * cellSize / 2;
        // Check output grid click
        const oc = Math.floor((px - outputX) / cellSize);
        const or2 = Math.floor((py - outputYOffset) / cellSize);
        if (oc >= 0 && oc < OUTPUT_SIZE && or2 >= 0 && or2 < OUTPUT_SIZE) {
            kernelRow = or2;
            kernelCol = oc;
            update();
        }
    });
    window.addEventListener('resize', resize);
    resize();
    update();
}
document.addEventListener('DOMContentLoaded', init);
export {};
