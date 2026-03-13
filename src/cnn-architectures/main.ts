// CNN Architecture Timeline — Interactive Reference
// Shows the evolution of CNN architectures from LeNet to ConvNeXt
export {};

interface Architecture {
  name: string;
  year: number;
  color: string;
  params: string;
  topK: string;
  depth: number;
  novelty: string;
  details: string[];
  layers: LayerBlock[];
}

interface LayerBlock {
  type: string; // 'conv' | 'pool' | 'fc' | 'residual' | 'inception' | 'norm' | 'dropout'
  label: string;
  color: string;
  size: number; // relative width
}

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let W = 0, H = 0;

let selectedArch = 0;
let hoveredArch = -1;

function $(id: string): HTMLElement { return document.getElementById(id)!; }

const COLORS = {
  bg: '#0a0a0f',
  text: '#d0d0dc',
  dimText: '#666880',
  panel: '#12121a',
  border: '#1e1e2a',
  conv: '#7c8cf8',
  pool: '#38bdf8',
  fc: '#34d399',
  residual: '#f59e0b',
  inception: '#a78bfa',
  norm: '#f43f5e',
  dropout: '#666880',
  timeline: '#2a2a3e',
};

const architectures: Architecture[] = [
  {
    name: 'LeNet-5', year: 1998, color: '#7c8cf8', params: '60K', topK: 'N/A (MNIST)',
    depth: 5, novelty: 'First successful CNN. Proved convolutions + backprop work for image recognition.',
    details: [
      'Conv 5×5 → Pool → Conv 5×5 → Pool → FC',
      'Trained on MNIST handwritten digits',
      'Used tanh/sigmoid activations',
      'Pioneered weight sharing in convolutions',
    ],
    layers: [
      { type: 'conv', label: 'Conv 5×5', color: COLORS.conv, size: 1 },
      { type: 'pool', label: 'Pool', color: COLORS.pool, size: 0.7 },
      { type: 'conv', label: 'Conv 5×5', color: COLORS.conv, size: 1 },
      { type: 'pool', label: 'Pool', color: COLORS.pool, size: 0.7 },
      { type: 'fc', label: 'FC', color: COLORS.fc, size: 1.2 },
    ]
  },
  {
    name: 'AlexNet', year: 2012, color: '#38bdf8', params: '60M', topK: '15.3% (top-5)',
    depth: 8, novelty: 'Won ImageNet 2012 by a huge margin. Proved deep learning works at scale.',
    details: [
      'ReLU activation (instead of tanh) — 6× faster training',
      'Dropout regularization (0.5) — reduced overfitting',
      'Data augmentation (flips, crops, color jitter)',
      'Trained on 2 GPUs (model parallelism)',
      'Local Response Normalization (LRN)',
    ],
    layers: [
      { type: 'conv', label: 'Conv 11×11', color: COLORS.conv, size: 1.5 },
      { type: 'pool', label: 'Pool', color: COLORS.pool, size: 0.7 },
      { type: 'conv', label: 'Conv 5×5', color: COLORS.conv, size: 1.2 },
      { type: 'pool', label: 'Pool', color: COLORS.pool, size: 0.7 },
      { type: 'conv', label: 'Conv 3×3 ×3', color: COLORS.conv, size: 1 },
      { type: 'pool', label: 'Pool', color: COLORS.pool, size: 0.7 },
      { type: 'fc', label: 'FC 4096', color: COLORS.fc, size: 1.3 },
      { type: 'dropout', label: 'Drop', color: COLORS.dropout, size: 0.5 },
      { type: 'fc', label: 'FC 1000', color: COLORS.fc, size: 1 },
    ]
  },
  {
    name: 'VGGNet', year: 2014, color: '#a78bfa', params: '138M', topK: '7.3% (top-5)',
    depth: 19, novelty: 'Showed that depth matters: uniform 3×3 convolutions stacked deep outperform larger kernels.',
    details: [
      'Only 3×3 convolutions (two 3×3 = one 5×5 receptive field)',
      'Very uniform architecture: conv-conv-pool repeated',
      'Up to 19 layers deep (VGG-19)',
      'Huge parameter count (138M) — mostly in FC layers',
      'Pre-trained VGG features became standard for transfer learning',
    ],
    layers: [
      { type: 'conv', label: '3×3 ×2', color: COLORS.conv, size: 0.8 },
      { type: 'pool', label: 'Pool', color: COLORS.pool, size: 0.5 },
      { type: 'conv', label: '3×3 ×2', color: COLORS.conv, size: 0.8 },
      { type: 'pool', label: 'Pool', color: COLORS.pool, size: 0.5 },
      { type: 'conv', label: '3×3 ×4', color: COLORS.conv, size: 0.8 },
      { type: 'pool', label: 'Pool', color: COLORS.pool, size: 0.5 },
      { type: 'conv', label: '3×3 ×4', color: COLORS.conv, size: 0.8 },
      { type: 'pool', label: 'Pool', color: COLORS.pool, size: 0.5 },
      { type: 'fc', label: 'FC ×3', color: COLORS.fc, size: 1.2 },
    ]
  },
  {
    name: 'GoogLeNet', year: 2014, color: '#34d399', params: '6.8M', topK: '6.7% (top-5)',
    depth: 22, novelty: 'Inception modules: parallel convolutions at multiple scales. Dramatically fewer parameters than VGG.',
    details: [
      'Inception module: 1×1, 3×3, 5×5 convs + pool in parallel',
      '1×1 convolutions for dimensionality reduction (bottleneck)',
      'Global average pooling instead of FC layers',
      'Auxiliary classifiers for gradient flow (removed at inference)',
      '12× fewer parameters than AlexNet, better accuracy',
    ],
    layers: [
      { type: 'conv', label: 'Conv 7×7', color: COLORS.conv, size: 1.2 },
      { type: 'pool', label: 'Pool', color: COLORS.pool, size: 0.5 },
      { type: 'inception', label: 'Inception ×9', color: COLORS.inception, size: 1.5 },
      { type: 'pool', label: 'AvgPool', color: COLORS.pool, size: 0.5 },
      { type: 'fc', label: 'FC 1000', color: COLORS.fc, size: 0.8 },
    ]
  },
  {
    name: 'ResNet', year: 2015, color: '#f59e0b', params: '25.5M', topK: '3.6% (top-5)',
    depth: 152, novelty: 'Skip connections (residual learning): learn F(x) + x instead of F(x). Enabled 152+ layer networks.',
    details: [
      'Residual blocks: output = F(x) + x (skip connection)',
      'Solved the degradation problem: deeper ≠ always better without residuals',
      'Batch normalization after every convolution',
      'Bottleneck design: 1×1 → 3×3 → 1×1 (reduces computation)',
      'Won ImageNet 2015, surpassed human-level performance',
      'Identity shortcuts allow gradients to flow directly through the network',
    ],
    layers: [
      { type: 'conv', label: 'Conv 7×7', color: COLORS.conv, size: 1 },
      { type: 'pool', label: 'Pool', color: COLORS.pool, size: 0.5 },
      { type: 'residual', label: 'Res ×3', color: COLORS.residual, size: 1 },
      { type: 'residual', label: 'Res ×4', color: COLORS.residual, size: 1 },
      { type: 'residual', label: 'Res ×6', color: COLORS.residual, size: 1 },
      { type: 'residual', label: 'Res ×3', color: COLORS.residual, size: 1 },
      { type: 'pool', label: 'AvgPool', color: COLORS.pool, size: 0.5 },
      { type: 'fc', label: 'FC', color: COLORS.fc, size: 0.8 },
    ]
  },
  {
    name: 'ConvNeXt', year: 2022, color: '#f43f5e', params: '88M', topK: '1.6% (top-5)',
    depth: 100, novelty: 'Modernized ResNet with transformer-era techniques. Proved CNNs can match Vision Transformers.',
    details: [
      'Patchify stem: 4×4 non-overlapping convolution (like ViT patch embedding)',
      'Inverted bottleneck: expand → depthwise conv → shrink (like MobileNet)',
      'Larger kernels: 7×7 depthwise convolutions',
      'Layer normalization instead of batch normalization',
      'GELU activation instead of ReLU',
      'Fewer normalization layers (only one per block)',
      'Matches Swin Transformer accuracy with pure convolutions',
    ],
    layers: [
      { type: 'conv', label: 'Patch 4×4', color: COLORS.conv, size: 0.8 },
      { type: 'norm', label: 'LN', color: COLORS.norm, size: 0.3 },
      { type: 'residual', label: 'CNX ×3', color: '#f43f5e', size: 1 },
      { type: 'residual', label: 'CNX ×3', color: '#f43f5e', size: 1 },
      { type: 'residual', label: 'CNX ×9', color: '#f43f5e', size: 1.2 },
      { type: 'residual', label: 'CNX ×3', color: '#f43f5e', size: 1 },
      { type: 'pool', label: 'AvgPool', color: COLORS.pool, size: 0.5 },
      { type: 'fc', label: 'FC', color: COLORS.fc, size: 0.8 },
    ]
  },
];

