import { usePatternStore } from '@/stores/patternStore';
import { pushVizEvent, clearVizEvents } from './vizEvents';

let initialized = false;
let strudelRepl: any = null;

export async function initAudio(): Promise<void> {
  if (initialized) return;

  const { initStrudel, evaluate } = await import('@strudel/web');
  strudelRepl = await initStrudel();

  // Load sample sources. All via evaluate() so they register in
  // Strudel's own sound registry (same scope as the audio engine).

  // 1. Dirt-Samples: bd, sd, hh, cp, 808bd, 808sd, etc.
  await evaluate(`samples('github:tidalcycles/dirt-samples')`, false);

  // 2. GM Soundfonts: gm_epiano1, gm_trumpet, gm_string_ensemble1, etc.
  //    Must be loaded via @strudel/soundfonts's registerSoundfonts() BUT called
  //    through evaluate so it registers in the correct sound registry.
  //    We import the raw font data and register each sound manually.
  try {
    const sf = await import('@strudel/soundfonts');
    // registerSoundfonts calls registerSound from @strudel/webaudio.
    // Due to bundle duplication, we need to get registerSound from the same
    // scope as @strudel/web. We do this by making it available globally
    // and calling it from evaluate.
    (globalThis as any).__soundfontData = (sf as any).default || sf;
    // Actually, let's just call registerSoundfonts and see if it works
    // now that packages are deduped
    sf.registerSoundfonts();
    console.log('[AI Rack] GM soundfonts registered');
  } catch (e) {
    console.warn('[AI Rack] Soundfonts failed:', e);
  }

  // 3. Bank samples for .bank() usage (RolandTR808, RolandTR909, etc.)
  //    The .bank("X") system constructs sound names as "X_samplename".
  //    These need to be registered as individual sounds.
  //    We load them by fetching the bank's sample map and registering each entry.
  await loadBankSamples(evaluate);

  // Override punchcard/spiral to use .draw()
  await patchVisualizationMethods();

  // Register viz trigger
  (globalThis as any).__vizTrigger = (hap: any, _deadline: number, duration: number) => {
    const v = hap.value || hap;
    pushVizEvent({
      s: v.s || v.sound || 'synth',
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
  };

  initialized = true;
  console.log('[AI Rack] Strudel initialized');
}

/**
 * Load bank sample maps and register each sample with the bank prefix.
 * E.g., RolandTR808 bank with samples bd, sd, hh → registers RolandTR808_bd, etc.
 */
async function loadBankSamples(evaluate: (code: string, autoplay?: boolean) => Promise<any>) {
  const banks = [
    'RolandTR808', 'RolandTR909', 'RolandCR78',
    'AkaiLinn', 'EmuSP12',
  ];

  for (const bank of banks) {
    try {
      const res = await fetch(`https://shabda.ndre.gr/${bank}.json?strudel=1`);
      if (!res.ok) continue;
      const data = await res.json();
      const base = data._base || `https://shabda.ndre.gr/`;

      // The shabda format: { "BankName": ["path/to/file.wav", ...], "_base": "..." }
      // But .bank() expects "BankName_bd", "BankName_sd" etc.
      // The samples in the array are numbered (0, 1, 2...) not named (bd, sd, hh).
      // So .bank("RolandTR808") with s("bd") looks for "RolandTR808_bd" which doesn't exist.
      //
      // The actual strudel.cc website uses a different sample loading approach for banks.
      // The bank samples on strudel.cc are loaded from a comprehensive prebake that
      // maps bank_sound names to URLs.
      //
      // For compatibility, let's create the expected mappings from the bank's file list.
      // The files are named like "RolandTR808_BD.wav", "RolandTR808_SD.wav" etc.
      const files = data[bank];
      if (!Array.isArray(files)) continue;

      // Build a sample map with proper names
      const sampleMap: Record<string, string[]> = {};
      for (const file of files) {
        // Extract sound name from filename, e.g. "samples/RolandTR808/RolandTR808_BD.wav" → "bd"
        const filename = file.split('/').pop()?.replace(/\.\w+$/, '') || '';
        // Files named like "RolandTR808_BD" → key should be "RolandTR808_bd"
        const key = filename.toLowerCase();
        if (!sampleMap[key]) sampleMap[key] = [];
        sampleMap[key].push(file);
      }

      // Also map without bank prefix for convenience
      // "RolandTR808_bd" → also register as bank entry
      sampleMap._base = [base] as any;

      (globalThis as any).__bankMap = sampleMap;
      await evaluate(`samples(__bankMap, '${base}')`, false);
      console.log(`[AI Rack] Bank ${bank} registered (${Object.keys(sampleMap).length - 1} sounds)`);
    } catch {
      // Non-fatal
    }
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
