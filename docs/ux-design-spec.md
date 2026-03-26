# AI Rack — Terminal UX Design Specification

## 1. Layout Specification

### Panel Arrangement

```
┌─────────────────────────────────┬──────────────────────────────┐
│  [Tab1] [Tab2] [+]             │                              │
│   CODE REPL (Left Panel)        │   VISUALIZATION (Right Panel)│
│   ~55% width                    │   ~45% width                 │
│                                 │                              │
│   - Multi-tab Strudel editor    │   - Hydra Synth canvas       │
│   - Per-tab undo history        │   - GPU shader visuals       │
│   - File save/load (Ctrl+S/O)  │   - Beat-reactive graphics   │
│   - Inline waveform overlays    │   - Fullscreen toggle (F11)  │
│   - Line numbers + gutter       │                              │
│                                 ├──────────────────────────────┤
│                                 │   SAMPLE BROWSER (Bottom-R)  │
│                                 │   - Browsable sample tree    │
│                                 │   - Click to preview/audition│
├─────────────────────────────────┴──────────────────────────────┤
│  CHAT PANEL (Bottom-Left)  ~25% height                         │
│  - Claude AI conversation                                      │
│  - Streaming text with typing animation                        │
│  - Voice input via microphone                                  │
├────────────────────────────────────────────────────────────────┤
│  STATUS BAR (Fixed Bottom)  1 row                              │
│  ♩ 120 BPM │ C minor │ d4 "bd sd hh sd" │ ▶ playing │ CPU 12% │
└────────────────────────────────────────────────────────────────┘
```

### Responsive Behavior

- **Desktop (>1200px)**: Full 3-panel layout as above
- **Tablet (768–1200px)**: Tabs to switch between Code and Viz panels; Chat stays bottom
- **Small screen (<768px)**: Single panel with tab navigation (Code / Viz / Chat)
- **Panel resizing**: Draggable dividers between all panels (use `react-resizable-panels` or `allotment`)
- **Double-click divider**: Reset to default proportions
- **Keyboard shortcut** `Cmd/Ctrl+1/2/3`: Focus Code / Viz / Chat panel
- **Fullscreen viz**: `F11` or button expands right panel to 100% (code overlay available via `Esc`)

### Right Panel: Hydra Canvas

The right panel hosts a single Hydra Synth `<canvas>` element that fills the panel. Hydra renders GPU-accelerated shader visuals directly — no DOM overlay needed. The canvas resizes dynamically with the panel via `ResizeObserver`. Strudel's native Hydra integration means visual commands (e.g., `osc().color().out()`) are written in the same REPL as audio patterns, and visuals react to audio automatically.

### Left Panel: Unified REPL

The code editor contains both Strudel audio patterns and Hydra visual commands in the same file. Syntax highlighting should differentiate:
- **Audio patterns**: `sound()`, `note()`, `s()` — highlighted in cyan
- **Hydra visuals**: `osc()`, `shape()`, `src()`, `.out()` — highlighted in magenta
- This distinction helps users visually parse audio vs. visual code at a glance

---

## 2. Visual Aesthetic

### Color Palette

#### Base Theme — "Phosphor Dark"

| Role              | Color       | Usage                                    |
|-------------------|-------------|------------------------------------------|
| Background        | `#0a0a0f`   | Deep near-black with slight blue tint    |
| Surface           | `#12121a`   | Panel backgrounds                        |
| Border            | `#1a1a2e`   | Panel dividers (pulses with beat)        |
| Primary Text      | `#e0e0e0`   | Code, chat messages                      |
| Accent Green      | `#00ff41`   | Prompt cursor, active indicators         |
| Accent Cyan       | `#00d4ff`   | Keywords, function names                 |
| Accent Magenta    | `#ff00ff`   | Strings, pattern highlights              |
| Accent Amber      | `#ffcc00`   | Warnings, BPM display, caret            |
| Accent Red        | `#ff3333`   | Errors, stop button                      |
| Dim Text          | `#555577`   | Comments, timestamps, line numbers       |
| Beat Pulse        | `#1a1a3a`   | Background flash on beat (subtle)        |

