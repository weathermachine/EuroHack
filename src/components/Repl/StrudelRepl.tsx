import React, { useEffect, useRef, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, ViewUpdate } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { basicSetup } from 'codemirror';
import { strudelHighlight } from './strudelHighlight';
import { useStrudel } from './useStrudel';
import { usePatternStore } from '@/stores/patternStore';
import styles from './StrudelRepl.module.css';

// Dark theme matching Phosphor Dark colors
const darkTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#0a0a0f',
      color: '#e0e0e0',
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: '14px',
      height: '100%',
    },
    '.cm-content': {
      caretColor: '#00ff41',
      padding: '8px 0',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: '#00ff41',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
      backgroundColor: '#1a1a3a',
    },
    '.cm-gutters': {
      backgroundColor: '#0a0a0f',
      color: '#555577',
      border: 'none',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#12121a',
    },
    '.cm-activeLine': {
      backgroundColor: '#12121a',
    },
    '.cm-matchingBracket': {
      backgroundColor: '#1a1a2e',
      outline: '1px solid #00d4ff',
    },
  },
  { dark: true }
);

export const StrudelRepl: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { evaluate, stop, isReady } = useStrudel();
  const lastError = usePatternStore((s) => s.lastError);

  // Track whether we're updating from store to avoid loops
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
        run: () => {
          handleEvaluate();
          return true;
        },
      },
      {
        key: 'Ctrl-.',
        run: () => {
          stop();
          return true;
        },
      },
    ]);

    const updateListener = EditorView.updateListener.of((update: ViewUpdate) => {
      if (update.docChanged && !updatingFromStore.current) {
        const code = update.state.doc.toString();
        usePatternStore.getState().setCode(code);
      }
    });

    const state = EditorState.create({
      doc: initialCode,
      extensions: [
        basicSetup,
        javascript(),
        strudelHighlight,
        darkTheme,
        evalKeymap,
        updateListener,
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [handleEvaluate, stop]);

  // Sync store → editor (for AI-driven code changes)
  useEffect(() => {
    const unsub = usePatternStore.subscribe(
      (state) => state.code,
      (code) => {
        const view = viewRef.current;
        if (!view) return;

        const currentDoc = view.state.doc.toString();
        if (code !== currentDoc) {
          updatingFromStore.current = true;
          view.dispatch({
            changes: {
              from: 0,
              to: view.state.doc.length,
              insert: code,
            },
          });
          updatingFromStore.current = false;
        }
      }
    );

    return unsub;
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <span className={styles.label}>STRUDEL REPL</span>
        <span className={styles.hint}>
          {isReady ? 'Ctrl+Enter to evaluate' : 'Initializing...'}
        </span>
      </div>
      <div ref={editorRef} className={styles.editor} />
      {lastError && (
        <div className={styles.errorBar}>
          <span className={styles.errorIcon}>!</span>
          {lastError}
        </div>
      )}
    </div>
  );
};
