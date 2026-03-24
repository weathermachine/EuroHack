import { useEffect } from 'react';
import { useUIStore } from '../stores/uiStore';
import { usePatternStore } from '../stores/patternStore';

/**
 * Global keyboard shortcuts for panel navigation and playback control.
 *
 * Shortcuts defined here:
 *   Ctrl+1       — Focus code panel
 *   Ctrl+2       — Focus viz panel
 *   Ctrl+3       — Focus chat panel
 *   Ctrl+.       — Stop playback (hush)
 *   F11          — Toggle viz fullscreen
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
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActivePanel, toggleVizFullscreen, setPlaying]);
}
