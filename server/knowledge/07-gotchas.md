# Common Mistakes & Gotchas

These are things that DO NOT work or are frequent sources of errors. Memorize these — they will save you from breaking the music.

## 1. `.bank()` is NOT supported

**NEVER use `.bank()`**. It does not exist in this environment.

```js
// WRONG — will error
s("bd sd").bank("RolandTR808")

// CORRECT — use 808 sample names directly
s("808bd 808sd")
```

See the samples reference for all available direct sample names.

## 2. `setcps()` is NOT chainable

`setcps()` is a standalone function call. It must go on its own line before the pattern.

```js
// WRONG — will error
s("bd sd").setcps(0.5)

// WRONG — will error
setcps(0.5).s("bd sd")

// CORRECT
setcps(0.5)
s("bd sd")
```

## 3. `stack()` takes individual arguments, NOT arrays

```js
// WRONG — will not work as expected
stack([s("bd"), s("hh")])

// CORRECT
stack(
  s("bd"),
  s("hh")
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
s("bd*4")
s("hh*8")

// CORRECT — use stack() to play both
stack(
  s("bd*4"),
  s("hh*8")
)
```

## 6. Code must end with a pattern expression

The last line of your code must be a pattern expression (or `silence`/`hush()`). Configuration like `setcps()` should come before, not after.

```js
// WRONG — setcps() is not a pattern, nothing will play
s("bd sd")
setcps(0.5)

// CORRECT
setcps(0.5)
s("bd sd")
```

## 7. GM soundfont names (`gm_*`) DO NOT WORK — use built-in synths instead

**All `gm_*` sound names are BROKEN** due to a dual-registry issue between `@strudel/soundfonts` and `@strudel/web`. They register in the wrong sound registry and the REPL cannot find them.

```js
// WRONG — will produce silence / "sound not found"
s("gm_epiano1")
note("c4").sound("gm_electric_bass_finger")
note("<Cm7 Fm7>").sound("gm_pad_warm")
note("c3").sound("gm_trumpet")

// CORRECT — use built-in synths
note("<Cm7 Fm7>").sound("fm").fmi(1.5).fmh(2).voicing()     // electric piano feel
note("c2 e2 g2").sound("sawtooth").lpf(400).release(0.1)     // bass
note("<Cm7 Ab^7>").sound("sawtooth").lpf(800).release(1).room(0.6)  // pad
note("c4 e4 g4").sound("triangle").release(0.3)               // flute-like lead
```

Available built-in synths: `sine`, `sawtooth`, `square`, `triangle`, `fm`. See 04-soundfonts.md for the full substitution guide.

## 8. Bank sample names (`RolandTR808_bd`, etc.) DO NOT WORK

Bank-prefixed sample names like `RolandTR808_bd`, `RolandTR909_sd`, `EmuSP12_hh` are **NOT reliably available**. They depend on an external server (shabda.ndre.gr) and have format mapping issues.

```js
// WRONG — will produce silence
s("RolandTR808_bd RolandTR808_sd")

// CORRECT — use dirt-sample 808 names directly
s("808bd 808sd")
```

Use the dirt-sample equivalents: `808bd`, `808sd`, `808hc`, `808oh`, `808cy`, `808ht`, `808mt`, `808lt`.

## 9. Don't use `let` or `const` for the final pattern

The REPL expects a bare expression as the last statement, not a variable declaration.

```js
// WRONG — declaration doesn't return a value
const pattern = s("bd sd")

// CORRECT — bare expression
s("bd sd")

// ALSO CORRECT — if you need variables, use them before the final expression
setcps(0.5)
stack(
  s("bd sd"),
  s("hh*4")
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
s("hh*8").lpf(sine)

// CORRECT — filter sweeps between 200 and 5000 Hz
s("hh*8").lpf(sine.range(200, 5000).slow(4))
```

## 12. `.speed()` with negative values reverses playback

This is intentional, but can surprise you:
```js
s("bd").speed(-1)  // plays backward
s("bd").speed(0)   // silence (no playback)
```

## 13. `.cut()` groups are global

All sounds with the same cut group number will cut each other off, even across different `stack()` layers:
```js
// These will cut each other because they share cut group 1
stack(
  s("hh*8").cut(1),
  s("oh*2").cut(1)   // oh will be cut by hh — this is usually intentional for hats
)
```

## Quick Reference: What Goes Where

| Thing | Where | Example |
|-------|-------|---------|
| `setcps()` | Own line, before pattern | `setcps(0.5)` |
| `hush()` | Own line | `hush()` |
| Sample selection | Inside `s()` | `s("808bd")` |
| Effects | Chained on pattern | `.room(0.5)` |
| Multiple layers | Inside `stack()` | `stack(s("bd"), s("hh"))` |
| Sections | Inside `cat()` | `cat(s("bd"), s("hh"))` |
| Tempo | `setcps(bpm/240)` | `setcps(120/240)` |
