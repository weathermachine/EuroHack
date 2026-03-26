# Canvas 2D Visualization Recipes

Ready-to-use Canvas 2D visualization recipes for the `update_visualization` tool in Events mode. Each visualization is a complete function body that reacts to live sound events.

## Parameters Available

- `ctx` — CanvasRenderingContext2D
- `width` — canvas width in pixels
- `height` — canvas height in pixels
- `events` — array of active sound events: `{ s, gain, duration, triggeredAt, cutoff, delay, room, pan, speed, note }`
- `time` — current `performance.now()` in ms

Canvas is pre-cleared to `#0a0a0f` each frame. Events expire after 3 seconds. Use `age = (time - ev.triggeredAt) / 1000` and `decay = Math.max(0, 1 - age / ev.duration)` for animation timing.

## Color Palette (Phosphor Dark)

- Green: `#00ff41`
- Cyan: `#00d4ff`
- Magenta: `#ff00ff`
- Amber: `#ffcc00`
- Red: `#ff3333`

---

### Pulsing Cubes
3D-perspective isometric cubes arranged in a grid that pulse in size when sounds trigger.

```js
// Pulsing Cubes — isometric grid that reacts to beats
const cx = width / 2;
const cy = height / 2;
const cols = 6;
const rows = 6;
const spacing = Math.min(width, height) / 8;
const colors = ['#00ff41', '#00d4ff', '#ff00ff', '#ffcc00', '#ff3333'];

// Isometric projection helpers
const isoX = (gx, gy) => cx + (gx - gy) * spacing * 0.6;
const isoY = (gx, gy) => cy * 0.4 + (gx + gy) * spacing * 0.35;

// Compute per-cell energy from events
const cellEnergy = new Array(cols * rows).fill(0);
for (const ev of events) {
  const age = (time - ev.triggeredAt) / 1000;
  const decay = Math.max(0, 1 - age / Math.max(ev.duration, 0.3));
  const hash = (ev.s.charCodeAt(0) + (ev.note || 0)) % (cols * rows);
  cellEnergy[hash] = Math.max(cellEnergy[hash], decay * ev.gain);
}

// Draw cubes back-to-front for correct layering
for (let gy = 0; gy < rows; gy++) {
  for (let gx = 0; gx < cols; gx++) {
    const idx = gy * cols + gx;
    const energy = cellEnergy[idx];
    const baseSize = spacing * 0.22;
    const size = baseSize + energy * baseSize * 1.8;
    const px = isoX(gx - cols / 2, gy - rows / 2);
    const py = isoY(gx - cols / 2, gy - rows / 2) - energy * 30;
    const color = colors[(gx + gy) % colors.length];

    // Parse color for brightness modulation
    const alpha = 0.4 + energy * 0.6;

    // Top face
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(px, py - size);
    ctx.lineTo(px + size, py - size * 0.5);
    ctx.lineTo(px, py);
    ctx.lineTo(px - size, py - size * 0.5);
    ctx.closePath();
    ctx.fill();

    // Left face (darker)
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha * 0.6;
    ctx.beginPath();
    ctx.moveTo(px - size, py - size * 0.5);
    ctx.lineTo(px, py);
    ctx.lineTo(px, py + size * 0.5);
    ctx.lineTo(px - size, py);
    ctx.closePath();
    ctx.fill();

    // Right face (darkest)
    ctx.globalAlpha = alpha * 0.35;
    ctx.beginPath();
    ctx.moveTo(px + size, py - size * 0.5);
    ctx.lineTo(px, py);
    ctx.lineTo(px, py + size * 0.5);
    ctx.lineTo(px + size, py);
    ctx.closePath();
    ctx.fill();
  }
}
ctx.globalAlpha = 1;
```

---

### Particle System
Particles burst from center on each trigger, with gravity, velocity, and color based on sound.

