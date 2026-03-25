# Melodic & Harmonic Sound Sources

## Built-in Synths (AVAILABLE)

Strudel has built-in synthesizer waveforms that work as sound sources. Use them with `.s()` or `.sound()` and control pitch with `note()`:

| Synth | Description | Best for |
|-------|-------------|----------|
| `sine` | Pure sine wave | Sub-bass, soft pads, clean tones |
| `sawtooth` | Sawtooth wave (bright, buzzy) | Leads, bass, aggressive pads |
| `square` | Square wave (hollow, reedy) | Chiptune, reedy leads, hollow bass |
| `triangle` | Triangle wave (soft, mellow) | Soft leads, gentle bass, flute-like |
| `fm` | FM synthesis | Electric piano, bells, metallic bass |

### FM Synthesis Parameters
When using `fm`, you can control the FM modulation:
- `.fmi(amount)` — FM modulation index (depth). Higher = more harmonics. Default ~1.
- `.fmh(ratio)` — FM harmonicity ratio (carrier:modulator frequency ratio). Default 1.

```js
// Sub-bass with sine
note("c1 ~ c1 eb1").s("sine").gain(0.8)

// Bright sawtooth lead
note("c4 e4 g4 c5").s("sawtooth").lpf(2000).release(0.3)

// Acid bass with sawtooth + filter sweep
note("c2 c2 c3 c2").s("sawtooth").lpf(sine.range(200, 3000).slow(4)).lpq(8)

// FM electric piano
chord("<Cm7 Fm7 Ab^7 G7>").s("fm").fmi(1.5).fmh(2).voicing().gain(0.5)

// FM bells
note("c5 e5 g5 c6").s("fm").fmi(3).fmh(5).release(1).room(0.4)

// Square wave chiptune
note("c4 e4 g4 e4 c4").s("square").lpf(4000).release(0.1)

// Triangle soft pad
note("<C3 E3 G3>").s("triangle").release(1.5).room(0.5).gain(0.4)
```

### Using Waveforms as Modulation Sources (LFOs)
These oscillator names also work as **continuous modulation sources** for parameters — this is different from using them as sound sources:

```js
// Filter sweep with sine LFO
s("Kicks*4").lpf(sine.range(200, 5000).slow(4))

// Gain tremolo with triangle LFO
s("ClosedHats*8").gain(tri.range(0.3, 0.8))

// Panning with sine LFO
note("c3 e3 g3").s("Stabs").pan(sine.slow(2))
```

Available LFO shapes: `sine`, `cosine`, `saw`, `square`, `tri`, `rand`, `irand`
- `.range(min, max)` — map to a value range
- `.slow(n)` / `.fast(n)` — control LFO speed

---

## GM Soundfonts (`gm_*`) — BROKEN, DO NOT USE

**All `gm_*` sound names are BROKEN.** Do not use any `gm_*` name. They produce silence due to a dual-registry issue.

---

## Samples for Melodic/Harmonic Parts

### Piano
**Salamander Grand Piano** is loaded and available. Real multi-sampled piano across the full keyboard:
```js
note("c3 e3 g3 b3").s("piano").gain(0.5)
chord("<Cm7 Fm7>").s("piano").voicing()
```

### Local Samples (user's curated library)
| Name | Variants | Best for |
|------|----------|----------|
| `Synth` | 62 | Leads, melodies, soft textures |
| `Stabs` | 79 | Chords, voicings, stabs |
| `Bass` | 46 | Basslines, sub-bass |
| `Chords` | 270 | Chord stabs, progressions, pads |
| `Vox` | 126 | Vocal textures, choirs |

### Dirt-Samples (melodic)
| Name | Variants | Best for |
|------|----------|----------|
| `arpy` | 11 | Arpeggiated synth, melodies |
| `pluck` | 17 | Plucked strings |
| `casio` | 3 | Casio keyboard tones |
| `juno` | 12 | Juno synth patches, warm pads |
| `moog` | 7 | Moog synth patches |
| `hoover` | 6 | Hoover synth stabs |
| `pad` | 4 | Pad sounds for ambient layers |

### VCSL Synths
Additional synth samples from the VCSL pack. Explore via the Sample Browser.

---

## Substitution Guide

| Need | Use |
|------|-----|
| Piano / electric piano | `note("...").s("piano")` |
| Synth bass | `note("...").s("Bass").lpf(400)` |
| Warm pad | `note("...").s("Chords").lpf(800).release(1).room(0.6)` |
| String ensemble | `note("...").s("Synth").lpf(2000).release(0.8).room(0.5)` |
| Brass / horn stab | `note("...").s("Stabs").lpf(3000).release(0.2)` |
| Flute / soft lead | `note("...").s("Synth").release(0.3).room(0.3)` |
| Choir | `note("...").s("Vox").lpf(1500).release(1.5).room(0.7)` |
| Vibraphone / bells | `note("...").s("Synth").release(0.5).room(0.4)` |
| Classic synth | `note("...").s("juno")` or `note("...").s("moog")` |

---

## Examples

```js
// Real piano chords
chord("<Cm7 Fm7 Ab^7 G7>").s("piano").voicing().gain(0.5)

// Warm pad layer
chord("<Cm7 Ab^7>").s("Chords").voicing()
  .lpf(sine.range(600, 2000).slow(16)).release(1.5).room(0.7).gain(0.3)

// Bass line
note("c2 ~ e2 g2").s("Bass").lpf(400).release(0.1).gain(0.8)

// Lead melody
note("c5 e5 g5 c6").s("Synth").release(0.3).room(0.3).gain(0.4)

// Juno pad
note("<C3 E3 G3>").s("juno").release(1).room(0.5).gain(0.35)
```
