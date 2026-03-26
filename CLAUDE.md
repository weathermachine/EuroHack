# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

AI Rack (EuroHack) — an AI-powered live coding music environment combining Strudel (music patterns), Hydra (GPU visuals), and Claude (AI chat assistant) in a 3-panel React app. Licensed AGPL-3.0 (required by Strudel).

## Commands

```bash
npm run dev              # Start Vite (5173) + Express API (3001) concurrently
npm run dev:electron     # Same + Electron window
npm run build            # tsc && vite build → dist/
npm run build:electron   # Build + electron-builder → release/
npm test                 # Vitest (watch mode)
npx vitest run           # Vitest single run
npx vitest run tests/unit/foo.test.ts  # Single test file
npm run test:e2e         # Playwright E2E
npm run lint             # ESLint on src/ server/ electron/
npm run format           # Prettier
npm run typecheck        # tsc --noEmit
```

Requires `ANTHROPIC_API_KEY` env var for chat functionality. Node 20+.

## Architecture

**Frontend (src/):** React 18 + TypeScript + Vite. Four panels: Strudel REPL (CodeMirror 6, with active note highlighting), Hydra canvas (GPU shaders), Chat (React Virtuoso), Sample Browser (browsable tree of all samples). State via Zustand stores (`stores/`), subscribed from both React and imperative audio code. Path alias: `@/` → `src/`.

**Backend (server/):** Express server proxying Claude API calls with SSE streaming. Constructs system prompts from a Strudel reference (`prompts/strudel-ref.ts`) + dynamic context (current code, playback state). Knowledge files in `server/knowledge/` provide domain expertise injected into prompts.

**Electron (electron/):** Optional desktop shell. Express runs as child process; renderer is identical web code. Feature detection via `window.electronAPI`.

### Key Data Flows

- **Chat → Audio:** User message → `chatStore` → SSE to backend → Claude responds with `update_pattern` tool call → `patternStore.evaluate()` → Strudel scheduler picks up new pattern within ~50ms (hot-swap via atomic reference replacement).
- **Chat → Viz:** Claude can send `update_visualization` (Canvas 2D events) or `update_hydra` (GPU shader) to create/modify visuals. Both auto-switch the viz panel to the appropriate mode.
- **Audio → UI:** Strudel → Web Audio → AnalyserNode → Meyda feature extraction → `audioStore` → CSS custom properties (`--beat-intensity`, `--rms`) → beat-reactive UI.
- **Code → Audio:** CodeMirror edit → Cmd+Enter → `patternStore.evaluate()` → Strudel transpiles + schedules.

### Stores (Zustand)

- `patternStore` — code, pattern ref, playback state, error recovery (keeps `lastWorkingCode` fallback)
- `chatStore` — message history, SSE streaming state
- `audioStore` — FFT, RMS, spectral centroid, beat detection flags
- `uiStore` — panel focus, CRT toggle, fullscreen
- `vizStore` — visualization state (`vizMode: 'events' | 'hydra'`, `selectedShader`, `customHydraCode`, custom draw code). AI uses `update_visualization` for Canvas 2D (events) and `update_hydra` for GPU shaders. 12 demoscene-style Canvas 2D examples in `server/knowledge/13-canvas-visualizations.md`.

### Audio Engine (src/audio/)

- `engine.ts` — Strudel init, sample loading (local samples from `public/samples/` + dough-samples CDN), pattern evaluation
- `analyzer.ts` — AnalyserNode + Meyda feature extraction
- `reactive.ts` — rAF loop bridging audio features to CSS custom properties
- Single AudioContext shared by Strudel and analysis. Meyda runs on main thread (~0.1ms/frame).

**Sample sources:** Local samples from `public/samples/`, plus 6 dough-samples packs loaded from `https://raw.githubusercontent.com/felixroos/dough-samples/main/` (Dirt-Samples, Tidal Drum Machines, Piano, VCSL, EmuSP12, Mridangam). The old shabda.ndre.gr bank loading and broken GM soundfont loading have been removed. Built-in synths (`sine`, `sawtooth`, `square`, `triangle`, `fm`) are also available as sound sources, with `.fmi()` and `.fmh()` for FM synthesis. `.bank("RolandTR808")` etc. works via the Tidal Drum Machines pack. Only `gm_*` soundfonts are broken; everything else works.

