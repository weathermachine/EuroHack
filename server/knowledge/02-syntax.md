# Strudel Syntax Reference

## Mini-Notation

Mini-notation is a compact string syntax for writing rhythmic and melodic patterns.

| Symbol | Meaning | Example |
|--------|---------|---------|
| ` ` (space) | Sequence steps equally in time | `"bd sd hh hh"` — 4 equal steps |
| `*n` | Repeat n times within its slot | `"hh*4"` — 4 hats in one step |
| `/n` | Play once every n cycles | `"cp/2"` — clap every 2nd cycle |
| `[a b]` | Subsequence (subdivide a step) | `"bd [sd sd]"` — 2nd half has 2 snares |
| `<a b>` | Alternate each cycle | `"<bd sd>"` — bd cycle 1, sd cycle 2 |
| `a?` | 50% random chance | `"hh?"` — random hat |
| `a?n` | n% chance (0-1) | `"hh?0.3"` — 30% chance |
| `~` | Rest/silence | `"bd ~ sd ~"` |
| `!n` | Replicate | `"bd!3"` = `"bd bd bd"` |
| `@n` | Weight/stretch | `"bd@3 sd"` — bd takes 3/4 of cycle |
| `,` | Layer (parallel in same step) | `"[bd, hh hh]"` |
| `:n` | Select sample variant | `"bd:3"` — 4th bd variant |
| `a(k,n)` | Euclidean rhythm | `"hh(3,8)"` — 3 hits in 8 steps |
| `a(k,n,r)` | Euclidean with rotation | `"hh(3,8,1)"` — rotated by 1 |

## Creator Functions

These create pattern objects. The return value is what gets played.

### `s(mininotation)` / `sound(mininotation)`
Create a pattern from sample names.
```js
s("bd sd hh hh")
sound("bd sd hh hh")  // identical
```

### `note(mininotation)`
Create a pattern from note values (MIDI numbers or note names).
```js
note("c3 e3 g3 b3")
note("60 64 67 71")
```

### `n(mininotation)`
Create a pattern of numbers, typically for selecting sample variants or scale degrees.
```js
n("0 2 4 6").scale("C:minor").sound("fm").fmi(1.5).fmh(2)
```

### `stack(pat1, pat2, ...)`
Layer multiple patterns simultaneously. Takes **individual arguments**, NOT an array.
```js
stack(
  s("bd sd bd sd"),
  s("hh*8"),
  note("c2 e2").sound("sawtooth").lpf(400).release(0.1)
)
```

### `cat(pat1, pat2, ...)`
Play patterns one after another, each for one cycle.
```js
cat(
  s("bd sd bd sd"),
  s("hh*8 cp")
)
```

### `silence`
An empty pattern. Useful for muting layers.
```js
silence
```

## Standalone Functions (NOT Chainable)

These are called on their own line BEFORE the pattern expression.

### `setcps(n)`
Set cycles per second (tempo). **Must be on its own line.**
- BPM conversion: `setcps(bpm / 60 / 4)` or equivalently `setcps(bpm / 240)`
- 120 BPM → `setcps(0.5)`
- 140 BPM → `setcps(140/240)`

```js
setcps(0.5)
s("bd sd")
```

### `hush()`
Stop all sound. On its own line.

## Chainable Methods

These are chained onto pattern expressions with dot notation.

### Volume & Dynamics
| Method | Description | Example |
|--------|-------------|---------|
| `.gain(n)` | Volume 0-1+ | `.gain(0.8)` |
| `.velocity(n)` | MIDI velocity 0-1 | `.velocity(0.6)` |

### Filters
| Method | Description | Example |
|--------|-------------|---------|
| `.lpf(hz)` | Low-pass filter cutoff | `.lpf(800)` |
| `.hpf(hz)` | High-pass filter cutoff | `.hpf(200)` |
| `.bpf(hz)` | Band-pass filter | `.bpf(1000)` |
| `.lpq(n)` | LPF resonance | `.lpf(800).lpq(8)` |
| `.vowel(v)` | Vowel filter | `.vowel("a e i o")` |

### Effects
| Method | Description | Example |
|--------|-------------|---------|
| `.room(n)` | Reverb amount 0-1 | `.room(0.5)` |
| `.size(n)` | Reverb size 0-1 | `.room(0.5).size(0.8)` |
| `.delay(n)` | Delay amount 0-1 | `.delay(0.5)` |
| `.delaytime(n)` | Delay time in seconds | `.delaytime(0.125)` |
| `.delayfeedback(n)` | Delay feedback 0-1 | `.delayfeedback(0.5)` |
| `.distort(n)` | Distortion 0-1+ | `.distort(0.3)` |
| `.crush(n)` | Bitcrush (lower=more) | `.crush(4)` |
| `.coarse(n)` | Sample rate reduction | `.coarse(8)` |
| `.pan(n)` | Stereo pan 0-1 (0.5=center) | `.pan(sine)` |
| `.phaser(n)` | Phaser depth | `.phaser(2)` |
| `.phaserdepth(n)` | Phaser depth | `.phaserdepth(0.5)` |
| `.phaserfreq(n)` | Phaser rate | `.phaserfreq(0.4)` |

