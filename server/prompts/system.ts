import { KNOWLEDGE_BASE } from '../knowledge/loader';

export interface PromptContext {
  code: string;
  isPlaying: boolean;
  cps: number;
  error?: string;
}

const VIZ_REFERENCE = `## Visualization API

The update_visualization tool accepts Canvas 2D JavaScript code that will be called every animation frame.
Your code is the BODY of a function with these parameters:
- ctx: CanvasRenderingContext2D (the drawing context)
- width: number (canvas width in pixels)
- height: number (canvas height in pixels)
- events: array of active sound events from Strudel, each with:
  - s: string (sound name, e.g. "bd", "sd", "hh")
  - gain: number (0-1)
  - duration: number (seconds)
  - triggeredAt: number (performance.now() timestamp)
  - cutoff, delay, room, pan, speed, note: optional number parameters
- time: number (current performance.now() in ms)

The canvas is cleared to #0a0a0f before each call. You do NOT need to clear it.

### Tips
- Use \`time\` for animation (e.g. Math.sin(time * 0.001))
- Use \`events\` to react to music (each event has age = time - ev.triggeredAt)
- Events expire after 3 seconds
- Common pattern: iterate events, calculate age/decay, draw shapes

### Example: Sine waves
\`\`\`
const centerY = height / 2;
ctx.strokeStyle = '#00ff41';
ctx.lineWidth = 2;
ctx.beginPath();
for (let x = 0; x < width; x++) {
  const amp = events.reduce((sum, ev) => {
    const age = (time - ev.triggeredAt) / 1000;
    return sum + ev.gain * Math.max(0, 1 - age);
  }, 0);
  const y = centerY + Math.sin(x * 0.02 + time * 0.003) * amp * 50;
  x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
}
ctx.stroke();
\`\`\`

### Example: Circles on trigger
\`\`\`
for (const ev of events) {
  const age = (time - ev.triggeredAt) / 1000;
  const decay = Math.max(0, 1 - age);
  const radius = age * 200;
  ctx.globalAlpha = decay * ev.gain * 0.5;
  ctx.strokeStyle = ev.s === 'bd' ? '#ff3333' : ev.s === 'sd' ? '#00d4ff' : '#ffcc00';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
  ctx.stroke();
}
ctx.globalAlpha = 1;
\`\`\`
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
1. Always return COMPLETE working code via the update_pattern tool — not diffs or patches.
2. CRITICAL: setcps() is a standalone function. Put it on its own line BEFORE the pattern. NEVER chain it.
3. The LAST expression must be the pattern — it's what gets played.
4. Use the update_visualization tool for visual changes (provide the function body, not the declaration).`;

  return block;
}
