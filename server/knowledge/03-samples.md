# Sample Catalog — ALL AVAILABLE SAMPLES

All samples below are loaded at startup from multiple sources: local samples, Dirt-Samples, Tidal Drum Machines, Piano, VCSL, EmuSP12, and Mridangam. Samples are lazy-loaded (downloaded on first use).

Use `:n` to select variants (0-indexed). Example: `s("bd:3")` plays the 4th bd variant.

**`.bank()` IS supported** for Tidal Drum Machines. Example: `s("bd sd hh cp").bank("RolandTR808")`

**Do NOT use `gm_*` soundfont names** — they are broken. Use `piano` for piano, local samples for synths/stabs.

## Core Drum Kit (dirt-samples)

| Sample | Variants | Description |
|--------|----------|-------------|
| `bd` | 24 (0-23) | Acoustic/electronic bass drums |
| `sd` | 2 (0-1) | Snare drums |
| `sn` | 52 (0-51) | Extended snare collection |
| `hh` | 13 (0-12) | Closed hi-hats |
| `oh` | 6 (0-5) | Open hi-hats |
| `cp` | 2 (0-1) | Claps |
| `cr` | 6 (0-5) | Crash cymbals |
| `cb` | 1 (0) | Cowbell |
| `ht` | 16 (0-15) | High toms |
| `mt` | 16 (0-15) | Mid toms |
| `lt` | 16 (0-15) | Low toms |
| `rs` | 1 (0) | Rimshot |

## 808 Drum Machine

**Use these instead of `.bank("RolandTR808")`** — they are direct sample names.

| Sample | Variants | Description |
|--------|----------|-------------|
| `808bd` | 25 (0-24) | 808 bass drums (deep, boomy) |
| `808sd` | 25 (0-24) | 808 snare drums |
| `808hc` | 5 (0-4) | 808 closed hi-hats |
| `808oh` | 5 (0-4) | 808 open hi-hats |
| `808cy` | 25 (0-24) | 808 cymbals |
| `808ht` | 5 (0-4) | 808 high toms |
| `808mt` | 5 (0-4) | 808 mid toms |
| `808lt` | 5 (0-4) | 808 low toms |
| `808lc` | 5 (0-4) | 808 low conga |
| `808mc` | 5 (0-4) | 808 mid conga |

## Electronic / Machine Drums

| Sample | Variants | Description |
|--------|----------|-------------|
| `clubkick` | 5 (0-4) | Club-style kicks |
| `hardkick` | 6 (0-5) | Hard/distorted kicks |
| `kicklinn` | 1 (0) | LinnDrum kick |
| `linnhats` | 6 (0-5) | LinnDrum hi-hats |
| `popkick` | 10 (0-9) | Pop-style kicks |
| `bassdm` | 24 (0-23) | Bass drum machine hits |
| `electro1` | 13 (0-12) | Electro drum kit |
| `drumtraks` | 13 (0-12) | Sequential DrumTraks |
| `dr` | 42 (0-41) | Assorted drum machine hits |
| `gretsch` | 24 (0-23) | Gretsch acoustic drum kit |

## Instrument Samples (CONFIRMED — dirt-samples)

These are your **primary melodic/harmonic tools**.

| Sample | Variants | Description |
|--------|----------|-------------|
| `bass` | varies | Bass guitar |
| `bass0` | varies | Bass variant 0 |
| `bass1` | varies | Bass variant 1 |
| `bass2` | varies | Bass variant 2 |
| `bass3` | varies | Bass variant 3 |
| `jvbass` | 13 (0-12) | JV bass synth — great for bass lines |
| `jungbass` | 20 (0-19) | Jungle bass hits |
| `casio` | 3 (0-2) | Casio keyboard tones — use for keys/chords |
| `juno` | 12 (0-11) | Juno synth patches — warm pads and leads |
| `moog` | 7 (0-6) | Moog synth patches |
| `hoover` | 6 (0-5) | Hoover synth stabs |
| `arpy` | 11 (0-10) | Arpeggiated synth — great for melodies |
| `pluck` | 17 (0-16) | Plucked string sounds |
| `pad` | 4 (0-3) | Pad sounds — use for ambient layers |
| `sitar` | 8 (0-7) | Sitar |
| `sax` | 22 (0-21) | Saxophone |
| `flick` | 17 (0-16) | Flick/pluck sounds |
| `can` | 14 (0-13) | Can/metallic sounds |
| `chin` | 4 (0-3) | China cymbal / chime |
| `control` | 2 (0-1) | Control blips |
| `cosmicg` | 15 (0-14) | Cosmic/space sounds |
| `diphone` | 38 (0-37) | Diphone speech synthesis |
| `em2` | 6 (0-5) | Electronic melody |
| `feel` | 7 (0-6) | Feel/texture sounds |
| `feelfx` | 8 (0-7) | Feel FX |
| `hand` | 17 (0-16) | Hand percussion |
| `if` | 5 (0-4) | IF sounds |
| `in` | 8 (0-7) | Incoming sounds |
| `kurt` | 7 (0-6) | Kurt samples |
| `latibro` | 11 (0-10) | Latin brother |
| `less` | 4 (0-3) | Less sounds |
| `made` | 7 (0-6) | Made sounds |
| `made2` | 1 (0) | Made variant 2 |
| `msg` | 9 (0-8) | Message sounds |
| `notes` | 15 (0-14) | Musical notes |
| `numbers` | 9 (0-8) | Spoken numbers |
| `off` | 1 (0) | Off sound |
| `pebbles` | 1 (0) | Pebbles |
| `perc` | 6 (0-5) | Percussion hits |
| `peri` | 15 (0-14) | Peri sounds |
| `print` | 11 (0-10) | Printer sounds |
| `proc` | 2 (0-1) | Process sounds |
| `stomp` | 10 (0-9) | Stomps |
| `stab` | 23 (0-22) | Synth stabs — great for chords |
| `tabla` | 26 (0-25) | Tabla percussion |
| `tabla2` | 46 (0-45) | Extended tabla |
| `tok` | 4 (0-3) | Tok sounds |
| `ul` | 10 (0-9) | UL sounds |
| `wobble` | 1 (0) | Wobble bass |

