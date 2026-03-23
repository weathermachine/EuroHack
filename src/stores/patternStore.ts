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

const DEFAULT_CODE = `// Welcome to AI Rack
// Press Ctrl+Enter to evaluate, or chat with the AI below
s("bd sd:1 [~ bd] sd:2")
  .speed(1)
  .gain(0.8)
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
