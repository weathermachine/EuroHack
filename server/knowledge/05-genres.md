# Genre Production Guide

Each genre includes BPM, tempo setup, drum patterns, bass, chords, effects, groove techniques, and a complete working template.

**All templates use ONLY confirmed-working sounds: local samples (Kicks, Snares, ClosedHats, OpenHats, Claps, Crashes, eot, Bass, Chords, Stabs, Synth, Vox).**

---

## 1. Hip Hop (85-95 BPM)

**Tempo:** `setcps(90/240)` -> 90 BPM

### Characteristics
- Boom bap drum feel with swing
- Heavy 808 kicks or punchy acoustic kicks
- Sparse snares on 2 and 4
- Swung hi-hats with ghost notes
- Deep sub-bass or synth bass

### Drum Pattern
```js
s("eot:5 ~ ~ eot:5 ~ ~ eot:5 ~")  // kicks
s("[~ ~ ~ ~] eot:8 [~ ~ ~ ~] eot:8")      // snare on 2 & 4
s("ClosedHats*8").gain("[.4 .7 .5 .8]*2")       // hats with velocity
```

### Bass Approach
Use `Bass` with low-pass filter for rubber 808-style bass:
```js
note("c2 ~ ~ c2 ~ eb2 ~ ~").s("Bass").lpf(400).release(0.1).gain(0.85)
```

### Chords/Keys
Stabs for Rhodes-like electric piano feel:
```js
chord("<Cm7 Fm7 Ab^7 G7>").s("Stabs").voicing().lpf(1200).gain(0.5)
```

### Effects Profile
- Light room reverb: `.room(0.2).size(0.4)`
- Vinyl warmth: `.lpf(2000)` on master elements
- Subtle delay on hats: `.delay(0.15).delaytime(0.18)`

### Groove
Swing the hats with `.late()`:
```js
s("ClosedHats*8").late("0 .04 0 .04").gain("[.4 .7 .5 .8]*2")
```

### Complete Template
```js
setcps(90/240)
stack(
  s("eot:5 ~ ~ eot:5 ~ ~ eot:5 ~").gain(0.9),
  s("[~ ~ ~ ~] eot:8 [~ ~ ~ ~] eot:8").gain(0.8),
  s("ClosedHats*8").late("0 .04 0 .04").gain("[.4 .7 .5 .8]*2"),
  s("OpenHats ~ ~ ~ OpenHats ~ ~ ~").gain(0.3),
  note("c2 ~ ~ c2 ~ eb2 ~ ~").s("Bass").lpf(400).release(0.1).gain(0.85),
  chord("<Cm7 Fm7 Ab^7 G7>").s("Stabs").voicing().lpf(1200).gain(0.45).room(0.2)
)
```

---

## 2. Techno (130-145 BPM)

**Tempo:** `setcps(138/240)` -> 138 BPM

### Characteristics
- Relentless four-on-the-floor kick
- Minimal, repetitive, hypnotic
- LPF sweeps for tension and release
- Acid bass lines (303-style)
- Industrial textures

### Drum Pattern
```js
s("Kicks*4")                                    // four-on-the-floor
s("~ Claps ~ Claps")                               // clap on 2 & 4
s("ClosedHats*8").gain("[.5 .8]*4")                  // 8th note hats
s("~ ~ ~ ~ ~ ~ OpenHats ~")                        // open hat accents
```

### Bass Approach
Acid-style with filter sweeps — use `Bass`:
```js
note("c2 c2 c3 c2 eb2 c2 c3 c2").s("Bass")
  .lpf(sine.range(200, 3000).slow(8)).lpq(8).gain(0.7)
```

### Chords/Keys
Minimal — stabs or pads, not full progressions.
```js
note("<C5 Eb5>/4").s("Synth").lpf(1500).release(1.5).gain(0.25).room(0.6).size(0.9)
```

### Effects Profile
- Reverb on claps/hats: `.room(0.4).size(0.7)`
- Delay on percussion: `.delay(0.3).delaytime(0.125).delayfeedback(0.4)`
- LPF sweeps everywhere: `.lpf(sine.range(300, 5000).slow(16))`
- Distortion on kicks: `.distort(0.2)`

