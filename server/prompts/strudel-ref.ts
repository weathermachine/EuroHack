export const STRUDEL_REFERENCE = `
# Strudel Reference — FOLLOW EXACTLY

## CRITICAL SYNTAX RULES
1. setcps() is a STANDALONE function, NOT a pattern method. NEVER chain it: \`stack(...).setcps(0.5)\` is WRONG.
   CORRECT: put setcps() on its own line BEFORE the pattern, or call it separately.
2. The LAST expression in the code must be the pattern (what gets played). setcps() returns undefined, not a pattern.
3. All pattern methods are lowercase and chainable: .s(), .note(), .gain(), .lpf(), etc.
4. Mini-notation strings are auto-parsed — just use quoted strings like "c3 e3 g3".
5. stack() takes patterns as arguments, NOT arrays: stack(pat1, pat2) not stack([pat1, pat2]).

## Correct Code Structure
\`\`\`javascript
// Set tempo FIRST (standalone call)
setcps(0.55)

// Then the pattern expression (this is what plays)
stack(
  s("bd [~ bd] ~ bd").gain(0.9),
  s("~ sd ~ sd"),
  s("hh*8").gain(0.4)
)
\`\`\`

## WRONG (common mistakes to avoid)
- \`stack(...).setcps(0.5)\` — WRONG: setcps is not a pattern method
- \`stack(...).cps(0.5)\` — WRONG: cps is not a pattern method
- \`setcps(0.5).s("bd sd")\` — WRONG: setcps returns undefined
- \`s("bd sd").bpm(120)\` — WRONG: there is no bpm() method
- \`stack([pat1, pat2])\` — WRONG: don't wrap in array

## Mini-Notation Syntax
- \`"a b c"\` — sequence: play a, b, c evenly across one cycle
- \`"[a b c]"\` — subsequence: fit a, b, c into one step
- \`"<a b c>"\` — alternate: play a on cycle 1, b on cycle 2, c on cycle 3
- \`"a*4"\` — repeat: play a four times per cycle
- \`"a/2"\` — slow: play a once every 2 cycles
- \`"~"\` — rest (silence)
- \`"a?"\` — 50% probability
- \`"a|b"\` — random choice
- \`"(3,8)"\` — Euclidean rhythm: 3 hits spread over 8 steps
- \`"a:2"\` — sample variant: 3rd sample of sound a
- \`"a@3"\` — weight: give 3x time in subdivision

## Core Functions (create patterns)
- \`s("pattern")\` — trigger samples by name
- \`note("pattern")\` — melodic notes (e.g. "c3 e3 g3 b3", "60 64 67")
- \`sound("pattern")\` — alias for s()
- \`n("pattern")\` — sample number selector (use with .s("bank"))
- \`stack(pat1, pat2, ...)\` — layer patterns simultaneously
- \`cat(pat1, pat2, ...)\` — concatenate across cycles
- \`silence\` — empty pattern

## Standalone Functions (NOT chainable on patterns)
- \`setcps(n)\` — set cycles per second. 0.5 = 120 BPM in 4/4. Call on its own line.
- \`hush()\` — stop all sound immediately
- \`samples("github:user/repo")\` — load sample bank

## Chainable Pattern Methods (.method())
### Sound Selection
- \`.s("name")\` — set sound/sample
- \`.n(num)\` — sample variant number
- \`.note("pattern")\` — set note
- \`.freq(hz)\` — set frequency directly

### Volume & Envelope
- \`.gain(0-1)\` — volume (default 0.8)
- \`.attack(sec)\` — attack time
- \`.decay(sec)\` — decay time
- \`.sustain(0-1)\` — sustain level
- \`.release(sec)\` — release time

### Filters
- \`.lpf(hz)\` or \`.cutoff(hz)\` — low-pass filter
- \`.hpf(hz)\` — high-pass filter
- \`.bpf(hz)\` — band-pass filter
- \`.resonance(0-1)\` or \`.lpq(q)\` — filter Q

### Effects
- \`.delay(0-1)\` — delay wet amount
- \`.delaytime(sec)\` — delay time
- \`.delayfeedback(0-1)\` — delay feedback
- \`.room(0-1)\` — reverb amount
- \`.roomsize(0-1)\` — reverb size
- \`.pan(0-1)\` — stereo pan (0=left, 0.5=center, 1=right)
- \`.crush(bits)\` — bitcrush (lower = more crushed, try 4-8)
- \`.distort(amount)\` — distortion
- \`.speed(rate)\` — playback speed (negative = reverse)
- \`.cut(group)\` — cut group
- \`.orbit(n)\` — effects bus

### Pattern Transforms
- \`.fast(n)\` — speed up by n
- \`.slow(n)\` — slow down by n
- \`.rev()\` — reverse pattern
- \`.jux(fn)\` — apply fn to right channel only
- \`.every(n, fn)\` — apply fn every n cycles
- \`.sometimes(fn)\` — 50% of the time
- \`.often(fn)\` — 75% of the time
- \`.rarely(fn)\` — 25% of the time
- \`.off(time, fn)\` — time-shifted layer
- \`.struct("pattern")\` — impose rhythm
- \`.early(time)\` / \`.late(time)\` — time shift
- \`.add(n)\` / \`.sub(n)\` / \`.mul(n)\` — arithmetic on values
- \`.range(min, max)\` — scale values
- \`.segment(n)\` — sample n times per cycle
- \`.chunk(n, fn)\` — apply fn to chunks

## Built-in Synths (use with .s())
sine, sawtooth, square, triangle, fm (with .fmi() and .fmh())

## Common Samples (use with s() or .s())
### Dirt-Samples (always available):
bd (kick), sd (snare), hh (hi-hat), oh (open hat), cp (clap),
cr (crash), rim (rimshot), mt/ht/lt (toms), cb (cowbell),
bass, piano, casio, jazz, metal, techno, gabba, jvbass, future

### 808 Drum Machine Samples (from dirt-samples, NOT .bank()):
808bd (808 kick), 808sd (808 snare), 808hc (808 closed hat),
808oh (808 open hat), 808cy (808 cymbal), 808mt/808ht/808lt (808 toms),
808lc (808 low conga), 808mc (808 mid conga)
Use directly: s("808bd 808sd 808bd 808sd") — do NOT use .bank("RolandTR808")

### GM Soundfonts — DO NOT USE (BROKEN):
All gm_* names (gm_epiano1, gm_piano, gm_synth_bass_2, gm_pad_warm, etc.) are
BROKEN due to a dual-registry issue. They will produce silence or errors.
NEVER use any gm_* sound name.

### For melodic/harmonic parts, use built-in synths:
- fm (electric piano feel): note("c4").sound("fm").fmi(1.5).fmh(2)
- sawtooth (bass, pads, strings): note("c2").sound("sawtooth").lpf(400)
- triangle (soft leads, flute-like): note("c4").sound("triangle")
- sine (sub-bass, pure tones): note("c2").sound("sine").lpf(200)
- square (organ-like, chiptune): note("c4").sound("square")

### Dirt-sample tonal instruments (also work for melodies):
arpy, jvbass, casio, juno, moog, pluck, pad, sax, hoover, stab

## IMPORTANT: Do NOT use .bank() or gm_* names
The .bank("RolandTR808") syntax is NOT supported in this environment.
Instead, use the 808 samples directly: s("808bd") instead of s("bd").bank("RolandTR808")
All gm_* soundfont names are BROKEN — use built-in synths (fm, sawtooth, triangle, sine, square) instead.

## Tempo Reference
- setcps(0.5) = 120 BPM (standard house/techno)
- setcps(0.55) = 132 BPM (tech house)
- setcps(0.575) = 138 BPM (trance)
- setcps(0.7) = 168 BPM (drum & bass)
- setcps(0.375) = 90 BPM (hip hop)
- setcps(0.333) = 80 BPM (downtempo)
- Formula: cps = bpm / 240 (for 4/4 time)

## Genre Templates

### Minimal Techno
\`\`\`
setcps(0.52)
stack(
  s("bd ~ ~ bd ~ ~ bd ~"),
  s("~ ~ ~ ~ sd ~ ~ ~").gain(0.7),
  s("hh*16").gain(0.3).lpf(6000),
  s("rim:3 ~ rim:3 ~").gain(0.25).sometimes(x => x.delay(0.5).delaytime(0.125))
)
\`\`\`

### Dub Techno
\`\`\`
setcps(0.5)
stack(
  s("bd ~ [~ bd] ~"),
  s("~ sd:3 ~ sd:3").room(0.8).roomsize(0.9).gain(0.6),
  s("hh*8").gain(0.2).lpf(3000).pan("<0.3 0.7>"),
  note("<[c2 ~] [~ c2] [c2 ~] [eb2 ~]>").s("sawtooth")
    .lpf(800).resonance(0.3).gain(0.35).room(0.6)
    .attack(0.01).decay(0.1).sustain(0.3).release(0.4)
)
\`\`\`

### Hip Hop (87 BPM)
\`\`\`
setcps(87/240)
stack(
  s("808bd ~ ~ ~ ~ ~ 808bd ~").gain(1.1),
  s("~ ~ ~ 808sd ~ ~ ~ 808sd").room(0.15).gain(0.95),
  s("808hc*8").gain("[.4 .7 .5 .8]*1").late("0 .04 0 .04"),
  note("<[c1 ~] [f1 ~] [bb0 ~] [ab0 ~]>").s("sawtooth").lpf(400)
    .gain(1.0).attack(0.01).decay(0.5).sustain(0.8).release(0.3),
  chord("<Cm7 Fm7 Bb7 Ab^7>/2").voicing().s("fm").fmi(1.5).fmh(2)
    .struct("x ~ [~ x] ~").room(0.3).gain(0.5)
    .attack(0.01).release(0.2)
)
\`\`\`
`;
