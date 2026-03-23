import { create } from 'zustand';

type PanelId = 'code' | 'viz' | 'chat';

interface UIStore {
  activePanel: PanelId;
  crtEnabled: boolean;
  vizFullscreen: boolean;

  setActivePanel: (panel: PanelId) => void;
  toggleCrt: () => void;
  toggleVizFullscreen: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activePanel: 'code',
  crtEnabled: false,
  vizFullscreen: false,

  setActivePanel: (activePanel) => set({ activePanel }),
  toggleCrt: () => set((state) => ({ crtEnabled: !state.crtEnabled })),
  toggleVizFullscreen: () =>
    set((state) => ({ vizFullscreen: !state.vizFullscreen })),
}));