### Groove
Techno is mostly straight. Use `.sometimes()` for variation:
```js
s("ClosedHats*8").sometimes(x => x.speed(1.5)).gain("[.5 .8]*4")
```

### Complete Template
```js
setcps(138/240)
stack(
  s("Kicks*4").gain(0.9).distort(0.15),
  s("~ Claps ~ Claps").room(0.3).size(0.5).gain(0.75),
  s("ClosedHats*8").gain("[.5 .8]*4").lpf(4000),
  s("~ ~ ~ ~ ~ ~ OpenHats ~").gain(0.4).room(0.3),
  note("c2 c2 c3 c2 eb2 c2 c3 c2").s("Bass")
    .lpf(sine.range(200, 3000).slow(8)).lpq(8).gain(0.65),
  s("Crashes/4").gain(0.3).room(0.5).size(0.8)
)
```

---

## 3. House (120-128 BPM)

**Tempo:** `setcps(124/240)` -> 124 BPM

### Characteristics
- Four-on-the-floor kick
- Off-beat hi-hats (the signature house groove)
- Piano stabs or chords
- Deep, rolling bass lines
- Warm, soulful feel

### Drum Pattern
```js
s("Kicks*4")                                    // four-on-the-floor
s("~ ClosedHats ~ ClosedHats")                               // offbeat hats (signature!)
s("~ Claps ~ Claps")                               // clap on 2 & 4
s("OpenHats ~ OpenHats ~ OpenHats ~ OpenHats ~").gain(0.3)           // open hat pulse
```

### Bass Approach
Deep and rolling — use `Bass`:
```js
note("c2 ~ c2 c2 ~ c2 eb2 ~").s("Bass").lpf(500).release(0.1).gain(0.8)
```

### Chords/Keys
Piano stabs — use `Stabs` for electric piano feel:
```js
chord("<Cm7 Fm7 Bb7 Eb^7>").s("Stabs").voicing().gain(0.5)
  .room(0.2).delay(0.15)
```

### Effects Profile
- Warm reverb: `.room(0.3).size(0.5)`
- Subtle delay on keys: `.delay(0.2).delaytime(0.19)`
- Gentle LPF: `.lpf(3000)`

### Groove
Off-beat hats ARE the groove. Add subtle swing:
```js
s("~ ClosedHats ~ ClosedHats").late("0 .02 0 .02")
```

### Complete Template
```js
setcps(124/240)
stack(
  s("Kicks*4").gain(0.9),
  s("~ ClosedHats ~ ClosedHats").gain(0.7),
  s("~ Claps ~ Claps").room(0.25).gain(0.75),
  s("OpenHats*4").gain("[0 .3 0 .3]"),
  note("c2 ~ c2 c2 ~ c2 eb2 ~").s("Bass").lpf(500).release(0.1).gain(0.8),
  chord("<Cm7 Fm7 Bb7 Eb^7>").s("Stabs").voicing().gain(0.45)
    .room(0.25).delay(0.15).delaytime(0.19)
)
```

---

## 4. Drum & Bass (170-180 BPM)

**Tempo:** `setcps(174/240)` -> 174 BPM

### Characteristics
- Fast, syncopated breakbeats
- Heavy, rolling bass (reese bass)
- Chopped amen breaks
- Rapid hi-hat patterns
- Atmospheric pads

### Drum Pattern
```js
s("Kicks ~ ~ Kicks ~ ~ Kicks ~")                     // syncopated kick
s("~ ~ Snares ~ ~ Snares ~ ~")                       // off-grid snare
s("ClosedHats*16").gain("[.3 .6 .4 .7]*4")           // rapid hats
```

### Bass Approach
Reese bass — heavy filtered bass:
```js
note("c2 ~ c2 ~ eb2 ~ c2 ~").s("Bass")
  .lpf(sine.range(150, 800).slow(4)).gain(0.8).distort(0.1)
```

### Chords/Keys
Dark atmospheric pads with heavy filtering:
```js
chord("<Cm Gm Ab Bb>").s("Chords").voicing().gain(0.3)
  .lpf(1200).room(0.5).size(0.8).release(1)
```

