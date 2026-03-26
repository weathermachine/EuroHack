import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onConfirm, onCancel]);

  return (
    <div style={overlay} onClick={onCancel}>
      <div style={dialog} onClick={(e) => e.stopPropagation()}>
        <p style={msg}>{message}</p>
        <div style={buttons}>
          <button style={btnCancel} onClick={onCancel}>Cancel</button>
          <button ref={confirmRef} style={btnConfirm} onClick={onConfirm}>Close</button>
        </div>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0, 0, 0, 0.5)',
};

const dialog: React.CSSProperties = {
  background: '#12121a',
  border: '1px solid #1a1a2e',
  borderRadius: 8,
  padding: '20px 24px',
  maxWidth: 360,
  fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
  fontSize: 13,
  color: '#e0e0e0',
};

const msg: React.CSSProperties = {
  margin: '0 0 16px',
  lineHeight: 1.5,
};

const buttons: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  justifyContent: 'flex-end',
};

const btnBase: React.CSSProperties = {
  fontFamily: 'inherit',
  fontSize: 12,
  padding: '6px 16px',
  border: '1px solid #1a1a2e',
  borderRadius: 4,
  cursor: 'pointer',
  outline: 'none',
};

const btnCancel: React.CSSProperties = {
  ...btnBase,
  background: 'transparent',
  color: '#555577',
};

const btnConfirm: React.CSSProperties = {
  ...btnBase,
  background: 'rgba(255, 51, 51, 0.15)',
  borderColor: '#ff3333',
  color: '#ff3333',
};
