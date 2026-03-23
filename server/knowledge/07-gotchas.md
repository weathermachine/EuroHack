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

## 7. GM soundfont names use underscores

All GM soundfont names use underscores, not hyphens or camelCase.

```js
// WRONG
s("gm-epiano1")
s("gmEpiano1")
s("gm epiano1")

// CORRECT
s("gm_epiano1")
note("c4").sound("gm_electric_bass_finger")
```

## 8. Don't use `let` or `const` for the final pattern

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

## 9. `.note()` expects note names or MIDI numbers

```js
// CORRECT
note("c3 e3 g3")
note("60 64 67")

// WRONG — these are not valid notes
note("C E G")  // must be lowercase with octave
```

## 10. Continuous patterns need `.range()` for useful values

Bare oscillators output 0-1. Use `.range()` to map to useful ranges:

```js
// WRONG — filter will just wobble between 0 and 1 Hz (inaudible)
s("hh*8").lpf(sine)

// CORRECT — filter sweeps between 200 and 5000 Hz
s("hh*8").lpf(sine.range(200, 5000).slow(4))
```

## 11. `.speed()` with negative values reverses playback

This is intentional, but can surprise you:
```js
s("bd").speed(-1)  // plays backward
s("bd").speed(0)   // silence (no playback)
```

## 12. `.cut()` groups are global

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
