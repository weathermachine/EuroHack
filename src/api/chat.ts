import type { ChatRequest, ToolCall } from '@/types/messages';

interface StreamHandlers {
  onText: (chunk: string) => void;
  onToolCall: (tool: ToolCall) => void;
  onError: (error: string) => void;
  onDone: () => void;
}

export async function sendChatMessage(
  request: ChatRequest,
  handlers: StreamHandlers,
): Promise<void> {
  let response: Response;

  try {
    response = await fetch(`/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  } catch (err) {
    handlers.onError(
      err instanceof Error ? err.message : 'Failed to connect to server',
    );
    return;
  }

  if (!response.ok) {
    handlers.onError(`Server error: ${response.status} ${response.statusText}`);
    return;
  }

  if (!response.body) {
    handlers.onError('No response body');
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  // State for accumulating tool call input across deltas
  let currentToolName: string | null = null;
  let currentToolInput = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Split on double newline to get complete SSE events
      const events = buffer.split('\n\n');
      // Last element may be incomplete — keep it in the buffer
      buffer = events.pop() ?? '';

      for (const eventBlock of events) {
        if (!eventBlock.trim()) continue;

        const lines = eventBlock.split('\n');
        let eventType = '';
        let data = '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            data = line.slice(6);
          }
        }

        switch (eventType) {
          case 'text': {
            try {
              const parsed = JSON.parse(data);
              handlers.onText(parsed.text ?? '');
            } catch {
              handlers.onText(data);
            }
            break;
          }

          case 'tool_use_start': {
            try {
              const parsed = JSON.parse(data);
              currentToolName = parsed.name ?? null;
              currentToolInput = '';
            } catch {
              // ignore malformed tool_use_start
            }
            break;
          }

          case 'tool_input_delta':
            currentToolInput += data;
            break;

          case 'tool_use_end': {
            if (currentToolName) {
              try {
                const input = currentToolInput
                  ? JSON.parse(currentToolInput)
                  : {};
                handlers.onToolCall({
                  name: currentToolName as ToolCall['name'],
                  input,
                });
              } catch {
                handlers.onError(
                  `Failed to parse tool input for ${currentToolName}`,
                );
              }
            }
            currentToolName = null;
            currentToolInput = '';
            break;
          }

          case 'tool_use': {
            // Simple single-event tool call format
            try {
              const tool = JSON.parse(data) as ToolCall;
              handlers.onToolCall(tool);
            } catch {
              handlers.onError('Failed to parse tool call');
            }
            break;
          }

          case 'error': {
            try {
              const parsed = JSON.parse(data);
              handlers.onError(parsed.message ?? data);
            } catch {
              handlers.onError(data);
            }
            break;
          }

          case 'done':
            handlers.onDone();
            return;
        }
      }
    }

    // Stream ended without a done event
    handlers.onDone();
  } catch (err) {
    handlers.onError(
      err instanceof Error ? err.message : 'Stream reading failed',
    );
  }
}
