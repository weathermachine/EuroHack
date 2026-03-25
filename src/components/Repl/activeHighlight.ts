/**
 * CodeMirror extension that highlights actively playing notes/beats in the REPL.
 *
 * Strudel's transpiler attaches source locations to each pattern leaf via `withLoc`.
 * When a hap triggers, `hap.context.locations` contains [{start, end}] character offsets
 * into the source code. We create CodeMirror decorations that briefly flash those ranges.
 */
import { StateField, StateEffect } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView } from '@codemirror/view';
import type { Extension } from '@codemirror/state';

/** Effect to replace all highlights with a new set */
const setHighlights = StateEffect.define<{ from: number; to: number }[]>();

const highlightMark = Decoration.mark({ class: 'cm-active-hap' });

/** StateField that holds the current highlight decorations */
const highlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decos, tr) {
    // Map positions through document changes
    decos = decos.map(tr.changes);

    for (const effect of tr.effects) {
      if (effect.is(setHighlights)) {
        const docLen = tr.state.doc.length;
        const ranges = effect.value
          .filter(h => h.from >= 0 && h.to <= docLen && h.from < h.to)
          .sort((a, b) => a.from - b.from || a.to - b.to)
          // Merge overlapping ranges
          .reduce<{ from: number; to: number }[]>((acc, h) => {
            const last = acc[acc.length - 1];
            if (last && h.from <= last.to) {
              last.to = Math.max(last.to, h.to);
            } else {
              acc.push({ from: h.from, to: h.to });
            }
            return acc;
          }, [])
          .map(h => highlightMark.range(h.from, h.to));

        decos = Decoration.set(ranges, true);
      }
    }
    return decos;
  },
  provide: (f) => EditorView.decorations.from(f),
});

// --- Active highlight list (managed externally) ---

interface ActiveHighlight {
  from: number;
  to: number;
  expiresAt: number;
}

const activeList: ActiveHighlight[] = [];
const MAX_HIGHLIGHTS = 200;

/** Called by the audio engine when a hap triggers */
export function pushHighlight(locations: Array<{ start: number; end: number }>, duration: number) {
  const now = performance.now();
  const expiresAt = now + Math.max(duration * 1000, 100); // at least 100ms visible

  for (const loc of locations) {
    if (loc.start != null && loc.end != null && loc.start < loc.end) {
      activeList.push({ from: loc.start, to: loc.end, expiresAt });
    }
  }

  if (activeList.length > MAX_HIGHLIGHTS) {
    activeList.splice(0, activeList.length - MAX_HIGHLIGHTS);
  }
}

/** Clear all highlights */
export function clearHighlights() {
  activeList.length = 0;
}

// --- RAF loop that syncs activeList → CodeMirror ---

let rafId = 0;
let currentView: EditorView | null = null;
let lastRangeKey = '';

function tick() {
  if (!currentView) return;
  rafId = requestAnimationFrame(tick);

  const now = performance.now();

  // Expire old highlights
  for (let i = activeList.length - 1; i >= 0; i--) {
    if (activeList[i].expiresAt < now) {
      activeList.splice(i, 1);
    }
  }

  // Build current active ranges
  const ranges = activeList.map(h => ({ from: h.from, to: h.to }));

  // Quick check if anything changed (avoid dispatching every frame)
  const rangeKey = ranges.map(r => `${r.from}:${r.to}`).join(',');
  if (rangeKey === lastRangeKey) return;
  lastRangeKey = rangeKey;

  // Dispatch effect to update decorations
  try {
    currentView.dispatch({
      effects: setHighlights.of(ranges),
    });
  } catch {
    // View may be destroyed
  }
}

/** Start the RAF highlight loop */
export function startHighlightLoop(view: EditorView) {
  currentView = view;
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(tick);
}

/** Stop the highlight loop */
export function stopHighlightLoop() {
  currentView = null;
  cancelAnimationFrame(rafId);
  lastRangeKey = '';
}

/** CSS theme for active hap highlights */
const activeHighlightTheme = EditorView.baseTheme({
  '.cm-active-hap': {
    backgroundColor: 'rgba(0, 255, 65, 0.18)',
    borderBottom: '2px solid rgba(0, 255, 65, 0.7)',
    borderRadius: '2px',
  },
});

/** CodeMirror extension — add this to your editor extensions */
export function activeHighlightExtension(): Extension {
  return [highlightField, activeHighlightTheme];
}
