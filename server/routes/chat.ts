import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { setupSSE } from '../middleware/sse';
import { buildSystemMessages, type PromptContext } from '../prompts/system';

const router = Router();

const anthropic = new Anthropic();

const tools: Anthropic.Tool[] = [
  {
    name: 'update_pattern',
    description:
      'Replace the current Strudel pattern code. Always provide complete, working code — not diffs or patches.',
    input_schema: {
      type: 'object' as const,
      properties: {
        code: {
          type: 'string',
          description: 'Complete Strudel pattern code to evaluate',
        },
      },
      required: ['code'],
    },
  },
  {
    name: 'update_visualization',
    description:
      'Update the Canvas 2D visualization. Provide the function BODY (not declaration) that draws each frame. The function receives: ctx (CanvasRenderingContext2D), width, height, events (array of {s, gain, duration, triggeredAt, cutoff, delay, room, pan, speed, note}), time (performance.now in ms). Canvas is pre-cleared to #0a0a0f.',
    input_schema: {
      type: 'object' as const,
      properties: {
        code: {
          type: 'string',
          description: 'JavaScript function body for Canvas 2D drawing. Has access to: ctx, width, height, events, time.',
        },
      },
      required: ['code'],
    },
  },
  {
    name: 'explain_music',
    description:
      'Explain music theory concepts, Strudel syntax, or pattern design decisions to the user.',
    input_schema: {
      type: 'object' as const,
      properties: {
        explanation: {
          type: 'string',
          description: 'Detailed explanation of the music concept or pattern',
        },
      },
      required: ['explanation'],
    },
  },
  {
    name: 'suggest_changes',
    description:
      'Suggest possible changes without applying them. Use when the user asks for ideas or options.',
    input_schema: {
      type: 'object' as const,
      properties: {
        suggestions: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of suggested changes or ideas',
        },
        code: {
          type: 'string',
          description:
            'Optional example code demonstrating one of the suggestions',
        },
      },
      required: ['suggestions'],
    },
  },
];

interface ChatRequestBody {
  message: string;
  context: PromptContext;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

router.post('/chat', async (req, res) => {
  const { message, context, history } = req.body as ChatRequestBody;

  if (!message || !context) {
    res.status(400).json({ error: 'message and context are required' });
    return;
  }

  const sse = setupSSE(res);

  try {
    const messages: Anthropic.MessageParam[] = [];

    if (history) {
      for (const msg of history) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    messages.push({ role: 'user', content: message });

    console.log('[chat] sending request to Claude, messages:', messages.length);

    const stream = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: buildSystemMessages(context),
      tools,
      messages,
      stream: true,
    });

    // Track tool use blocks
    const toolInputBuffers: Map<number, { id: string; name: string; input: string }> = new Map();

    for await (const event of stream) {
      switch (event.type) {
        case 'content_block_start':
          if (event.content_block.type === 'tool_use') {
            toolInputBuffers.set(event.index, {
              id: event.content_block.id,
              name: event.content_block.name,
              input: '',
            });
          }
          break;

        case 'content_block_delta':
          if (event.delta.type === 'text_delta') {
            sse.sendEvent('text', { text: event.delta.text });
          } else if (event.delta.type === 'input_json_delta') {
            const buf = toolInputBuffers.get(event.index);
            if (buf) {
              buf.input += event.delta.partial_json;
            }
          }
          break;

        case 'content_block_stop': {
          const buf = toolInputBuffers.get(event.index);
          if (buf) {
            try {
              const input = JSON.parse(buf.input);
              sse.sendEvent('tool_use', {
                id: buf.id,
                name: buf.name,
                input,
              });
              console.log('[chat] tool_use:', buf.name);
            } catch {
              console.error('[chat] failed to parse tool input:', buf.input.slice(0, 100));
            }
            toolInputBuffers.delete(event.index);
          }
          break;
        }

        case 'message_stop':
          console.log('[chat] message complete');
          break;
      }
    }

    sse.end();
  } catch (error) {
    console.error('[chat] error:', error);
    const message =
      error instanceof Anthropic.APIError
        ? `Claude API error: ${error.status} ${error.message}`
        : error instanceof Error
          ? error.message
          : 'Unknown error';

    sse.sendEvent('error', { message });
    sse.end();
  }
});

export default router;
