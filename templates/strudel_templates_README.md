# Strudel Genre Templates
Five ready-to-use live coding templates for the Strudel REPL (https://strudel.cc/)

## Files
| File | Genre | BPM | Key |
|------|-------|-----|-----|
| `techno_template.js` | Techno | 140 | A minor |
| `house_template.js` | House | 124 | F minor |
| `drum_and_bass_template.js` | Drum & Bass | 174 | D minor |
| `hip_hop_template.js` | Hip Hop | 87 | C minor |
| `soul_template.js` | Soul | 95 | Eb major |

---

## Quick Start
1. Open https://strudel.cc/
2. Select all the default code and delete it
3. Paste any template
4. Press **ctrl+enter** to play
5. Press **ctrl+.** to stop

---

## Core Live Coding Controls

### Mute / Unmute layers
Every sound layer starts with either `$:` (active) or `_$:` (muted).

```js
$:  sound("bd*4")   // ACTIVE — this plays
_$: sound("bd*4")   // MUTED  — this is silent
```

Toggle layers in real time: edit `$:` ↔ `_$:` then press **ctrl+enter**.

### Change the key / mood
Each template has one line at the top:

```js
let chords = chord("<Am7 Gm7 Fm7 Em7>/2")
```

Change the chord symbols to revoice the entire track. The bass, pads, and melody
all reference this variable. Some chord symbols to try:

```
Major:      C  G  D  A  E  F  Bb  Eb  Ab
Minor:      Cm Gm Dm Am Em Fm Bbm Ebm Abm
7th:        C7  Cm7  CM7  (or C^7)
Extended:   C9  Cm9  C11  C13  C-11
```

### Change the tempo
```js
setcpm(140/4)  // 140 BPM  ← edit this number
```

---

## Song Structure Techniques

### Manual (live coding style)
The simplest approach — toggle layers with `$:` / `_$:` as you perform:

```
INTRO  → only kick + hats + bass ($:), everything else muted (_$:)
BUILD  → unmute pads/chords
DROP   → unmute melody and remaining layers
BREAK  → mute kick + bass, let atmosphere breathe
OUTRO  → re-mute layers one by one
```

### Automatic with `.mask()`
Add `.mask()` to automate when a layer plays.
Each element = 1 cycle (at 140bpm, 1 cycle ≈ 1.7s).

```js
// Play on cycles 5–8 of every 8-cycle loop:
sound("hh*8").mask("<0 0 0 0 1 1 1 1>/8")

// Play ONLY on the last cycle of every 4:
sound("rim ~ rim rim").mask("<0 0 0 1>/4")

// Silent for 8 cycles (intro), then active forever after:
sound("bd*4").mask("<0!8 1!8>/16".early(.5))
```

### Structural variation with `<...>`
Use angle brackets to alternate between patterns every N cycles:

```js
// Alternate between two bass patterns every 2 cycles
note("<[a1 ~ a1 ~] [a1 ~ ~ a1 ~ ~ a1 ~]>")

// Chord progression that changes every 2 cycles
chord("<Am7 Gm7 Fm7 Em7>/2")
```

---

## Customization Tips

### Adjust the groove feel
```js
.late(.02)           // push slightly behind the beat (soul/hip-hop feel)
.late("0 .04 0 .04") // swing 8th notes (hip-hop hi-hats)
```

### Filter sweeps for tension/release
```js
.lpf(sine.range(200, 2000).slow(8))  // slow LPF sweep over 8 cycles
.lpf(400)                             // fixed dark/closed filter
.lpf(4000)                            // open/bright filter
```

### Space and atmosphere
```js
.room(.2)   // small room
.room(.6)   // medium hall
.delay(.125) // 1/8th note delay
.delay(.25)  // 1/4 note delay
```

### Drum machine banks
```js
.bank("RolandTR909")   // house, techno
.bank("RolandTR808")   // hip hop, soul
.bank("AkaiLinn")      // DnB, breaks
.bank("RolandTR707")   // funk, electro
```

---

## Learning Resources
- **Strudel Docs**: https://strudel.cc/workshop/getting-started/
- **Mini-Notation reference**: https://strudel.cc/learn/mini-notation/
- **Chord/Voicing guide**: https://strudel.cc/understand/voicings/
- **Strudel Discord**: https://discord.com/invite/HGEdXmRkzT
