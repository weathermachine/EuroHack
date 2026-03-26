import { useCallback, useRef, useEffect } from 'react';
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';
import { useChatStore, createMessageId } from '@/stores/chatStore';
import { usePatternStore, selectActiveCode } from '@/stores/patternStore';
import { useVizStore } from '@/stores/vizStore';
import { sendChatMessage } from '@/api/chat';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import type { ChatMessage as ChatMessageType, ToolCall } from '@/types/messages';
import ChatMessage from './ChatMessage';
import ChatInput, { type ChatInputHandle } from './ChatInput';
import styles from './ChatInterface.module.css';

export default function ChatInterface() {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const chatInputRef = useRef<ChatInputHandle>(null);

  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const addMessage = useChatStore((s) => s.addMessage);
  const setStreaming = useChatStore((s) => s.setStreaming);
  const appendToLastMessage = useChatStore((s) => s.appendToLastMessage);
  const completeStream = useChatStore((s) => s.completeStream);
  const addToHistory = useChatStore((s) => s.addToHistory);

  const patternCode = usePatternStore(selectActiveCode);
  const isPlaying = usePatternStore((s) => s.isPlaying);
  const cps = usePatternStore((s) => s.cps);
  const lastError = usePatternStore((s) => s.lastError);
  const setCode = usePatternStore((s) => s.setCode);

  const { startListening, stopListening, transcript, isListening } = useSpeechToText();

  // Update input with transcript as user speaks
  useEffect(() => {
    if (transcript) {
      console.log('[Chat] Setting transcript:', transcript, 'ref:', !!chatInputRef.current);
      chatInputRef.current?.setValue(transcript);
    }
  }, [transcript]);

  // Keyboard handlers for Ctrl+\ (toggle record) and Ctrl+] (submit)
  // Using a ref for isListening so the handler always sees current value
  const isListeningRef = useRef(isListening);
  isListeningRef.current = isListening;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+\ — toggle recording on/off
      if (e.ctrlKey && e.key === '\\' && !e.repeat) {
        e.preventDefault();
        if (isListeningRef.current) {
          stopListening();
        } else {
          startListening();
        }
        return;
      }
      // Ctrl+] — stop recording (if active) and submit input
      if (e.ctrlKey && e.key === ']') {
        e.preventDefault();
        if (isListeningRef.current) {
          stopListening();
        }
        // Delay to let final transcript arrive before submitting
        setTimeout(() => chatInputRef.current?.submit(), 200);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [startListening, stopListening]);

  const handleToolCall = useCallback(
    (tool: ToolCall) => {
      switch (tool.name) {
        case 'update_pattern': {
          const code = tool.input.code as string;
          if (code) {
            // Show the AI-generated code in the active tab
            setCode(code);
            // Evaluate all armed tabs combined (respects MixBar)
            import('@/audio/engine').then(async (engine) => {
              const combinedCode = usePatternStore.getState().buildCombinedCode();
              const result = await engine.evaluateCode(combinedCode || code);
              if (!result.success) {
                appendToLastMessage(`\n⚠️ Code error: ${result.error}`);
              }
            }).catch(() => {});
          }
          break;
        }
        case 'update_visualization': {
          const code = tool.input.code as string;
          if (code) {
            const vizState = useVizStore.getState();
            // Switch to events mode so the custom Canvas 2D draw is visible
            if (vizState.vizMode !== 'events') {
              vizState.setVizMode('events');
            }
            vizState.setCustomDraw(code);
          }
          break;
        }
        case 'update_hydra': {
          const code = tool.input.code as string;
          if (code) {
            const vizState = useVizStore.getState();
            // Switch to Hydra mode and apply the custom shader
            if (vizState.vizMode !== 'hydra') {
              vizState.setVizMode('hydra');
            }
            vizState.setCustomHydra(code);
          }
          break;
        }
        case 'explain_music': {
          const explanation = tool.input.explanation as string;
          if (explanation) {
            appendToLastMessage(explanation);
          }
          break;
        }
        case 'suggest_changes': {
          const suggestions = tool.input.suggestions as string[];
          const code = tool.input.code as string | undefined;
          if (suggestions?.length) {
            const text = suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n');
            appendToLastMessage(text);
          }
          if (code) {
            appendToLastMessage('\n\n```strudel\n' + code + '\n```');
          }
          break;
        }
      }
    },
    [setCode, appendToLastMessage],
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

      let receivedContent = false;

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
            receivedContent = true;
            appendToLastMessage(chunk);
          },
          onToolCall: (tool) => {
            receivedContent = true;
            handleToolCall(tool);
          },
          onError: (error) => {
            receivedContent = true;
            appendToLastMessage(`\n⚠️ ${error}`);
            completeStream();
          },
          onDone: () => {
            // If Claude finished without sending any content, show a helpful message
            if (!receivedContent) {
              appendToLastMessage('⚠️ No response received. Try rephrasing your request or being more specific.');
            }
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
      appendToLastMessage,
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
        const combinedCode = usePatternStore.getState().buildCombinedCode();
        engine.evaluateCode(combinedCode || code);
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

      <ChatInput
        ref={chatInputRef}
        onSubmit={handleSubmit}
        disabled={isStreaming}
        isListening={isListening}
      />
    </div>
  );
}
