export interface ShaderPreset {
  id: string;
  name: string;
  category: 'audio-reactive' | 'ambient' | 'geometric' | 'feedback';
  code: string;
}

// All presets use window.audio which provides:
//   rms, energy, spectral  — raw per-frame values
//   rmsSmooth, energySmooth — fast attack, slow release
//   rmsPeak, energyPeak     — instant jump to peak, exponential decay (best for spike response)
//   beat                    — 1.0 on beat, decays smoothly over ~80ms (visible across frames)
//   fft                    — Float32Array[256] frequency bins

export const SHADER_PRESETS: ShaderPreset[] = [
  // Audio-Reactive — strong response to amplitude spikes
  {
    id: 'audio-reactive-1',
    name: 'Pulse Wave',
    category: 'audio-reactive',
    code: `osc(10, 0.1, () => window.audio.rmsPeak * 4)
      .color(0.9, 0.2, () => window.audio.spectral / 800)
      .rotate(() => window.audio.energySmooth * 0.5)
      .scale(() => 1 + window.audio.beat * 0.5)
      .brightness(() => window.audio.beat * 0.2)
      .out()`,
  },
  {
    id: 'audio-reactive-2',
    name: 'Beat Kaleidoscope',
    category: 'audio-reactive',
    code: `osc(8, 0.2, () => window.audio.rmsPeak * 3)
      .kaleid(() => 3 + window.audio.beat * 6)
      .color(() => window.audio.beat * 0.5, () => window.audio.rmsSmooth, 0.8)
      .rotate(() => window.audio.energySmooth * 0.4)
      .scale(() => 1 + window.audio.rmsPeak * 0.3)
      .out()`,
  },
  {
    id: 'audio-reactive-3',
    name: 'Frequency Noise',
    category: 'audio-reactive',
    code: `noise(() => 3 + window.audio.energyPeak * 15, () => window.audio.rmsSmooth * 0.8)
      .color(() => window.audio.spectral / 1500, 0.4, 0.8)
      .modulate(osc(2, 0.1), () => window.audio.rmsPeak * 0.4)
      .brightness(() => window.audio.beat * 0.25)
      .contrast(() => 1 + window.audio.rmsPeak * 0.5)
      .out()`,
  },

  // Ambient — gentle response, driven by smoothed values
  {
    id: 'ambient-1',
    name: 'Deep Ocean',
    category: 'ambient',
    code: `noise(3, 0.05)
      .color(0.1, 0.3, 0.8)
      .modulate(osc(1, 0.08), () => 0.1 + window.audio.rmsSmooth * 0.15)
      .rotate(0.005)
      .scale(() => 1.01 + window.audio.rmsPeak * 0.04)
      .brightness(() => window.audio.rmsSmooth * 0.15 - 0.05)
      .out()`,
  },
  {
    id: 'ambient-2',
    name: 'Aurora',
    category: 'ambient',
    code: `gradient(0.1)
      .color(0.2, 0.8, 0.5)
      .modulate(noise(2, 0.03), () => 0.15 + window.audio.rmsSmooth * 0.1)
      .saturate(() => 1.5 + window.audio.rmsPeak)
      .hue(() => window.audio.spectral / 3000)
      .brightness(() => window.audio.beat * 0.1)
      .out()`,
  },

  // Geometric — sharp response to beats
  {
    id: 'geometric-1',
    name: 'Crystal Grid',
    category: 'geometric',
    code: `shape(4, () => 0.2 + window.audio.rmsPeak * 0.3, 0.01)
      .repeat(5, 5)
      .rotate(() => window.audio.energySmooth * 0.3)
      .kaleid(() => 4 + window.audio.beat * 4)
      .color(0, () => window.audio.rmsPeak, 0.9)
      .scale(() => 1 + window.audio.beat * 0.3)
      .out()`,
  },
  {
    id: 'geometric-2',
    name: 'Voronoi Cells',
    category: 'geometric',
    code: `voronoi(8, () => window.audio.energyPeak * 0.8, 0.3)
      .color(() => window.audio.rmsPeak, 0.2, 0.6)
      .modulate(noise(1), () => window.audio.rmsPeak * 0.15)
      .rotate(() => window.audio.energySmooth * 0.15)
      .brightness(() => window.audio.beat * 0.15)
      .out()`,
  },

  // Feedback — trails respond to amplitude spikes
  {
    id: 'feedback-1',
    name: 'Echo Tunnel',
    category: 'feedback',
    code: `src(o0)
      .scale(() => 0.99 - window.audio.beat * 0.02)
      .rotate(() => 0.01 + window.audio.beat * 0.08)
      .layer(
        osc(4, 0.1, () => window.audio.rmsPeak * 3)
          .mask(shape(4, () => 0.05 + window.audio.rmsPeak * 0.4, 0.01))
      )
      .colorama(() => window.audio.spectral / 4000)
      .brightness(() => -0.01 + window.audio.beat * 0.1)
      .out()`,
  },
  {
    id: 'feedback-2',
    name: 'Glitch Mirror',
    category: 'feedback',
    code: `src(o0)
      .scale(0.98)
      .modulate(noise(3), () => window.audio.energyPeak * 0.04)
      .layer(
        osc(20, 0, 0)
          .pixelate(() => 10 + window.audio.beat * 50, () => 10 + window.audio.beat * 50)
          .mask(shape(3, () => window.audio.rmsPeak * 0.5, 0.01))
      )
      .brightness(() => -0.02 + window.audio.beat * 0.15)
      .out()`,
  },
];
