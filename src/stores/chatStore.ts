import { create } from 'zustand';
import type { ChatMessage, CodeBlock } from '../types/messages';

interface ChatStore {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamBuffer: string;
  commandHistory: string[];
  historyIndex: number;

  addMessage: (message: ChatMessage) => void;
  setStreaming: (streaming: boolean) => void;
  appendStream: (chunk: string) => void;
  completeStream: () => void;
  addToHistory: (command: string) => void;
  navigateHistory: (direction: 'up' | 'down') => string;
}

let messageCounter = 0;

export function createMessageId(): string {
  return `msg-${Date.now()}-${++messageCounter}`;
}

export function extractCodeBlocks(content: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    blocks.push({
      code: match[2].trim(),
      language: match[1] || 'javascript',
    });
  }
  return blocks;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isStreaming: false,
  streamBuffer: '',
  commandHistory: [],
  historyIndex: -1,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setStreaming: (isStreaming) => set({ isStreaming }),

  appendStream: (chunk) =>
    set((state) => ({ streamBuffer: state.streamBuffer + chunk })),

  completeStream: () => {
    const { streamBuffer, messages } = get();
    if (streamBuffer) {
      // Update the last assistant message in place with the streamed content
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant') {
        const updated = {
          ...lastMsg,
          content: streamBuffer,
          codeBlocks: extractCodeBlocks(streamBuffer),
        };
        set({
          messages: [...messages.slice(0, -1), updated],
          streamBuffer: '',
          isStreaming: false,
        });
      } else {
        // Fallback: add as new message
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: createMessageId(),
              role: 'assistant' as const,
              content: streamBuffer,
              codeBlocks: extractCodeBlocks(streamBuffer),
              timestamp: Date.now(),
            },
          ],
          streamBuffer: '',
          isStreaming: false,
        }));
      }
    } else {
      // No content streamed — remove the empty placeholder
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.content) {
        set({ messages: messages.slice(0, -1), isStreaming: false, streamBuffer: '' });
      } else {
        set({ isStreaming: false, streamBuffer: '' });
      }
    }
  },

  addToHistory: (command) =>
    set((state) => ({
      commandHistory: [command, ...state.commandHistory].slice(0, 100),
      historyIndex: -1,
    })),

  navigateHistory: (direction) => {
    const { commandHistory, historyIndex } = get();
    let newIndex: number;
    if (direction === 'up') {
      newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
    } else {
      newIndex = Math.max(historyIndex - 1, -1);
    }
    set({ historyIndex: newIndex });
    return newIndex >= 0 ? commandHistory[newIndex] : '';
  },
}));
