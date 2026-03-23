import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface PatternStore {
  code: string;
  isPlaying: boolean;
  cps: number;
  cyclePosition: number;
  lastError: string | null;
  lastWorkingCode: string;

  setCode: (code: string) => void;
  setPlaying: (playing: boolean) => void;
  setCps: (cps: number) => void;
  setCyclePosition: (pos: number) => void;
  setError: (error: string | null) => void;
  setLastWorkingCode: (code: string) => void;
}

const DEFAULT_CODE = `// Welcome to AI Rack — Ctrl+Enter to evaluate
// Use stack() to layer multiple patterns
stack(
  s("bd sd:1 [~ bd] sd:2").gain(0.8),
  s("hh*8").gain(0.3)
)
`;

export const usePatternStore = create<PatternStore>()(subscribeWithSelector((set) => ({
  code: DEFAULT_CODE,
  isPlaying: false,
  cps: 0.5, // 120 BPM
  cyclePosition: 0,
  lastError: null,
  lastWorkingCode: DEFAULT_CODE,

  setCode: (code) => set({ code }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setCps: (cps) => set({ cps }),
  setCyclePosition: (cyclePosition) => set({ cyclePosition }),
  setError: (lastError) => set({ lastError }),
  setLastWorkingCode: (lastWorkingCode) => set({ lastWorkingCode }),
})));