### Playback Control
| Method | Description | Example |
|--------|-------------|---------|
| `.speed(n)` | Playback speed (negative=reverse) | `.speed(2)` |
| `.begin(n)` | Start point 0-1 | `.begin(0.25)` |
| `.end(n)` | End point 0-1 | `.end(0.75)` |
| `.cut(n)` | Cut group (stops previous) | `.cut(1)` |
| `.clip(n)` | Clip to n cycles | `.clip(1)` |
| `.release(n)` | Release time in seconds | `.release(0.5)` |
| `.attack(n)` | Attack time in seconds | `.attack(0.1)` |
| `.sustain(n)` | Sustain time in seconds | `.sustain(0.5)` |
| `.decay(n)` | Decay time in seconds | `.decay(0.2)` |

### Pitch
| Method | Description | Example |
|--------|-------------|---------|
| `.note(n)` | Set note | `.note("c3")` |
| `.n(n)` | Set sample number | `.n("0 2 4")` |
| `.scale(name)` | Apply scale | `.scale("C:minor")` |
| `.transpose(n)` | Transpose by semitones | `.transpose(7)` |
| `.octave(n)` | Set octave | `.octave(4)` |

### Pattern Transforms
| Method | Description | Example |
|--------|-------------|---------|
| `.fast(n)` | Speed up pattern | `.fast(2)` |
| `.slow(n)` | Slow down pattern | `.slow(2)` |
| `.rev()` | Reverse pattern | `.rev()` |
| `.jux(fn)` | Apply fn to right channel | `.jux(rev)` |
| `.off(t, fn)` | Overlay shifted+modified copy | `.off(1/8, x=>x.note(12))` |
| `.every(n, fn)` | Apply fn every n cycles | `.every(4, x=>x.fast(2))` |
| `.sometimes(fn)` | Apply fn 50% of the time | `.sometimes(x=>x.speed(2))` |
| `.someCycles(fn)` | Apply fn to random cycles | `.someCycles(x=>x.rev())` |
| `.early(t)` | Shift pattern earlier | `.early(1/4)` |
| `.late(t)` | Shift pattern later | `.late(1/8)` |
| `.struct(pat)` | Apply rhythmic structure | `.struct("x ~ x x ~ x ~ x")` |
| `.mask(pat)` | Silence where pattern is 0 | `.mask("<1 1 0 1>")` |
| `.ply(n)` | Multiply each event | `.ply(2)` |
| `.striate(n)` | Granular slice | `.striate(4)` |
| `.chop(n)` | Chop into n pieces | `.chop(8)` |
| `.chunk(n, fn)` | Apply fn to each nth chunk | `.chunk(4, x=>x.speed(2))` |
| `.degradeBy(n)` | Randomly remove events | `.degradeBy(0.3)` |
| `.superimpose(fn)` | Layer with modified copy | `.superimpose(x=>x.fast(2))` |

### Voicing & Chords
| Method | Description | Example |
|--------|-------------|---------|
| `.voicing()` | Auto voice-lead chords | `note("<C^7 Dm7 G7>").voicing()` |
| `.mode(m)` | Voicing mode | `.voicing().mode("below")` |
| `.anchor(n)` | Voicing anchor note | `.voicing().anchor("c4")` |

## FM Synthesis Parameters

For use with `fm` sound source or FM synth patches:
| Method | Description | Example |
|--------|-------------|---------|
| `.fmi(n)` | FM modulation index | `.fmi(2)` |
| `.fmh(n)` | FM harmonicity ratio | `.fmh(1.5)` |

```js
note("c3 e3 g3 b3").sound("fm").fmi(2).fmh(1.5)
```

## Code Structure

Always follow this structure:

```js
// 1. Tempo (standalone)
setcps(0.5)

// 2. Pattern expression (last thing — this is what plays)
stack(
  s("bd sd bd sd").gain(0.9),
  s("hh*8").gain(0.6),
  note("c2 e2 g2 e2").sound("sawtooth").lpf(400).release(0.1)
)
```

## Using Continuous Patterns as Values

Oscillators can be used as modulation sources anywhere a number is expected:

```js
s("bd sd").lpf(sine.range(200, 2000).slow(4))
s("hh*8").gain(sine.range(0.3, 0.8))
s("pad").pan(sine.slow(2))
```

Available oscillators: `sine`, `cosine`, `saw`, `square`, `tri`, `rand`, `irand`
- `.range(min, max)` — map oscillator to a range
- `.slow(n)` / `.fast(n)` — control oscillator speed
