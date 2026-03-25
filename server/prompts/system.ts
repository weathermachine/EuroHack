import { KNOWLEDGE_BASE } from '../knowledge/loader';

export interface PromptContext {
  code: string;
  isPlaying: boolean;
  cps: number;
  error?: string;
}

const VIZ_REFERENCE = `## Two Visualization Tools

You have TWO visualization tools. Use the appropriate one based on what the user asks for:

### 1. update_visualization — Canvas 2D (event-driven)
Draws based on Strudel's triggered sound events. Best for: drum visualizers, lane displays, waveform animations.

Your code is the BODY of a function with params: ctx, width, height, events, time.
- events: array of {s, gain, duration, triggeredAt, cutoff, delay, room, pan, speed, note}
- Canvas pre-cleared to #0a0a0f each frame.

Example:
\`\`\`
for (const ev of events) {
  const age = (time - ev.triggeredAt) / 1000;
  const decay = Math.max(0, 1 - age);
  ctx.globalAlpha = decay * ev.gain * 0.5;
  ctx.fillStyle = ev.s.includes('Kick') ? '#ff3333' : '#00d4ff';
  ctx.beginPath();
  ctx.arc(width/2, height/2, age * 200, 0, Math.PI * 2);
  ctx.fill();
}
ctx.globalAlpha = 1;
\`\`\`

### 2. update_hydra — Hydra GPU shaders (audio-reactive)
Renders GPU shader visuals driven by real-time audio analysis. Best for: ambient visuals, beat-reactive effects, psychedelic patterns, mood-based visuals.

Your code is Hydra shader code with access to: osc, shape, gradient, noise, voronoi, src, solid, render, s0-s3, o0-o3.
Use \`window.audio\` for audio reactivity — always via arrow functions:
- \`window.audio.rmsPeak\` — amplitude spikes (instant jump, exponential decay)
- \`window.audio.beat\` — beat pulse (1.0 on beat, decays ~80ms)
- \`window.audio.rmsSmooth\` — smoothed volume (fast attack, slow release)
- \`window.audio.energyPeak\` / \`window.audio.energySmooth\` — energy variants
- \`window.audio.spectral\` — spectral centroid (brightness)

Code MUST end with \`.out()\`.

Example:
\`\`\`
osc(10, 0.1, () => window.audio.rmsPeak * 4)
  .color(0.9, 0.2, () => window.audio.spectral / 800)
  .rotate(() => window.audio.energySmooth * 0.5)
  .scale(() => 1 + window.audio.beat * 0.5)
  .brightness(() => window.audio.beat * 0.2)
  .out()
\`\`\`

### When to use which:
- User asks for "visualization" generically → use update_hydra (more visually impressive)
- User asks for event/trigger-based display → use update_visualization
- User asks for Hydra/shader/GPU visuals → use update_hydra
- User asks for something that reacts to individual drum hits → use update_visualization
- User asks for ambient/psychedelic/audio-reactive → use update_hydra
`;

export function buildSystemMessages(context: PromptContext) {
  return [
    {
      type: 'text' as const,
      text: KNOWLEDGE_BASE,
      cache_control: { type: 'ephemeral' as const },
    },
    {
      type: 'text' as const,
      text: buildContextBlock(context),
    },
  ];
}

function buildContextBlock(ctx: PromptContext): string {
  let block = `## Current Session State
- Playing: ${ctx.isPlaying}
- Tempo: ${ctx.cps} CPS (${Math.round(ctx.cps * 60 * 2)} BPM approx)

### Current Code
\`\`\`javascript
${ctx.code}
\`\`\``;

  if (ctx.error) {
    block += `\n\n### Last Error\n${ctx.error}`;
  }

  block += `\n\n${VIZ_REFERENCE}`;

  block += `\n\n## Reminders
1. The update_pattern tool REPLACES the entire REPL. Always include the user's existing code with your additions/changes applied. To add a layer: copy the Current Code, insert your new layer into the stack(), return the whole thing. To change something: copy the Current Code, modify the relevant line, return the whole thing. Only generate from scratch if the user asks for something completely new.
2. NEVER remove layers the user already has unless they explicitly ask. Always append or modify — never strip.
3. CRITICAL: setcps() is a standalone function. Put it on its own line BEFORE the pattern. NEVER chain it.
4. The LAST expression must be the pattern — it's what gets played.
5. Use the update_visualization tool for visual changes (provide the function body, not the declaration).
6. ONLY use supported chord types with .voicing(): C, Cm, C7, C^7, Cm7, Cm9, C9, Cdim, Caug, C6. NEVER use sus2, sus4, 7sus4, add9, 7#9, m7b5.`;

  return block;
}
