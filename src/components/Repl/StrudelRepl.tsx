import React, { useEffect, useRef, useCallback } from 'react';
import { EditorState, Extension } from '@codemirror/state';
import { EditorView, keymap, ViewUpdate } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { basicSetup } from 'codemirror';
import { strudelHighlight } from './strudelHighlight';
import { activeHighlightExtension, startHighlightLoop, stopHighlightLoop, clearHighlights } from './activeHighlight';
import { useStrudel } from './useStrudel';
import { usePatternStore, selectActiveCode } from '@/stores/patternStore';
import type { Tab } from '@/stores/patternStore';
import TabBar from './TabBar';
import MixBar from './MixBar';
import { saveFile, saveFileAs, openFile } from './fileOperations';
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

// Use refs for handlers so CodeMirror keymaps don't need to be recreated
// when callbacks change. This prevents the cascading re-initialization bug.
const handlerRefs = {
  evaluate: null as (() => void) | null,
  stop: null as (() => void) | null,
  save: null as (() => void) | null,
  saveAs: null as (() => void) | null,
  open: null as (() => void) | null,
};

// Build extensions ONCE — keymaps dispatch through stable refs
function buildExtensions(updatingFromStore: React.MutableRefObject<boolean>): Extension[] {
  const updateListener = EditorView.updateListener.of((update: ViewUpdate) => {
    if (update.docChanged && !updatingFromStore.current) {
      const currentTabId = usePatternStore.getState().activeTabId;
      usePatternStore.getState().setTabCode(currentTabId, update.state.doc.toString());
    }
  });

  const evalKeymap = keymap.of([
    { key: 'Ctrl-Enter', run: () => { handlerRefs.evaluate?.(); return true; } },
    { key: 'Ctrl-.', run: () => { handlerRefs.stop?.(); return true; } },
    { key: 'Ctrl-s', run: () => { handlerRefs.save?.(); return true; } },
    { key: 'Ctrl-Shift-s', run: () => { handlerRefs.saveAs?.(); return true; } },
    { key: 'Ctrl-o', run: () => { handlerRefs.open?.(); return true; } },
  ]);

  return [
    basicSetup,
    javascript(),
    strudelHighlight,
    darkTheme,
    evalKeymap,
    updateListener,
    EditorView.lineWrapping,
    activeHighlightExtension(),
  ];
}

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

  // Tab state from store
  const tabs = usePatternStore((s) => s.tabs);
  const activeTabId = usePatternStore((s) => s.activeTabId);

  // EditorState cache for tab switching (preserves undo/redo per tab)
  const tabStatesRef = useRef<Map<string, EditorState>>(new Map());
  const prevActiveTabIdRef = useRef<string>(activeTabId);
  // Stable extensions ref (built once)
  const extensionsRef = useRef<Extension[] | null>(null);

  // --- File operation handlers ---

  const handleSave = useCallback(async () => {
    const tab = usePatternStore.getState().getActiveTab();
    if (!tab) return;
    const handle = await saveFile(tab.code, tab.fileHandle);
    if (handle) {
      usePatternStore.getState().setTabFileHandle(tab.id, handle);
      usePatternStore.getState().setTabDirty(tab.id, false);
      if (tab.name.startsWith('Untitled')) {
        const name = (handle as any).name?.replace(/\.(str|js)$/, '') || tab.name;
        usePatternStore.getState().setTabName(tab.id, name);
      }
    }
  }, []);

  const handleSaveAs = useCallback(async () => {
    const tab = usePatternStore.getState().getActiveTab();
    if (!tab) return;
    const handle = await saveFileAs(tab.code);
    if (handle) {
      usePatternStore.getState().setTabFileHandle(tab.id, handle);
      usePatternStore.getState().setTabDirty(tab.id, false);
      const name = (handle as any).name?.replace(/\.(str|js)$/, '') || tab.name;
      usePatternStore.getState().setTabName(tab.id, name);
    }
  }, []);

  const handleOpen = useCallback(async () => {
    const result = await openFile();
    if (result) {
      const store = usePatternStore.getState();
      const tabId = store.addTab(result.name, result.code, result.handle);
      store.setTabDirty(tabId, false);
    }
  }, []);

  const handleCloseTab = useCallback((tabId: string) => {
    const store = usePatternStore.getState();
    const tab = store.tabs.find((t: Tab) => t.id === tabId);
    if (tab?.isDirty) {
      if (!window.confirm(`"${tab.name}" has unsaved changes. Close anyway?`)) return;
    }
    tabStatesRef.current.delete(tabId);
    store.removeTab(tabId);
  }, []);

  const handleAddTab = useCallback(() => {
    usePatternStore.getState().addTab();
  }, []);

  const handleRenameTab = useCallback((tabId: string, newName: string) => {
    usePatternStore.getState().setTabName(tabId, newName);
  }, []);

  const handleEvaluate = useCallback(() => {
    if (!viewRef.current) return;
    // Sync editor content to store first
    const code = viewRef.current.state.doc.toString();
    const store = usePatternStore.getState();
    store.setTabCode(store.activeTabId, code);
    // Evaluate all armed tabs combined
    const combinedCode = store.buildCombinedCode();
    if (combinedCode) evaluate(combinedCode);
  }, [evaluate]);

  // Keep handler refs up to date (keymaps dispatch through these)
  handlerRefs.evaluate = handleEvaluate;
  handlerRefs.stop = stop;
  handlerRefs.save = handleSave;
  handlerRefs.saveAs = handleSaveAs;
  handlerRefs.open = handleOpen;

  // --- Initialize CodeMirror (ONCE) ---

  useEffect(() => {
    if (!editorRef.current) return;

    const activeTab = usePatternStore.getState().getActiveTab();
    const initialCode = activeTab?.code ?? '';

    if (!extensionsRef.current) {
      extensionsRef.current = buildExtensions(updatingFromStore);
    }

    const state = EditorState.create({
      doc: initialCode,
      extensions: extensionsRef.current,
    });

    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;
    startHighlightLoop(view);

    return () => { stopHighlightLoop(); clearHighlights(); view.destroy(); viewRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty — editor created once, never recreated

  // --- Tab switching ---

  useEffect(() => {
    const view = viewRef.current;
    if (!view || activeTabId === prevActiveTabIdRef.current) return;

    // Save current tab's EditorState
    tabStatesRef.current.set(prevActiveTabIdRef.current, view.state);

    // Restore or create target tab's state
    // Wrap in updatingFromStore to suppress the updateListener from writing
    // the new tab's code back to the store (it's already correct there)
    updatingFromStore.current = true;

    const cachedState = tabStatesRef.current.get(activeTabId);
    if (cachedState) {
      view.setState(cachedState);
    } else {
      const tab = usePatternStore.getState().tabs.find((t: Tab) => t.id === activeTabId);
      if (!extensionsRef.current) {
        extensionsRef.current = buildExtensions(updatingFromStore);
      }
      const newState = EditorState.create({
        doc: tab?.code ?? '',
        extensions: extensionsRef.current,
      });
      view.setState(newState);
    }

    updatingFromStore.current = false;
    prevActiveTabIdRef.current = activeTabId;
  }, [activeTabId]);

  // --- Sync store → editor (for AI updates to active tab) ---
  // Track the tab ID so we can distinguish "code changed because a different
  // tab became active" from "code changed within the same tab" (e.g. AI update).
  // Only the latter should push content into the editor — tab switches are
  // handled by the tab switch effect above.

  useEffect(() => {
    let lastSeenTabId = usePatternStore.getState().activeTabId;

    const unsub = usePatternStore.subscribe(
      selectActiveCode,
      (code) => {
        const currentTabId = usePatternStore.getState().activeTabId;

        // selectActiveCode changed because a different tab is now active —
        // the tab switch useEffect handles loading that tab's EditorState.
        if (currentTabId !== lastSeenTabId) {
          lastSeenTabId = currentTabId;
          return;
        }

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

  // Clear highlights when playback stops
  useEffect(() => {
    if (!isPlaying) clearHighlights();
  }, [isPlaying]);

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
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={(id) => usePatternStore.getState().setActiveTab(id)}
        onCloseTab={handleCloseTab}
        onAddTab={handleAddTab}
        onRenameTab={handleRenameTab}
      />
      <div className={styles.toolbar}>
        <span className={styles.label}>STRUDEL REPL</span>
        <span className={styles.hint}>
          {isReady ? 'Ctrl+Enter to evaluate' : 'Initializing...'}
        </span>
      </div>
      <div ref={editorRef} className={styles.editor} />
      <MixBar
        tabs={tabs}
        activeTabId={activeTabId}
        onToggleArmed={(id) => usePatternStore.getState().toggleArmed(id)}
      />
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