// ============================================================
// DRAWING
// ============================================================
function draw(): void {
  ctx.clearRect(0, 0, W, H);

  const arch = architectures[selectedArch];

  // Timeline at top
  const timelineY = 30;
  const timelineLeft = 40;
  const timelineRight = W - 40;
  const timelineW = timelineRight - timelineLeft;

  // Timeline line
  ctx.strokeStyle = COLORS.timeline;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(timelineLeft, timelineY);
  ctx.lineTo(timelineRight, timelineY);
  ctx.stroke();

  // Year range
  const minYear = 1998;
  const maxYear = 2024;
  const yearToX = (y: number) => timelineLeft + (y - minYear) / (maxYear - minYear) * timelineW;

  // Architecture dots on timeline
  for (let i = 0; i < architectures.length; i++) {
    const a = architectures[i];
    const x = yearToX(a.year);
    const isSelected = i === selectedArch;
    const isHovered = i === hoveredArch;

    ctx.beginPath();
    ctx.arc(x, timelineY, isSelected ? 8 : isHovered ? 7 : 5, 0, Math.PI * 2);
    ctx.fillStyle = isSelected ? a.color : isHovered ? a.color : COLORS.border;
    ctx.fill();
    if (isSelected) {
      ctx.strokeStyle = a.color;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Year label
    ctx.font = `${isSelected ? 'bold ' : ''}9px "Segoe UI", system-ui, sans-serif`;
    ctx.fillStyle = isSelected ? a.color : COLORS.dimText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(String(a.year), x, timelineY + 12);

    // Name label
    ctx.font = `${isSelected ? 'bold 11px' : '10px'} "Segoe UI", system-ui, sans-serif`;
    ctx.fillText(a.name, x, timelineY + 24);
  }

  // Architecture diagram
  const diagramY = 90;
  const diagramH = H - diagramY - 10;
  const blockPad = 4;

  // Compute total width
  const totalSize = arch.layers.reduce((s, l) => s + l.size, 0);
  const availW = W - 80;
  const unitW = availW / totalSize;

  let curX = 40;
  for (let i = 0; i < arch.layers.length; i++) {
    const layer = arch.layers[i];
    const blockW = layer.size * unitW - blockPad;
    const blockH = diagramH * 0.7;
    const blockY = diagramY + (diagramH - blockH) / 2;

    // Block
    ctx.fillStyle = layer.color + '20';
    ctx.strokeStyle = layer.color;
    ctx.lineWidth = 1.5;

    const r = 4;
    ctx.beginPath();
    ctx.moveTo(curX + r, blockY);
    ctx.lineTo(curX + blockW - r, blockY);
    ctx.arcTo(curX + blockW, blockY, curX + blockW, blockY + r, r);
    ctx.lineTo(curX + blockW, blockY + blockH - r);
    ctx.arcTo(curX + blockW, blockY + blockH, curX + blockW - r, blockY + blockH, r);
    ctx.lineTo(curX + r, blockY + blockH);
    ctx.arcTo(curX, blockY + blockH, curX, blockY + blockH - r, r);
    ctx.lineTo(curX, blockY + r);
    ctx.arcTo(curX, blockY, curX + r, blockY, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Skip connection arrow for residual blocks
    if (layer.type === 'residual') {
      ctx.setLineDash([3, 2]);
      ctx.strokeStyle = layer.color + '80';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(curX, blockY - 5);
      ctx.quadraticCurveTo(curX + blockW / 2, blockY - 18, curX + blockW, blockY - 5);
      ctx.stroke();
      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(curX + blockW, blockY - 5);
      ctx.lineTo(curX + blockW - 6, blockY - 10);
      ctx.lineTo(curX + blockW - 6, blockY);
      ctx.closePath();
      ctx.fillStyle = layer.color + '80';
      ctx.fill();
      ctx.setLineDash([]);
    }

    // Label
    ctx.font = '9px "Cascadia Code", "Fira Code", monospace';
    ctx.fillStyle = layer.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(layer.label, curX + blockW / 2, blockY + blockH / 2);

    // Arrow to next
    if (i < arch.layers.length - 1) {
      ctx.fillStyle = COLORS.dimText;
      ctx.font = '12px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('\u2192', curX + blockW + blockPad / 2, blockY + blockH / 2);
    }

    curX += blockW + blockPad;
  }
}

// ============================================================
// UI
// ============================================================
function buildInfoPanel(): void {
  const arch = architectures[selectedArch];
  const panel = $('info-panel');

  let html = '';
  html += `<div class="arch-header" style="border-left-color:${arch.color}">`;
  html += `<div class="arch-name" style="color:${arch.color}">${arch.name} (${arch.year})</div>`;
  html += `<div class="arch-stats">`;
  html += `<span>Params: <strong>${arch.params}</strong></span>`;
  html += `<span>Top-5 Error: <strong>${arch.topK}</strong></span>`;
  html += `<span>Depth: <strong>${arch.depth}</strong></span>`;
  html += `</div></div>`;

  html += `<div class="arch-novelty"><strong>Key Innovation:</strong> ${arch.novelty}</div>`;

  html += `<div class="arch-details">`;
  for (const d of arch.details) {
    html += `<div class="detail-item">\u2022 ${d}</div>`;
  }
  html += `</div>`;

  // Legend
  html += `<div class="legend">`;
  html += `<span class="legend-item"><span class="legend-dot" style="background:${COLORS.conv}"></span>Convolution</span>`;
  html += `<span class="legend-item"><span class="legend-dot" style="background:${COLORS.pool}"></span>Pooling</span>`;
  html += `<span class="legend-item"><span class="legend-dot" style="background:${COLORS.fc}"></span>Fully Connected</span>`;
  html += `<span class="legend-item"><span class="legend-dot" style="background:${COLORS.residual}"></span>Residual</span>`;
  html += `<span class="legend-item"><span class="legend-dot" style="background:${COLORS.inception}"></span>Inception</span>`;
  html += `</div>`;

  // Comparison insight
  let insight = '';
  if (selectedArch === 0) {
    insight = 'LeNet-5 started it all. Only 60K parameters and 5 layers — but it proved that learned convolution filters could replace hand-crafted feature extractors for image recognition.';
  } else if (arch.name === 'ResNet') {
    insight = 'ResNet\'s skip connections were revolutionary: they solved the degradation problem (deeper networks performing worse) by letting the network learn residual functions F(x) + x instead of direct mappings. This one idea enabled going from ~20 to 152+ layers.';
  } else if (arch.name === 'ConvNeXt') {
    insight = 'ConvNeXt proved that the "CNN vs Transformer" debate was a false dichotomy. By adopting transformer-era training techniques (AdamW, heavy augmentation, larger kernels), a pure CNN can match or beat Vision Transformers. The architecture matters less than the training recipe.';
  } else {
    const prev = architectures[selectedArch - 1];
    insight = `${arch.name} improved on ${prev.name} (${prev.year}) by ${arch.novelty.toLowerCase()} The trend across architectures: deeper networks, smarter connectivity, and fewer parameters per accuracy point.`;
  }
  html += `<div class="insight-box">${insight}</div>`;

  panel.innerHTML = html;
}

// ============================================================
// CANVAS SIZING
// ============================================================
function resize(): void {
  const container = canvas.parentElement!;
  const w = container.clientWidth;
  const h = Math.min(280, w * 0.4);
  const dpr = window.devicePixelRatio || 1;
  W = w; H = h;
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

  // Architecture selection buttons
  document.querySelectorAll('.arch-btn').forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      selectedArch = parseInt((btn as HTMLElement).dataset.idx || '0');
      document.querySelectorAll('.arch-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      draw();
      buildInfoPanel();
    });
  });

  // Canvas hover for timeline interaction
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * W / rect.width;
    const py = (e.clientY - rect.top) * H / rect.height;

    const timelineY = 30;
    if (Math.abs(py - timelineY) < 25) {
      const timelineLeft = 40;
      const timelineRight = W - 40;
      const timelineW = timelineRight - timelineLeft;
      const minYear = 1998;
      const maxYear = 2024;

      let found = -1;
      for (let i = 0; i < architectures.length; i++) {
        const x = timelineLeft + (architectures[i].year - minYear) / (maxYear - minYear) * timelineW;
        if (Math.abs(px - x) < 20) { found = i; break; }
      }
      if (found !== hoveredArch) {
        hoveredArch = found;
        canvas.style.cursor = found >= 0 ? 'pointer' : 'default';
        draw();
      }
    } else if (hoveredArch >= 0) {
      hoveredArch = -1;
      canvas.style.cursor = 'default';
      draw();
    }
  });

  canvas.addEventListener('click', (e) => {
    if (hoveredArch >= 0) {
      selectedArch = hoveredArch;
      document.querySelectorAll('.arch-btn').forEach((b, i) => {
        b.classList.toggle('active', i === selectedArch);
      });
      draw();
      buildInfoPanel();
    }
  });

  window.addEventListener('resize', resize);
  resize();
  buildInfoPanel();
}

document.addEventListener('DOMContentLoaded', init);
