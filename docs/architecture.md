# AI Rack — Application Architecture

## 1. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | React 18 + TypeScript | Component model, ecosystem, Strudel compatibility |
| **Bundler** | Vite 6 | Fast HMR, native ESM, good Electron support |
| **Desktop Shell** | Electron 33 | Chromium + Node for Web Audio / GPU access |
| **Code Editor** | CodeMirror 6 | Same editor Strudel uses; widget/decoration API for inline viz |
| **Audio Engine** | `@strudel/web` | Full Strudel runtime — pattern scheduling, synthesis, mini-notation |
| **Visuals** | `hydra-synth` | GPU shader visuals, native Strudel integration via `initHydra()` |
| **Audio Analysis** | Meyda + Web Audio AnalyserNode | RMS, spectral centroid, beat detection → CSS custom properties |
| **State Management** | Zustand | Minimal boilerplate, works outside React tree (audio callbacks) |
| **Layout** | `react-resizable-panels` | Draggable 3-panel layout |
| **Animation** | Framer Motion | Spring physics for beat-reactive UI elements |
| **Chat List** | React Virtuoso | Virtualized message list with auto-scroll |
| **AI Backend** | Express + Anthropic SDK | Claude API proxy with SSE streaming |
| **Styling** | CSS Modules + CSS custom properties | Scoped styles, `--beat-intensity` driven from JS |
| **Font** | JetBrains Mono | Monospace with ligatures, terminal aesthetic |
| **Desktop Build** | electron-builder | Cross-platform packaging |
| **Music Engine** | `server/engine/` | MusicTheory, PatternGenerator, Transforms — server-side pattern generation |
| **Visualization** | Canvas 2D + `hydra-synth` | Dual mode: Events (Canvas 2D event display) + Hydra (GPU shaders) |
| **Sample Browser** | `src/components/SampleBrowser/` | Browsable tree of local + CDN samples with click-to-preview |
| **Active Highlight** | `src/components/Repl/activeHighlight.ts` | Notes/beats flash green in editor via `hap.context.locations` |
| **Testing** | Vitest + Playwright | Unit + E2E |
| **Linting** | ESLint + Prettier | Consistent code style |

