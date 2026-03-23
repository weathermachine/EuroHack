import { create } from 'zustand';
import type { ChatMessage, CodeBlock } from '../types/messages';

interface ChatStore {
  messages: ChatMessage[];
  isStreaming: boolean;
  commandHistory: string[];
  historyIndex: number;

  addMessage: (message: ChatMessage) => void;
  setStreaming: (streaming: boolean) => void;
  appendToLastMessage: (chunk: string) => void;
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
  commandHistory: [],
  historyIndex: -1,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setStreaming: (isStreaming) => set({ isStreaming }),

  // Append text chunk directly to the last message's content.
  // This creates a new messages array each time so Virtuoso re-renders.
  appendToLastMessage: (chunk) =>
    set((state) => {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === 'assistant') {
        msgs[msgs.length - 1] = {
          ...last,
          content: last.content + chunk,
        };
      }
      return { messages: msgs };
    }),

  completeStream: () => {
    const { messages } = get();
    const lastMsg = messages[messages.length - 1];

    if (lastMsg && lastMsg.role === 'assistant') {
      // Finalize: extract code blocks from the completed content
      const updated = {
        ...lastMsg,
        codeBlocks: extractCodeBlocks(lastMsg.content),
      };

      // If message is empty (no text, only tool calls), remove it
      if (!updated.content.trim()) {
        set({
          messages: messages.slice(0, -1),
          isStreaming: false,
        });
      } else {
        set({
          messages: [...messages.slice(0, -1), updated],
          isStreaming: false,
        });
      }
    } else {
      set({ isStreaming: false });
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
