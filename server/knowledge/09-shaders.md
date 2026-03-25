# Shader Recipes & Techniques

Ready-to-use Hydra shader recipes organized by genre, technique, and use case. Adapt these as starting points.

## Genre-Matched Visuals

### Ambient / Downtempo
Slow morphing noise, soft colors, gentle modulation:
```js
noise(3, 0.05)
  .modulate(osc(2, 0.05), 0.08)
  .color(0.3, 0.4, 0.7)
  .saturate(0.6)
  .brightness(() => audio.rmsSmooth * 0.15)
  .rotate(0, 0.02)
  .out()
```

### Techno / House
Sharp geometric shapes, beat-reactive kaleidoscope, high contrast:
```js
osc(20, 0.1, 0.5)
  .kaleid(() => 4 + audio.beat * 4)
  .rotate(() => audio.rmsSmooth * 6.28)
  .contrast(1.5)
  .brightness(() => audio.beat * 0.4)
  .color(0.8, 0.2, 1)
  .out()
```

### Drum & Bass
Fast pixelation, aggressive color shifts, voronoi with speed:
```js
voronoi(8, () => audio.energy * 2, 0.5)
  .colorama(() => audio.rmsSmooth * 0.15)
  .pixelate(() => 10 + audio.beat * 30, () => 10 + audio.beat * 30)
  .color(1, 0.4, 0.1)
  .contrast(1.8)
  .brightness(() => audio.beat * 0.3)
  .out()
```

### Lo-fi / Chill
Warm gradients, gentle oscillators, low saturation:
```js
osc(4, 0.05, 0.3)
  .color(0.9, 0.7, 0.5)
  .modulate(noise(2, 0.05), 0.05)
  .saturate(0.5)
  .brightness(() => 0.1 + audio.rmsSmooth * 0.1)
  .rotate(0, 0.01)
  .out()
```

### Experimental
Feedback loops, heavy modulation, unpredictable:
```js
src(o0)
  .scale(1.01)
  .rotate(() => audio.spectral * 0.1)
  .modulate(osc(3), () => audio.energy * 0.2)
  .colorama(() => audio.rmsSmooth * 0.05)
  .brightness(-0.01)
  .blend(noise(3, 0.1).color(0.5, 0.2, 0.8), 0.05)
  .out()
```

## Technique Library

### Feedback Loop
Creates trailing/echo effect. Always include decay to prevent white-out:
```js
src(o0).scale(1.01).rotate(0.01).brightness(-0.01).out()
```

### Color Cycling
Audio-reactive hue shifting:
```js
osc(10, 0.1, 0.5)
  .colorama(() => audio.rmsSmooth * 0.1)
  .out()
```

### Beat Flash
Flash on kicks and transients:
```js
noise(5, 0.1)
  .brightness(() => audio.beat * 0.3)
  .out()
```

### Tunnel Effect
Repeating shapes that create depth:
```js
shape(4, 0.3, 0.01)
  .repeat(10, 10)
  .modulate(noise(2), 0.1)
  .out()
```

### Water / Liquid
Flowing, organic texture:
```js
noise(3, 0.1)
  .modulate(osc(2, 0.05), 0.1)
  .color(0.2, 0.5, 0.8)
  .saturate(1.2)
  .out()
```

### Glitch
Digital distortion aesthetic:
```js
osc(40, 0.1, 0)
  .modulate(noise(4), () => audio.energy * 0.5)
  .pixelate(20, 20)
  .out()
```

### Spiral
Rotating kaleidoscope tunnel:
```js
osc(10, 0.1, 1)
  .kaleid(6)
  .rotate(() => audio.rmsSmooth * 3.14)
  .scale(() => 0.8 + audio.rmsSmooth * 0.3)
  .out()
```

### Plasma
Classic plasma effect:
```js
osc(10, 0.1, 0.8)
  .modulate(osc(3, 0.1, 0.5), 0.3)
  .color(1, 0.5, 0.3)
  .hue(() => audio.spectral * 0.3)
  .out()
```

## Combining Audio + Visuals — Best Practices

### Mapping Guide

| Audio Property | Best Used For | Character |
|---|---|---|
| `audio.rmsPeak` | Scale pulse, brightness flash, shape size | **Best for amplitude spikes** — instant jump, smooth decay |
| `audio.beat` | Kaleid changes, rotation jumps, color flash | **Best for kick/snare response** — decays over ~80ms, visible across frames |
| `audio.rmsSmooth` | Rotation, color shifts, filter modulation | Smoothed volume — fast attack, slow release |
| `audio.energyPeak` | Modulation depth, distortion amount | Energy spikes with decay |
| `audio.energySmooth` | Repeat count, kaleid sides, complexity | Smoothed intensity — gradual |
| `audio.spectral` | Hue, color temperature | Frequency content — high=bright, low=dark |
| `audio.rms` | Direct amplitude (jittery) | Raw per-frame value — use rmsPeak instead for visual response |

### Which Values to Use
- **For amplitude spikes (kicks, transients):** Use `rmsPeak` and `beat` — they have exponential decay so Hydra's render loop actually catches them
- **For continuous modulation:** Use `rmsSmooth` / `energySmooth` — fast attack, slow release
- **Avoid raw `rms`/`energy`** for visual parameters — they're per-frame and too jittery. Use `rmsPeak` or `rmsSmooth` instead

### Always Use Arrow Functions
```js
// CORRECT — updates every frame
osc(10, 0.1, () => audio.rms * 2).out()

// WRONG — captured once, never changes
osc(10, 0.1, audio.rms * 2).out()
```

### Scaling Values
Audio values are typically 0-1. Scale them to useful ranges:
```js
// Subtle effect
() => audio.rmsSmooth * 0.1

// Moderate effect
() => audio.rmsSmooth * 0.5

// Strong effect
() => audio.rmsSmooth * 2

// Offset + scale (keep a minimum value)
() => 0.5 + audio.rmsSmooth * 1.5
```

## Performance Tips

1. **Limit modulate chains to 3-4 max** — each modulate is an extra texture lookup per pixel.
2. **Avoid very high `repeat()` counts** (>20) — these multiply fragment shader work.
3. **Feedback loops (`src(o0)`) accumulate** — always include slight decay:
   - `.scale(0.99)` — slight zoom-out decay
   - `.brightness(-0.01)` — gradual fade to black
   - Both together prevent white-out or frozen frames
4. **Use `pixelate()` to reduce fill rate** if the shader is heavy — fewer pixels to compute.
5. **Simpler is often better** — a clean, well-mapped audio-reactive shader beats a complex one that stutters.
