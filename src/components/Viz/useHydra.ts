import { useRef, useState, useCallback, useEffect } from 'react';
import Hydra from 'hydra-synth';
import { useAudioStore } from '@/stores/audioStore';

export function useHydra() {
  const hydraRef = useRef<Hydra | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const audioRafRef = useRef<number>(0);
  const audioRunningRef = useRef(false);
  const rmsSmoothRef = useRef(0);
  const energySmoothRef = useRef(0);
  // Peak tracker: holds at peak value and decays over time
  const rmsPeakRef = useRef(0);
  const energyPeakRef = useRef(0);
  const beatDecayRef = useRef(0);

  const init = useCallback((canvas: HTMLCanvasElement) => {
    if (hydraRef.current) return;

    const hydra = new Hydra({
      canvas,
      makeGlobal: false,
      autoLoop: true,
      detectAudio: false,
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

  // Alias — window.audio is already global so evaluate works fine for shader code
  const applyShader = evaluate;

  const startAudioReactive = useCallback(() => {
    if (audioRunningRef.current) return;
    audioRunningRef.current = true;

    const SMOOTH_UP = 0.3;    // Fast attack for smoothed values
    const SMOOTH_DOWN = 0.05; // Slow release for smoothed values
    const PEAK_DECAY = 0.92;  // Peak envelope decay per frame (~120ms to half)
    const BEAT_DECAY = 0.88;  // Beat flash decay per frame (~80ms to half)

    function tick() {
      if (!audioRunningRef.current) return;

      const audioState = useAudioStore.getState();

      // Asymmetric smoothing: fast attack, slow release
      const rmsTarget = audioState.rms;
      const rmsRate = rmsTarget > rmsSmoothRef.current ? SMOOTH_UP : SMOOTH_DOWN;
      rmsSmoothRef.current += (rmsTarget - rmsSmoothRef.current) * rmsRate;

      const energyTarget = audioState.energy;
      const energyRate = energyTarget > energySmoothRef.current ? SMOOTH_UP : SMOOTH_DOWN;
      energySmoothRef.current += (energyTarget - energySmoothRef.current) * energyRate;

      // Peak envelope: instantly jumps to new peaks, decays exponentially
      rmsPeakRef.current = Math.max(rmsTarget, rmsPeakRef.current * PEAK_DECAY);
      energyPeakRef.current = Math.max(energyTarget, energyPeakRef.current * PEAK_DECAY);

      // Beat: jumps to 1.0 on beat, decays smoothly so Hydra can see it
      if (audioState.isBeat) {
        beatDecayRef.current = 1.0;
      } else {
        beatDecayRef.current *= BEAT_DECAY;
      }

      (window as any).audio = {
        // Raw values (per-frame, jittery)
        rms: rmsTarget,
        energy: energyTarget,
        spectral: audioState.spectralCentroid,
        fft: audioState.fftData,
        // Smoothed values (fast attack, slow release — good for continuous modulation)
        rmsSmooth: rmsSmoothRef.current,
        energySmooth: energySmoothRef.current,
        // Peak envelope (instant jump, exponential decay — great for amplitude spikes)
        rmsPeak: rmsPeakRef.current,
        energyPeak: energyPeakRef.current,
        // Beat pulse (1.0 on beat → decays to 0 — visible across multiple frames)
        beat: beatDecayRef.current,
      };

      audioRafRef.current = requestAnimationFrame(tick);
    }

    tick();
  }, []);

  const stopAudioReactive = useCallback(() => {
    audioRunningRef.current = false;
    cancelAnimationFrame(audioRafRef.current);
  }, []);

  const resize = useCallback((width: number, height: number) => {
    if (!hydraRef.current) return;
    hydraRef.current.setResolution(width, height);
  }, []);

  useEffect(() => {
    return () => {
      stopAudioReactive();
      if (hydraRef.current) {
        hydraRef.current = null;
        setIsInitialized(false);
      }
    };
  }, [stopAudioReactive]);

  return { init, evaluate, applyShader, resize, isInitialized, startAudioReactive, stopAudioReactive };
}
