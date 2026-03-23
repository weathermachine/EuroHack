import { useCallback, useState } from 'react';
import styles from './CodeBlock.module.css';

interface CodeBlockProps {
  code: string;
  language: string;
  onInject?: (code: string) => void;
}

export default function CodeBlock({ code, language, onInject }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API may not be available
    }
  }, [code]);

  const handleInject = useCallback(() => {
    onInject?.(code);
  }, [code, onInject]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.language}>{language || 'code'}</span>
        <div className={styles.actions}>
          <button className={styles.copyButton} onClick={handleCopy}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          {onInject && (
            <button className={styles.button} onClick={handleInject}>
              ▶ Apply
            </button>
          )}
        </div>
      </div>
      <pre className={styles.code}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
