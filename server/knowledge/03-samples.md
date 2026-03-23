# Sample Catalog — CONFIRMED AVAILABLE (dirt-samples)

All samples below are loaded from the `tidalcycles/dirt-samples` GitHub repository via the REPL's `samples()` function. They are **confirmed available** and guaranteed to work.

Use `:n` to select variants (0-indexed). Example: `s("bd:3")` plays the 4th bd variant.

**IMPORTANT: Do NOT use `.bank()`. Do NOT use `gm_*` soundfont names (they are NOT loaded — see 04-soundfonts.md). All samples below are accessed directly by name in `s()`.**

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

These are your **primary melodic/harmonic tools** alongside built-in synths.

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

## Built-in Synths (ALWAYS AVAILABLE)

For melodic/harmonic parts, use built-in synths instead of GM soundfonts:

| Name | Description | Best for |
|------|-------------|----------|
| `sine` | Pure sine wave | Sub-bass, soft pads |
| `sawtooth` | Sawtooth wave (bright, buzzy) | Leads, bass, pads |
| `square` | Square wave (hollow, reedy) | Chiptune, reedy leads |
| `triangle` | Triangle wave (soft, mellow) | Soft leads, keys |
| `fm` | FM synthesis | Electric piano, bells, bass |

```js
// Use these INSTEAD of gm_epiano1, gm_piano, gm_synth_bass_2, etc.
// Electric piano substitute:
chord("<Cm7 Fm7 Ab^7 G7>").sound("fm").fmi(1.5).fmh(2).voicing().gain(0.5)

// Pad substitute:
note("<Cm7 Ab^7>").sound("sawtooth").lpf(800).release(1).room(0.6).gain(0.3)

// Bass substitute:
note("c2 ~ e2 g2").sound("sawtooth").lpf(400).release(0.1).gain(0.8)

// Warm lead:
note("c4 e4 g4 c5").sound("triangle").release(0.3).room(0.3)
```

## Tips

- Start with low variant numbers (`:0`, `:1`) — they're usually the cleanest
- Use `n()` to cycle through variants: `s("bd").n("0 3 5 12")`
- Layer kicks for weight: `stack(s("bd"), s("808bd:5").gain(0.6))`
- 808 samples are great for hip hop and trap — they have long tails, use `.cut(1)` to manage
- **For chords/melodies**: Use `fm` (electric piano feel), `sawtooth` (bright), `triangle` (soft), `sine` (pure) with `.note()`
- **NEVER use `gm_*` names** — they are not loaded in this environment