#### Music-Reactive Color Behavior

- **Beat hit**: Border color briefly flashes from `#1a1a2e` → `#00ff41` (kick) or `#00d4ff` (snare) then fades back over 100ms
- **Frequency mapping**: Low freqs → warm (amber/red), Mid → green, High → cyan/magenta
- **Volume envelope**: Text glow intensity scales with RMS amplitude (CSS `text-shadow` blur radius: 2px–8px)
- **Idle state**: Gentle ambient pulse on borders (~0.5Hz sine wave on opacity)

### Typography

| Element          | Font                          | Size   | Weight | Notes                     |
|------------------|-------------------------------|--------|--------|---------------------------|
| Code             | `JetBrains Mono`, `Fira Code` | 14px   | 400    | Ligatures enabled         |
| Chat messages    | `JetBrains Mono`              | 13px   | 400    | Slightly smaller          |
| AI responses     | `JetBrains Mono`              | 13px   | 300    | Lighter weight distinction |
| Status bar       | `JetBrains Mono`              | 11px   | 700    | Bold, uppercase labels    |
| Panel headers    | `JetBrains Mono`              | 11px   | 700    | Uppercase, letter-spacing: 2px |
| Prompt symbol    | `JetBrains Mono`              | 14px   | 700    | `>` or `λ>` in accent green |

#### Glow Effects

```css
.terminal-text {
  text-shadow: 0 0 4px rgba(0, 255, 65, 0.3);  /* subtle green phosphor */
}
.terminal-text--active {
  text-shadow: 0 0 8px rgba(0, 255, 65, 0.6);  /* brighter on beat */
}
```

### CRT / Retro Effects (Toggleable via Settings)

All effects are opt-in and GPU-accelerated. Toggle with `Cmd/Ctrl+Shift+R`.

#### Scanlines

```css
.crt-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15) 0px,
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 3px
  );
  pointer-events: none;
  z-index: 100;
}
```

#### Phosphor Glow (Vignette)

```css
.crt-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%);
  pointer-events: none;
}
```

#### Subtle Screen Curvature

```css
.crt-screen {
  border-radius: 12px;
  box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.3);
}
```

#### RGB Chromatic Aberration (subtle, on beat hits)

```css
@keyframes rgb-shift {
  0%   { text-shadow: -1px 0 red, 1px 0 cyan; }
  50%  { text-shadow: -0.5px 0 red, 0.5px 0 cyan; }
  100% { text-shadow: 0 0 transparent; }
}
```

---

## 3. Dynamic Elements

### Beat-Reactive UI

| Element                  | Trigger         | Effect                                              |
|--------------------------|-----------------|-----------------------------------------------------|
| Panel borders            | Kick drum       | Flash green, fade over 100ms                        |
| Background               | Beat (any)      | Subtle brightness pulse `#0a0a0f` → `#0f0f18`      |
| Status bar BPM           | Beat            | Scale transform 1.0 → 1.05, spring back            |
| Cursor                   | Beat            | Width pulse (2px → 4px → 2px)                      |
| Viz panel                | Continuous      | Full audio-reactive rendering (separate system)     |
| Code gutter              | Pattern cycle   | Highlight current line being evaluated              |

### Inline Visualization Widgets (Code Panel)

Rendered as CodeMirror decorations / widgets overlaid on the editor:

- **Mini waveform**: Appears inline after `sound("...")` calls — shows the sample waveform as a tiny sparkline (40px tall, full line width), rendered via `<canvas>`
- **Pattern viz**: Below `"bd sd hh sd"` patterns, show a mini step-sequencer grid with colored dots for each hit, animated as playback progresses
- **Frequency spectrum**: After `lpf()`/`hpf()` calls, show a tiny frequency response curve
- **Envelope display**: After `adsr()` calls, show the attack-decay-sustain-release shape
- **Implementation**: CodeMirror 6 `ViewPlugin` + `Decoration.widget()` — each widget is a small canvas element positioned via CM's coordinate system