```js
// Particle System — burst particles on trigger events
const state = ctx.canvas._particles = ctx.canvas._particles || { list: [], lastSeen: {} };
const particles = state.list;
const colors = ['#00ff41', '#00d4ff', '#ff00ff', '#ffcc00', '#ff3333'];

// Spawn particles for new/active events
for (const ev of events) {
  const age = (time - ev.triggeredAt) / 1000;
  if (age < 0.05) {
    const count = Math.floor(8 + ev.gain * 15);
    const color = colors[ev.s.charCodeAt(0) % colors.length];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4 * ev.gain;
      particles.push({
        x: width / 2,
        y: height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 2,
        life: 1,
        decay: 0.008 + Math.random() * 0.015,
        size: 2 + Math.random() * 3,
        color: color
      });
    }
  }
}

// Update and draw particles
const dt = 1;
for (let i = particles.length - 1; i >= 0; i--) {
  const p = particles[i];
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.vy += 0.06; // gravity
  p.life -= p.decay;

  if (p.life <= 0 || p.x < -50 || p.x > width + 50 || p.y > height + 50) {
    particles.splice(i, 1);
    continue;
  }

  ctx.globalAlpha = p.life;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
  ctx.fill();
}

// Cap particle count for performance
if (particles.length > 800) particles.splice(0, particles.length - 800);
ctx.globalAlpha = 1;
```

---

### Tunnel / Wormhole
Concentric rings pulse outward from center, creating a tunnel effect driven by events.

```js
// Tunnel / Wormhole — concentric rings pulse outward on beats
const state = ctx.canvas._tunnelState = ctx.canvas._tunnelState || { rings: [] };
const rings = state.rings;
const cx = width / 2;
const cy = height / 2;
const maxRadius = Math.sqrt(cx * cx + cy * cy);
const colors = ['#00ff41', '#00d4ff', '#ff00ff', '#ffcc00', '#ff3333'];

// Spawn rings from events
for (const ev of events) {
  const age = (time - ev.triggeredAt) / 1000;
  if (age < 0.05) {
    rings.push({
      radius: 5,
      speed: 1.5 + ev.gain * 3,
      lineWidth: 1 + ev.gain * 3,
      color: colors[ev.s.charCodeAt(0) % colors.length],
      alpha: 0.9
    });
  }
}

// Compute overall energy for background glow
let energy = 0;
for (const ev of events) {
  const age = (time - ev.triggeredAt) / 1000;
  energy += Math.max(0, 1 - age / Math.max(ev.duration, 0.3)) * ev.gain;
}
energy = Math.min(energy, 3);

// Subtle background glow at center
const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius * 0.5);
grd.addColorStop(0, `rgba(0, 212, 255, ${0.03 + energy * 0.02})`);
grd.addColorStop(1, 'transparent');
ctx.fillStyle = grd;
ctx.fillRect(0, 0, width, height);

// Update and draw rings
for (let i = rings.length - 1; i >= 0; i--) {
  const r = rings[i];
  r.radius += r.speed;
  r.alpha *= 0.992;

  if (r.radius > maxRadius || r.alpha < 0.01) {
    rings.splice(i, 1);
    continue;
  }

  ctx.strokeStyle = r.color;
  ctx.globalAlpha = r.alpha * (1 - r.radius / maxRadius);
  ctx.lineWidth = r.lineWidth * (1 - r.radius / maxRadius * 0.5);
  ctx.beginPath();
  ctx.arc(cx, cy, r.radius, 0, Math.PI * 2);
  ctx.stroke();
}

// Cap ring count
if (rings.length > 60) rings.splice(0, rings.length - 60);
ctx.globalAlpha = 1;
```

---

### Plasma / Psychedelic
Classic demoscene plasma with sine interference patterns. Colors shift with time and audio events.

```js
// Plasma / Psychedelic — sine wave interference modulated by audio
const t = time * 0.001;
const step = 6; // pixel step for performance

// Calculate audio energy
let energy = 0;
let spectralShift = 0;
for (const ev of events) {
  const age = (time - ev.triggeredAt) / 1000;
  const decay = Math.max(0, 1 - age / Math.max(ev.duration, 0.3));
  energy += decay * ev.gain;
  spectralShift += (ev.note || 60) * decay * 0.01;
}
energy = Math.min(energy, 4);

// Plasma parameters — audio modulates frequency and palette
const freq1 = 0.013 + energy * 0.005;
const freq2 = 0.018 + energy * 0.003;
const freq3 = 0.008;
const saturation = 60 + energy * 30;
const lightness = 25 + energy * 15;

for (let y = 0; y < height; y += step) {
  for (let x = 0; x < width; x += step) {
    const v1 = Math.sin(x * freq1 + t * 1.3);
    const v2 = Math.sin(y * freq2 + t * 0.8);
    const v3 = Math.sin((x * freq3 + y * freq3) + t * 0.5);
    const v4 = Math.sin(Math.sqrt((x - width / 2) * (x - width / 2) + (y - height / 2) * (y - height / 2)) * 0.02 - t * 1.5);

    const value = (v1 + v2 + v3 + v4) / 4;
    const hue = (value * 120 + t * 40 + spectralShift * 30) % 360;

    ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    ctx.fillRect(x, y, step, step);
  }
}
```

