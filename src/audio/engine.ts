import { usePatternStore } from '@/stores/patternStore';
import { pushVizEvent, clearVizEvents } from './vizEvents';
import { createAnalyzer, startAnalysis } from './analyzer';
import { pushHighlight } from '@/components/Repl/activeHighlight';

let initialized = false;
let strudelRepl: any = null;
let analyzerConnected = false;

export async function initAudio(): Promise<void> {
  if (initialized) return;

  const { initStrudel, evaluate, getAudioContext } = await import('@strudel/web');

  // Install audio tap BEFORE Strudel initializes so we catch superdough's
  // master gain → destination connection. When any node connects to the
  // AudioContext destination, we also wire it to our AnalyserNode for Meyda.
  installAudioTap(getAudioContext);

  strudelRepl = await initStrudel();

  // Pre-initialize AudioWorklets to avoid "AudioWorklet does not have a valid
  // AudioWorkletGlobalScope" errors on first pattern trigger.
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.audioWorklet) {
      // Trigger superdough worklet loading by evaluating a silent pattern
      await evaluate('silence', false);
      // Give worklets a moment to initialize
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log('[AI Rack] AudioWorklets pre-initialized');
    }
  } catch {
    // Non-fatal — worklets will load on first real trigger
  }

  // Load sample sources. All via evaluate() so they register in
  // Strudel's own sound registry (same scope as the audio engine).

  // 1. dough-samples: comprehensive sample packs via CDN (lazy-loaded on first use)
  //    Includes: Dirt-Samples, Tidal Drum Machines (TR-808, TR-909, LinnDrum, etc.),
  //    Salamander Grand Piano, VCSL synths, Mridangam, EmuSP12
  await loadDoughSamples(evaluate);

  // 2. Local user samples from public/samples/
  //    Loaded from a pre-built index.json manifest (rebuilt on server start).
  //    Usage: s("Kicks"), s("Kicks:3"), s("Bass:12"), etc.
  await loadLocalSamples(evaluate);

  // Override punchcard/spiral to use .draw()
  await patchVisualizationMethods();

  // Register viz trigger + REPL highlight trigger
  (globalThis as any).__vizTrigger = (hap: any, _deadline: number, duration: number) => {
    const v = hap.value || hap;
    pushVizEvent({
      s: String(v.s || v.sound || 'synth'),
      gain: v.gain ?? 0.8,
      duration: duration ?? 0.2,
      triggeredAt: performance.now(),
      cutoff: v.cutoff ?? v.lpf,
      delay: v.delay,
      room: v.room,
      pan: v.pan,
      speed: v.speed,
      note: v.note ?? v.freq,
    });

    // Push source locations to REPL highlight system
    const locations = hap.context?.locations;
    if (locations && locations.length > 0) {
      pushHighlight(locations, duration ?? 0.2);
    }
  };

  initialized = true;
  console.log('[AI Rack] Strudel initialized');
}

/**
 * Monkey-patch AudioNode.prototype.connect BEFORE Strudel initializes.
 * When superdough connects its master GainNode to ctx.destination,
 * we intercept that source node and also feed it to our Meyda analyzer.
 * This gives us real-time RMS, energy, spectral centroid, and beat detection.
 */
function installAudioTap(getAudioContext: () => AudioContext) {
  if (analyzerConnected) return;

  const origConnect = AudioNode.prototype.connect;

  AudioNode.prototype.connect = function (dest: any, ...args: any[]) {
    const result = (origConnect as any).call(this, dest, ...args);

    // Detect when a node connects to the AudioContext destination.
    // Set analyzerConnected FIRST to prevent re-entrancy — createAnalyzer
    // internally calls .connect() which would trigger this handler again.
    if (!analyzerConnected && dest instanceof AudioDestinationNode) {
      analyzerConnected = true; // Guard BEFORE calling createAnalyzer
      try {
        const ctx = getAudioContext();
        if (ctx) {
          createAnalyzer(ctx, this);
          startAnalysis();
          // Restore original connect now that analyzer is set up
          AudioNode.prototype.connect = origConnect;
          console.log('[AI Rack] Audio analyzer tapped from', this.constructor.name);
        }
      } catch (e) {
        analyzerConnected = false; // Reset on failure so it can retry
        console.warn('[AI Rack] Audio tap failed:', e);
      }
    }

    return result;
  } as any;
}

