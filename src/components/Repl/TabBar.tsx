import React, { useState, useRef, useCallback } from 'react';
import type { Tab } from '@/stores/patternStore';
import styles from './TabBar.module.css';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onAddTab: () => void;
  onRenameTab: (tabId: string, newName: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onAddTab,
  onRenameTab,
}) => {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const commitRename = useCallback(() => {
    if (editingTabId && editValue.trim()) {
      onRenameTab(editingTabId, editValue.trim());
    }
    setEditingTabId(null);
  }, [editingTabId, editValue, onRenameTab]);

  const handleDoubleClick = useCallback((tab: Tab) => {
    setEditingTabId(tab.id);
    setEditValue(tab.name);
    // Focus the input after render
    requestAnimationFrame(() => inputRef.current?.select());
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        commitRename();
      } else if (e.key === 'Escape') {
        setEditingTabId(null);
      }
    },
    [commitRename],
  );

  return (
    <div className={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const isEditing = tab.id === editingTabId;

        return (
          <div
            key={tab.id}
            className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
            onClick={() => onSelectTab(tab.id)}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                className={styles.renameInput}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <span
                className={styles.tabName}
                onDoubleClick={() => handleDoubleClick(tab)}
              >
                {tab.name}
              </span>
            )}
            {tab.isDirty && <span className={styles.dirtyDot} />}
            <button
              className={styles.closeBtn}
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
              title="Close tab"
            >
              &times;
            </button>
          </div>
        );
      })}
      <button className={styles.addBtn} onClick={onAddTab} title="New tab">
        +
      </button>
    </div>
  );
};

export default TabBar;
