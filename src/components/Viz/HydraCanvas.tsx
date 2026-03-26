import { useRef, useEffect } from 'react';
import { usePatternStore } from '@/stores/patternStore';
import { useVizStore } from '@/stores/vizStore';
import { getVizEvents, clearVizEvents, expireVizEvents, type VizEvent } from '@/audio/vizEvents';
import { useHydra } from './useHydra';
import { SHADER_PRESETS } from './shaderPresets';
import VizControls from './VizControls';
import styles from './HydraCanvas.module.css';

const SOUND_COLORS: Record<string, string> = {
  bd: '#ff3333',
  sd: '#00d4ff',
  hh: '#ffcc00',
  oh: '#ffcc00',
  cp: '#ff00ff',
  cr: '#00ff41',
  rim: '#ff8800',
  tom: '#ff6644',
};

function getColor(s: unknown): string {
  const str = typeof s === 'string' ? s : String(s ?? '');
  const base = str.split(':')[0];
  return SOUND_COLORS[base] || '#e0e0e0';
}

export default function HydraCanvas() {
  const eventsCanvasRef = useRef<HTMLCanvasElement>(null);
  const hydraCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const laneMapRef = useRef<Map<string, number>>(new Map());
  const isPlaying = usePatternStore((s) => s.isPlaying);
  const customDrawFn = useVizStore((s) => s.drawFn);
  const vizError = useVizStore((s) => s.error);
  const vizMode = useVizStore((s) => s.vizMode);
  const setVizMode = useVizStore((s) => s.setVizMode);
  const selectedShader = useVizStore((s) => s.selectedShader);
  const customHydraCode = useVizStore((s) => s.customHydraCode);

  const lastWorkingCode = usePatternStore((s) => s.lastWorkingCode);

  const hydra = useHydra();

  // Clear viz state when playback stops or code changes
  useEffect(() => {
    if (!isPlaying) {
      clearVizEvents();
      laneMapRef.current.clear();
    }
  }, [isPlaying]);

  useEffect(() => {
    clearVizEvents();
    laneMapRef.current.clear();
  }, [lastWorkingCode]);

  // Sync events canvas size
  useEffect(() => {
    const container = containerRef.current;
    const canvas = eventsCanvasRef.current;
    if (!container || !canvas) return;

    function syncSize() {
      const rect = container!.getBoundingClientRect();
      canvas!.width = Math.floor(rect.width);
      canvas!.height = Math.floor(rect.height);
    }

    syncSize();
    const observer = new ResizeObserver(syncSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Sync hydra canvas size
  useEffect(() => {
    const container = containerRef.current;
    const canvas = hydraCanvasRef.current;
    if (!container || !canvas) return;

    function syncSize() {
      const rect = container!.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      canvas!.width = w;
      canvas!.height = h;
      hydra.resize(w, h);
    }

    syncSize();
    const observer = new ResizeObserver(syncSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [hydra]);

  // Initialize / teardown Hydra when switching to hydra mode
  useEffect(() => {
    if (vizMode !== 'hydra') {
      hydra.stopAudioReactive();
      return;
    }

    const canvas = hydraCanvasRef.current;
    if (!canvas) return;

    if (!hydra.isInitialized) {
      hydra.init(canvas);
    }

    hydra.startAudioReactive();

    // Apply selected shader preset
    const preset = SHADER_PRESETS.find(p => p.id === useVizStore.getState().selectedShader);
    hydra.applyShader(preset?.code ?? `osc(10, 0.1, () => window.audio.rmsPeak * 4).color(0.9, 0.2, () => window.audio.spectral / 800).rotate(() => window.audio.energySmooth * 0.5).scale(() => 1 + window.audio.beat * 0.5).brightness(() => window.audio.beat * 0.2).out()`);

    return () => {
      hydra.stopAudioReactive();
    };
  }, [vizMode, hydra]);

  // Apply shader when selectedShader changes (preset mode)
  useEffect(() => {
    if (vizMode !== 'hydra' || !hydra.isInitialized) return;
    // Don't override custom Hydra code with a preset
    if (customHydraCode) return;
    const preset = SHADER_PRESETS.find(p => p.id === selectedShader);
    if (preset) {
      hydra.applyShader(preset.code);
    }
  }, [selectedShader, vizMode, hydra, customHydraCode]);

  // Apply custom Hydra code from AI
  useEffect(() => {
    if (vizMode !== 'hydra' || !hydra.isInitialized || !customHydraCode) return;
    hydra.applyShader(customHydraCode);
  }, [customHydraCode, vizMode, hydra]);

  // Events render loop — runs in events mode, or in any mode when stopped (idle overlay)
  useEffect(() => {
    if (vizMode !== 'events' && isPlaying) return;

    let running = true;

    function draw() {
      if (!running) return;
      rafRef.current = requestAnimationFrame(draw);

      const canvas = eventsCanvasRef.current;
      if (!canvas) return;
      const { width, height } = canvas;
      if (width === 0 || height === 0) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const now = performance.now();

      // Clear
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, width, height);

      if (!isPlaying) {
        drawIdleState(ctx, width, height);
        return;
      }

      // Expire old events
      expireVizEvents(3000);
      const events = getVizEvents();

      // Update lane map for default viz
      for (const ev of events) {
        if (!laneMapRef.current.has(ev.s)) {
          laneMapRef.current.set(ev.s, laneMapRef.current.size);
        }
      }

      // Use custom draw function if available
      if (customDrawFn) {
        try {
          customDrawFn(ctx, width, height, events, now);
        } catch {
          // Fall back to default on error
          drawDefaultViz(ctx, width, height, now, events, laneMapRef.current);
        }
        return;
      }

      if (events.length === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '12px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('listening...', width / 2, height / 2);
        ctx.textAlign = 'start';
        return;
      }

      drawDefaultViz(ctx, width, height, now, events, laneMapRef.current);
    }

    draw();

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [vizMode, isPlaying, customDrawFn]);

  return (
    <div ref={containerRef} className={styles.container}>
      {/* Mode switch toggle */}
      <div className={styles.modeSwitch}>
        <button
          className={vizMode === 'events' ? styles.active : ''}
          onClick={() => setVizMode('events')}
        >Events</button>
        <button
          className={vizMode === 'hydra' ? styles.active : ''}
          onClick={() => setVizMode('hydra')}
        >Hydra</button>
      </div>

      {vizMode === 'hydra' && <VizControls />}

      {/* Hydra canvas - visible when mode is hydra */}
      <canvas
        ref={hydraCanvasRef}
        className={styles.canvas}
        style={{ display: vizMode === 'hydra' ? 'block' : 'none' }}
      />

      {/* Events canvas - visible in events mode, or as idle overlay when stopped */}
      <canvas
        ref={eventsCanvasRef}
        className={styles.canvas}
        style={{ display: (vizMode === 'events' || !isPlaying) ? 'block' : 'none' }}
      />

      {vizError && (
        <div className={styles.error}>Viz error: {vizError}</div>
      )}
    </div>
  );
}

function drawIdleState(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.fillStyle = '#ffffff';
  ctx.font = '600 18px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('E u r o  H a c k', centerX, centerY - 20);

  const triSize = 20;
  const triY = centerY + 15;
  ctx.beginPath();
  ctx.moveTo(centerX - triSize, triY);
  ctx.lineTo(centerX + triSize, triY);
  ctx.lineTo(centerX, triY + triSize * 1.2);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.textAlign = 'start';
}

function drawDefaultViz(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  now: number,
  events: VizEvent[],
  laneMap: Map<string, number>,
) {
  const laneCount = Math.max(laneMap.size, 1);
  const laneHeight = height / laneCount;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let i = 1; i < laneCount; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * laneHeight);
    ctx.lineTo(width, i * laneHeight);
    ctx.stroke();
  }

  for (const ev of events) {
    const lane = laneMap.get(ev.s) ?? 0;
    const age = (now - ev.triggeredAt) / 1000;
    const totalDuration = Math.max(ev.duration, 0.1);
    const progress = Math.min(age / totalDuration, 1);
    const decay = age < totalDuration ? 1 : Math.max(0, 1 - (age - totalDuration) * 2);
    const color = getColor(ev.s);
    const laneY = lane * laneHeight;
    const laneCenterY = laneY + laneHeight / 2;
    const barHeight = laneHeight * 0.6 * ev.gain * decay;
    const barX = 50;
    const barWidth = width - 70;

    ctx.globalAlpha = 0.3 * decay;
    ctx.fillStyle = color;
    ctx.fillRect(barX, laneCenterY - barHeight / 2, barWidth * progress, barHeight);

    ctx.globalAlpha = 0.15 * decay;
    ctx.strokeStyle = color;
    ctx.strokeRect(barX, laneCenterY - barHeight / 2, barWidth, barHeight);

    if (age < 0.1) {
      ctx.globalAlpha = (1 - age / 0.1) * 0.5 * ev.gain;
      ctx.fillStyle = color;
      ctx.fillRect(0, laneY, width, laneHeight);
    }

    ctx.globalAlpha = 0.8 * decay;
    ctx.fillStyle = color;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textBaseline = 'middle';
    ctx.fillText(ev.s, 6, laneCenterY);
  }

  ctx.globalAlpha = 1;
}
