# Production Techniques

## Song Structure

Build song sections using `stack()` for layering and `.mask()` for timed activation/deactivation of layers.

### Section-Based Arrangement
Use `<0 0 1 0>` style masks to control when layers come in:

```js
setcps(124/240)
stack(
  // Drums — always playing
  s("bd*4").gain(0.9),
  s("~ cp ~ cp").gain(0.7),

  // Hats — enter at bar 2
  s("hh*8").gain(0.5).mask("<0 1 1 1>"),

  // Bass — enter at bar 2
  note("c2 ~ c2 eb2").sound("sawtooth").lpf(400).release(0.1).mask("<0 1 1 1>").gain(0.8),

  // Melody — only bar 3 (hook)
  note("c4 eb4 g4 bb4").sound("fm").fmi(1.5).fmh(2).mask("<0 0 1 0>").gain(0.5),

  // Pad — bars 3 and 4
  chord("<Cm7 Fm7>").sound("sawtooth").lpf(800).release(1).room(0.6).voicing().mask("<0 0 1 1>").gain(0.3)
)
```

### Typical Arrangement Flow
- **Intro** (bars 1-2): Kick + minimal elements
- **Verse** (bars 3-6): Add hats, bass, basic groove
- **Hook/Chorus** (bars 7-8): Full arrangement, melody
- **Bridge** (bars 9-10): Strip back, change chords
- **Outro** (bars 11-12): Gradually remove elements

## Groove & Swing

### Adding Swing with `.late()`
Shift every other note slightly late to create swing feel:
```js
// Light swing
s("hh*8").late("0 .03 0 .03")

// Heavy swing (hip hop)
s("hh*8").late("0 .06 0 .06")

// Triplet-feel swing
s("hh*8").late("0 .04 0 .04")
```

### Velocity Patterns with `.gain()`
Human drummers don't hit every note at the same volume:
```js
// Basic accent pattern
s("hh*8").gain("[.4 .7 .5 .8]*2")

// Ghost notes on snare
s("~ [sd:1 sd:1] ~ sd").gain("[~ [.3 .3] ~ .9]")

// Rising velocity
s("hh*8").gain("[.3 .4 .5 .6 .7 .8 .9 1]")
```

### Humanization
Combine swing and velocity for realistic feel:
```js
s("hh*8")
  .late("0 .04 0 .04")
  .gain("[.4 .7 .5 .8]*2")
  .speed("[1 .98 1.02 1]*2")  // subtle pitch variation
```

## Filter Sweeps

### LPF Sweep (Build-up)
```js
// Slow sweep over 8 cycles
s("hh*8").lpf(sine.range(200, 8000).slow(8))

// Dramatic one-direction sweep over 16 cycles
note("c3*4").sound("sawtooth").lpf(saw.range(100, 5000).slow(16))
```

### HPF Sweep (Tension/Release)
```js
// Filter out low end, then bring it back
s("bd*4").hpf(sine.range(20, 500).slow(4))
```

### Resonant Acid Sweep
```js
note("c2 c2 c3 c2").sound("sawtooth")
  .lpf(sine.range(200, 3000).slow(8))
  .lpq(8)  // high resonance for acid sound
```

## Layering

### Simultaneous Layers with `stack()`
```js
stack(
  s("bd*4"),           // kick layer
  s("~ cp ~ cp"),      // snare layer
  s("hh*8"),           // hat layer
  note("c2 e2").sound("sawtooth").lpf(400).release(0.1)  // bass layer
)
```

### Sequential Sections with `cat()`
Each section plays for one cycle, then the next:
```js
cat(
  s("bd sd bd sd"),      // section A
  s("bd hh sd [hh hh]") // section B
)
```

### Layered Sounds (one instrument)
```js
// Fat kick: acoustic + 808
stack(
  s("bd").gain(0.8),
  s("808bd:5").gain(0.5).lpf(100)
)
```

## Melodic Patterns

### Using `n()` with `.scale()`
Map numbers to scale degrees:
```js
// Play scale degrees 0-7 in C minor
n("0 2 4 6 3 5 7 4").scale("C:minor").sound("fm").fmi(1.5).fmh(2)

// Random notes from scale
n("[0 1 2 3 4 5 6 7]?").scale("C:minor").sound("fm").fmi(3).fmh(3.5).release(0.5)
```

### Common Scales
- `C:major`, `C:minor`, `C:dorian`, `C:mixolydian`
- `C:pentatonic`, `C:minor_pentatonic`
- `C:blues`, `C:harmonic_minor`
- `C:phrygian`, `C:lydian`

### Chord Voicings with `.voicing()`
Automatically voice-lead chord symbols:
```js
chord("<C^7 Dm7 G7 C^7>").sound("fm").fmi(1.5).fmh(2).voicing()
```

## Variation Techniques

### `.every(n, fn)` — Apply function every n cycles
```js
// Double speed every 4th cycle
s("bd sd bd sd").every(4, x => x.fast(2))

// Reverse every 3rd cycle
s("hh*8").every(3, x => x.rev())
```

### `.sometimes(fn)` — 50% chance each cycle
```js
s("bd sd bd sd").sometimes(x => x.speed(1.5))
```

### `.off(time, fn)` — Overlay a delayed, modified copy
```js
// Echo with pitch shift
note("c4 e4 g4 b4").sound("fm").fmi(1.5).fmh(2)
  .off(1/8, x => x.note(12).gain(0.5))
```

### `.superimpose(fn)` — Layer with modified version
```js
// Layer original with octave-up version
note("c3 e3 g3").sound("triangle")
  .superimpose(x => x.note(12).gain(0.4))
```

## Beat Masks for Arrangement

### Timed Activation
```js
// Play only on cycles 3 and 4 of every 4
s("hh*8").mask("<0 0 1 1>")

// Play first 2 of every 4 cycles
note("c4 e4").sound("fm").fmi(1.5).fmh(2).mask("<1 1 0 0>")
```

### Building Intensity
```js
stack(
  s("bd*4"),                                    // always on
  s("hh*8").mask("<0 1 1 1>"),                  // enters cycle 2
  s("~ cp ~ cp").mask("<0 0 1 1>"),             // enters cycle 3
  note("c2 e2").sound("sawtooth").lpf(400).release(0.1).mask("<0 0 0 1>")  // enters cycle 4
)
```

## Common Chord Progressions

### Pop/Rock
- I - V - vi - IV: `"<C G Am F>"`
- I - IV - V - IV: `"<C F G F>"`

### Jazz
- ii - V - I: `"<Dm7 G7 C^7 C^7>"`
- I - vi - ii - V: `"<C^7 Am7 Dm7 G7>"`

### Soul/R&B
- i - iv - VII - III: `"<Cm7 Fm7 Bb7 Eb^7>"`
- i - iv - v - IV: `"<Cm9 Fm9 Gm7 Fm7>"`

### Lo-fi/Neo-Soul
- i - iv - bVII - bIII: `"<Cm7 Fm7 Bb^7 Eb^7>"`
- ii - V - I - vi: `"<Dm7 G7 C^7 Am7>"`

### Minor/Dark
- i - bVI - bIII - bVII: `"<Cm Ab Eb Bb>"`
- i - iv - i - V: `"<Cm Fm Cm G>"`

Use `.voicing()` with these for automatic voice leading:
```js
chord("<Dm7 G7 C^7 Am7>").sound("fm").fmi(1.5).fmh(2).voicing()
```
