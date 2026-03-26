import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface Tab {
  id: string;
  name: string;
  code: string;
  isDirty: boolean;
  fileHandle?: FileSystemFileHandle | null;
  isArmed: boolean; // participates in concurrent playback via MixBar
}

interface PatternStore {
  // Tab state
  tabs: Tab[];
  activeTabId: string;
  nextUntitledIndex: number;

  // Global state (shared across all tabs)
  isPlaying: boolean;
  cps: number;
  cyclePosition: number;
  lastError: string | null;
  lastWorkingCode: string;

  // Tab actions
  addTab: (name?: string, code?: string, fileHandle?: FileSystemFileHandle | null) => string;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  setTabCode: (tabId: string, code: string) => void;
  setTabName: (tabId: string, name: string) => void;
  setTabDirty: (tabId: string, dirty: boolean) => void;
  setTabFileHandle: (tabId: string, handle: FileSystemFileHandle | null) => void;

  // Mix (concurrent playback)
  explicitlyArmedIds: string[];
  toggleArmed: (tabId: string) => void;
  buildCombinedCode: () => string;

  // Backward-compatible convenience (operates on active tab)
  setCode: (code: string) => void;

  // Derived helper
  getActiveTab: () => Tab | undefined;

  // Global actions (unchanged)
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

function generateId(): string {
  return crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const initialTabId = generateId();

export const usePatternStore = create<PatternStore>()(subscribeWithSelector((set, get) => ({
  // Tab state
  tabs: [
    {
      id: initialTabId,
      name: 'Untitled 1',
      code: DEFAULT_CODE,
      isDirty: false,
      fileHandle: null,
      isArmed: true,
    },
  ],
  activeTabId: initialTabId,
  nextUntitledIndex: 2,
  explicitlyArmedIds: [],

  // Global state
  isPlaying: false,
  cps: 0.5, // 120 BPM
  cyclePosition: 0,
  lastError: null,
  lastWorkingCode: DEFAULT_CODE,

  // Tab actions
  addTab: (name?: string, code?: string, fileHandle?: FileSystemFileHandle | null) => {
    const state = get();
    const id = generateId();
    const tabName = name ?? `Untitled ${state.nextUntitledIndex}`;
    const newTab: Tab = {
      id,
      name: tabName,
      code: code ?? '',
      isDirty: false,
      fileHandle: fileHandle ?? null,
      isArmed: true, // auto-armed since it becomes active
    };
    // Disarm outgoing active tab if not explicitly armed
    const updatedTabs = state.tabs.map((t) =>
      t.id === state.activeTabId && !state.explicitlyArmedIds.includes(t.id)
        ? { ...t, isArmed: false }
        : t,
    );
    set({
      tabs: [...updatedTabs, newTab],
      activeTabId: id,
      ...(name == null ? { nextUntitledIndex: state.nextUntitledIndex + 1 } : {}),
    });
    return id;
  },

  removeTab: (tabId: string) => {
    const state = get();
    const cleanedExplicit = state.explicitlyArmedIds.filter((id) => id !== tabId);

    if (state.tabs.length === 1) {
      const id = generateId();
      const newTab: Tab = {
        id,
        name: `Untitled ${state.nextUntitledIndex}`,
        code: '',
        isDirty: false,
        fileHandle: null,
        isArmed: true,
      };
      set({
        tabs: [newTab],
        activeTabId: id,
        nextUntitledIndex: state.nextUntitledIndex + 1,
        explicitlyArmedIds: [],
      });
      return;
    }

    const idx = state.tabs.findIndex((t) => t.id === tabId);
    const remaining = state.tabs.filter((t) => t.id !== tabId);

    let newActiveId = state.activeTabId;
    if (state.activeTabId === tabId) {
      const newIdx = Math.min(idx, remaining.length - 1);
      newActiveId = remaining[newIdx].id;
      // Auto-arm the new active tab
      remaining[newIdx] = { ...remaining[newIdx], isArmed: true };
    }

    set({ tabs: remaining, activeTabId: newActiveId, explicitlyArmedIds: cleanedExplicit });
  },

  setActiveTab: (tabId: string) => {
    const state = get();
    if (tabId === state.activeTabId) return;

    // Disarm outgoing tab if not explicitly armed, arm incoming tab
    const updatedTabs = state.tabs.map((t) => {
      if (t.id === state.activeTabId && !state.explicitlyArmedIds.includes(t.id)) {
        return { ...t, isArmed: false };
      }
      if (t.id === tabId) {
        return { ...t, isArmed: true };
      }
      return t;
    });

    set({ tabs: updatedTabs, activeTabId: tabId });
  },

  setTabCode: (tabId: string, code: string) => {
    set({
      tabs: get().tabs.map((t) =>
        t.id === tabId ? { ...t, code, isDirty: true } : t,
      ),
    });
  },

  setTabName: (tabId: string, name: string) => {
    set({
      tabs: get().tabs.map((t) =>
        t.id === tabId ? { ...t, name } : t,
      ),
    });
  },

  setTabDirty: (tabId: string, dirty: boolean) => {
    set({
      tabs: get().tabs.map((t) =>
        t.id === tabId ? { ...t, isDirty: dirty } : t,
      ),
    });
  },

  setTabFileHandle: (tabId: string, handle: FileSystemFileHandle | null) => {
    set({
      tabs: get().tabs.map((t) =>
        t.id === tabId ? { ...t, fileHandle: handle } : t,
      ),
    });
  },

  // Mix (concurrent playback)
  toggleArmed: (tabId: string) => {
    const state = get();
    const tab = state.tabs.find((t) => t.id === tabId);
    if (!tab) return;

    const newArmed = !tab.isArmed;
    const updatedTabs = state.tabs.map((t) =>
      t.id === tabId ? { ...t, isArmed: newArmed } : t,
    );

    let updatedExplicit = state.explicitlyArmedIds;
    if (newArmed) {
      // Explicitly arming — remember this
      if (!updatedExplicit.includes(tabId)) {
        updatedExplicit = [...updatedExplicit, tabId];
      }
    } else {
      // Explicitly disarming — forget explicit status
      updatedExplicit = updatedExplicit.filter((id) => id !== tabId);
    }

    set({ tabs: updatedTabs, explicitlyArmedIds: updatedExplicit });
  },

  buildCombinedCode: () => {
    const state = get();
    const armedTabs = state.tabs.filter((t) => t.isArmed && t.code.trim());
    if (armedTabs.length === 0) return '';
    if (armedTabs.length === 1) return armedTabs[0].code;

    // Concatenate directly — no {} blocks because Strudel's transpiler
    // treats $: as special label syntax that must be at the top level.
    // Variable collisions (duplicate let/const names) will produce a clear
    // error the user can fix by renaming.
    return armedTabs
      .map((tab) => `// ── ${tab.name} ──\n${tab.code}`)
      .join('\n\n');
  },

  // Backward-compatible convenience
  setCode: (code: string) => {
    const state = get();
    set({
      tabs: state.tabs.map((t) =>
        t.id === state.activeTabId ? { ...t, code, isDirty: true } : t,
      ),
    });
  },

  // Derived helper
  getActiveTab: () => {
    const state = get();
    return state.tabs.find((t) => t.id === state.activeTabId);
  },

  // Global actions (unchanged)
  setPlaying: (isPlaying) => set({ isPlaying }),
  setCps: (cps) => set({ cps }),
  setCyclePosition: (cyclePosition) => set({ cyclePosition }),
  setError: (lastError) => set({ lastError }),
  setLastWorkingCode: (lastWorkingCode) => set({ lastWorkingCode }),
})));

export const selectActiveCode = (state: ReturnType<typeof usePatternStore.getState>) => {
  const tab = state.tabs.find((t) => t.id === state.activeTabId);
  return tab?.code ?? '';
};
