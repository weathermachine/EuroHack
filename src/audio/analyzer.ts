import { createMeydaAnalyzer } from 'meyda';
import { useAudioStore } from '@/stores/audioStore';

interface AudioFeatures {
  rms: number;
  spectralCentroid: number;
  energy: number;
  isBeat: boolean;
}

const ENERGY_HISTORY_SIZE = 30;
const BEAT_THRESHOLD = 1.5;

let analyserNode: AnalyserNode | null = null;
let meydaAnalyzer: ReturnType<typeof createMeydaAnalyzer> | null = null;
let energyHistory: number[] = [];
let running = false;

export function createAnalyzer(
  audioContext: AudioContext,
  sourceNode: AudioNode
): void {
  // Create an AnalyserNode tapped from the master output (parallel, doesn't affect audio)
  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 512;
  sourceNode.connect(analyserNode);

  energyHistory = [];

  meydaAnalyzer = createMeydaAnalyzer({
    audioContext,
    source: analyserNode,
    bufferSize: 512,
    featureExtractors: ['rms', 'spectralCentroid', 'energy'],
    callback: (features: Record<string, unknown>) => {
      const rms = (features.rms as number) || 0;
      const spectralCentroid = (features.spectralCentroid as number) || 0;
      const energy = (features.energy as number) || 0;

      // Beat detection: flag when current energy > 1.5x rolling average
      energyHistory.push(energy);
      if (energyHistory.length > ENERGY_HISTORY_SIZE) {
        energyHistory.shift();
      }

      const avgEnergy =
        energyHistory.length > 1
          ? energyHistory.reduce((a, b) => a + b, 0) / energyHistory.length
          : energy;

      const isBeat = energy > avgEnergy * BEAT_THRESHOLD && energyHistory.length > 2;

      const audioFeatures: AudioFeatures = {
        rms,
        spectralCentroid,
        energy,
        isBeat,
      };

      useAudioStore.getState().update(audioFeatures);
    },
  });
}

export function startAnalysis(): void {
  if (meydaAnalyzer && !running) {
    meydaAnalyzer.start();
    running = true;
  }
}

export function stopAnalysis(): void {
  if (meydaAnalyzer && running) {
    meydaAnalyzer.stop();
    running = false;
  }
}

export function destroyAnalyzer(): void {
  stopAnalysis();
  if (analyserNode) {
    analyserNode.disconnect();
    analyserNode = null;
  }
  meydaAnalyzer = null;
  energyHistory = [];
}