---

### Fire
Bottom-up fire effect with audio-driven intensity. Cellular automaton approach with warm palette.

```js
// Fire — bottom-up fire effect reacting to audio intensity
const state = ctx.canvas._fireState = ctx.canvas._fireState || { buffer: null, w: 0, h: 0 };
const cellW = 4;
const cellH = 4;
const cols = Math.ceil(width / cellW);
const rows = Math.ceil(height / cellH);

// Reinitialize buffer if size changed
if (state.w !== cols || state.h !== rows) {
  state.w = cols;
  state.h = rows;
  state.buffer = new Float32Array(cols * rows);
}
const buf = state.buffer;

// Calculate audio intensity
let intensity = 0;
for (const ev of events) {
  const age = (time - ev.triggeredAt) / 1000;
  const decay = Math.max(0, 1 - age / Math.max(ev.duration, 0.3));
  intensity += decay * ev.gain;
}
intensity = Math.min(intensity, 5);

// Seed bottom rows with heat based on audio
for (let x = 0; x < cols; x++) {
  const base = 0.3 + intensity * 0.15;
  buf[(rows - 1) * cols + x] = Math.min(1, base + Math.random() * (0.3 + intensity * 0.12));
  buf[(rows - 2) * cols + x] = Math.min(1, base * 0.8 + Math.random() * (0.2 + intensity * 0.1));
}

// Propagate fire upward with cooling
for (let y = 0; y < rows - 2; y++) {
  for (let x = 0; x < cols; x++) {
    const below = (y + 1) * cols;
    const xl = Math.max(0, x - 1);
    const xr = Math.min(cols - 1, x + 1);
    const avg = (buf[below + xl] + buf[below + x] + buf[below + xr] + buf[(y + 2) * cols + x]) / 4;
    const cooling = 0.015 + Math.random() * 0.01;
    buf[y * cols + x] = Math.max(0, avg - cooling);
  }
}

// Render buffer to canvas
for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    const val = buf[y * cols + x];
    if (val < 0.01) continue;

    // Fire color palette: black -> red -> orange -> yellow -> white
    let r, g, b;
    if (val < 0.33) {
      const t = val / 0.33;
      r = Math.floor(t * 255);
      g = 0;
      b = 0;
    } else if (val < 0.66) {
      const t = (val - 0.33) / 0.33;
      r = 255;
      g = Math.floor(t * 180);
      b = 0;
    } else {
      const t = (val - 0.66) / 0.34;
      r = 255;
      g = 180 + Math.floor(t * 75);
      b = Math.floor(t * 180);
    }

    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
  }
}
```

---

### Water Ripples
Ripples emanate from random positions on each trigger, expanding outward with decreasing opacity.

```js
// Water Ripples — concentric circles expand from trigger points
const state = ctx.canvas._rippleState = ctx.canvas._rippleState || { ripples: [] };
const ripples = state.ripples;
const colors = ['#00ff41', '#00d4ff', '#ff00ff', '#ffcc00', '#ff3333'];

// Spawn ripples for new events
for (const ev of events) {
  const age = (time - ev.triggeredAt) / 1000;
  if (age < 0.05) {
    ripples.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0,
      maxRadius: 80 + ev.gain * 150,
      speed: 1.5 + ev.gain * 2,
      color: colors[ev.s.charCodeAt(0) % colors.length],
      ringCount: 3 + Math.floor(ev.gain * 3),
      life: 1
    });
  }
}

// Draw water surface tint
ctx.fillStyle = 'rgba(0, 20, 40, 0.15)';
ctx.fillRect(0, 0, width, height);

// Update and draw ripples
for (let i = ripples.length - 1; i >= 0; i--) {
  const r = ripples[i];
  r.radius += r.speed;
  r.life = Math.max(0, 1 - r.radius / r.maxRadius);

  if (r.life <= 0) {
    ripples.splice(i, 1);
    continue;
  }

  // Draw concentric rings
  for (let ring = 0; ring < r.ringCount; ring++) {
    const ringRadius = r.radius - ring * 12;
    if (ringRadius <= 0) continue;

    const ringAlpha = r.life * (1 - ring / r.ringCount) * 0.7;
    ctx.strokeStyle = r.color;
    ctx.globalAlpha = ringAlpha;
    ctx.lineWidth = 1.5 - ring * 0.2;
    ctx.beginPath();
    ctx.arc(r.x, r.y, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// Cap ripple count
if (ripples.length > 40) ripples.splice(0, ripples.length - 40);
ctx.globalAlpha = 1;
```

