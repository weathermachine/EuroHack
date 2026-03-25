# Built-in Music Engine Tools

The AI system has server-side music engine tools that generate Strudel code automatically. When you call these tools, the server executes the generation logic and sends the resulting code to the REPL — you do NOT need to write the Strudel code yourself for these operations.

## Generation Tools

### `generate_pattern`
Generate a complete multi-layer pattern (drums + bass + chords + melody).
- **style**: techno, house, dnb, trap, breakbeat, ambient, boom_bap, trip_hop, experimental, jazz, blues
- **key**: Musical key (C, D, F#, etc.)
- **bpm**: Tempo

Use this when the user asks for a complete beat/track in a specific genre.

### `generate_drums`
Generate a drum pattern for a style with configurable complexity.
- **style**: Same styles as above
- **complexity**: 0 (simple) to 1 (complex)

### `generate_bassline`
Generate a bassline for a key and style.
- **key**: Musical key
- **style**: techno, house, dnb, acid, dub, funk, ambient, trip_hop, boom_bap

### `generate_melody`
Generate a melodic pattern from a scale.
- **root**: Root note
- **scale**: Scale name (minor, major, dorian, blues, minor_pentatonic, etc.)
- **length**: Number of notes (default 8)

### `generate_chord_progression`
Generate a chord progression and play it.
- **key**: Musical key
- **style**: pop, jazz, blues, soul, edm, lofi, rock, classical, dark

## Transformation Tools

### `shift_mood`
Transform the currently playing pattern to match an emotional mood.
- **target_mood**: dark, euphoric, melancholic, aggressive, dreamy, peaceful, energetic
- **intensity**: 0-1 (how strongly to apply)

Use when the user says things like "make it darker", "more dreamy", "aggressive".

### `set_energy`
Adjust the energy level of the current pattern on a 0-10 scale.
- **level**: 0 (minimal/ambient) to 10 (maximum energy)

Use when the user says things like "turn it up", "chill it out", "more energy".

## When to Use Which Tool

| User request | Tool to use |
|-------------|-------------|
| "Make a techno beat" | `generate_pattern` with style="techno" |
| "Give me some drums" | `generate_drums` |
| "Add a bassline in D" | `generate_bassline` + combine with current using `update_pattern` |
| "Make it darker" | `shift_mood` with target_mood="dark" |
| "More energy" | `set_energy` with level 7-8 |
| "Make it slower and spacey" | `shift_mood` with target_mood="dreamy" |
| Custom/specific pattern | `update_pattern` with hand-written code |

**IMPORTANT:** For `shift_mood` and `set_energy`, the engine transforms the *currently playing* code. For `generate_*` tools, the engine creates new code from scratch. If the user wants to modify existing music, prefer `shift_mood`/`set_energy` or write code via `update_pattern`.
