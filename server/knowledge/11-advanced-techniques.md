# Advanced Live Coding Techniques

## Parallel Patterns with `$:` and `_$:`

Use `$:` before each pattern to run them in parallel. Use `_$:` to mute a pattern without deleting it.

```js
$:  s("Kicks*4")        // plays
_$: s("ClosedHats*8")   // muted — change _$: to $: to activate
$:  s("~ Claps ~ Claps")
```

This is the standard way to manage multiple layers in live performance.

## Tempo with `setcpm()`

`setcpm(bpm/4)` sets tempo in cycles per minute (1 cycle = 4 beats in 4/4 time). More intuitive than `setcps()`:

```js
setcpm(120/4)   // 120 BPM
setcpm(140/4)   // 140 BPM
setcpm(174/4)   // 174 BPM (drum & bass)
setcpm(90/4)    // 90 BPM (hip hop)
```

Both `setcpm()` and `setcps()` work. Use whichever is clearer.

---

## Modulation with Signals

Use oscillating signals instead of static values to animate effects over time:

```js
s("ClosedHats*16").gain(sine)              // volume pulses with sine wave
s("ClosedHats*8").lpf(saw.range(200,4000)) // filter sweeps up repeatedly
```

### Signal Types
| Signal | Shape |
|--------|-------|
| `sine` | smooth wave, 0–1 |
| `saw` | ramp up, 0–1 |
| `square` | on/off, 0 or 1 |
| `tri` | triangle wave, 0–1 |
| `rand` | random, 0–1 |
| `perlin` | smooth random drift (organic, non-repeating) |

### Range & Speed
```js
.lpf(sine.range(300, 2000))          // oscillate between 300hz and 2000hz
.lpf(sine.range(300, 2000).slow(8))  // one full sweep over 8 cycles
.gain(perlin.range(.4, 1))           // organic gain drift
```

Use `perlin` instead of `sine` for ambient textures — it doesn't repeat predictably.

---

## Chords & Voicings — Advanced

### Reusable Chord Variable
Define chords once, reuse across all layers. Change the progression and the whole track reharmonizes:

```js
let chords = chord("<Cm7 Fm7 Bb7 Ab^7>/2")

$: chords.voicing().s("Stabs").gain(.5)                       // pads
$: chords.struct("x ~ [~ x] ~").voicing().s("piano")          // rhythmic stabs
$: n("0 - 1 -").set(chords).mode("root:c2").voicing().s("Bass")  // bass from chord root
$: n("7 8 [10 9] 8").set(chords).voicing().s("Synth")         // melody from chord tones
```

### Voicing Controls
```js
.anchor("c5")          // align voicings to target note
.mode("root:c2")       // bass mode: always play root at c2
.mode("below")         // top note stays below anchor (default)
.mode("above")         // bottom note stays above anchor
```

### `struct` — Impose a Rhythm on Chords
```js
chords.struct("x ~ [~ x] ~").voicing().s("piano")
// Plays the chord only at the "x" positions — creates rhythmic stabs
```

---

## Ambient Chord Pads

Key ingredients: **slow chord changes + long envelope + reverb + filter modulation**

### Basic Sustained Pad
```js
chord("<Am7 Fm7 Dm7 Em7>/4")
  .voicing().s("sawtooth")
  .attack(3).release(4)
  .room(.8).gain(.4)
```

### Full Ambient Stack
```js
setcpm(60/4)

let chords = chord("<Am7 Dm7 Cm7 Em7>/4")

$: // warm low layer
  chords.voicing().s("sawtooth")
  .lpf(sine.range(200, 900).slow(20))
  .attack(4).sustain(1).release(6)
  .room(.9).gain(.35)

$: // shimmer high layer
  chords.voicing().s("triangle")
  .lpf(2000)
  .attack(6).sustain(1).release(8)
  .room(1).delay(.25).gain(.2)

$: // piano body
  chords.voicing().s("piano")
  .attack(3).release(5)
  .room(.8).gain(.3).lpf(1400)
```

### Ambient Tips
- Offset attack times between layers (3s, 5s, 7s) so they don't all swell together
- Use `perlin` for LPF instead of `sine` for organic, non-repeating drift
- `.sustain(1)` keeps the note fully on between attack and release
- `.delay(.25)` with high `.room()` creates an infinite-feeling space

---

## Pattern Effects

### `jux` — Split Stereo, Modify Right Channel
```js
n("0 1 [4 3] 2").s("Synth").jux(rev)
// Original on left, reversed on right — instant stereo width
```

