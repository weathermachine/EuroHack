import { usePatternStore } from '@/stores/patternStore';
import { pushVizEvent } from './vizEvents';

let initialized = false;

/**
 * Install a global hook that intercepts every Strudel trigger event.
 * Strudel's superdough calls through getTrigger which we can't easily
 * wrap, but we CAN patch Pattern.prototype.onTrigger to add our own
 * listener to every pattern that plays.
 *
 * Even simpler: patch the global `onTrigger` function that the REPL's
 * Cyclist calls for each scheduled hap.
 */
function installTriggerHook() {
  // Strudel's internal scheduler calls window.postMessage for .dough() patterns.
  // For superdough (the default), it doesn't. But the superdough trigger function
  // receives (hap, deadline, duration, cps, t) — we can wrap it.
  //
  // The approach: after initStrudel, wrap the global `superdough` or `trigger` function.
  // But those are internal.
  //
  // SIMPLEST: Strudel's webaudio module exports `onTrigger` callbacks.
  // We'll use Pattern.prototype to add a draw callback to every pattern.

  // Actually, let's just add a message listener AND also manually post
  // messages from the superdough trigger by wrapping it.
}

export async function initAudio(): Promise<void> {
  if (initialized) return;

  const { initStrudel, evaluate } = await import('@strudel/web');
  await initStrudel();

  // Hook: wrap the global superdough trigger to capture events for visualization.
  // After initStrudel, superdough's trigger is registered. We wrap it by
  // monkey-patching the AudioNode connect to also observe triggers.
  //
  // BETTER APPROACH: Use Strudel's `Pattern.prototype.log()` or
  // `.onTrigger()` which is designed exactly for this.
  // We'll make every evaluated pattern call our viz callback.

  // Load default Dirt-Samples
  await evaluate(`samples('github:tidalcycles/dirt-samples')`, false);

  initialized = true;
  console.log('[AI Rack] Strudel initialized with Dirt-Samples');
}

export function isInitialized(): boolean {
  return initialized;
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

    // Append .onTrigger() to the user's code so we capture every event.
    // The onTrigger callback receives (hap, deadline, hapDuration, cps, targetTime)
    // We inject a global __vizTrigger function that pushes to our viz event bus.
    (globalThis as any).__vizTrigger = (hap: any, _deadline: number, hapDuration: number) => {
      const v = hap.value || hap;
      pushVizEvent({
        s: v.s || v.sound || 'synth',
        gain: v.gain ?? 0.8,
        duration: hapDuration ?? 0.2,
        triggeredAt: performance.now(),
        cutoff: v.cutoff ?? v.lpf,
        delay: v.delay,
        room: v.room,
        pan: v.pan,
        speed: v.speed,
        note: v.note ?? v.freq,
      });
    };

    // Wrap the code to add .onTrigger() — this hooks our viz callback
    // into the pattern pipeline without changing the audio output.
    const wrappedCode = `${code}\n.onTrigger(__vizTrigger, false)`;

    try {
      await evaluate(wrappedCode);
    } catch {
      // If wrapping fails (e.g. code doesn't end with a pattern expression),
      // fall back to evaluating the original code without viz hook
      await evaluate(code);
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
  usePatternStore.getState().setPlaying(false);
}
