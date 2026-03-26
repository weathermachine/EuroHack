import { useEffect } from 'react';
import { useUIStore } from '../stores/uiStore';
import { usePatternStore } from '../stores/patternStore';
import { saveFile, openFile } from '../components/Repl/fileOperations';

/**
 * Global keyboard shortcuts for panel navigation and playback control.
 *
 * Shortcuts defined here:
 *   Ctrl+1       — Focus code panel
 *   Ctrl+2       — Focus viz panel
 *   Ctrl+3       — Focus chat panel
 *   Ctrl+.       — Stop playback (hush)
 *   F11          — Toggle viz fullscreen
 *   Ctrl+S       — Save active tab
 *   Ctrl+O       — Open file into new tab
 *   Ctrl+W       — Close active tab (with dirty check)
 *   Ctrl+Tab     — Cycle to next tab
 *   Ctrl+Shift+Tab — Cycle to previous tab
 *
 * Additional shortcuts defined in ChatInterface.tsx (need ChatInput ref):
 *   Ctrl+\  (hold) — Start speech recognition; release \ to stop
 *   Ctrl+]         — Submit current chat input
 */
export function useKeyboardShortcuts() {
  const setActivePanel = useUIStore((s) => s.setActivePanel);
  const toggleVizFullscreen = useUIStore((s) => s.toggleVizFullscreen);
  const setPlaying = usePatternStore((s) => s.setPlaying);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.ctrlKey;

      // Cmd+1: focus code panel
      if (mod && e.key === '1') {
        e.preventDefault();
        setActivePanel('code');
        return;
      }

      // Cmd+2: focus viz panel
      if (mod && e.key === '2') {
        e.preventDefault();
        setActivePanel('viz');
        return;
      }

      // Cmd+3: focus chat panel
      if (mod && e.key === '3') {
        e.preventDefault();
        setActivePanel('chat');
        return;
      }

      // Cmd+.: stop playback (hush)
      if (mod && e.key === '.') {
        e.preventDefault();
        setPlaying(false);
        return;
      }

      // F11: toggle viz fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        toggleVizFullscreen();
        return;
      }

      // Ctrl+S: save active tab
      if (mod && e.key === 's' && !e.shiftKey) {
        e.preventDefault();
        const store = usePatternStore.getState();
        const tab = store.getActiveTab();
        if (tab) {
          saveFile(tab.code, tab.fileHandle).then((handle) => {
            if (handle) {
              store.setTabFileHandle(tab.id, handle);
              store.setTabDirty(tab.id, false);
              if (tab.name.startsWith('Untitled')) {
                const name = (handle as any).name?.replace(/\.(str|js)$/, '') || tab.name;
                store.setTabName(tab.id, name);
              }
            }
          });
        }
        return;
      }

      // Ctrl+O: open file into new tab
      if (mod && e.key === 'o') {
        e.preventDefault();
        openFile().then((result) => {
          if (result) {
            const store = usePatternStore.getState();
            const tabId = store.addTab(result.name, result.code, result.handle);
            store.setTabDirty(tabId, false);
          }
        });
        return;
      }

      // Ctrl+W: close active tab (dispatches event for non-blocking confirm)
      if (mod && e.key === 'w') {
        e.preventDefault();
        const store = usePatternStore.getState();
        const tab = store.getActiveTab();
        if (tab) {
          window.dispatchEvent(new CustomEvent('ai-rack:close-tab', { detail: tab.id }));
        }
        return;
      }

      // Ctrl+Tab / Ctrl+Shift+Tab: cycle tabs
      if (mod && e.key === 'Tab') {
        e.preventDefault();
        const store = usePatternStore.getState();
        const { tabs, activeTabId } = store;
        if (tabs.length <= 1) return;
        const currentIndex = tabs.findIndex(t => t.id === activeTabId);
        const nextIndex = e.shiftKey
          ? (currentIndex - 1 + tabs.length) % tabs.length
          : (currentIndex + 1) % tabs.length;
        store.setActiveTab(tabs[nextIndex].id);
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActivePanel, toggleVizFullscreen, setPlaying]);
}
