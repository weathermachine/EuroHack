import { useEffect, useRef } from 'react';
import { useAudioStore } from '@/stores/audioStore';

const BEAT_DECAY_MS = 80;

export function useAudioReactive(): void {
  const rafRef = useRef<number>(0);
  const beatTimeRef = useRef<number>(0);

  useEffect(() => {
    const root = document.documentElement;

    function tick(now: number) {
      const { rms, spectralCentroid, isBeat } = useAudioStore.getState();

      // Track beat timing: set to 1 on beat, decay back to 0 after BEAT_DECAY_MS
      if (isBeat) {
        beatTimeRef.current = now;
      }

      const elapsed = now - beatTimeRef.current;
      const beatValue = elapsed < BEAT_DECAY_MS ? 1 : 0;

      root.style.setProperty('--rms', String(rms));
      root.style.setProperty('--spectral-centroid', String(spectralCentroid));
      root.style.setProperty('--beat-intensity', String(rms));
      root.style.setProperty('--is-beat', String(beatValue));

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      // Reset CSS custom properties on unmount
      root.style.setProperty('--rms', '0');
      root.style.setProperty('--spectral-centroid', '0');
      root.style.setProperty('--beat-intensity', '0');
      root.style.setProperty('--is-beat', '0');
    };
  }, []);
}
