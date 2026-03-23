import { useState, useCallback } from 'react';
import { initAudio, evaluateCode, stopPlayback, isInitialized } from '@/audio/engine';

interface UseStrudelReturn {
  evaluate: (code: string) => Promise<{ success: boolean; error?: string }>;
  stop: () => void;
  isReady: boolean;
}

export function useStrudel(): UseStrudelReturn {
  const [isReady, setIsReady] = useState(isInitialized());

  const evaluate = useCallback(
    async (code: string): Promise<{ success: boolean; error?: string }> => {
      // Lazy init on first evaluate (requires user gesture for AudioContext)
      if (!isReady) {
        try {
          await initAudio();
          setIsReady(true);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error('Failed to initialize Strudel audio:', msg);
          return { success: false, error: `Init failed: ${msg}` };
        }
      }
      return evaluateCode(code);
    },
    [isReady],
  );

  const stop = useCallback(() => {
    stopPlayback();
  }, []);

  return { evaluate, stop, isReady };
}