### Cursor and Text Effects

- **Block cursor**: Blinking block cursor (green) in code editor, rate: 530ms
- **Beam cursor**: Thin beam cursor in chat input
- **Cursor trail**: Optional subtle phosphor trail (2-frame fade) when cursor moves
- **Text insertion**: New characters appear with a brief 50ms opacity fade-in
- **Code evaluation flash**: When code runs, the entire code block briefly flashes with a green tint overlay (150ms)

### Status Bar

Fixed single row at bottom. Segments separated by `│` character.

```
♩ 120 BPM │ C min │ d4 "bd sd hh sd" │ ▶ playing │ CPU 12% │ 00:42
```

- **BPM**: Pulses on beat; editable (click to type, scroll to adjust)
- **Key/Scale**: Dropdown on click
- **Current pattern**: Truncated preview of active code, scrolls if long
- **Transport**: Play/Stop state with icon
- **CPU**: Audio worklet CPU usage (warn if >80%)
- **Timer**: Elapsed time since play started

---

## 4. Chat Interface Design

### Message Layout

```
┌─ CHAT ──────────────────────────────────────────────────────┐
│                                                              │
│  [12:03:01] you > make the hihat pattern more complex       │
│                                                              │
│  [12:03:02] claude > Here's a variation with offbeat hihats │
│  and ghost notes:                                            │
│                                                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │ sound("hh*8").gain(sine.range(0.3,1))            │  [▶]  │
│  └──────────────────────────────────────────────────┘       │
│                                                              │
│  This adds a sine-wave gain modulation for a more           │
│  dynamic feel. Want me to add swing?                         │
│                                                              │
│  ─────────────────────────────────────────────────────────── │
│  λ> _                                                        │
└──────────────────────────────────────────────────────────────┘
```

### Message Styling

- **User messages**: `>` prefix in accent green, full brightness text
- **AI messages**: `claude >` prefix in accent cyan, slightly dimmer text (weight 300)
- **Code blocks in chat**: Bordered box with syntax highlighting, `[▶]` button to send code to REPL
- **Timestamps**: Dim text (`#555577`), monospace, left-aligned
- **Streaming animation**: Characters appear one-by-one at ~30 chars/sec with a trailing block cursor; code blocks render all at once when complete

### Chat Input

