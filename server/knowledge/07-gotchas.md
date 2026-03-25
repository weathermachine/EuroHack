# Common Mistakes & Gotchas

These are things that DO NOT work or are frequent sources of errors. Memorize these — they will save you from breaking the music.

## 1. ONLY use local samples — NO dirt-samples, NO `.bank()`, NO `gm_*`

**NEVER use dirt-samples** (`bd`, `sd`, `hh`, `cp`, `808bd`, etc.), GM soundfonts (`gm_*`), bank samples (`RolandTR808_bd`), or `.bank()`. ONLY use the local sample library.

```js
// WRONG — dirt-samples, will cause fallback/unexpected sounds
s("bd sd hh cp")
s("808bd 808sd")

// WRONG — GM soundfonts, will produce silence
note("c4").sound("gm_epiano1")

// WRONG — .bank() does not exist
s("bd sd").bank("RolandTR808")

// CORRECT — local samples ONLY
s("Kicks Snares ClosedHats Claps")
s("eot eot:3 eot:7 eot:1")
```

**Local sample names (case-sensitive):** `Kicks`, `Snares`, `ClosedHats`, `OpenHats`, `Claps`, `Crashes`, `eot`, `Bass`, `Chords`, `Stabs`, `Synth`, `Vox`

**For melodic/harmonic parts:** use local samples: `Synth` (leads), `Stabs` (chords/voicings), `Bass` (basslines), `Chords` (chord stabs) with `.note()` or `chord()`

## 2. `setcps()` is NOT chainable

`setcps()` is a standalone function call. It must go on its own line before the pattern.

```js
// WRONG — will error
s("Kicks Snares").setcps(0.5)

// WRONG — will error
setcps(0.5).s("Kicks Snares")

// CORRECT
setcps(0.5)
s("Kicks Snares")
```

## 3. `stack()` takes individual arguments, NOT arrays

```js
// WRONG — will not work as expected
stack([s("Kicks"), s("ClosedHats")])

// CORRECT
stack(
  s("Kicks"),
  s("ClosedHats")
)
```

## 4. `setcpm()` does not exist

There is no `setcpm()` function. Convert BPM to CPS:

```js
// WRONG
setcpm(120)

// CORRECT — BPM to CPS conversion
setcps(120/240)  // or equivalently setcps(120/60/4)
```

The formula: `cps = bpm / 60 / 4` or simply `cps = bpm / 240`

## 5. Only the last expression plays

If you write multiple pattern expressions, only the **last one** will actually play. All previous ones are evaluated but discarded.

```js
// WRONG — only the hh pattern will play, bd is lost
s("Kicks*4")
s("ClosedHats*8")

// CORRECT — use stack() to play both
stack(
  s("Kicks*4"),
  s("ClosedHats*8")
)
```

## 6. Code must end with a pattern expression

The last line of your code must be a pattern expression (or `silence`/`hush()`). Configuration like `setcps()` should come before, not after.

```js
// WRONG — setcps() is not a pattern, nothing will play
s("Kicks Snares")
setcps(0.5)

// CORRECT
setcps(0.5)
s("Kicks Snares")
```

## 7. Scale syntax MUST use colon — NOT spaces

```js
// WRONG — spaces cause "[tonal] error: Scale name is incomplete"
n("0 2 4 6").scale("C minor")
n("0 2 4 6").scale("C minor_pentatonic")
n("0 2 4 6").scale("A harmonic minor")

// CORRECT — always use colon between root and scale name
n("0 2 4 6").scale("C:minor")
n("0 2 4 6").scale("C:minor_pentatonic")
n("0 2 4 6").scale("A:harmonic_minor")
```

## 8. GM soundfont names (`gm_*`) DO NOT WORK

**All `gm_*` sound names are BROKEN.** Use local samples instead.

```js
// WRONG
note("c4").sound("gm_epiano1")

// CORRECT
chord("<Cm7 Fm7>").s("Stabs").voicing()
note("c2 e2 g2").s("Bass").lpf(400).release(0.1)
```

## 8. Dirt-sample names (`bd`, `sd`, `hh`) — DO NOT USE

**Do NOT use dirt-sample names.** Use local samples instead.

```js
// WRONG — dirt-samples
s("bd sd hh cp")
s("808bd 808sd")

// CORRECT — local samples
s("Kicks Snares ClosedHats Claps")
s("eot eot:3")
```

## 9. `.voicing()` requires `chord()`, NOT `note()`

