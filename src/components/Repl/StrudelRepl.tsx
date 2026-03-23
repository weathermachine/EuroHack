import React, { useEffect, useRef, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, ViewUpdate } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { basicSetup } from 'codemirror';
import { strudelHighlight } from './strudelHighlight';
import { useStrudel } from './useStrudel';
import { usePatternStore } from '@/stores/patternStore';
import styles from './StrudelRepl.module.css';

const darkTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#0a0a0f',
      color: '#e0e0e0',
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: '14px',
      height: '100%',
    },
    '.cm-content': { caretColor: '#00ff41', padding: '8px 0' },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#00ff41' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
      backgroundColor: '#1a1a3a',
    },
    '.cm-gutters': { backgroundColor: '#0a0a0f', color: '#555577', border: 'none' },
    '.cm-activeLineGutter': { backgroundColor: '#12121a' },
    '.cm-activeLine': { backgroundColor: '#12121a' },
    '.cm-matchingBracket': { backgroundColor: '#1a1a2e', outline: '1px solid #00d4ff' },
  },
  { dark: true },
);

export const StrudelRepl: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const drawContainerRef = useRef<HTMLDivElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const painterRafRef = useRef<number>(0);
  const { evaluate, stop, isReady } = useStrudel();
  const lastError = usePatternStore((s) => s.lastError);
  const isPlaying = usePatternStore((s) => s.isPlaying);
  const updatingFromStore = useRef(false);

  const handleEvaluate = useCallback(() => {
    if (!viewRef.current) return;
    const code = viewRef.current.state.doc.toString();
    usePatternStore.getState().setCode(code);
    evaluate(code);
  }, [evaluate]);

  // Initialize CodeMirror
  useEffect(() => {
    if (!editorRef.current) return;
    const initialCode = usePatternStore.getState().code;

    const evalKeymap = keymap.of([
      {
        key: 'Ctrl-Enter',
        run: () => { handleEvaluate(); return true; },
      },
      {
        key: 'Ctrl-.',
        run: () => { stop(); return true; },
      },
    ]);

    const updateListener = EditorView.updateListener.of((update: ViewUpdate) => {
      if (update.docChanged && !updatingFromStore.current) {
        usePatternStore.getState().setCode(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: initialCode,
      extensions: [
        basicSetup, javascript(), strudelHighlight, darkTheme,
        evalKeymap, updateListener, EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;

    return () => { view.destroy(); viewRef.current = null; };
  }, [handleEvaluate, stop]);

  // Sync store → editor
  useEffect(() => {
    const unsub = usePatternStore.subscribe(
      (state) => state.code,
      (code) => {
        const view = viewRef.current;
        if (!view) return;
        const currentDoc = view.state.doc.toString();
        if (code !== currentDoc) {
          updatingFromStore.current = true;
          view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: code } });
          updatingFromStore.current = false;
        }
      },
    );
    return unsub;
  }, []);

  // Reparent Strudel's full-screen canvas (from pianoroll/draw) into our panel
  useEffect(() => {
    const container = drawContainerRef.current;
    if (!container) return;

    const observer = new MutationObserver(() => {
      const canvases = document.querySelectorAll('canvas[style*="position"]');
      canvases.forEach((canvas) => {
        const el = canvas as HTMLCanvasElement;
        if (el.parentElement === document.body && el.style.position === 'fixed') {
          el.style.position = 'absolute';
          el.style.inset = '0';
          el.style.width = '100%';
          el.style.height = '100%';
          container.appendChild(el);
          container.style.display = 'block';

          const rect = container.getBoundingClientRect();
          const dpr = window.devicePixelRatio;
          el.width = Math.floor(rect.width) * dpr;
          el.height = Math.floor(rect.height) * dpr;
        }
      });
    });

    observer.observe(document.body, { childList: true });

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const dpr = window.devicePixelRatio;
      container.querySelectorAll('canvas').forEach((c) => {
        c.width = Math.floor(width) * dpr;
        c.height = Math.floor(height) * dpr;
      });
    });
    resizeObserver.observe(container);

    return () => { observer.disconnect(); resizeObserver.disconnect(); };
  }, []);

  // Run punchcard/onPaint painters in a draw loop
  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(painterRafRef.current);
      // Clean up strudel canvases
      const container = drawContainerRef.current;
      if (container) {
        container.querySelectorAll('canvas:not([data-repl])').forEach((c) => c.remove());
        if (!container.querySelector('canvas')) {
          container.style.display = 'none';
        }
      }
      return;
    }

    // Start painter loop
    let running = true;

    async function painterLoop() {
      if (!running) return;
      painterRafRef.current = requestAnimationFrame(painterLoop);

      const canvas = drawCanvasRef.current;
      const container = drawContainerRef.current;
      if (!canvas || !container) return;

      try {
        const { getPattern, getTime } = await import('@strudel/web');
        const pattern = getPattern?.();
        if (!pattern || typeof pattern.getPainters !== 'function') return;

        const painters = pattern.getPainters();
        if (!painters || painters.length === 0) return;

        // Show the draw container and canvas
        container.style.display = 'block';
        canvas.style.display = 'block';

        // Sync canvas size
        const rect = container.getBoundingClientRect();
        if (canvas.width !== Math.floor(rect.width) || canvas.height !== Math.floor(rect.height)) {
          canvas.width = Math.floor(rect.width);
          canvas.height = Math.floor(rect.height);
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const time = getTime();
        const lookback = 4; // cycles to look back
        const lookahead = 0.5;
        const haps = pattern
          .queryArc(Math.max(0, time - lookback), time + lookahead)
          .filter((h: any) => h.hasOnset?.());

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Call each painter
        for (const painter of painters) {
          try {
            painter(ctx, time, haps, pattern);
          } catch {
            // Painter error — non-fatal
          }
        }
      } catch {
        // Module not loaded yet or pattern not available
      }
    }

    painterRafRef.current = requestAnimationFrame(painterLoop);

    return () => {
      running = false;
      cancelAnimationFrame(painterRafRef.current);
    };
  }, [isPlaying]);

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <span className={styles.label}>STRUDEL REPL</span>
        <span className={styles.hint}>
          {isReady ? 'Ctrl+Enter to evaluate' : 'Initializing...'}
        </span>
      </div>
      <div ref={editorRef} className={styles.editor} />
      <div
        ref={drawContainerRef}
        className={styles.drawContainer}
        style={{ display: 'none' }}
      >
        <canvas ref={drawCanvasRef} data-repl="true" className={styles.drawCanvas} />
      </div>
      {lastError && (
        <div className={styles.errorBar}>
          <span className={styles.errorIcon}>!</span>
          {lastError}
        </div>
      )}
    </div>
  );
};
