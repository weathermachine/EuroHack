# Melodic Sounds: Built-in Synths (GM Soundfonts are BROKEN)

## GM Soundfonts — DO NOT USE

**All `gm_*` sound names are BROKEN in this environment.** Do not use `gm_epiano1`, `gm_piano`, `gm_synth_bass_2`, `gm_pad_warm`, `gm_string_ensemble_1`, `gm_trumpet`, or any other `gm_*` name.

### Why they don't work
The `@strudel/soundfonts` package registers sounds via `registerSound()` imported from `@strudel/webaudio`. However, `@strudel/web` (which runs the REPL) bundles its own internal copy of the sound registry. These are two separate registries — sounds registered by `registerSoundfonts()` are invisible to the REPL's playback engine. The result: silence or "sound not found" errors.

### Until this is fixed in the engine, NEVER generate code with `gm_*` names.

---

## Built-in Synths — ALWAYS AVAILABLE

These are waveform-based synthesizers built into WebAudio. They are part of the REPL's internal engine and **always work**. Use them for ALL melodic and harmonic parts.

| Name | Description | Best for |
|------|-------------|----------|
| `sine` | Pure sine wave | Sub-bass, gentle tones, pure pads |
| `sawtooth` | Sawtooth wave (bright, buzzy) | Leads, bass, pads, strings-like |
| `square` | Square wave (hollow, reedy) | Chiptune, reedy leads, organ-like |
| `triangle` | Triangle wave (soft, mellow) | Soft leads, flute-like, keys |
| `fm` | FM synthesis | Electric piano, bells, metallic bass |

### FM Synth Parameters
- `.fmi(n)` — FM modulation index (higher = brighter/more harmonics). Default ~1.
- `.fmh(n)` — FM harmonicity ratio (frequency ratio of modulator to carrier). Try 1, 1.5, 2, 3.
- `.fmattack(n)` — FM envelope attack
- `.fmdecay(n)` — FM envelope decay

---

## Substitution Guide: What to Use Instead of GM Soundfonts

| Instead of... | Use this |
|--------------|----------|
| `gm_epiano1` / `gm_piano` | `note("...").sound("fm").fmi(1.5).fmh(2).release(0.3)` |
| `gm_synth_bass_1` / `gm_synth_bass_2` | `note("...").sound("sawtooth").lpf(400).release(0.1)` |
| `gm_electric_bass_finger` | `note("...").sound("triangle").lpf(600).release(0.15)` or dirt-sample `jvbass` with `.note()` |
| `gm_pad_warm` / `gm_pad_*` | `note("...").sound("sawtooth").lpf(800).release(1).room(0.6)` |
| `gm_string_ensemble_1` | `note("...").sound("sawtooth").lpf(2000).release(0.8).room(0.5)` |
| `gm_trumpet` / `gm_brass_section` | `note("...").sound("sawtooth").lpf(3000).release(0.2)` |
| `gm_flute` / `gm_recorder` | `note("...").sound("triangle").release(0.3).room(0.3)` |
| `gm_vibraphone` / `gm_glockenspiel` | `note("...").sound("fm").fmi(3).fmh(3.5).release(0.5).room(0.4)` |
| `gm_organ` / `gm_church_organ` | `note("...").sound("square").lpf(2000).release(0.5)` |
| `gm_choir_aahs` | `note("...").sound("triangle").lpf(1500).release(1.5).room(0.7)` |

### Dirt-sample alternatives for melodic/tonal parts
Some dirt-samples are tonal and respond to `.note()`:
- `arpy` — arpeggiated synth, great for melodies
- `jvbass` — JV bass, great for bass lines
- `casio` — Casio keyboard tones
- `pluck` — plucked string sounds
- `juno` — Juno synth patches (warm)
- `moog` — Moog synth patches
- `sax` — saxophone (use `.note()` cautiously — these are one-shot samples)
- `pad` — pad sounds

---

## Working Examples

```js
// Electric piano chord progression (replaces gm_epiano1)
chord("<Cm7 Fm7 Ab^7 G7>").sound("fm").fmi(1.5).fmh(2).voicing()
  .release(0.4).room(0.3).gain(0.5)

// Warm pad (replaces gm_pad_warm)
chord("<Cm7 Ab^7 Fm9 G7sus4>").s("sawtooth").voicing()
  .lpf(sine.range(600, 2000).slow(16)).release(1.5).room(0.7).gain(0.3)

// Bass line (replaces gm_synth_bass_2)
note("c2 ~ e2 g2").sound("sawtooth").lpf(400).release(0.1).gain(0.8)

// Vibraphone-like (replaces gm_vibraphone)
note("<C4 E4 G4 C5>/2").sound("fm").fmi(3).fmh(3.5)
  .release(0.6).room(0.4).gain(0.3)

// Flute-like lead (replaces gm_flute)
note("c5 e5 g5 c6").sound("triangle").release(0.3).room(0.3).gain(0.4)

// String ensemble feel (replaces gm_string_ensemble_1)
note("<C3 E3 G3 C4>").sound("sawtooth").lpf(2000).release(0.8)
  .room(0.5).size(0.7).gain(0.35)
```