---

### Plasma Ball / Energy Orb
Central glowing orb with lightning tendrils that extend outward on beats.

```js
// Plasma Ball / Energy Orb — central orb with lightning tendrils
const cx = width / 2;
const cy = height / 2;
const t = time * 0.001;

// Calculate energy from events
let energy = 0;
let maxGain = 0;
for (const ev of events) {
  const age = (time - ev.triggeredAt) / 1000;
  const decay = Math.max(0, 1 - age / Math.max(ev.duration, 0.3));
  energy += decay * ev.gain;
  maxGain = Math.max(maxGain, decay * ev.gain);
}
energy = Math.min(energy, 4);

// Outer glow
const orbRadius = 30 + energy * 15;
const glowRadius = orbRadius * 3;
const glow = ctx.createRadialGradient(cx, cy, orbRadius * 0.5, cx, cy, glowRadius);
glow.addColorStop(0, `rgba(100, 0, 255, ${0.15 + energy * 0.08})`);
glow.addColorStop(0.5, `rgba(180, 0, 255, ${0.05 + energy * 0.03})`);
glow.addColorStop(1, 'transparent');
ctx.fillStyle = glow;
ctx.fillRect(0, 0, width, height);

// Draw lightning tendrils
const tendrilCount = 6 + Math.floor(energy * 4);
const colors = ['#00d4ff', '#ff00ff', '#00ff41', '#ffcc00'];

for (let i = 0; i < tendrilCount; i++) {
  const baseAngle = (i / tendrilCount) * Math.PI * 2 + t * 0.3;
  const length = orbRadius + maxGain * 120 + Math.sin(t * 3 + i) * 30;
  const segments = 12;
  const color = colors[i % colors.length];

  ctx.strokeStyle = color;
  ctx.lineWidth = 1 + energy * 0.5;
  ctx.globalAlpha = 0.4 + maxGain * 0.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy);

  for (let s = 1; s <= segments; s++) {
    const frac = s / segments;
    const angle = baseAngle + (Math.random() - 0.5) * 0.8 * frac;
    const dist = frac * length;
    const jitter = (Math.random() - 0.5) * 15 * frac;
    const px = cx + Math.cos(angle) * dist + jitter;
    const py = cy + Math.sin(angle) * dist + jitter;
    ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Glow pass
  ctx.lineWidth = 3 + energy;
  ctx.globalAlpha = 0.1 + maxGain * 0.1;
  ctx.stroke();
}

// Central orb with radial gradient
const orbGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbRadius);
orbGrad.addColorStop(0, `rgba(255, 255, 255, ${0.7 + energy * 0.1})`);
orbGrad.addColorStop(0.4, `rgba(180, 100, 255, ${0.5 + energy * 0.1})`);
orbGrad.addColorStop(1, 'rgba(80, 0, 200, 0)');
ctx.globalAlpha = 1;
ctx.fillStyle = orbGrad;
ctx.beginPath();
ctx.arc(cx, cy, orbRadius, 0, Math.PI * 2);
ctx.fill();
```

---

### Matrix Rain
Falling columns of characters with speed and brightness pulsing on audio events.