The `.voicing()` method looks for the `chord` property on the value. `note()` sets the `note` property, not `chord`. Using `note().voicing()` produces "unknown chord undefined".

```js
// WRONG — note() doesn't set the chord property
note("<Cm7 Fm7>").s("Stabs").voicing()

// CORRECT — chord() sets the chord property that voicing() needs
chord("<Cm7 Fm7>").s("Stabs").voicing()
```

## 9b. `.voicing()` does NOT support sus, add, or altered chords

Strudel's voicing dictionary only supports these chord types: major triads, minor (`m`), 7th (`7`), major 7th (`^7`/`maj7`), minor 7th (`m7`), minor 9th (`m9`), 9th (`9`), diminished (`dim`/`o`), augmented (`aug`/`+`), and 6th (`6`).

**These will spam "unknown chord" errors every scheduler tick (~20ms):**
- `sus2`, `sus4`, `7sus4`, `7sus2` — NOT supported
- `add9`, `add11` — NOT supported
- `7#9`, `7b9`, `7#11` — altered extensions NOT supported
- `m7b5` — half-diminished NOT supported

```js
// WRONG — will flood console with "[voicing]: unknown chord" errors
chord("<Cm9 Fm9 Bb7sus4 G7sus4>").s("Stabs").voicing()

// CORRECT — use supported chord types only
chord("<Cm9 Fm9 Bb7 Gm7>").s("Stabs").voicing()

// ALSO CORRECT — skip .voicing() and write notes directly for complex chords
note("<[c3,eb3,g3,bb3] [f3,ab3,c4,eb4] [bb2,d3,f3,ab3] [g2,bb2,d3,f3]>").s("Stabs")
```

**Safe chord types for `.voicing()`:** `C`, `Cm`, `C7`, `C^7`, `Cm7`, `Cm9`, `C9`, `Cdim`, `Caug`, `C6`

## 10. `piano` is NOT a valid sample name

The sample `piano` does NOT exist. Use local samples:

```js
// WRONG
note("c4 e4 g4").s("piano")

// CORRECT alternatives
note("c4 e4 g4").s("Stabs")    // Stab/piano feel
note("c4 e4 g4").s("Synth")    // Synth lead
note("c4 e4 g4").s("Chords")   // Chord stab
```

## 11. Don't use `let` or `const` for the final pattern

The REPL expects a bare expression as the last statement, not a variable declaration.

```js
// WRONG — declaration doesn't return a value
const pattern = s("Kicks Snares")

// CORRECT — bare expression
s("Kicks Snares")

// ALSO CORRECT — if you need variables, use them before the final expression
setcps(0.5)
stack(
  s("Kicks Snares"),
  s("ClosedHats*4")
)
```

## 10. `.note()` expects note names or MIDI numbers

```js
// CORRECT
note("c3 e3 g3")
note("60 64 67")

// WRONG — these are not valid notes
note("C E G")  // must be lowercase with octave
```

## 11. Continuous patterns need `.range()` for useful values

Bare oscillators output 0-1. Use `.range()` to map to useful ranges:

```js
// WRONG — filter will just wobble between 0 and 1 Hz (inaudible)
s("ClosedHats*8").lpf(sine)

// CORRECT — filter sweeps between 200 and 5000 Hz
s("ClosedHats*8").lpf(sine.range(200, 5000).slow(4))
```

## 12. `.speed()` with negative values reverses playback

This is intentional, but can surprise you:
```js
s("Kicks").speed(-1)  // plays backward
s("Kicks").speed(0)   // silence (no playback)
```

## 13. `.cut()` groups are global

All sounds with the same cut group number will cut each other off, even across different `stack()` layers:
```js
// These will cut each other because they share cut group 1
stack(
  s("ClosedHats*8").cut(1),
  s("OpenHats*2").cut(1)   // oh will be cut by hh — this is usually intentional for hats
)
```

## Quick Reference: What Goes Where

| Thing | Where | Example |
|-------|-------|---------|
| `setcps()` | Own line, before pattern | `setcps(0.5)` |
| `hush()` | Own line | `hush()` |
| Sample selection | Inside `s()` | `s("Kicks")` |
| Effects | Chained on pattern | `.room(0.5)` |
| Multiple layers | Inside `stack()` | `stack(s("Kicks"), s("ClosedHats"))` |
| Sections | Inside `cat()` | `cat(s("Kicks"), s("ClosedHats"))` |
| Tempo | `setcps(bpm/240)` | `setcps(120/240)` |
