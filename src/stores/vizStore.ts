import { create } from 'zustand';

interface VizStore {
  /** Custom draw function code (Canvas 2D JS). null = use default visualization */
  customDrawCode: string | null;
  /** Compiled draw function, or null */
  drawFn: ((ctx: CanvasRenderingContext2D, width: number, height: number, events: any[], time: number) => void) | null;
  /** Last error from compiling custom code */
  error: string | null;

  setCustomDraw: (code: string) => void;
  clearCustomDraw: () => void;
}

export const useVizStore = create<VizStore>((set) => ({
  customDrawCode: null,
  drawFn: null,
  error: null,

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
}));