```js
// Matrix Rain — falling character columns reacting to audio
const state = ctx.canvas._matrixState = ctx.canvas._matrixState || { columns: null, w: 0 };
const fontSize = 14;
const colWidth = fontSize;
const numCols = Math.ceil(width / colWidth);

// Initialize columns
if (!state.columns || state.w !== numCols) {
  state.w = numCols;
  state.columns = [];
  for (let i = 0; i < numCols; i++) {
    state.columns.push({
      y: Math.random() * height,
      speed: 1 + Math.random() * 3,
      chars: [],
      active: Math.random() > 0.5,
      brightness: 0.5 + Math.random() * 0.5
    });
  }
}
const columns = state.columns;

// Calculate audio energy
let energy = 0;
let newTriggers = 0;
for (const ev of events) {
  const age = (time - ev.triggeredAt) / 1000;
  const decay = Math.max(0, 1 - age / Math.max(ev.duration, 0.3));
  energy += decay * ev.gain;
  if (age < 0.05) newTriggers++;
}
energy = Math.min(energy, 4);

// Activate random columns on new triggers
for (let t = 0; t < newTriggers; t++) {
  const idx = Math.floor(Math.random() * numCols);
  columns[idx].active = true;
  columns[idx].y = 0;
  columns[idx].speed = 2 + Math.random() * 3 + energy;
}

// Semi-transparent overlay for trail effect
ctx.fillStyle = `rgba(10, 10, 15, ${0.12 - energy * 0.01})`;
ctx.fillRect(0, 0, width, height);

ctx.font = `${fontSize}px monospace`;

// Characters pool
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*+=-~';

for (let i = 0; i < numCols; i++) {
  const col = columns[i];
  if (!col.active) continue;

  col.y += col.speed * (1 + energy * 0.3);

  // Draw the leading bright character
  const char = chars[Math.floor(Math.random() * chars.length)];
  const x = i * colWidth;

  // Bright head
  ctx.fillStyle = `rgba(180, 255, 180, ${0.9 + energy * 0.05})`;
  ctx.fillText(char, x, col.y);

  // Trail characters
  const trailLen = 8 + Math.floor(energy * 4);
  for (let j = 1; j < trailLen; j++) {
    const ty = col.y - j * fontSize;
    if (ty < 0) break;
    const alpha = (1 - j / trailLen) * (0.5 + energy * 0.1);
    ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
    const tc = chars[Math.floor(Math.random() * chars.length)];
    ctx.fillText(tc, x, ty);
  }

  // Reset column when off screen
  if (col.y - fontSize * 15 > height) {
    col.active = Math.random() > 0.3;
    col.y = 0;
    col.speed = 1 + Math.random() * 3;
  }
}
```

---

### Spectrum Bars
Vertical frequency bars that bounce with events, with gradient colors and mirror effect.

```js
// Spectrum Bars — vertical bars that react to events with mirror effect
const state = ctx.canvas._specState = ctx.canvas._specState || { bars: new Float32Array(32), targets: new Float32Array(32) };
const bars = state.bars;
const targets = state.targets;
const barCount = 32;
const barWidth = width / barCount * 0.75;
const gap = width / barCount * 0.25;
const maxBarHeight = height * 0.4;

// Decay targets
for (let i = 0; i < barCount; i++) {
  targets[i] *= 0.92;
}

// Map events to bars
for (const ev of events) {
  const age = (time - ev.triggeredAt) / 1000;
  const decay = Math.max(0, 1 - age / Math.max(ev.duration, 0.3));
  const amp = decay * ev.gain;

  // Map sound to bar index based on note or name hash
  const baseIdx = (ev.note || ev.s.charCodeAt(0)) % barCount;
  const spread = 2;
  for (let d = -spread; d <= spread; d++) {
    const idx = (baseIdx + d + barCount) % barCount;
    const falloff = 1 - Math.abs(d) / (spread + 1);
    targets[idx] = Math.max(targets[idx], amp * falloff);
  }
}

// Smooth bars toward targets
for (let i = 0; i < barCount; i++) {
  bars[i] += (targets[i] - bars[i]) * 0.25;
}

const centerY = height / 2;

// Draw bars (upper half + mirrored lower half)
for (let i = 0; i < barCount; i++) {
  const x = i * (barWidth + gap) + gap / 2;
  const h = bars[i] * maxBarHeight;
  if (h < 1) continue;

  // Color gradient from warm (bottom) to cool (top)
  const gradient = ctx.createLinearGradient(x, centerY, x, centerY - h);
  gradient.addColorStop(0, '#ff3333');
  gradient.addColorStop(0.3, '#ffcc00');
  gradient.addColorStop(0.6, '#00ff41');
  gradient.addColorStop(1, '#00d4ff');

  // Upper bars
  ctx.fillStyle = gradient;
  ctx.fillRect(x, centerY - h, barWidth, h);

  // Mirror bars (lower half, dimmer)
  const mirrorGrad = ctx.createLinearGradient(x, centerY, x, centerY + h);
  mirrorGrad.addColorStop(0, 'rgba(255, 51, 51, 0.4)');
  mirrorGrad.addColorStop(0.5, 'rgba(255, 204, 0, 0.2)');
  mirrorGrad.addColorStop(1, 'rgba(0, 212, 255, 0.05)');

  ctx.fillStyle = mirrorGrad;
  ctx.fillRect(x, centerY, barWidth, h * 0.7);
}

// Center line
ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(0, centerY);
ctx.lineTo(width, centerY);
ctx.stroke();
```

