# Hydra Visual Synthesis Reference

Hydra is a GPU shader live coding language for real-time visuals. In this app, Hydra code runs in the visualization panel. Use the `update_visualization` tool to send Hydra code — never just display it in text.

## Core Source Functions

Every Hydra patch starts with a source function. These create the initial texture.

### `osc(freq, sync, offset)` — Oscillator
```js
osc(10, 0.1, 0.5).out()
```
- `freq`: frequency of oscillation (default 60)
- `sync`: sync with other oscillators (default 0.1)
- `offset`: color offset (default 0)

### `shape(sides, radius, smoothing)` — Polygon Shape
```js
shape(4, 0.5, 0.01).out()
```
- `sides`: number of sides (3=triangle, 4=square, etc.)
- `radius`: size (0-1)
- `smoothing`: edge blur

### `gradient(speed)` — Color Gradient
```js
gradient(0.5).out()
```

### `noise(scale, offset)` — Perlin Noise
```js
noise(10, 0.1).out()
```

### `voronoi(scale, speed, blending)` — Voronoi Cells
```js
voronoi(5, 0.3, 0.3).out()
```

### `solid(r, g, b, a)` — Solid Color
```js
solid(1, 0, 0.5, 1).out()
```

### `src(texture)` — Use a Texture/Output as Source
```js
src(o0).scale(1.01).out()
```
Used for feedback loops and multi-output compositions.

## Transform Methods

All transforms are chainable on any source.

### Color Transforms
- `.color(r, g, b)` — multiply RGB channels
- `.saturate(amount)` — adjust saturation (1=normal, 0=grayscale, >1=oversaturated)
- `.brightness(val)` — adjust brightness
- `.contrast(val)` — adjust contrast
- `.hue(val)` — shift hue (0-1 range)
- `.colorama(amount)` — HSV color shifting/cycling
- `.invert(amount)` — invert colors (1=full invert)
- `.luma(threshold, tolerance)` — luminance-based mask

### Geometry Transforms
- `.rotate(angle, speed)` — rotate (angle in radians, speed for auto-rotation)
- `.scale(amount, xMult, yMult)` — scale (1=normal, >1=zoom in, <1=zoom out)
- `.pixelate(x, y)` — reduce resolution
- `.repeat(x, y, offsetX, offsetY)` — tile/repeat the texture
- `.kaleid(nSides)` — kaleidoscope effect
- `.scroll(scrollX, scrollY, speedX, speedY)` — scroll texture
- `.scrollX(amount, speed)` — horizontal scroll
- `.scrollY(amount, speed)` — vertical scroll

### Blend Operations
Combine two textures together:
- `.add(texture, amount)` — additive blend
- `.mult(texture, amount)` — multiplicative blend
- `.blend(texture, amount)` — linear blend/crossfade
- `.diff(texture)` — absolute difference
- `.layer(texture)` — layer on top (respects alpha)
- `.mask(texture)` — use texture as alpha mask

### Modulate Operations
Use one texture to distort another:
- `.modulate(texture, amount)` — general distortion
- `.modulateScale(texture, multiple, offset)` — modulate scale
- `.modulateRotate(texture, multiple, offset)` — modulate rotation
- `.modulateHue(texture, amount)` — modulate hue
- `.modulateKaleid(texture, nSides)` — modulate kaleidoscope
- `.modulatePixelate(texture, multiple, offset)` — modulate pixelation
- `.modulateScrollX(texture, scrollX, speed)` — modulate horizontal scroll
- `.modulateScrollY(texture, scrollY, speed)` — modulate vertical scroll

## Outputs

Hydra has 4 output buffers: `o0`, `o1`, `o2`, `o3`.

```js
// Render to specific output
osc(10).out(o0)
noise(5).out(o1)

// Show a specific output (default is o0)
render(o1)

// Show all 4 outputs in a grid
render()
```

Default `.out()` with no argument sends to `o0`.

## Audio-Reactive Variables

