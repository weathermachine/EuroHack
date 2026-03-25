# AI Rack — Genre Templates

Ready-to-use Strudel live coding templates for the AI Rack REPL. These templates are automatically loaded into the AI knowledge base on server startup — just drop new `.js` files here and restart.

## Templates

| File | Genre | BPM | Key | Character |
|------|-------|-----|-----|-----------|
| `techno_template.js` | Techno | 140 | A minor | Four-on-floor, acid bass, LPF sweeps, TR-909 |
| `house_template.js` | House | 124 | F minor | Four-on-floor, Rhodes stabs, vocal chops, TR-909 |
| `drum_and_bass_template.js` | Drum & Bass | 174 | D minor | Syncopated breakbeat, reese bass, cinematic pads |
| `hip_hop_template.js` | Hip Hop | 87 | C minor | Boom-bap kick/snare, 808 bass, swing hats, TR-808 |
| `soul_template.js` | Soul | 95 | Eb major | Behind-the-beat feel, walking bass, Rhodes + horns |

## How It Works

1. Templates in this folder are scanned on server startup by `server/buildTemplateKnowledge.ts`
2. Their content is written to `server/knowledge/12-templates.md`
3. The knowledge base loader auto-includes all `.md` files in `server/knowledge/`
4. The AI assistant can then reference and generate code based on these templates

## Adding New Templates

1. Create a new `.js` file in this folder (e.g., `ambient_template.js`)
2. Follow the existing template structure:
   - `setcpm(BPM/4)` at the top
   - `let chords = chord("<...>/2")` — shared chord variable
   - `$:` / `_$:` for each layer (drums, bass, chords, melody)
   - `.bank("...")` for drum machines
   - Comments with genre, BPM, and key in the header
3. Restart the dev server (`npm run dev`) — the template will be auto-loaded into the AI knowledge base

## Template Structure

Every template follows this layout:

```
setcpm(BPM/4)
let chords = chord("<...>/2")

DRUMS
  $:  kick              — always active
  $:  snare/clap        — always active
  $:  hi-hats           — always active
  _$: open hat/fills    — muted, add for texture

BASS
  $:  main bass         — always active
  _$: alt bass          — muted, swap for variation

CHORDS
  _$: pad/Rhodes        — muted, unmute for build/drop
  _$: stabs             — muted, unmute for rhythmic energy

MELODY
  _$: lead/melody       — muted, unmute for hooks
  _$: secondary voice   — muted, additional texture
```

## Live Performance Workflow

```
INTRO   → kick + hats + bass ($:) | chords/melody muted (_$:)
BUILD   → unmute pads/chords
DROP    → unmute melody, all layers active
BREAK   → mute kick + bass, let atmosphere breathe
HOOK    → everything back in
OUTRO   → re-mute layers one by one
```

## Tips

- Change `$:` to `_$:` and press Ctrl+Enter to mute/unmute in real time
- Edit the `let chords = chord(...)` line to revoice the entire track
- Add `.mask("<0!8 1!8>/16")` to any layer for automated intro → drop
- Use `.late(.02)` on drums for a "behind the beat" feel (hip hop/soul)
- Layer `.bank("RolandTR909")` and `.bank("RolandTR808")` for hybrid drum sounds
