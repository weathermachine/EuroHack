import { useCallback, useRef, forwardRef, useImperativeHandle, type KeyboardEvent } from 'react';
import { useChatStore } from '@/stores/chatStore';
import styles from './ChatInput.module.css';

interface ChatInputProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  isListening?: boolean;
}

export interface ChatInputHandle {
  getValue: () => string;
  setValue: (text: string) => void;
  submit: () => void;
}

const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
  ({ onSubmit, disabled = false, isListening = false }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const navigateHistory = useChatStore((s) => s.navigateHistory);

    useImperativeHandle(ref, () => ({
      getValue: () => inputRef.current?.value ?? '',
      setValue: (text: string) => {
        if (inputRef.current) inputRef.current.value = text;
      },
      submit: () => {
        const val = inputRef.current?.value?.trim();
        if (val) {
          onSubmit(val);
          if (inputRef.current) inputRef.current.value = '';
        }
      },
    }));

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
      <div className={`${styles.wrapper} ${isListening ? styles.recording : ''}`}>
        <span className={styles.prompt}>λ&gt;</span>
        {isListening && <span className={styles.recordingDot} />}
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
  },
);

ChatInput.displayName = 'ChatInput';

export default ChatInput;