/**
 * Load all dough-samples packs from GitHub CDN.
 * Each pack has a JSON manifest that maps sound names to file URLs.
 * Samples are lazy-loaded by the browser on first use — only downloads what's played.
 *
 * Packs:
 *   - Dirt-Samples: bd, sd, hh, cp, 808bd, arpy, pluck, etc.
 *   - Tidal Drum Machines: TR-808, TR-909, CR-78, LinnDrum, etc. via .bank()
 *   - Piano: Salamander Grand Piano (piano, gm_acoustic_grand_piano)
 *   - VCSL: Synth samples
 *   - Mridangam: Indian percussion
 *   - EmuSP12: Classic sampler
 */
async function loadDoughSamples(evaluate: (code: string, autoplay?: boolean) => Promise<any>) {
  const ds = 'https://raw.githubusercontent.com/felixroos/dough-samples/main';

  const packs = [
    { name: 'Dirt-Samples', json: `${ds}/Dirt-Samples.json` },
    { name: 'Tidal Drum Machines', json: `${ds}/tidal-drum-machines.json` },
    { name: 'Piano', json: `${ds}/piano.json` },
    { name: 'VCSL', json: `${ds}/vcsl.json` },
    { name: 'EmuSP12', json: `${ds}/EmuSP12.json` },
    { name: 'Mridangam', json: `${ds}/mridangam.json` },
  ];

  // Load all packs concurrently for faster startup
  const results = await Promise.allSettled(
    packs.map(async (pack) => {
      try {
        await evaluate(`samples('${pack.json}')`, false);
        return pack.name;
      } catch (e) {
        console.warn(`[AI Rack] Failed to load ${pack.name}:`, e);
        return null;
      }
    })
  );

  const loaded = results
    .filter((r): r is PromiseFulfilledResult<string | null> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter(Boolean);

  console.log(`[AI Rack] Dough samples loaded: ${loaded.join(', ')} (${loaded.length}/${packs.length} packs)`);
}

/**
 * Load local user samples from public/samples/.
 * Reads a pre-built index.json manifest that maps folder names to file arrays.
 * Registers each folder as a Strudel sound name (e.g., s("Kicks"), s("Bass:3")).
 */
async function loadLocalSamples(evaluate: (code: string, autoplay?: boolean) => Promise<any>) {
  try {
    const res = await fetch('/samples/index.json');
    if (!res.ok) {
      console.warn('[AI Rack] No local samples manifest found at /samples/index.json');
      return;
    }
    const sampleMap = await res.json();
    (globalThis as any).__localSamples = sampleMap;
    await evaluate(`samples(__localSamples, '/samples/')`, false);
    const names = Object.keys(sampleMap);
    console.log(`[AI Rack] Local samples registered: ${names.join(', ')} (${names.length} groups)`);
  } catch (e) {
    console.warn('[AI Rack] Failed to load local samples:', e);
  }
}

async function patchVisualizationMethods() {
  try {
    const { Pattern } = await import('@strudel/web');
    if (!Pattern) return;

    function getOrCreateCanvas(id = 'test-canvas') {
      let canvas = document.querySelector('#' + id) as HTMLCanvasElement;
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = id;
        const dpr = window.devicePixelRatio;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.cssText = 'pointer-events:none;width:100%;height:100%;position:fixed;top:0;left:0';
        document.body.prepend(canvas);
      }
      return canvas.getContext('2d', { willReadFrequently: true })!;
    }

    Pattern.prototype.punchcard = function (opts: any = {}) {
      const ctx = opts.ctx || getOrCreateCanvas();
      const cycles = opts.cycles ?? 4;
      const playhead = opts.playhead ?? 0.5;
      const behind = cycles * playhead;
      const ahead = cycles * (1 - playhead);
      const totalSpan = behind + ahead;

      return this.draw(
        (haps: any[], time: number) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          ctx.clearRect(0, 0, w, h);

          const noteSet = new Set<number>();
          for (const hap of haps) {
            const val = hap.value || {};
            noteSet.add(typeof (val.note ?? val.n ?? 0) === 'number' ? Math.round(val.note ?? val.n ?? 0) : 0);
          }
          const notes = [...noteSet].sort((a, b) => a - b);
          const noteMin = notes[0] ?? 0;
          const noteRange = Math.max((notes[notes.length - 1] ?? 127) - noteMin, 1);
          const margin = 20;
          const colors: Record<string, string> = {
            bd: '#ff3333', sd: '#00d4ff', hh: '#ffcc00', oh: '#ffcc00',
            cp: '#ff00ff', cr: '#00ff41', default: '#75baff',
          };

          for (const hap of haps) {
            if (!hap.whole) continue;
            const begin = hap.whole.begin.valueOf();
            const end = hap.whole.end.valueOf();
            const val = hap.value || {};
            const x = ((begin - (time - behind)) / totalSpan) * w;
            const barW = Math.max(((end - begin) / totalSpan) * w, 2);
            const noteVal = Math.round(val.note ?? val.n ?? 0);
            const y = h - margin - ((noteVal - noteMin) / noteRange) * (h - margin * 2);
            const barH = Math.max((h - margin * 2) / Math.max(noteRange, 12), 4);
            const s = (val.s || '').split(':')[0];
            const color = val.color || colors[s] || colors.default;
            const active = begin <= time && end > time;

            ctx.fillStyle = color;
            ctx.globalAlpha = active ? 0.9 : 0.35;
            ctx.fillRect(x, y - barH / 2, barW, barH);
            if (active) {
              ctx.strokeStyle = 'white';
              ctx.lineWidth = 1;
              ctx.globalAlpha = 0.5;
              ctx.strokeRect(x, y - barH / 2, barW, barH);
            }
          }

          const playheadX = (behind / totalSpan) * w;
          ctx.globalAlpha = 0.7;
          ctx.strokeStyle = '#ffcc00';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(playheadX, 0);
          ctx.lineTo(playheadX, h);
          ctx.stroke();
          ctx.globalAlpha = 1;
        },
        { lookbehind: behind, lookahead: ahead, id: opts.id ?? 1 },
      );
    };

    Pattern.prototype.spiral = function (opts: any = {}) {
      const ctx = opts.ctx || getOrCreateCanvas();
      const cycles = opts.cycles ?? 6;

      return this.draw(
        (haps: any[], time: number) => {
          const w = ctx.canvas.width;
          const h = ctx.canvas.height;
          const cx = w / 2;
          const cy = h / 2;
          const maxR = Math.min(w, h) * 0.4;
          ctx.clearRect(0, 0, w, h);

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let a = 0; a < Math.PI * 2 * 3; a += 0.05) {
            const r = maxR * (1 - a / (Math.PI * 2 * 3));
            const x = cx + Math.cos(a) * r;
            const y = cy + Math.sin(a) * r;
            a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke();

          for (const hap of haps) {
            if (!hap.whole) continue;
            const begin = hap.whole.begin.valueOf();
            const age = time - begin;
            if (age < 0 || age > cycles) continue;
            const val = hap.value || {};
            const note = val.note ?? val.n ?? 60;
            const angle = (begin % 1) * Math.PI * 2 - Math.PI / 2;
            const r = (1 - age / cycles) * maxR;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            const dotR = Math.max(4, (val.gain ?? 0.8) * 10);
            const hue = ((typeof note === 'number' ? note : 60) % 12) / 12 * 360;
            const active = age < (hap.whole.end.valueOf() - begin);
            ctx.fillStyle = `hsl(${hue}, 80%, ${active ? 65 : 45}%)`;
            ctx.globalAlpha = Math.max(0.1, 1 - age / cycles);
            ctx.beginPath();
            ctx.arc(x, y, active ? dotR * 1.3 : dotR, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        },
        { lookbehind: cycles, lookahead: 0.5, id: opts.id ?? 2 },
      );
    };

    console.log('[AI Rack] Visualization methods patched (punchcard, spiral)');
  } catch (e) {
    console.warn('[AI Rack] Failed to patch visualization methods:', e);
  }
}

export function isInitialized(): boolean {
  return initialized;
}

function cleanupStrudelVisuals() {
  document.querySelectorAll('canvas#test-canvas').forEach((c) => c.remove());
  document.querySelectorAll('canvas[style*="position: fixed"]').forEach((c) => c.remove());
}

export async function evaluateCode(
  code: string,
): Promise<{ success: boolean; error?: string }> {
  if (!initialized) {
    try {
      await initAudio();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Init failed: ${msg}` };
    }
  }

  const store = usePatternStore.getState();

  try {
    const { evaluate } = await import('@strudel/web');

    cleanupStrudelVisuals();
    clearVizEvents();

    await evaluate(code);

    const scheduler = strudelRepl?.scheduler;
    if (scheduler?.pattern && typeof scheduler.pattern.onTrigger === 'function') {
      scheduler.pattern = scheduler.pattern.onTrigger(
        (globalThis as any).__vizTrigger,
        false,
      );
    }

    store.setError(null);
    store.setLastWorkingCode(code);
    store.setPlaying(true);

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[AI Rack] eval error:', message);
    store.setError(message);
    return { success: false, error: message };
  }
}

export async function stopPlayback(): Promise<void> {
  const { hush } = await import('@strudel/web');
  hush();
  cleanupStrudelVisuals();
  clearVizEvents();
  usePatternStore.getState().setPlaying(false);
}
