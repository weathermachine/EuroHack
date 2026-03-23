import { useCallback, useRef, type KeyboardEvent, type ChangeEvent } from 'react';
import { useChatStore } from '@/stores/chatStore';
import styles from './ChatInput.module.css';

interface ChatInputProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSubmit, disabled = false }: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigateHistory = useChatStore((s) => s.navigateHistory);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const value = inputRef.current?.value.trim();
        if (value) {
          onSubmit(value);
          if (inputRef.current) inputRef.current.value = '';
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = navigateHistory('up');
        if (prev !== undefined && inputRef.current) {
          inputRef.current.value = prev;
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = navigateHistory('down');
        if (next !== undefined && inputRef.current) {
          inputRef.current.value = next;
        }
      }
    },
    [onSubmit, navigateHistory],
  );

  return (
    <div className={styles.wrapper}>
      <span className={styles.prompt}>λ&gt;</span>
      <input
        ref={inputRef}
        className={styles.input}
        type="text"
        placeholder={disabled ? 'Waiting for response...' : 'Ask about music, patterns, or Strudel...'}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        autoFocus
      />
    </div>
  );
}
