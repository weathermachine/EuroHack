import React from 'react';
import type { Tab } from '@/stores/patternStore';
import styles from './MixBar.module.css';

interface MixBarProps {
  tabs: Tab[];
  activeTabId: string;
  onToggleArmed: (tabId: string) => void;
}

const MixBar: React.FC<MixBarProps> = ({ tabs, activeTabId, onToggleArmed }) => {
  return (
    <div className={styles.mixBar}>
      <span className={styles.label}>MIX</span>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`${styles.channel} ${tab.id === activeTabId ? styles.channelActive : ''}`}
        >
          <span className={styles.channelName}>{tab.name}</span>
          <button
            className={`${styles.toggle} ${tab.isArmed ? styles.toggleOn : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleArmed(tab.id);
            }}
            title={tab.isArmed ? 'Disarm tab' : 'Arm tab for playback'}
          >
            <span className={styles.toggleDot} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default MixBar;