**License:** AGPL-3.0 (required by Strudel's license).

---

## 2. Project Structure

```
ai-rack/
├── package.json              # Root package with workspaces
├── tsconfig.json             # Shared TS config
├── vite.config.ts            # Vite config (web + Electron)
├── electron/
│   ├── main.ts               # Electron main process
│   ├── preload.ts            # Context bridge for IPC
│   └── electron-builder.yml  # Packaging config
├── server/
│   ├── index.ts              # Express server entry
│   ├── buildSampleIndex.ts   # Rebuilds public/samples/index.json on startup
│   ├── buildTemplateKnowledge.ts # Rebuilds knowledge/12-templates.md from templates/*.js
│   ├── routes/
│   │   ├── chat.ts           # POST /api/chat — Claude proxy
│   │   └── engine.ts         # REST API for music engine (/api/engine/*)
│   ├── engine/
│   │   ├── index.ts           # Engine barrel export
│   │   ├── MusicTheory.ts     # Scales, chords, progressions, arpeggios, euclidean rhythms
│   │   ├── PatternGenerator.ts# Drum/bass/melody/complete pattern generation
│   │   └── Transforms.ts      # Mood shifting, energy levels, refinements, effects
│   ├── knowledge/             # AI knowledge files injected into system prompts
│   │   ├── loader.ts          # Knowledge file loader
│   │   ├── 01-role.md … 10-mcp-tools.md  # Domain expertise files
│   │   ├── 11-advanced-techniques.md      # Advanced Strudel patterns
│   │   └── 12-templates.md               # Auto-generated from templates/*.js
│   ├── prompts/
│   │   ├── system.ts         # System prompt builder
│   │   └── strudel-ref.ts    # Strudel reference (cached)
│   └── middleware/
│       └── sse.ts            # SSE streaming helpers
├── src/
│   ├── main.tsx              # React entry
│   ├── App.tsx               # Root: layout + providers
│   ├── components/
│   │   ├── Layout/
│   │   │   └── PanelLayout.tsx       # 3-panel resizable shell
│   │   ├── Repl/
│   │   │   ├── StrudelRepl.tsx       # CodeMirror + eval
│   │   │   ├── useStrudel.ts         # Strudel lifecycle hook
│   │   │   ├── strudelHighlight.ts   # CM syntax highlighting
│   │   │   ├── activeHighlight.ts    # Live note/beat green flash via hap.context.locations
│   │   │   └── widgets/
│   │   │       ├── WaveformWidget.ts     # Inline sample waveform
│   │   │       ├── PatternGrid.ts        # Step-sequencer dots
│   │   │       ├── FilterCurve.ts        # Frequency response
│   │   │       └── EnvelopeWidget.ts     # ADSR shape
│   │   ├── Viz/
│   │   │   ├── HydraCanvas.tsx       # Dual-mode viz: events canvas + hydra canvas
│   │   │   ├── HydraCanvas.module.css
│   │   │   ├── useHydra.ts           # Hydra lifecycle hook
│   │   │   ├── shaderPresets.ts      # Hydra shader presets library
│   │   │   ├── VizControls.tsx       # Shader preset dropdown (hydra mode)
│   │   │   └── VizControls.module.css
│   │   ├── Chat/
│   │   │   ├── ChatInterface.tsx     # Message list + input
│   │   │   ├── ChatMessage.tsx       # Single message rendering
│   │   │   ├── ChatInput.tsx         # λ> input with history
│   │   │   └── CodeBlock.tsx         # Syntax-highlighted block + [▶] inject button
│   │   ├── SampleBrowser/
│   │   │   ├── SampleBrowser.tsx     # Browsable tree of local + CDN samples
│   │   │   └── SampleBrowser.module.css
│   │   └── StatusBar/
│   │       └── StatusBar.tsx         # BPM, key, transport, CPU, timer
│   ├── stores/
│   │   ├── patternStore.ts   # Current code, pattern ref, playback state
│   │   ├── chatStore.ts      # Message history, streaming state
│   │   ├── audioStore.ts     # FFT data, RMS, beat flags
│   │   ├── uiStore.ts        # Panel focus, CRT toggle, fullscreen
│   │   └── vizStore.ts       # Viz mode (events/hydra), shader selection, custom draw
│   ├── audio/
│   │   ├── engine.ts         # Strudel init, play/stop, pattern swap
│   │   ├── analyzer.ts       # AnalyserNode + Meyda feature extraction
│   │   └── reactive.ts       # Audio → CSS custom property bridge
│   ├── api/
│   │   └── chat.ts           # Client-side SSE fetch to /api/chat
│   ├── hooks/
│   │   ├── useBeatReactive.ts    # Subscribe to beat events for UI
│   │   └── useKeyboardShortcuts.ts
│   ├── styles/
│   │   ├── global.css        # Phosphor Dark theme, base reset
│   │   ├── crt.css           # Scanlines, vignette, curvature
│   │   └── variables.css     # CSS custom properties (colors, spacing)
│   └── types/
│       ├── strudel.d.ts      # Strudel type augmentations
│       └── messages.ts       # Chat message types
├── templates/
│   ├── techno_template.js    # Genre templates (Techno, House, DnB, Hip Hop, Soul)
│   ├── house_template.js
│   ├── drum_and_bass_template.js
│   ├── hip_hop_template.js
│   └── soul_template.js
├── public/
│   ├── fonts/                # JetBrains Mono woff2
│   └── samples/              # Local sample library (WAV files + index.json manifest)
├── docs/
│   ├── architecture.md       # This file
│   └── ux-design-spec.md     # UX specification
└── tests/
    ├── unit/                 # Vitest unit tests
    └── e2e/                  # Playwright E2E tests
```

---

## 3. Component Architecture

```
<App>
  <AudioReactiveProvider>          ← Meyda → CSS custom props
    <PanelLayout>                  ← react-resizable-panels
      ├── <StrudelRepl />          ← CodeMirror 6 + inline widgets
      ├── <HydraCanvas />          ← Dual-mode: events canvas OR hydra canvas
      │     └── <VizControls />    ← Shader preset dropdown (hydra mode only)
      └── <ChatInterface />        ← message list + input
    </PanelLayout>
    <SampleBrowser />              ← bottom-right, browsable sample tree
    <StatusBar />                  ← fixed bottom row
  </AudioReactiveProvider>
</App>
```

### Component Responsibilities

**`App`** — Initializes stores, wraps providers, manages keyboard shortcuts.

**`AudioReactiveProvider`** — Subscribes to `audioStore`, runs `requestAnimationFrame` loop that writes `--beat-intensity`, `--rms`, `--spectral-centroid` as CSS custom properties on `<html>`. All beat-reactive CSS reads these vars.

**`StrudelRepl`** — Hosts CodeMirror 6 editor. On `Cmd+Enter`, evaluates code through `audio/engine.ts`. Registers CM `ViewPlugin` decorations that render inline viz widgets (waveforms, pattern grids, ADSR) as canvas elements positioned via CM's coordinate system.

**`HydraCanvas`** — Dual-mode visualization panel controlled by `vizStore.vizMode`:
- **Events mode** (`'events'`): Canvas 2D rendering of live Strudel events (notes, samples) as they trigger. Supports custom draw functions via `vizStore.setCustomDraw()`.
- **Hydra mode** (`'hydra'`): GPU shader visuals via `hydra-synth`. Shader presets selectable via `VizControls` dropdown. Resizes via `ResizeObserver`.

**`VizControls`** — Dropdown selector for Hydra shader presets (from `shaderPresets.ts`). Only visible when `vizMode === 'hydra'`.

**`ChatInterface`** — Uses React Virtuoso for virtualized message list. Streams AI responses token-by-token with typewriter animation. Code blocks render with syntax highlighting and `[▶]` button that injects code into the REPL store.

**`SampleBrowser`** — Bottom-right panel displaying all local samples and dough-samples CDN packs in a browsable tree. Click any sample to preview it. Loaded from `public/samples/index.json` (local) and the dough-samples CDN manifest.

**`StatusBar`** — Reads from `patternStore` (BPM, playing state) and `audioStore` (CPU usage). Beat-reactive scale animation on BPM display via Framer Motion.

---

## 4. State Management

Zustand stores, subscribed to from both React components and imperative audio code.

### `patternStore`

```typescript
interface PatternStore {
  code: string;                    // Current editor content
  patternRef: Pattern | null;      // Live Strudel pattern reference
  isPlaying: boolean;
  cps: number;                     // Cycles per second (BPM / 60 / beatsPerCycle)
  cyclePosition: number;           // Current position in cycle
  lastError: string | null;
  lastWorkingCode: string;         // Fallback for error recovery

  setCode: (code: string) => void;
  evaluate: (code: string) => void;
  play: () => void;
  stop: () => void;
  setCps: (cps: number) => void;
}
```

### `chatStore`

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  codeBlocks: string[];           // Extracted for [▶] buttons
  timestamp: number;
}

