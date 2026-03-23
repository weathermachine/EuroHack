import { useState, useEffect, useRef } from 'react';
import { usePatternStore } from '../../stores/patternStore';
import { useUIStore } from '../../stores/uiStore';
import { useAudioStore } from '../../stores/audioStore';
import { useBeatReactive } from '../../hooks/useBeatReactive';
import styles from './StatusBar.module.css';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

export default function StatusBar() {
  const cps = usePatternStore((s) => s.cps);
  const isPlaying = usePatternStore((s) => s.isPlaying);
  const setPlaying = usePatternStore((s) => s.setPlaying);
  const crtEnabled = useUIStore((s) => s.crtEnabled);
  const toggleCrt = useUIStore((s) => s.toggleCrt);
  const { beatScale } = useBeatReactive();

  const [elapsed, setElapsed] = useState(0);
  const playStartRef = useRef<number | null>(null);

  const bpm = Math.round(cps * 120);

  // Timer
  useEffect(() => {
    if (isPlaying) {
      playStartRef.current = Date.now() - elapsed * 1000;
      const interval = setInterval(() => {
        if (playStartRef.current !== null) {
          setElapsed((Date.now() - playStartRef.current) / 1000);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const handlePlay = () => {
    if (!isPlaying) {
      setElapsed(0);
      setPlaying(true);
    }
  };

  const handleStop = () => {
    setPlaying(false);
    playStartRef.current = null;
  };

  return (
    <div className={styles.statusBar}>
      <div className={styles.left}>
        {/* Transport */}
        <div className={styles.transport}>
          <button className={styles.transportBtn} onClick={handlePlay}>
            ▶
          </button>
          <button className={styles.transportBtn} onClick={handleStop}>
            ■
          </button>
        </div>
        <span className={styles.separator}>│</span>

        {/* BPM — scales on beat */}
        <span
          className={styles.bpm}
          style={{ transform: `scale(${beatScale})` }}
        >
          ♩ {bpm} BPM
        </span>
        <span className={styles.separator}>│</span>

        {/* Playing state */}
        <span className={isPlaying ? styles.playing : styles.stopped}>
          {isPlaying ? '▶ playing' : '■ stopped'}
        </span>
        <span className={styles.separator}>│</span>

        {/* Key placeholder */}
        <span className={styles.key}>Key: —</span>
      </div>

      <div className={styles.right}>
        {/* CRT toggle */}
        <button
          className={`${styles.crtToggle} ${crtEnabled ? styles.crtActive : ''}`}
          onClick={toggleCrt}
        >
          CRT
        </button>
        <span className={styles.separator}>│</span>

        {/* Timer */}
        <span className={styles.timer}>{formatTime(elapsed)}</span>
      </div>
    </div>
  );
}
