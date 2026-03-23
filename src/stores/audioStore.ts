import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { AudioFeatures } from '../types/messages';

interface AudioStore {
  fftData: Float32Array;
  rms: number;
  spectralCentroid: number;
  energy: number;
  isBeat: boolean;

  update: (features: AudioFeatures) => void;
  reset: () => void;
}

export const useAudioStore = create<AudioStore>()(subscribeWithSelector((set) => ({
  fftData: new Float32Array(256),
  rms: 0,
  spectralCentroid: 0,
  energy: 0,
  isBeat: false,

  update: (features) =>
    set({
      fftData: features.fftData,
      rms: features.rms,
      spectralCentroid: features.spectralCentroid,
      energy: features.energy,
      isBeat: features.isBeat,
    }),

  reset: () =>
    set({
      fftData: new Float32Array(256),
      rms: 0,
      spectralCentroid: 0,
      energy: 0,
      isBeat: false,
    }),
})));