interface ChatStore {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamBuffer: string;           // Partial response during streaming

  sendMessage: (text: string) => void;
  appendStream: (chunk: string) => void;
  completeStream: () => void;
}
```

### `audioStore`

```typescript
interface AudioStore {
  fftData: Float32Array;          // 256-bin frequency data
  rms: number;                    // Root mean square amplitude
  spectralCentroid: number;
  isBeat: boolean;                // True for ~50ms on kick detection
  isSnare: boolean;

  update: (features: AudioFeatures) => void;
}
```

### `uiStore`

```typescript
interface UIStore {
  activePanel: 'code' | 'viz' | 'chat';
  crtEnabled: boolean;
  vizFullscreen: boolean;

  setActivePanel: (panel: string) => void;
  toggleCrt: () => void;
  toggleVizFullscreen: () => void;
}
```

### `vizStore`

```typescript
interface VizStore {
  customDrawCode: string | null;       // Custom Canvas 2D draw function code
  drawFn: Function | null;             // Compiled draw function
  error: string | null;                // Last compilation error
  vizMode: 'events' | 'hydra';        // Current visualization mode
  selectedShader: string;              // Active Hydra shader preset ID

  setCustomDraw: (code: string) => void;
  clearCustomDraw: () => void;
  setVizMode: (mode: 'events' | 'hydra') => void;
  setSelectedShader: (id: string) => void;
}
```

### Data Flow Between Stores

- **User types in chat** → `chatStore.sendMessage()` → SSE request to backend → streamed response updates `chatStore.streamBuffer` → on tool call `update_pattern`, writes new code to `patternStore.code` → REPL reflects change → auto-evaluate triggers `patternStore.evaluate()`
- **User edits code** → `patternStore.setCode()` → on `Cmd+Enter`, `patternStore.evaluate()` → Strudel scheduler picks up new pattern
- **Audio plays** → AnalyserNode feeds `audioStore.update()` every animation frame → `AudioReactiveProvider` writes CSS vars → components re-render or CSS transitions handle the rest

---

## 5. Backend Architecture

Express server handling Claude API proxying with state injection, plus a music engine API for pattern generation and transformation. On startup, auto-runs `buildSampleIndex()` (rebuilds `public/samples/index.json`) and `buildTemplateKnowledge()` (rebuilds `server/knowledge/12-templates.md` from `templates/*.js`).

### Routes

```
POST /api/chat
  Body: { message: string, context: { code: string, isPlaying: boolean, cps: number, error?: string } }
  Response: SSE stream (text/event-stream)
```

### System Prompt Construction

```typescript
function buildSystemPrompt(context: RequestContext): MessageParam[] {
  return [
    {
      role: 'system',
      content: [
        { type: 'text', text: STRUDEL_REFERENCE, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: buildContextBlock(context) }
      ]
    }
  ];
}
```

- **`STRUDEL_REFERENCE`** — Static ~4K token Strudel API reference. Sent with `cache_control: { type: 'ephemeral' }` for prompt caching (1hr TTL). Only transmitted once per session effectively.
- **`buildContextBlock`** — Dynamic: current code, playback state, BPM, last error. Changes every request.

### Claude Configuration

```typescript
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 2048,
  stream: true,
  tools: [
    { name: 'update_pattern', description: 'Evaluate Strudel code in the audio engine', input_schema: { code: 'string' } },
    { name: 'update_visualization', description: 'Canvas 2D visualization (event-driven)', input_schema: { code: 'string' } },
    { name: 'update_hydra', description: 'Hydra GPU shader visualization (audio-reactive)', input_schema: { code: 'string' } },
    { name: 'explain_music', description: 'Explain music theory or Strudel concepts', input_schema: { explanation: 'string' } },
    { name: 'suggest_changes', description: 'Suggest but do not apply changes', input_schema: { suggestions: 'string[]', code: 'string' } },
  ],
  // Enable eager streaming for faster first token
});
```

### Music Engine Routes

```
POST /api/engine/generate-drums         { style, complexity }
POST /api/engine/generate-bassline      { key, style }
POST /api/engine/generate-melody        { root, scale, length, octaveRange }
POST /api/engine/generate-complete      { style, key, bpm }
POST /api/engine/generate-variation     { pattern, type }
POST /api/engine/generate-fill          { style, bars }
POST /api/engine/generate-polyrhythm    { sounds, hitCounts, steps }
POST /api/engine/scale                  { root, scale, octave }
POST /api/engine/chord-progression      { key, style }
POST /api/engine/euclidean              { hits, steps, sound }
POST /api/engine/arpeggio               { chord, direction, octave }
POST /api/engine/transform              { pattern, action, ...params }
GET  /api/engine/info                   Lists available styles, scales, moods
```

### Engine-Backed Claude Tools

The chat route exposes these as Anthropic API tools that Claude can call directly:
- `generate_pattern` — Full composition generation
- `generate_drums` — Genre-specific drum patterns
- `generate_bassline` — Style-specific basslines
- `generate_melody` — Scale-aware melody generation
- `generate_chord_progression` — Progression by style
- `shift_mood` — Transform pattern mood (dark, bright, melancholic, etc.)
- `set_energy` — Adjust energy level (0–10)

Generated patterns can use local samples (Kicks, Snares, ClosedHats, etc.), dough-samples CDN packs (dirt-samples, Tidal Drum Machines, Piano, VCSL, EmuSP12, Mridangam via `https://raw.githubusercontent.com/felixroos/dough-samples/main/`), built-in synths (`sine`, `sawtooth`, `square`, `triangle`, `fm`), and `.bank()` calls (e.g. `s("bd sd hh cp").bank("RolandTR808")`). Only `gm_*` soundfonts are broken.

### SSE Proxy Flow

1. Client sends POST with user message + current app context
2. Server constructs system prompt (with cached Strudel ref) + user message
3. Streams Claude response via SSE: `event: text` for prose, `event: tool_use` for code changes
4. Client parses events: text → chat stream, tool calls → dispatch to stores

---

## 6. Data Flow Diagram

```
                         ┌────────────────────────────────────────────────┐
                         │                  FRONTEND                       │
                         │                                                 │
  User types in chat ──► │  ChatInput ──► chatStore.sendMessage()          │
                         │       │                                         │
                         │       ▼                                         │
                         │  POST /api/chat ──────────────────┐             │
                         │       (SSE stream)                │             │
                         └───────┬───────────────────────────┼─────────────┘
                                 │                           │
                         ┌───────▼───────────────────────────▼─────────────┐
                         │                  BACKEND                         │
                         │                                                  │
                         │  Express ──► Anthropic SDK ──► Claude API        │
                         │                                  │               │
                         │                    ◄─────────────┘               │
                         │  SSE events: text, tool_use                      │
                         └───────┬──────────────────────────────────────────┘
                                 │
                         ┌───────▼──────────────────────────────────────────┐
                         │            FRONTEND EVENT PARSER                  │
                         │                                                   │
                         │  event: text ─────────► chatStore (streaming)     │
                         │  event: tool_use ──┬──► patternStore (code swap)  │
                         │                    └──► hydra eval (viz update)   │
                         └───────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────┐
  │                         AUDIO PIPELINE                                   │
  │                                                                          │
  │  patternStore.evaluate()                                                 │
  │       │                                                                  │
  │       ▼                                                                  │
  │  Strudel Scheduler ──► queryArc() every ~50ms ──► Web Audio API          │
  │       │                                              │                   │
  │       │                                    ┌─────────┴──────────┐        │
  │       │                                    ▼                    ▼        │
  │       │                              AudioDestination    AnalyserNode    │
  │       │                              (Speakers)              │           │
  │       │                                                      ▼           │
  │       │                                                 Meyda Extract    │
  │       │                                                      │           │
  │       │                                                      ▼           │
  │       └──── initHydra() ──► H() bridge ──► Hydra Canvas   audioStore    │
  │                                                              │           │
  │                                                              ▼           │
  │                                                    CSS Custom Props      │
  │                                                    (--beat, --rms)       │
  │                                                              │           │
  │                                                              ▼           │
  │                                                    Beat-Reactive UI      │
  └─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Audio Pipeline

```
Strudel Pattern (code string)
       │
       ▼
  Transpiler (mini-notation → JS)
       │
       ▼
  Pattern Object (.queryArc() callable)
       │
       ▼
  Scheduler (polls every ~50ms, queries next time window)
       │
       ▼
  Web Audio API Graph
       │
       ├──► AudioDestination ──► Speakers
       │
       ├──► AnalyserNode (tapped from master output)
       │         │
       │         ▼
       │    Meyda.createMeydaAnalyzer({
       │      audioContext, source: analyserNode,
       │      featureExtractors: ['rms', 'spectralCentroid', 'energy']
       │    })
       │         │
       │         ▼
       │    audioStore.update(features) ──► CSS custom properties
       │                                         │
       │                                         ▼
       │                                   UI reactivity (borders, glow, scale)
       │
       └──► Hydra (via Strudel's native H() bridge)
                  │
                  ▼
             GPU Shader Pipeline ──► <canvas> in Viz panel
```

### Key Audio Design Decisions

- **Single AudioContext** — Created once at app init, shared by Strudel and the AnalyserNode tap.
- **AnalyserNode tap** — Connected as a parallel output from the master gain node. Does not affect audio output.
- **Meyda runs on main thread** — Feature extraction is lightweight (~0.1ms per frame). No AudioWorklet needed.
- **60fps CSS update loop** — `requestAnimationFrame` reads Meyda features, writes CSS custom properties. CSS transitions handle smoothing.

---

## 8. Hot-Swap Mechanism

Strudel's architecture makes hot-swap trivial — the scheduler queries the pattern reference every ~50ms. Replacing the reference = seamless transition.

### Flow

```
1. New code arrives (from user edit or Claude tool call)
       │
       ▼
2. patternStore receives new code string
       │
       ▼
3. engine.evaluate(code):
   a. Transpile code string (Strudel's transpiler handles mini-notation)
   b. Evaluate transpiled JS → new Pattern object
   c. If success:
      - Store as lastWorkingCode
      - Replace patternRef (atomic assignment)
      - Scheduler's next queryArc() picks up new pattern
      - Music transitions in ≤50ms (one scheduler tick)
      - Clear any error state
   d. If eval error:
      - Set lastError
      - Keep current patternRef (music continues unchanged)
      - If triggered by AI: send error back to Claude for correction
       │
       ▼
4. No audio interruption — scheduler never stops, only the
   pattern reference changes between ticks
```

### Why This Works

- Strudel's scheduler does NOT hold a copy of the pattern. It holds a **reference** and calls `patternRef.queryArc(start, end)` each tick.
- Replacing the reference is an atomic JS assignment — no race condition possible.
- The scheduler is oblivious to the swap. From its perspective, it simply gets different events from `queryArc()` on the next tick.
- Latency: 0–50ms (worst case: swap happens right after a tick, next tick is 50ms later).

### AI-Triggered Hot-Swap

When Claude returns an `update_pattern` tool call:

```
Claude SSE → parse tool_use event → extract code → patternStore.evaluate(code)
```

The chat continues streaming while the pattern swaps in the background. User hears the change before Claude finishes explaining it.

---

## 9. Error Recovery

### Evaluation Errors

```
Code submitted for eval
       │
       ▼
  Transpile + eval in try/catch
       │
       ├── Success → update patternRef, clear error
       │
       └── Error → error recovery flow:
              │
              ├── Store error message in patternStore.lastError
              ├── Keep previous patternRef (music continues)
              ├── Display error in status bar (red flash)
              │
              ├── If user-initiated:
              │     Show error inline in CodeMirror (red underline + tooltip)
              │
              └── If AI-initiated:
                    Send error back to Claude with context:
                    {
                      error: "ReferenceError: foo is not defined",
                      attempted_code: "...",
                      last_working_code: "..."
                    }
                         │
                         ▼
                    Claude attempts correction
                         │
                         ├── Retry #1: new code → eval
                         │     ├── Success → done
                         │     └── Error → retry #2
                         │
                         ├── Retry #2: new code → eval
                         │     ├── Success → done
                         │     └── Error → give up
                         │
                         └── Max retries (2) exceeded:
                               - Revert to lastWorkingCode
                               - Inform user in chat:
                                 "I couldn't get that to work. Reverted to
                                  the previous pattern. Here's what I tried..."
```

### Network Errors

- SSE connection drops → auto-reconnect with exponential backoff (1s, 2s, 4s, max 10s)
- Claude API timeout (30s) → show "Claude is taking longer than expected..." in chat
- Claude API error (429/500) → show error in chat, allow retry button

### Audio Errors

- AudioContext suspended (browser autoplay policy) → show "Click to enable audio" overlay
- WebGL context lost (Hydra) → recreate Hydra instance, re-evaluate last viz code
- Audio glitch detection (buffer underrun) → log warning, no user interruption

---

## 10. Electron Packaging

### Architecture

```
┌──────────────────────────────────┐
│  Electron Main Process            │
│  electron/main.ts                 │
│  - Creates BrowserWindow          │
│  - Spawns Express server          │
│  - IPC handlers for native APIs   │
└──────────┬───────────────────────┘
           │ IPC (contextBridge)
┌──────────▼───────────────────────┐
│  Electron Preload                 │
│  electron/preload.ts              │
│  - Exposes safe IPC methods       │
│  - File system access (sessions)  │
└──────────┬───────────────────────┘
           │
┌──────────▼───────────────────────┐
│  Renderer (Vite React App)        │
│  Same code as web version         │
│  - Detects Electron via env       │
│  - Uses IPC for native features   │
└──────────────────────────────────┘
```

### Key Decisions

- **Express server runs in main process** — On Electron, the backend starts as a child process on a random port. The renderer connects to `localhost:<port>`. On web, the server runs separately.
- **Single codebase** — `src/` is identical for web and Electron. Feature detection via `window.electronAPI` (exposed by preload).
- **electron-builder config** — Targets macOS (dmg + arm64/x64), Windows (nsis), Linux (AppImage).
- **ANTHROPIC_API_KEY** — In Electron, stored in OS keychain via `safeStorage`. In web, provided by the backend's environment.

### Preload API

```typescript
// electron/preload.ts
contextBridge.exposeInMainWorld('electronAPI', {
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  setApiKey: (key: string) => ipcRenderer.invoke('set-api-key', key),
  saveSession: (data: string) => ipcRenderer.invoke('save-session', data),
  loadSession: (id: string) => ipcRenderer.invoke('load-session', id),
  platform: process.platform,
});
```

---

## 11. Development Workflow

### Prerequisites

- Node.js 20+
- npm 10+
- An `ANTHROPIC_API_KEY` environment variable

### Commands

```bash
# Install dependencies
npm install

# Start development (web app + backend, hot reload)
npm run dev
# → Vite dev server on http://localhost:5173
# → Express API server on http://localhost:3001

# Start Electron development
npm run dev:electron
# → Launches Electron window pointing at Vite dev server

# Run tests
npm test              # Vitest unit tests
npm run test:e2e      # Playwright E2E

# Lint & format
npm run lint
npm run format

# Build for web
npm run build         # Output in dist/

# Build Electron app
npm run build:electron  # Output in release/

# Type check
npm run typecheck
```

### Development Architecture

```
Terminal 1: npm run dev
  ├── Vite dev server (port 5173) — HMR for React/CSS
  └── Express server (port 3001) — Claude API proxy

Terminal 2 (optional): npm run dev:electron
  └── Electron window loading localhost:5173
```

### Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-...    # Required
VITE_API_URL=http://localhost:3001  # Default, override for production
```

### Git Workflow

- `main` — stable, releasable
- `feature/*` — feature branches, PR into main
- Pre-commit: ESLint + Prettier via lint-staged + husky
