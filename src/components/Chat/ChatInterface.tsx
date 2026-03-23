import { useCallback, useRef } from 'react';
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';
import { useChatStore, createMessageId } from '@/stores/chatStore';
import { usePatternStore } from '@/stores/patternStore';
import { useVizStore } from '@/stores/vizStore';
import { sendChatMessage } from '@/api/chat';
import type { ChatMessage as ChatMessageType, ToolCall } from '@/types/messages';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import styles from './ChatInterface.module.css';

export default function ChatInterface() {
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const streamBuffer = useChatStore((s) => s.streamBuffer);
  const addMessage = useChatStore((s) => s.addMessage);
  const setStreaming = useChatStore((s) => s.setStreaming);
  const appendStream = useChatStore((s) => s.appendStream);
  const completeStream = useChatStore((s) => s.completeStream);
  const addToHistory = useChatStore((s) => s.addToHistory);

  const patternCode = usePatternStore((s) => s.code);
  const isPlaying = usePatternStore((s) => s.isPlaying);
  const cps = usePatternStore((s) => s.cps);
  const lastError = usePatternStore((s) => s.lastError);
  const setCode = usePatternStore((s) => s.setCode);

  const handleToolCall = useCallback(
    (tool: ToolCall) => {
      switch (tool.name) {
        case 'update_pattern': {
          const code = tool.input.code as string;
          if (code) {
            setCode(code);
            import('@/audio/engine').then(async (engine) => {
              const result = await engine.evaluateCode(code);
              if (!result.success) {
                // Show error in chat so user knows what happened
                appendStream(`\n⚠️ Code error: ${result.error}`);
              }
            }).catch(() => {});
          }
          break;
        }
        case 'update_visualization': {
          const code = tool.input.code as string;
          if (code) {
            useVizStore.getState().setCustomDraw(code);
          }
          break;
        }
        // explain_music and suggest_changes are text-only, handled by stream
      }
    },
    [setCode],
  );

  const handleSubmit = useCallback(
    (text: string) => {
      // Add user message
      const userMsg: ChatMessageType = {
        id: createMessageId(),
        role: 'user',
        content: text,
        codeBlocks: [],
        timestamp: Date.now(),
      };
      addMessage(userMsg);
      addToHistory(text);

      // Start streaming
      setStreaming(true);

      // Create placeholder assistant message
      const assistantMsg: ChatMessageType = {
        id: createMessageId(),
        role: 'assistant',
        content: '',
        codeBlocks: [],
        timestamp: Date.now(),
      };
      addMessage(assistantMsg);

      sendChatMessage(
        {
          message: text,
          context: {
            code: patternCode,
            isPlaying,
            cps,
            error: lastError ?? undefined,
          },
        },
        {
          onText: (chunk) => {
            appendStream(chunk);
          },
          onToolCall: handleToolCall,
          onError: (error) => {
            appendStream(`\n[Error: ${error}]`);
            completeStream();
          },
          onDone: () => {
            completeStream();
          },
        },
      );

      // Scroll to bottom
      setTimeout(() => {
        virtuosoRef.current?.scrollToIndex({
          index: 'LAST',
          behavior: 'smooth',
        });
      }, 50);
    },
    [
      addMessage,
      addToHistory,
      setStreaming,
      appendStream,
      completeStream,
      handleToolCall,
      patternCode,
      isPlaying,
      cps,
      lastError,
    ],
  );

  const handleInjectCode = useCallback(
    (code: string) => {
      setCode(code);
      import('@/audio/engine').then((engine) => {
        engine.evaluateCode(code);
      }).catch(() => {
        // Engine may not be initialized
      });
    },
    [setCode],
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>Chat</div>

      {messages.length === 0 ? (
        <div className={styles.empty}>
          Ask about Strudel patterns,{'\n'}
          music theory, or say{'\n'}
          &quot;make a beat&quot;
        </div>
      ) : (
        <Virtuoso
          ref={virtuosoRef}
          className={styles.messageList}
          data={messages}
          followOutput="smooth"
          initialTopMostItemIndex={messages.length - 1}
          itemContent={(index, message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isStreaming={
                isStreaming && index === messages.length - 1
              }
              streamBuffer={
                isStreaming && index === messages.length - 1
                  ? streamBuffer
                  : undefined
              }
              onInjectCode={handleInjectCode}
            />
          )}
        />
      )}

      {isStreaming && (
        <div className={styles.streamingIndicator}>
          <span className={styles.dot}>.</span>
          <span className={styles.dot}>.</span>
          <span className={styles.dot}>.</span>
        </div>
      )}

      <ChatInput onSubmit={handleSubmit} disabled={isStreaming} />
    </div>
  );
}