### `off` — Copy, Shift in Time, Modify
```js
n("0 [4 <3 2>] <2 3> [~ 1]")
  .off(1/16, x => x.add(4))
  .scale("C5:minor").s("Synth")
// Plays a copy 1/16 ahead, shifted up 4 scale degrees
```

### `ply` — Speed Up Each Event N Times
```js
s("ClosedHats Snares").ply(2)
// Each event plays twice — doubles density without changing pattern structure
```

### `add` — Transpose Notes by Pattern
```js
n("0 2 4 6".add("<0 1 2 1>")).scale("C:minor").s("Synth")
// Shifts the melody up/down by amounts each cycle
```

### `late` — Timing Displacement (Human Feel / Swing)
```js
s("Kicks ~ Snares ~").late(.02)          // slightly behind the beat
s("ClosedHats*8").late("0 .04 0 .04")   // swing on alternate 8ths
```

---

## Stem Grouping with Variables

Group layers logically into named variables. Use `$:` / `_$:` to mute/unmute stems independently:

```js
setcpm(120/4)

let drums = stack(
  s("Kicks*4"),
  s("~ Claps ~ Claps"),
  s("ClosedHats*8").gain("[.4 1]*4")
)

let bass = note("<[c2 c3]*4 [bb1 bb2]*4>").s("Bass").lpf(800)

let chords = chord("<Cm7 Bb7>/2").voicing().s("Stabs").room(.4)

let melody = n("<0 ~ [3 2] ~ 5 ~ 3 ~>*2").scale("C4:minor").s("Synth").room(.4)

// Toggle groups independently:
$:  drums
$:  bass
_$: chords   // muted — change to $: to activate
_$: melody   // muted
```

---

## Song Sections as Variables

Combine stem variables into named sections:

```js
let intro  = stack(drums, bass)
let verse  = stack(drums, bass, chords)
let hook   = stack(drums, bass, chords, melody)
let bridge = stack(bass, chords)         // drums drop out
let outro  = stack(drums, bass)
```

---

## Song Structure Techniques

### Option 1: Manual Live Switching
Change this single line and press Ctrl+Enter during performance:

```js
$: hook     // change "hook" to "verse", "bridge", etc.
```

### Option 2: `cat()` — Linear Sequence
Plays each section for one cycle, in order:

```js
$: cat(intro, intro, intro, intro, verse, verse, verse, verse, hook, hook, bridge, bridge, hook, hook, outro, outro)
```

### Option 3: `mask()` — Per-Layer Automation
Each layer specifies its own activity timeline. `0` = silent, `1` = active:

```js
$: drums .mask("<1 1 1 1 1 1 1 1 1 1 0 0 1 1 1 1>")
$: bass  .mask("<1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1>")
$: chords.mask("<0 0 0 0 1 1 1 1 1 1 1 1 1 1 0 0>")
$: melody.mask("<0 0 0 0 0 0 0 0 1 1 0 0 1 1 0 0>")
```

### Quick Mask Patterns
```js
.mask("<0 0 0 0 1 1 1 1>/8")    // silent 4 cycles, active 4 cycles
.mask("<0 0 0 1>/4")             // plays only on last cycle of every 4
.mask("<0!8 1!8>/16")            // silent for 8 cycles, then always on
```

### Comparison
| Technique | Best for |
|-----------|----------|
| Manual `$: sectionName` | Live improvisation, maximum flexibility |
| `cat(...)` | Pre-composed linear songs, fixed structure |
| `.mask(...)` | Automated performances, hands-off arrangements |

---

## Song Structure Workflow

```
INTRO   → kick + hats + bass only ($:) | chords/melody muted (_$:)
BUILD   → unmute pads/chords
DROP    → unmute melody, all layers active
BREAK   → mute kick + bass, let atmosphere breathe
HOOK    → everything back in
OUTRO   → re-mute layers one by one
```

---

## Groove Feel by Genre

```js
// Hip Hop / Soul — behind the beat
s("Kicks ~ Snares ~").late(.02)
s("ClosedHats*8").late("0 .04 0 .04")   // swing

// DnB — syncopated break feel
s("Kicks ~ ~ ~ [~ Kicks] ~ Kicks ~")

// House — pure four-on-floor
s("Kicks*4")

// Techno — acid bass with resonant filter sweep
note("a1*8").s("sawtooth")
  .lpf(sine.range(180, 1800).slow(8)).lpq(10)
```