## Vocal / Speech

| Sample | Variants | Description |
|--------|----------|-------------|
| `mouth` | 15 (0-14) | Mouth/vocal percussion |
| `speech` | 7 (0-6) | Speech fragments |
| `yeah` | 31 (0-30) | "Yeah" vocal samples |
| `speakspell` | 12 (0-11) | Speak & Spell sounds |
| `alphabet` | 26 (0-25) | Spoken alphabet A-Z |

## Genre Collections

| Sample | Variants | Description |
|--------|----------|-------------|
| `techno` | 7 (0-6) | Techno hits/loops |
| `house` | 8 (0-7) | House music hits |
| `rave` | 8 (0-7) | Rave stabs and hits |
| `gabba` | 4 (0-3) | Gabba kicks/hits |
| `hardcore` | 12 (0-11) | Hardcore hits |
| `jazz` | 8 (0-7) | Jazz samples |
| `jungle` | 13 (0-12) | Jungle breaks/hits |
| `future` | 17 (0-16) | Future bass/electronic |
| `metal` | 10 (0-9) | Metal guitar/drum hits |

## Noise & FX

| Sample | Variants | Description |
|--------|----------|-------------|
| `noise` | 8 (0-7) | Noise types |
| `glitch` | 8 (0-7) | Glitch effects |
| `fire` | 1 (0) | Fire crackle |
| `wind` | 10 (0-9) | Wind sounds |
| `birds` | 10 (0-9) | Bird sounds |
| `space` | 18 (0-17) | Space/sci-fi sounds |
| `industrial` | 32 (0-31) | Industrial noise/hits |

## Breakbeats

| Sample | Variants | Description |
|--------|----------|-------------|
| `amencutup` | 32 (0-31) | Amen break slices |
| `breaks125` | 2 (0-1) | Breakbeat at 125 BPM |
| `breaks152` | 1 (0) | Breakbeat at 152 BPM |
| `breaks157` | 1 (0) | Breakbeat at 157 BPM |
| `breaks165` | 1 (0) | Breakbeat at 165 BPM |

## Melodic/Harmonic Samples

| Name | Source | Best for |
|------|--------|----------|
| `piano` | Salamander Grand Piano | Real piano — `note("c3 e3 g3").s("piano")` |
| `Synth` | Local (62 variants) | Leads, melodies, soft textures |
| `Stabs` | Local (79 variants) | Chords, voicings, stabs |
| `Bass` | Local (46 variants) | Basslines, sub-bass |
| `Chords` | Local (270 variants) | Chord stabs, progressions |
| `arpy` | Dirt-Samples (11) | Arpeggiated synth, great for melodies |
| `pluck` | Dirt-Samples (17) | Plucked string sounds |
| `casio` | Dirt-Samples (3) | Casio keyboard tones |
| `juno` | Dirt-Samples (12) | Juno synth patches |

```js
// Piano:
note("c3 e3 g3 b3").s("piano").gain(0.5)

// Chord voicings:
chord("<Cm7 Fm7 Ab^7 G7>").s("Stabs").voicing().gain(0.5)

// Bass:
note("c2 ~ e2 g2").s("Bass").lpf(400).release(0.1).gain(0.8)

// Warm lead:
note("c4 e4 g4 c5").s("Synth").release(0.3).room(0.3)
```