---

### Waveform Scope
Oscilloscope-style waveform with overlapping sine waves driven by active events.

```js
// Waveform Scope — oscilloscope with event-driven sine waves
const cx = width / 2;
const cy = height / 2;
const t = time * 0.001;
const colors = ['#00ff41', '#00d4ff', '#ff00ff', '#ffcc00', '#ff3333'];

// Background grid
ctx.strokeStyle = 'rgba(0, 212, 255, 0.06)';
ctx.lineWidth = 0.5;
for (let y = 0; y < height; y += 40) {
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.stroke();
}
for (let x = 0; x < width; x += 40) {
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, height);
  ctx.stroke();
}

// Draw waveforms for each active event
let waveIdx = 0;
for (const ev of events) {
  const age = (time - ev.triggeredAt) / 1000;
  const decay = Math.max(0, 1 - age / Math.max(ev.duration, 0.5));
  if (decay < 0.01) continue;

  const amplitude = decay * ev.gain * height * 0.25;
  const freq = 0.01 + ((ev.note || 60) - 40) * 0.0008;
  const phase = t * (1 + waveIdx * 0.3) + ev.triggeredAt * 0.001;
  const color = colors[waveIdx % colors.length];

  // Glow pass (wider, lower opacity)
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.globalAlpha = decay * 0.15;
  ctx.beginPath();
  for (let x = 0; x < width; x += 2) {
    const y = cy + Math.sin(x * freq + phase) * amplitude
                  + Math.sin(x * freq * 2.1 + phase * 1.5) * amplitude * 0.3;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Sharp pass
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = decay * 0.7;
  ctx.beginPath();
  for (let x = 0; x < width; x += 2) {
    const y = cy + Math.sin(x * freq + phase) * amplitude
                  + Math.sin(x * freq * 2.1 + phase * 1.5) * amplitude * 0.3;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  waveIdx++;
  if (waveIdx > 6) break; // limit wave count for performance
}

ctx.globalAlpha = 1;

// Center line
ctx.strokeStyle = 'rgba(0, 255, 65, 0.15)';
ctx.lineWidth = 0.5;
ctx.beginPath();
ctx.moveTo(0, cy);
ctx.lineTo(width, cy);
ctx.stroke();
```

---

### Starfield
Stars flying toward the camera with speed increasing on beats.

```js
// Starfield — classic perspective starfield reacting to audio
const state = ctx.canvas._starState = ctx.canvas._starState || { stars: [] };
const stars = state.stars;
const cx = width / 2;
const cy = height / 2;
const maxStars = 300;

// Calculate energy
let energy = 0;
for (const ev of events) {
  const age = (time - ev.triggeredAt) / 1000;
  const decay = Math.max(0, 1 - age / Math.max(ev.duration, 0.3));
  energy += decay * ev.gain;
}
energy = Math.min(energy, 4);

// Initialize stars if needed
while (stars.length < maxStars) {
  stars.push({
    x: (Math.random() - 0.5) * width * 3,
    y: (Math.random() - 0.5) * height * 3,
    z: Math.random() * 1500 + 100
  });
}

// Base speed increases with energy
const speed = 3 + energy * 8;

for (let i = 0; i < stars.length; i++) {
  const star = stars[i];

  // Move star toward camera
  star.z -= speed;

  // Reset star if behind camera
  if (star.z <= 1) {
    star.x = (Math.random() - 0.5) * width * 3;
    star.y = (Math.random() - 0.5) * height * 3;
    star.z = 1500;
  }

  // Perspective projection
  const sx = cx + star.x / star.z * 200;
  const sy = cy + star.y / star.z * 200;

  // Previous position for streaks
  const pz = star.z + speed;
  const px = cx + star.x / pz * 200;
  const py = cy + star.y / pz * 200;

  // Skip if off screen
  if (sx < 0 || sx > width || sy < 0 || sy > height) continue;

  // Brightness based on depth
  const brightness = Math.min(1, (1500 - star.z) / 1500);
  const size = brightness * 2.5;

  // Color: white to cyan with energy
  const g = Math.floor(200 + energy * 55);
  const b = Math.floor(220 + energy * 35);
  ctx.strokeStyle = `rgba(${200 + Math.floor(brightness * 55)}, ${g}, ${b}, ${brightness})`;
  ctx.lineWidth = size;

  // Draw streak line
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(sx, sy);
  ctx.stroke();
}
```

