# Melodic Sounds: Local Samples (GM Soundfonts are BROKEN)

## GM Soundfonts — DO NOT USE

**All `gm_*` sound names are BROKEN in this environment.** Do not use `gm_epiano1`, `gm_piano`, `gm_synth_bass_2`, `gm_pad_warm`, `gm_string_ensemble_1`, `gm_trumpet`, or any other `gm_*` name.

### Why they don't work
The `@strudel/soundfonts` package registers sounds via `registerSound()` imported from `@strudel/webaudio`. However, `@strudel/web` (which runs the REPL) bundles its own internal copy of the sound registry. These are two separate registries — sounds registered by `registerSoundfonts()` are invisible to the REPL's playback engine. The result: silence or "sound not found" errors.

### Until this is fixed in the engine, NEVER generate code with `gm_*` names.

---

## Built-in Synths — DO NOT USE

**Do NOT use built-in synths** (`sine`, `sawtooth`, `square`, `triangle`, `fm`) as sound sources. Use local samples instead.

**Note:** `sine`, `saw`, `square`, `tri`, `cosine`, `rand`, `irand` are still valid as **modulation sources** (LFOs) for parameters like `.lpf()`, `.gain()`, `.pan()`, etc. Only their use as sound names in `.s()` or `.sound()` is prohibited.

---

## Local Samples for Melodic/Harmonic Parts

Use these local samples for ALL melodic and harmonic parts:

| Name | Variants | Best for |
|------|----------|----------|
| `Synth` | 62 | Leads, melodies, soft textures, flute-like |
| `Stabs` | 79 | Chords, voicings, electric piano feel, stabs |
| `Bass` | 46 | Basslines, sub-bass, rubber bass |
| `Chords` | 270 | Chord stabs, progressions, pads |

---

## Substitution Guide: What to Use Instead of GM Soundfonts

| Instead of... | Use this |
|--------------|----------|
| `gm_epiano1` / `gm_piano` | `chord("...").s("Stabs").voicing().release(0.3)` |
| `gm_synth_bass_1` / `gm_synth_bass_2` | `note("...").s("Bass").lpf(400).release(0.1)` |
| `gm_electric_bass_finger` | `note("...").s("Bass").lpf(600).release(0.15)` |
| `gm_pad_warm` / `gm_pad_*` | `note("...").s("Chords").lpf(800).release(1).room(0.6)` |
| `gm_string_ensemble_1` | `note("...").s("Synth").lpf(2000).release(0.8).room(0.5)` |
| `gm_trumpet` / `gm_brass_section` | `note("...").s("Stabs").lpf(3000).release(0.2)` |
| `gm_flute` / `gm_recorder` | `note("...").s("Synth").release(0.3).room(0.3)` |
| `gm_vibraphone` / `gm_glockenspiel` | `note("...").s("Synth").release(0.5).room(0.4)` |
| `gm_organ` / `gm_church_organ` | `note("...").s("Stabs").lpf(2000).release(0.5)` |
| `gm_choir_aahs` | `note("...").s("Vox").lpf(1500).release(1.5).room(0.7)` |

---

## Working Examples

```js
// Chord progression (replaces gm_epiano1)
chord("<Cm7 Fm7 Ab^7 G7>").s("Stabs").voicing()
  .release(0.4).room(0.3).gain(0.5)

// Warm pad (replaces gm_pad_warm)
chord("<Cm7 Ab^7 Fm9 G7sus4>").s("Chords").voicing()
  .lpf(sine.range(600, 2000).slow(16)).release(1.5).room(0.7).gain(0.3)

// Bass line (replaces gm_synth_bass_2)
note("c2 ~ e2 g2").s("Bass").lpf(400).release(0.1).gain(0.8)

// Lead melody (replaces gm_vibraphone)
note("<C4 E4 G4 C5>/2").s("Synth")
  .release(0.6).room(0.4).gain(0.3)

// Flute-like lead (replaces gm_flute)
note("c5 e5 g5 c6").s("Synth").release(0.3).room(0.3).gain(0.4)

// String ensemble feel (replaces gm_string_ensemble_1)
note("<C3 E3 G3 C4>").s("Synth").lpf(2000).release(0.8)
  .room(0.5).size(0.7).gain(0.35)
```