## Tidal Drum Machines (via `.bank()`)

Use `.bank("MachineName")` with standard drum sound names (`bd`, `sd`, `hh`, `cp`, `oh`, etc.):

```js
// Classic TR-808 beat
s("bd sd:1 hh cp").bank("RolandTR808")

// TR-909 techno kick pattern
s("bd*4").bank("RolandTR909")

// Layer different machines
stack(
  s("bd sd bd [sd bd]").bank("RolandTR909"),
  s("hh*8").bank("RolandTR808").gain(0.5)
)
```

Available machines include: `RolandTR808`, `RolandTR909`, `RolandCR78`, `RolandTR707`, `RolandTR626`, `LinnDrum`, `AkaiLinn`, `EmuDrumulator`, `BossDR110`, `KorgM1`, `KorgMinipops`, `RolandCompurhythm1000`, and more.

## Local Sample Library (Custom Samples)

These are the user's own samples loaded from `public/samples/`. They are registered at startup and available alongside dirt-samples. Use them exactly like dirt-samples with `s()` and `:n` for variant selection (0-indexed).

| Sample | Variants | Description |
|--------|----------|-------------|
| `eot` | 15 (0-14) | 808 drum machine one-shots (named "eot" = eight-oh-eight, to avoid Strudel parsing "808" as a number) |
| `Bass` | 46 (0-45) | Bass synth hits, sub-bass, wobbles, filtered bass |
| `Chords` | 270 (0-269) | Chord stabs and progressions — large collection |
| `Claps` | 34 (0-33) | Clap one-shots |
| `ClosedHats` | 40 (0-39) | Closed hi-hat one-shots |
| `Crashes` | 30 (0-29) | Crash and cymbal one-shots |
| `Kicks` | 63 (0-62) | Kick drum one-shots — wide variety |
| `OpenHats` | 32 (0-31) | Open hi-hat one-shots |
| `Snares` | 62 (0-61) | Snare drum one-shots — wide variety |
| `Stabs` | 79 (0-78) | Synth stabs and hits |
| `Synth` | 62 (0-61) | Synth one-shots and textures |
| `Vox` | 126 (0-125) | Vocal samples and chops |

**Note:** Local sample names are **case-sensitive** — use `Kicks` not `kicks`. These names start with uppercase.

```js
// Local sample examples:
s("Kicks:5 Kicks:12 Snares:3 Snares:20")

// Layer local kicks with dirt-sample hats:
stack(
  s("Kicks:0 Kicks:22"),
  s("ClosedHats*4"),
  s("Claps").every(2, x => x)
)

// Cycle through chord variants:
s("Chords").n("0 15 42 88").slow(4)

// Combine local and dirt-samples freely:
stack(
  s("Kicks:5 ~ Kicks:12 ~"),
  s("hh*4"),
  s("Stabs:3").slow(2),
  s("Vox:42").loopAt(4)
)
```

### Sample priority guide

**Prefer local samples** for drums and one-shots — they're the user's curated collection. Use dirt-samples, drum machines, and other packs when you need specific sounds.

| For this | First choice | Also available |
|----------|-------------|----------------|
| Kicks | `Kicks` (local) | `bd` (dirt), `.bank("RolandTR808")` |
| Snares | `Snares` (local) | `sd`, `sn` (dirt), `.bank("RolandTR909")` |
| Hi-hats | `ClosedHats`/`OpenHats` (local) | `hh`, `oh` (dirt) |
| Claps | `Claps` (local) | `cp` (dirt) |
| Bass | `Bass` (local) | `jvbass`, `bass` (dirt) |
| Piano | `piano` (Salamander) | — |
| Synth leads | `Synth` (local) | `arpy`, `pluck` (dirt) |
| Chord stabs | `Stabs`/`Chords` (local) | `casio`, `juno` (dirt) |
| Vocals | `Vox` (local) | `mouth`, `speech` (dirt) |
| Tabla/world | `tabla`, `mridangam` (dirt/dough) | — |
| Vintage machines | `.bank("RolandTR808")` etc. | `808bd` (dirt) |

## Tips

- Start with low variant numbers (`:0`, `:1`) — they're usually the cleanest
- Use `n()` to cycle through variants: `s("Kicks").n("0 3 5 12")`
- Layer kicks for weight: `stack(s("Kicks:0"), s("bd:5").gain(0.4))`
- `eot` samples are great for hip hop and trap — they have long tails, use `.cut(1)` to manage
- For piano: `note("c3 e3 g3").s("piano")` — multi-sampled, sounds great
- `.bank()` works with standard names: `s("bd sd hh cp").bank("RolandTR909")`
- **NEVER use `gm_*` names** — they are broken