In this app, `window.audio` provides real-time audio analysis data. Use these values inside arrow functions to make visuals react to the music.

### Available Properties
```
audio.rms            — raw volume per frame (0-1, jittery)
audio.energy         — raw energy per frame
audio.spectral       — spectral centroid (frequency brightness)
audio.fft            — Float32Array[256] frequency bins

audio.rmsSmooth      — smoothed RMS (fast attack, slow release — good for continuous modulation)
audio.energySmooth   — smoothed energy (fast attack, slow release)

audio.rmsPeak        — peak amplitude envelope (instant jump to spike, exponential decay ~120ms half-life)
audio.energyPeak     — peak energy envelope (same behavior)

audio.beat           — beat pulse (jumps to 1.0 on beat, decays smoothly over ~80ms — visible across multiple Hydra frames)
```

### Best Values for Amplitude-Synced Visuals
- **`rmsPeak`** — Best for reacting to amplitude spikes. Instantly jumps to the peak value and decays. Use for scale pulses, brightness flashes, shape size.
- **`beat`** — Best for kick/snare response. Decays over multiple frames so Hydra's render loop actually sees it. Use for kaleidoscope changes, rotation jumps, color flashes.
- **`rmsSmooth`** — Best for continuous modulation (filter sweeps, slow color changes). Responds quickly to volume increases, releases slowly.
- **`energyPeak`** — Like rmsPeak but weighted toward overall spectral energy. Good for modulation depth.

### Usage — Always Use Arrow Functions
Parameters can be static numbers OR arrow functions `() => expr` for animation and reactivity:

```js
// CORRECT — arrow function, re-evaluated each frame
osc(10, 0.1, () => audio.rmsSmooth * 2).out()

// WRONG — evaluates once and stays fixed
osc(10, 0.1, audio.rmsSmooth * 2).out()
```

## Common Patterns for Music Visualization

### Beat-Reactive Pulse
Flash brightness and scale on every beat:
```js
osc(10, 0.1, 0.5)
  .scale(() => 1 + audio.beat * 0.2)
  .brightness(() => audio.beat * 0.3)
  .out()
```

### Frequency-Mapped Color
Shift color temperature based on spectral centroid:
```js
noise(3, 0.1)
  .hue(() => audio.spectral * 0.5)
  .saturate(1.5)
  .out()
```

### Energy-Driven Complexity
Increase modulation depth with energy:
```js
osc(10, 0.1, 0.5)
  .modulate(noise(3), () => audio.energySmooth * 0.3)
  .out()
```

### Ambient Mood
```js
noise(3, 0.1)
  .modulate(osc(2, 0.1), 0.1)
  .color(0.3, 0.4, 0.8)
  .brightness(() => audio.rmsSmooth * 0.2)
  .saturate(0.7)
  .out()
```

### Aggressive Mood
```js
osc(40, 0.1, 0)
  .modulate(noise(4), () => audio.energy * 0.4)
  .kaleid(4)
  .color(1, 0.3, 0.2)
  .brightness(() => audio.beat * 0.5)
  .pixelate(30, 30)
  .out()
```

### Minimal Mood
```js
shape(4, 0.3, 0.01)
  .rotate(() => audio.rmsSmooth * 3.14)
  .scale(() => 0.5 + audio.rmsSmooth * 0.5)
  .color(0.9, 0.9, 1)
  .out()
```

## Critical Rules for Hydra Code Generation

1. **Always use `update_visualization` tool** — never just display Hydra code in text, it won't render.
2. **Parameters can be static numbers OR arrow functions** — use `() => expr` for animation and audio reactivity.
3. **Always end with `.out()`** — defaults to `o0` if no argument given.
4. **Keep shaders performant** — avoid excessive `.modulate()` chains (max 3-4 deep).
5. **Available outputs**: `o0`, `o1`, `o2`, `o3`. Available sources: `s0`, `s1`, `s2`, `s3`.
6. **Arrow functions for `audio.*`** values are what make visuals react to the music. Without the arrow function wrapper, the value is read once and never updates.
