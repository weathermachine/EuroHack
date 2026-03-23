import { useUIStore } from './stores/uiStore';
import PanelLayout from './components/Layout/PanelLayout';
import StatusBar from './components/StatusBar/StatusBar';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useAudioReactive } from './audio/reactive';

export default function App() {
  const crtEnabled = useUIStore((s) => s.crtEnabled);

  useKeyboardShortcuts();
  useAudioReactive();

  return (
    <div id="app" className={crtEnabled ? 'crt-enabled' : ''}>
      <PanelLayout />
      <StatusBar />
    </div>
  );
}