### Sample Browser (src/components/SampleBrowser/)

Bottom-right panel showing all local samples and dough-samples packs in a browsable tree. Click any sample to preview it.

### Active REPL Highlighting (src/components/Repl/activeHighlight.ts)

Notes and beats flash green in the CodeMirror editor as they trigger, using `hap.context.locations` from Strudel's transpiler.

### Auto-Regeneration on Server Startup

- `server/buildSampleIndex.ts` — Rebuilds `public/samples/index.json` from the local sample folders.
- `server/buildTemplateKnowledge.ts` — Rebuilds `server/knowledge/12-templates.md` from `templates/*.js` files.

Both run automatically when the Express server starts.

### Genre Templates (templates/)

5 genre templates (Techno, House, DnB, Hip Hop, Soul) in `templates/` folder. Auto-loaded into the AI knowledge base as `server/knowledge/12-templates.md` via the build script above.

### Error Recovery

Failed evaluations keep the previous pattern playing. AI-triggered errors get sent back to Claude for up to 2 correction retries before reverting to `lastWorkingCode`.

## Local Samples

User's custom sample library lives in `public/samples/` with subfolders: `eot` (808s), `Bass`, `Chords`, `Claps`, `ClosedHats`, `Crashes`, `Kicks`, `OpenHats`, `Snares`, `Stabs`, `Synth`, `Vox`. Files are named `FolderName_N.wav`. A manifest at `public/samples/index.json` maps folders to file arrays — auto-regenerated on server startup by `server/buildSampleIndex.ts`. Loaded in `engine.ts` via `loadLocalSamples()`. Names are **case-sensitive** in Strudel (use `Kicks` not `kicks`).

In addition to local samples, dough-samples CDN packs (Dirt-Samples, Tidal Drum Machines, Piano, VCSL, EmuSP12, Mridangam) are available. Use `.bank("RolandTR808")` etc. for drum machine packs. Built-in synths (`sine`, `sawtooth`, `square`, `triangle`, `fm`) work as sound sources. Both `setcpm(bpm/4)` and `setcps(bpm/240)` are valid for setting tempo.

## Music Engine (server/engine/)

Built-in music engine with three modules:
- **MusicTheory.ts** — scales (17 types), chord progressions (9 styles), euclidean rhythms, arpeggios, numeral-to-chord conversion
- **PatternGenerator.ts** — drum patterns (9 genres), basslines (9 styles), melodies, complete compositions, variations, fills, polyrhythms
- **Transforms.ts** — mood shifting (7 moods), energy levels (0-10), refinements (faster/slower/brighter/darker/etc.), transpose, reverse, stretch, humanize, effects

Exposed via:
1. **Anthropic API tools** in `server/routes/chat.ts` — the in-app AI calls `generate_pattern`, `generate_drums`, `shift_mood`, etc. and the server executes them, converting results to `update_pattern` events
2. **REST API** at `server/routes/engine.ts` — direct endpoints like `POST /api/engine/generate-drums`, `/api/engine/transform`, `/api/engine/scale`, etc. for frontend use

All generated patterns use local samples (Kicks, Snares, ClosedHats, etc.), dough-samples CDN packs (dirt-samples, drum machine banks, piano), and built-in synths (`sine`, `sawtooth`, `square`, `triangle`, `fm`). Correct Strudel syntax with `setcps(bpm/240)` or `setcpm(bpm/4)`. Only `gm_*` soundfonts are broken; everything else works.

## Strudel Package Deduplication

Vite config forces single instances of `@strudel/core` and `@strudel/webaudio` via resolve aliases to prevent "loaded more than once" errors. Be aware of this when adding/updating Strudel dependencies.

## Pre-commit

Husky + lint-staged runs ESLint + Prettier on staged `.ts`/`.tsx`/`.css` files.
