import { useRef, useState, useCallback, useEffect } from 'react';
import Hydra from 'hydra-synth';

export function useHydra() {
  const hydraRef = useRef<Hydra | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const init = useCallback((canvas: HTMLCanvasElement) => {
    if (hydraRef.current) return;

    const hydra = new Hydra({
      canvas,
      makeGlobal: false,
      autoLoop: false,
      detectAudio: true,
      width: canvas.width,
      height: canvas.height,
    });

    hydraRef.current = hydra;
    setIsInitialized(true);

    // Default visual
    try {
      hydra.synth.osc(4, 0.1, 0.8).color(0, 1, 0.7).out();
    } catch {
      // Hydra may not be ready immediately
    }
  }, []);

  const evaluate = useCallback((code: string) => {
    if (!hydraRef.current) return;
    try {
      const synth = hydraRef.current.synth;
      const fn = new Function(
        'osc', 'shape', 'gradient', 'noise', 'voronoi',
        'src', 'solid', 'render', 's0', 's1', 's2', 's3',
        'o0', 'o1', 'o2', 'o3',
        code,
      );
      fn(
        synth.osc.bind(synth), synth.shape.bind(synth),
        synth.gradient.bind(synth), synth.noise.bind(synth),
        synth.voronoi.bind(synth), synth.src.bind(synth),
        synth.solid.bind(synth), synth.render.bind(synth),
        synth.s0, synth.s1, synth.s2, synth.s3,
        synth.o0, synth.o1, synth.o2, synth.o3,
      );
    } catch (err) {
      console.warn('Hydra eval error:', err);
    }
  }, []);

  const resize = useCallback((width: number, height: number) => {
    if (!hydraRef.current) return;
    hydraRef.current.setResolution(width, height);
  }, []);

  useEffect(() => {
    return () => {
      if (hydraRef.current) {
        hydraRef.current = null;
        setIsInitialized(false);
      }
    };
  }, []);

  return { init, evaluate, resize, isInitialized };
}