- Prompt symbol: `λ>` in green (lambda evokes functional programming / Strudel's Haskell roots)
- Single-line by default, expands to multi-line with `Shift+Enter`
- `Enter` sends message
- `↑` arrow recalls previous messages
- Tab completion for common commands (`/play`, `/stop`, `/bpm`, `/pattern`)
- Input background slightly lighter than chat history (`#15151f`)

---

## 5. Interaction Patterns

### Keyboard Shortcuts

| Shortcut              | Action                                  |
|-----------------------|-----------------------------------------|
| `Cmd/Ctrl+Enter`     | Evaluate code in REPL                   |
| `Cmd/Ctrl+.`         | Stop all sound                          |
| `Cmd/Ctrl+1`         | Focus Code panel                        |
| `Cmd/Ctrl+2`         | Focus Visualization panel               |
| `Cmd/Ctrl+3`         | Focus Chat panel                        |
| `Cmd/Ctrl+Shift+R`   | Toggle CRT effects                      |
| `F11`                | Fullscreen visualization                |
| `Esc`                | Exit fullscreen / close overlays        |
| `Ctrl+S`             | Save active tab to file                 |
| `Ctrl+Shift+S`       | Save As (new file)                      |
| `Ctrl+O`             | Open file into new tab                  |
| `Ctrl+W`             | Close active tab                        |
| `Ctrl+Tab`           | Next tab                                |
| `Ctrl+Shift+Tab`     | Previous tab                            |
| `Cmd/Ctrl+L`         | Clear chat                              |
| `Tab` (in chat)      | Autocomplete command                    |
| `↑` (in chat)        | Previous message                        |

### Panel Focus Model

- **Active panel**: Has brighter border (accent green thin glow)
- **Inactive panels**: Default dim border
- **Tab key**: Does NOT cycle panels (needed for code indentation). Use `Cmd+1/2/3` instead
- **Click**: Focuses panel
- **Code panel focused**: All keyboard input goes to CodeMirror
- **Chat panel focused**: All keyboard input goes to chat input; `Cmd+Enter` sends
- **Viz panel focused**: Keyboard shortcuts for viz controls (zoom, rotate camera, etc.)

### Code Editing Flow

1. Write Strudel code in left panel
2. `Cmd+Enter` evaluates — inline visualizations appear
3. Music plays, right panel reacts
4. Ask Claude in chat: "add reverb" → Claude responds with code suggestion
5. Click `[▶]` on code block in chat → code inserted into REPL
6. `Cmd+Enter` to evaluate updated code

---

## 6. Recommended Libraries

### Core Rendering & Layout

| Library                  | Purpose                              | Why                                          |
|--------------------------|--------------------------------------|----------------------------------------------|
| **CodeMirror 6**         | Code editor (left panel)             | Used by Strudel; extensible, fast, widget API |
| **react-resizable-panels** | Panel layout with draggable dividers | Lightweight, accessible, React-native        |
| **Framer Motion**        | UI animations                        | Declarative, spring physics, layout animations |

### Terminal Aesthetic

| Library / Technique      | Purpose                              | Why                                          |
|--------------------------|--------------------------------------|----------------------------------------------|
| **CSS custom properties** | Music-reactive styling              | Update `--beat-intensity` from JS, CSS handles transitions |
| **Custom CSS (no lib)**  | Scanlines, glow, CRT effects        | Lightweight; examples above; no dependency needed |
| **Google Fonts: JetBrains Mono** | Typography                    | Excellent ligatures, free, widely supported  |

### Audio Integration

| Library                  | Purpose                              | Why                                          |
|--------------------------|--------------------------------------|----------------------------------------------|
| **Strudel (@strudel/core)** | Pattern engine & synthesis        | Core of the app; provides pattern scheduling |
| **Web Audio API (native)** | Beat detection, frequency analysis | AnalyserNode for FFT data → drive UI reactivity |
| **Meyda**                | Audio feature extraction             | RMS, spectral centroid, etc. for nuanced UI response |

### Visualization

| Library                  | Purpose                              | Why                                          |
|--------------------------|--------------------------------------|----------------------------------------------|
| **Hydra Synth (primary)** | Right panel visualizations          | GPU-accelerated shader-based visuals; native Strudel integration; analog-synth aesthetic; renders to `<canvas>` |
| **Three.js (secondary)** | Optional 3D scene visualizations     | Future addition for 3D environments; can composite with Hydra canvas |

> **Note on Hydra integration**: Strudel has native Hydra support, so audio patterns and visual commands coexist in the same REPL code. The right panel simply hosts the Hydra canvas element sized to fill the panel. Hydra's `.render()` output is inherently beat-reactive when driven by Strudel patterns.

### Chat & Streaming

| Library                  | Purpose                              | Why                                          |
|--------------------------|--------------------------------------|----------------------------------------------|
| **Anthropic SDK (streaming)** | Claude API integration           | Native streaming support for token-by-token display |
| **React Virtuoso**       | Chat message list virtualization     | Smooth scroll, auto-scroll to bottom, handles large histories |

---

## 7. Design Principles Summary

1. **Terminal-native feel**: Everything is monospace, prompt-driven, keyboard-first
2. **Alive, not decorative**: Every visual effect is driven by the music — nothing is purely cosmetic animation
3. **Progressive disclosure**: CRT effects are off by default; power users toggle them on
4. **Code is the instrument**: The left panel is the primary interface; chat and viz support it
5. **Seamless AI integration**: Claude suggestions flow directly into the code editor with one click
6. **Performance budget**: CRT effects use CSS only (composited layers); visualizations use WebGL; never block the audio thread
