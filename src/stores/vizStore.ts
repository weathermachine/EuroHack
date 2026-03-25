import { create } from 'zustand';

interface VizStore {
  /** Custom draw function code (Canvas 2D JS). null = use default visualization */
  customDrawCode: string | null;
  /** Compiled draw function, or null */
  drawFn: ((ctx: CanvasRenderingContext2D, width: number, height: number, events: any[], time: number) => void) | null;
  /** Last error from compiling custom code */
  error: string | null;

  /** Current visualization mode */
  vizMode: 'events' | 'hydra';
  /** Selected Hydra shader preset ID */
  selectedShader: string;
  /** Custom Hydra shader code from AI. null = use preset */
  customHydraCode: string | null;

  setCustomDraw: (code: string) => void;
  clearCustomDraw: () => void;
  setVizMode: (mode: 'events' | 'hydra') => void;
  setSelectedShader: (id: string) => void;
  setCustomHydra: (code: string) => void;
  clearCustomHydra: () => void;
}

export const useVizStore = create<VizStore>((set) => ({
  customDrawCode: null,
  drawFn: null,
  error: null,
  vizMode: 'events',
  selectedShader: 'audio-reactive-1',
  customHydraCode: null,

  setCustomDraw: (code: string) => {
    try {
      // Compile the code into a function.
      // The function receives: ctx, width, height, events, time
      // - ctx: CanvasRenderingContext2D
      // - width/height: canvas dimensions
      // - events: array of { s, gain, duration, triggeredAt, cutoff, delay, room, pan, speed, note }
      // - time: current performance.now() in ms
      const fn = new Function(
        'ctx', 'width', 'height', 'events', 'time',
        code,
      ) as VizStore['drawFn'];

      // Test it doesn't throw immediately
      const testCanvas = document.createElement('canvas');
      testCanvas.width = 100;
      testCanvas.height = 100;
      const testCtx = testCanvas.getContext('2d')!;
      fn!(testCtx, 100, 100, [], performance.now());

      set({ customDrawCode: code, drawFn: fn, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ error: msg });
      console.error('[Viz] Custom draw code error:', msg);
    }
  },

  clearCustomDraw: () => set({ customDrawCode: null, drawFn: null, error: null }),

  setVizMode: (mode) => set({ vizMode: mode }),

  setSelectedShader: (id) => set({ selectedShader: id, customHydraCode: null }),

  setCustomHydra: (code) => set({ customHydraCode: code }),

  clearCustomHydra: () => set({ customHydraCode: null }),
}));