---

### Kaleidoscope
Shapes drawn from events then mirrored in a multi-fold symmetry pattern.

```js
// Kaleidoscope — 8-fold symmetry with shapes driven by events
const cx = width / 2;
const cy = height / 2;
const t = time * 0.001;
const folds = 8;
const colors = ['#00ff41', '#00d4ff', '#ff00ff', '#ffcc00', '#ff3333'];

// Collect shape data from events
const shapes = [];
for (const ev of events) {
  const age = (time - ev.triggeredAt) / 1000;
  const decay = Math.max(0, 1 - age / Math.max(ev.duration, 0.5));
  if (decay < 0.01) continue;

  shapes.push({
    angle: ((ev.note || ev.s.charCodeAt(0)) * 0.1 + t * 0.2) % (Math.PI * 2 / folds),
    dist: 20 + decay * ev.gain * Math.min(width, height) * 0.3,
    size: 3 + decay * ev.gain * 15,
    color: colors[ev.s.charCodeAt(0) % colors.length],
    alpha: decay * 0.7,
    type: ev.s.charCodeAt(0) % 3 // 0=circle, 1=rect, 2=triangle
  });
}

// Add ambient rotating shapes for baseline visual interest
const ambientCount = 3;
for (let i = 0; i < ambientCount; i++) {
  shapes.push({
    angle: t * 0.1 + i * 0.7,
    dist: 40 + Math.sin(t + i * 2) * 30,
    size: 4,
    color: colors[i % colors.length],
    alpha: 0.15,
    type: i % 3
  });
}

ctx.save();
ctx.translate(cx, cy);

// Draw each shape reflected across all folds
for (const shape of shapes) {
  for (let fold = 0; fold < folds; fold++) {
    const angle = shape.angle + (fold / folds) * Math.PI * 2;

    // Normal and mirrored
    for (let mirror = 0; mirror < 2; mirror++) {
      const a = mirror === 0 ? angle : -angle;
      const sx = Math.cos(a) * shape.dist;
      const sy = Math.sin(a) * shape.dist;

      ctx.globalAlpha = shape.alpha;
      ctx.fillStyle = shape.color;

      if (shape.type === 0) {
        // Circle
        ctx.beginPath();
        ctx.arc(sx, sy, shape.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (shape.type === 1) {
        // Rotated rectangle
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(a + t);
        ctx.fillRect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
        ctx.restore();
      } else {
        // Triangle
        ctx.beginPath();
        for (let v = 0; v < 3; v++) {
          const va = v / 3 * Math.PI * 2 + t;
          const vx = sx + Math.cos(va) * shape.size;
          const vy = sy + Math.sin(va) * shape.size;
          if (v === 0) ctx.moveTo(vx, vy);
          else ctx.lineTo(vx, vy);
        }
        ctx.closePath();
        ctx.fill();
      }
    }
  }
}

ctx.restore();
ctx.globalAlpha = 1;
```

---

## Tips for Custom Visualizations

1. **Persistent state**: Use `ctx.canvas._myState = ctx.canvas._myState || {...}` for data that survives across frames (particle arrays, previous positions, accumulators).
2. **Event age/decay**: Always compute `age = (time - ev.triggeredAt) / 1000` and `decay = Math.max(0, 1 - age / ev.duration)` to animate events over their lifetime.
3. **Performance**: Use pixel stepping (e.g., `step = 4`) for full-canvas effects. Cap array sizes. Avoid allocating objects every frame if possible.
4. **Color from sound**: Hash `ev.s.charCodeAt(0)` or use `ev.note` to pick from the Phosphor Dark palette consistently per sound.
5. **Layered glow**: Draw the same path twice — once wide and transparent, once thin and bright — for a neon glow effect.
6. **Energy aggregation**: Sum `decay * ev.gain` across all events for overall energy. Use `Math.min()` to cap it so visuals stay controlled.
