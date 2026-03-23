import { useMemo, useState } from 'react';
import type { ChatMessage as ChatMessageType } from '@/types/messages';
import CodeBlockComponent from './CodeBlock';
import styles from './ChatMessage.module.css';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
  streamBuffer?: string;
  onInjectCode?: (code: string) => void;
}

interface ContentSegment {
  type: 'text' | 'code';
  content: string;
  language?: string;
}

function parseContent(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index);
      if (text.trim()) {
        segments.push({ type: 'text', content: text });
      }
    }
    segments.push({
      type: 'code',
      language: match[1] || 'strudel',
      content: match[2],
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const text = content.slice(lastIndex);
    if (text.trim()) {
      segments.push({ type: 'text', content: text });
    }
  }

  if (segments.length === 0 && content.trim()) {
    segments.push({ type: 'text', content });
  }

  return segments;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatMessage({
  message,
  isStreaming = false,
  streamBuffer,
  onInjectCode,
}: ChatMessageProps) {
  const [collapsed, setCollapsed] = useState(false);

  const displayContent =
    isStreaming && streamBuffer !== undefined ? streamBuffer : message.content;

  const segments = useMemo(() => parseContent(displayContent), [displayContent]);

  const isUser = message.role === 'user';

  // Get a preview for collapsed state (first 60 chars)
  const preview = displayContent.slice(0, 60).replace(/\n/g, ' ');

  return (
    <div className={`${styles.message} ${isUser ? styles.user : styles.assistant}`}>
      <div className={styles.header}>
        <span
          className={styles.collapseToggle}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? '▸' : '▾'}
        </span>
        {isUser && <span className={styles.userPrefix}>&gt;</span>}
        {!isUser && <span className={styles.assistantPrefix}>◇</span>}
        {collapsed && <span className={styles.preview}>{preview}…</span>}
        <span className={styles.timestamp}>{formatTime(message.timestamp)}</span>
      </div>

      {!collapsed && (
        <div className={styles.content}>
          {segments.map((segment, i) =>
            segment.type === 'code' ? (
              <CodeBlockComponent
                key={i}
                code={segment.content}
                language={segment.language ?? 'strudel'}
                onInject={onInjectCode}
              />
            ) : (
              <span key={i}>{segment.content}</span>
            ),
          )}
          {isStreaming && <span className={styles.streamCursor} />}
        </div>
      )}
    </div>
  );
}
