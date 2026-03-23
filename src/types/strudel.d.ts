declare module '@strudel/web' {
  export function initStrudel(): Promise<void>;
  export function evaluate(code: string, autoplay?: boolean): Promise<void>;
  export function hush(): void;
  export function getAudioContext(): AudioContext;
}

declare module '@strudel/core' {
  export class Pattern {
    queryArc(start: number, end: number): Hap[];
    play(): void;
    _scope(opts?: ScopeOptions): Pattern;
    _spectrum(opts?: SpectrumOptions): Pattern;
    pianoroll(opts?: PianorollOptions): Pattern;
  }

  export interface Hap {
    whole: { begin: number; end: number } | null;
    part: { begin: number; end: number };
    value: unknown;
  }

  export interface ScopeOptions {
    align?: boolean;
    color?: string;
    thickness?: number;
    scale?: number;
  }

  export interface SpectrumOptions {
    thickness?: number;
    speed?: number;
    min?: number;
    max?: number;
  }

  export interface PianorollOptions {
    cycles?: number;
    labels?: number;
  }

  export function sequence(...args: unknown[]): Pattern;
  export function stack(...args: unknown[]): Pattern;
  export function note(pat: string): Pattern;
  export function s(pat: string): Pattern;
  export function hush(): void;
  export function setcps(cps: number): void;
}

declare module '@strudel/hydra' {
  export function initHydra(opts?: {
    canvas?: HTMLCanvasElement;
    detectAudio?: boolean;
    makeGlobal?: boolean;
    autoLoop?: boolean;
  }): Promise<void>;
}

declare module 'hydra-synth' {
  export default class HydraInstance {
    constructor(opts?: {
      canvas?: HTMLCanvasElement;
      detectAudio?: boolean;
      makeGlobal?: boolean;
      autoLoop?: boolean;
      width?: number;
      height?: number;
    });
    tick(dt: number): void;
    setResolution(width: number, height: number): void;
  }
}

declare module 'meyda' {
  interface MeydaAnalyzerOptions {
    audioContext: AudioContext;
    source: AudioNode;
    bufferSize: number;
    featureExtractors: string[];
    callback: (features: Record<string, unknown>) => void;
  }

  interface MeydaAnalyzer {
    start(): void;
    stop(): void;
  }

  export function createMeydaAnalyzer(opts: MeydaAnalyzerOptions): MeydaAnalyzer;
}

// Global functions injected by initStrudel()
declare function note(pat: string): import('@strudel/core').Pattern;
declare function s(pat: string): import('@strudel/core').Pattern;
declare function sound(pat: string): import('@strudel/core').Pattern;
declare function stack(...args: unknown[]): import('@strudel/core').Pattern;
declare function sequence(...args: unknown[]): import('@strudel/core').Pattern;
declare function cat(...args: unknown[]): import('@strudel/core').Pattern;
declare function hush(): void;
declare function setcps(cps: number): void;