### Effects Profile
- Heavy reverb on pads: `.room(0.6).size(0.9)`
- Distortion on bass: `.distort(0.15)`
- Fast delays: `.delay(0.25).delaytime(0.06).delayfeedback(0.3)`

### Groove
Syncopation IS the groove. Use amen break slices:
```js
s("amencutup:0 amencutup:3 amencutup:1 amencutup:7 amencutup:2 amencutup:5 amencutup:4 amencutup:6")
  .speed(1.1).gain(0.7)
```

### Complete Template
```js
setcps(174/240)
stack(
  s("Kicks ~ [~ Kicks] ~ ~ [Kicks ~] ~ ~").gain(0.9),
  s("~ ~ Snares:3 ~ ~ [~ Snares:3] ~ ~").room(0.2).gain(0.8),
  s("ClosedHats*16").gain("[.3 .6 .4 .7]*4").lpf(6000),
  note("c2 ~ c2 ~ eb2 ~ c2 ~").s("Bass")
    .lpf(sine.range(150, 800).slow(4)).gain(0.75).distort(0.1),
  chord("<Cm Gm Ab Bb>").s("Chords").voicing().gain(0.25)
    .lpf(1200).room(0.5).size(0.8).release(1)
)
```

---

## 5. Soul / R&B (90-100 BPM)

**Tempo:** `setcps(95/240)` -> 95 BPM

### Characteristics
- Pocket timing with deep groove
- Walking or melodic bass lines
- Warm electric piano (Rhodes)
- Brush-style drums
- Rich chord voicings

### Drum Pattern
```js
s("Kicks ~ Kicks ~")                                // simple kick
s("~ Snares ~ Snares")                                // snare on 2 & 4
s("[ClosedHats ClosedHats ClosedHats ClosedHats] [ClosedHats ClosedHats ClosedHats ClosedHats]").gain("[.4 .6 .5 .7]*2")  // gentle hats
```

### Bass Approach
Walking bass — use `Bass` for warm finger-bass feel:
```js
note("c2 e2 g2 e2 f2 a2 c3 a2").s("Bass")
  .gain(0.75).lpf(600).release(0.15)
```

### Chords/Keys
Rich Rhodes voicings using Stabs:
```js
chord("<Cm9 Fm9 Dm7b5 G7>").s("Stabs").voicing().gain(0.5)
  .room(0.3).size(0.4).lpf(2500)
```

### Effects Profile
- Warm reverb: `.room(0.3).size(0.5)`
- Gentle chorus feel: `.delay(0.1).delaytime(0.02).delayfeedback(0.2)`
- Warmth: `.lpf(3000)` on most elements

### Groove
Deep pocket with swing:
```js
s("[ClosedHats ClosedHats ClosedHats ClosedHats]*2").late("0 .05 0 .03").gain("[.4 .6 .5 .7]*2")
```

### Complete Template
```js
setcps(95/240)
stack(
  s("Kicks ~ [~ Kicks] ~").gain(0.85),
  s("~ Snares ~ Snares").gain(0.7).room(0.2),
  s("[ClosedHats ClosedHats ClosedHats ClosedHats]*2").late("0 .05 0 .03").gain("[.4 .6 .5 .7]*2"),
  note("c2 e2 g2 e2 f2 a2 c3 a2").s("Bass")
    .gain(0.7).lpf(600).release(0.15),
  chord("<Cm9 Fm9 Dm7b5 G7>").s("Stabs").voicing().gain(0.45)
    .room(0.3).size(0.4).lpf(2500),
  note("<C4 E4 G4 C5>/2").s("Synth").gain(0.2).room(0.4).release(0.5)
)
```

---

## 6. Ambient / Downtempo (60-90 BPM)

**Tempo:** `setcps(70/240)` -> 70 BPM

### Characteristics
- Sparse or no drums
- Long, evolving pad textures
- Heavy reverb and delay
- Slow filter sweeps
- Atmospheric sound design

