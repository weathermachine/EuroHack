import { useRef, useEffect, useState, useCallback } from 'react';
import { useAudioStore } from '../stores/audioStore';

export function useBeatReactive() {
  const [beatScale, setBeatScale] = useState(1);
  const [beatOpacity, setBeatOpacity] = useState(0);
  const rafRef = useRef<number>(0);
  const scaleRef = useRef(1);
  const opacityRef = useRef(0);

  const decay = useCallback(() => {
    // Exponential decay toward resting values
    scaleRef.current += (1 - scaleRef.current) * 0.15;
    opacityRef.current *= 0.88;

    // Snap to rest when close enough
    if (Math.abs(scaleRef.current - 1) < 0.001) scaleRef.current = 1;
    if (opacityRef.current < 0.01) opacityRef.current = 0;

    setBeatScale(scaleRef.current);
    setBeatOpacity(opacityRef.current);

    if (scaleRef.current !== 1 || opacityRef.current > 0) {
      rafRef.current = requestAnimationFrame(decay);
    }
  }, []);

  useEffect(() => {
    const unsub = useAudioStore.subscribe(
      (state) => state.isBeat,
      (isBeat) => {
        if (isBeat) {
          scaleRef.current = 1.1;
          opacityRef.current = 1;
          cancelAnimationFrame(rafRef.current);
          rafRef.current = requestAnimationFrame(decay);
        }
      },
    );

    return () => {
      unsub();
      cancelAnimationFrame(rafRef.current);
    };
  }, [decay]);

  return { beatScale, beatOpacity };
}
