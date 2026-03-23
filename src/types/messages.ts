export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  codeBlocks: CodeBlock[];
  timestamp: number;
}

export interface CodeBlock {
  code: string;
  language: string;
  description?: string;
}

export interface ToolCall {
  name: 'update_pattern' | 'update_visualization' | 'explain_music' | 'suggest_changes';
  input: Record<string, unknown>;
}

export interface PatternUpdate {
  code: string;
  description: string;
}

export interface VizUpdate {
  code: string;
  description: string;
}

export interface Suggestion {
  label: string;
  description: string;
  code: string;
}

export interface SSEEvent {
  type: 'text' | 'tool_use_start' | 'tool_input_delta' | 'tool_use_end' | 'error' | 'done';
  data: string;
  toolName?: string;
  toolId?: string;
}

export interface ChatRequest {
  message: string;
  context: {
    code: string;
    isPlaying: boolean;
    cps: number;
    error?: string;
  };
}

export interface AudioFeatures {
  rms: number;
  spectralCentroid: number;
  energy: number;
  fftData: Float32Array;
  isBeat: boolean;
}