### Drum Pattern (minimal)
```js
s("Kicks ~ ~ ~ Kicks ~ ~ ~").gain(0.5)            // sparse kick
s("~ ~ ~ ~ ~ ~ ClosedHats ~").gain(0.3).room(0.6)   // occasional hat
```

### Bass Approach
Sub-bass, very sparse:
```js
note("c2 ~ ~ ~ ~ ~ eb2 ~").s("Bass").gain(0.6).release(0.8).lpf(200)
```

### Chords/Keys
Lush evolving pads with heavy filtering and reverb:
```js
chord("<Cm7 Ab^7 Fm9 G7sus4>").s("Chords").voicing()
  .room(0.8).size(0.95).release(2).gain(0.4)
  .lpf(sine.range(800, 3000).slow(16))
```

### Effects Profile
- Maximum reverb: `.room(0.7).size(0.95)`
- Long delays: `.delay(0.5).delaytime(0.375).delayfeedback(0.6)`
- Slow LPF sweeps: `.lpf(sine.range(500, 3000).slow(16))`
- Pan modulation: `.pan(sine.slow(8))`

### Complete Template
```js
setcps(70/240)
stack(
  s("Kicks ~ ~ ~ Kicks ~ ~ ~").gain(0.45).room(0.4).lpf(200),
  chord("<Cm7 Ab^7 Fm9 G7sus4>").s("Chords").voicing()
    .room(0.8).size(0.95).release(2).gain(0.35)
    .lpf(sine.range(800, 3000).slow(16)),
  note("<C4 Ab3 F4 G4>/2").s("Synth").gain(0.15)
    .room(0.7).delay(0.5).delaytime(0.375).delayfeedback(0.5).release(0.6),
  note("c2 ~ ~ ~ ~ ~ eb2 ~").s("Bass").gain(0.5).release(0.8).lpf(200),
  s("wind:3").gain(0.1).room(0.5).speed(0.5).begin(0.1).end(0.9)
)
```

---

## 7. Lo-fi (75-90 BPM)

**Tempo:** `setcps(82/240)` -> 82 BPM

### Characteristics
- Muted, soft drums
- Detuned keys and instruments
- Vinyl crackle texture
- Warm low-pass filtering on everything
- Swing and imperfection

### Drum Pattern
```js
s("Kicks ~ [~ Kicks] ~").lpf(2000).gain(0.7)        // muted kick
s("~ Snares ~ Snares").lpf(3000).gain(0.5)             // soft snare
s("ClosedHats*8").lpf(2500).gain("[.3 .5 .3 .6]*2")   // filtered hats
```

### Bass Approach
Warm, muted bass with heavy filtering:
```js
note("c2 ~ e2 ~ f2 ~ g2 ~").s("Bass")
  .lpf(400).release(0.15).gain(0.7)
```

### Chords/Keys
Detuned Rhodes feel with filtering:
```js
chord("<Cm7 Fm7 Ab^7 Gm7>").s("Stabs").voicing()
  .lpf(1500).gain(0.4).room(0.3)
```

### Effects Profile
- Warm LPF on everything: `.lpf(2000)` or lower
- Cozy reverb: `.room(0.3).size(0.5)`
- Bitcrush for vinyl feel: `.crush(12).coarse(2)`
- Subtle noise layer for texture

### Groove
Heavy swing on hats:
```js
s("ClosedHats*8").late("0 .06 0 .06").lpf(2500).gain("[.3 .5 .3 .6]*2")
```

### Complete Template
```js
setcps(82/240)
stack(
  s("Kicks ~ [~ Kicks] ~").lpf(2000).gain(0.7),
  s("~ Snares ~ Snares").lpf(3000).gain(0.5).room(0.2),
  s("ClosedHats*8").late("0 .06 0 .06").lpf(2500).gain("[.3 .5 .3 .6]*2"),
  note("c2 ~ e2 ~ f2 ~ g2 ~").s("Bass")
    .lpf(400).release(0.15).gain(0.65),
  chord("<Cm7 Fm7 Ab^7 Gm7>").s("Stabs").voicing()
    .lpf(1500).gain(0.4).room(0.3),
  s("noise:1").gain(0.04).lpf(3000).crush(10)
)
```
