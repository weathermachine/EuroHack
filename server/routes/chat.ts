import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { setupSSE } from '../middleware/sse';
import { buildSystemMessages, type PromptContext } from '../prompts/system';
import { MusicTheory } from '../engine/MusicTheory.js';
import { PatternGenerator } from '../engine/PatternGenerator.js';
import { Transforms } from '../engine/Transforms.js';

const router = Router();

const anthropic = new Anthropic();

const tools: Anthropic.Tool[] = [
  {
    name: 'update_pattern',
    description:
      'Evaluate Strudel code in the audio engine. The code plays immediately but does NOT replace the user\'s REPL editor — their editor is their workspace. When modifying existing music, include the full current code with your changes applied (add/modify layers, don\'t erase). When creating from scratch, provide complete working code.',
    input_schema: {
      type: 'object' as const,
      properties: {
        code: {
          type: 'string',
          description: 'Complete Strudel pattern code to evaluate in the audio engine',
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
  // --- Engine-backed tools (executed server-side) ---
  {
    name: 'generate_pattern',
    description:
      'Generate a complete multi-layer Strudel pattern for a given style, key, and BPM. Returns ready-to-play code. Styles: techno, house, dnb, trap, breakbeat, ambient, boom_bap, trip_hop, experimental, jazz, blues.',
    input_schema: {
      type: 'object' as const,
      properties: {
        style: { type: 'string', description: 'Music style (e.g., techno, house, dnb, trap, boom_bap, trip_hop)' },
        key: { type: 'string', description: 'Musical key (e.g., C, D, F#). Default: C' },
        bpm: { type: 'number', description: 'Tempo in BPM. Default: 120' },
      },
      required: ['style'],
    },
  },
  {
    name: 'generate_drums',
    description:
      'Generate a drum pattern for a given style and complexity. Returns Strudel code using local samples (Kicks, Snares, ClosedHats, etc.).',
    input_schema: {
      type: 'object' as const,
      properties: {
        style: { type: 'string', description: 'Drum style (techno, house, dnb, trap, breakbeat, ambient, boom_bap, trip_hop, experimental)' },
        complexity: { type: 'number', description: 'Complexity 0-1 (0=simple, 1=complex). Default: 0.7' },
      },
      required: ['style'],
    },
  },
  {
    name: 'generate_bassline',
    description:
      'Generate a bassline for a given key and style using local Bass samples.',
    input_schema: {
      type: 'object' as const,
      properties: {
        key: { type: 'string', description: 'Musical key (e.g., C, D, F#)' },
        style: { type: 'string', description: 'Bass style (techno, house, dnb, acid, dub, funk, ambient, trip_hop, boom_bap)' },
      },
      required: ['key', 'style'],
    },
  },
  {
    name: 'generate_melody',
    description:
      'Generate a melodic pattern from a scale using local Synth samples.',
    input_schema: {
      type: 'object' as const,
      properties: {
        root: { type: 'string', description: 'Root note (e.g., C, D, F#)' },
        scale: { type: 'string', description: 'Scale name (minor, major, dorian, blues, minor_pentatonic, etc.)' },
        length: { type: 'number', description: 'Number of notes. Default: 8' },
      },
      required: ['root', 'scale'],
    },
  },
  {
    name: 'generate_chord_progression',
    description:
      'Generate a chord progression for a key and style. Returns Strudel chord symbols.',
    input_schema: {
      type: 'object' as const,
      properties: {
        key: { type: 'string', description: 'Musical key (e.g., C, Am, F#)' },
        style: { type: 'string', description: 'Progression style (pop, jazz, blues, soul, edm, lofi, rock, classical, dark)' },
      },
      required: ['key', 'style'],
    },
  },
  {
    name: 'shift_mood',
    description:
      'Transform the current pattern to match an emotional mood. Moods: dark, euphoric, melancholic, aggressive, dreamy, peaceful, energetic.',
    input_schema: {
      type: 'object' as const,
      properties: {
        target_mood: {
          type: 'string',
          enum: ['dark', 'euphoric', 'melancholic', 'aggressive', 'dreamy', 'peaceful', 'energetic'],
          description: 'Target mood',
        },
        intensity: { type: 'number', description: 'How strongly to apply (0-1). Default: 0.5' },
      },
      required: ['target_mood'],
    },
  },
  {
    name: 'set_energy',
    description:
      'Adjust the overall energy level of the current pattern. Scale 0-10: 0=minimal/ambient, 5=normal, 10=maximum.',
    input_schema: {
      type: 'object' as const,
      properties: {
        level: { type: 'number', description: 'Energy level 0-10' },
      },
      required: ['level'],
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

              // Execute engine tools server-side and convert to update_pattern
              const engineResult = executeEngineTool(buf.name, input, context);
              if (engineResult) {
                // Send as update_pattern so the client evaluates the generated code
                sse.sendEvent('tool_use', {
                  id: buf.id,
                  name: 'update_pattern',
                  input: { code: engineResult.code },
                });
                if (engineResult.description) {
                  sse.sendEvent('text', { text: `\n\n*${engineResult.description}*` });
                }
                console.log('[chat] engine tool:', buf.name, '→ update_pattern');
              } else {
                // Pass through non-engine tools as-is
                sse.sendEvent('tool_use', {
                  id: buf.id,
                  name: buf.name,
                  input,
                });
                console.log('[chat] tool_use:', buf.name);
              }
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

/**
 * Execute engine-backed tools server-side.
 * Returns { code, description } if this is an engine tool, or null if not.
 */
function executeEngineTool(
  name: string,
  input: Record<string, unknown>,
  context: PromptContext,
): { code: string; description?: string } | null {
  try {
    switch (name) {
      case 'generate_pattern': {
        const code = PatternGenerator.generateComplete(
          input.style as string,
          (input.key as string) || 'C',
          (input.bpm as number) || 120,
        );
        return { code, description: `Generated ${input.style} pattern in ${input.key || 'C'} at ${input.bpm || 120} BPM` };
      }
      case 'generate_drums': {
        const code = PatternGenerator.generateDrums(
          input.style as string,
          (input.complexity as number) ?? 0.7,
        );
        return { code, description: `Generated ${input.style} drum pattern` };
      }
      case 'generate_bassline': {
        const code = PatternGenerator.generateBassline(
          input.key as string,
          input.style as string,
        );
        return { code, description: `Generated ${input.style} bassline in ${input.key}` };
      }
      case 'generate_melody': {
        const code = PatternGenerator.generateMelody(
          input.root as string,
          input.scale as string,
          (input.length as number) || 8,
        );
        return { code, description: `Generated melody in ${input.root} ${input.scale}` };
      }
      case 'generate_chord_progression': {
        const chords = MusicTheory.generateProgression(
          input.key as string,
          input.style as string,
        );
        const code = `chord("<${chords.join(' ')}>").s("Stabs").voicing().gain(0.5)`;
        return { code, description: `Generated ${input.style} chord progression in ${input.key}: ${chords.join(' → ')}` };
      }
      case 'shift_mood': {
        const result = Transforms.shiftMood(
          context.code,
          input.target_mood as string,
          (input.intensity as number) ?? 0.5,
        );
        return result;
      }
      case 'set_energy': {
        const result = Transforms.setEnergy(
          context.code,
          input.level as number,
        );
        return result;
      }
      default:
        return null;
    }
  } catch (err) {
    console.error(`[engine] ${name} failed:`, (err as Error).message);
    return null;
  }
}

export default router;
