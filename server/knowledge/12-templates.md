# Genre Templates

The following genre templates are available. Each is a complete, ready-to-play Strudel pattern using the `$:` / `_$:` stem system. All templates share a single `let chords = chord(...)` variable so changing the progression revoices the entire track.

| Template | Genre | BPM | Key |
|----------|-------|-----|-----|
| `drum_and_bass_template.js` | Drum And Bass | 174 | D minor |
| `hip_hop_template.js` | Hip Hop | 87 | C minor |
| `house_template.js` | House | 124 | F minor |
| `soul_template.js` | Soul | 95 | Eb major |
| `techno_template.js` | Techno | 140 | A minor |

---

## How Templates Work

- Each layer uses `$:` (active) or `_$:` (muted)
- Toggle layers live: change `$:` to `_$:` and press Ctrl+Enter
- All layers share a single `let chords = chord(...)` variable — change it to revoice everything
- `.bank("RolandTR909")` etc. for drum machine sounds
- Use `.mask()` for automated arrangement

## Template Structure

Every template follows this layout:
```
setcpm(BPM/4)
let chords = chord("<...>/2")

DRUMS:    $: kick, $: snare/clap, $: hats, _$: fills/variations
BASS:     $: main bass, _$: alt bass
CHORDS:   _$: pad, _$: stabs, _$: strings
MELODY:   _$: lead, _$: secondary melody
```

---

## Drum And Bass Template (174 BPM, D minor)

```js
// ════════════════════════════════════════════════════════════════
// ░▒▓ DRUM & BASS TEMPLATE — 174 BPM — Key: D minor ▓▒░
// ════════════════════════════════════════════════════════════════
//
// HOW TO USE:
//   • Paste into https://strudel.cc/
//   • ctrl+enter  → play/update
//   • ctrl+.      → stop
//   • Change  $:  to  _$:  to MUTE a layer
//   • Change  _$: to  $:   to UNMUTE a layer
//
// SONG STRUCTURE APPROACH:
//   INTRO  → pads + bass only. Build tension.
//   DROP   → Unmute full drum break. Energy explodes.
//   VERSE  → All layers. Keep break rolling.
//   BRIDGE → Mute drums. Half-time feel. Atmospheric.
//   OUTRO  → Drums back in, then strip layers.
//
//   TIP: DnB lives on the BREAK. Swap in .bank("AkaiLinn")
//        for a more amen-style feel.
// ════════════════════════════════════════════════════════════════

setcpm(174/4) // 174 BPM

// ── CHORD PROGRESSION ──────────────────────────────────────────
let chords = chord("<Dm7 C^7 Bbm7 Am7>/2")

// ┌─────────────────────────────────────────────────────────────┐
// │  DRUMS — syncopated breakbeat pattern                        │
// └─────────────────────────────────────────────────────────────┘

$: // KICK — syncopated DnB kick
  sound("bd ~ ~ ~ [~ bd] ~ bd ~")
  .bank("RolandTR909")
  .gain(1.05)

$: // SNARE — on 3 with ghost notes
  sound("~ ~ sd ~ ~ ~ [sd ~] ~")
  .bank("RolandTR909")
  .gain("[1 .4]*4")
  .room(.15)

$: // HI-HATS — rolling 16th feel
  sound("hh*8")
  .gain("[.5 .8 .6 .9 .5 .8 .6 1]*1")
  .bank("RolandTR909")

_$: // OPEN HAT — adds lift and space
  sound("~ oh ~ [~ oh]")
  .bank("RolandTR909")
  .gain(.5)

_$: // BREAK VARIATION — alternates between 2 patterns every 2 cycles
  sound("<[bd ~ [~ bd] ~ ~ bd ~ ~] [bd ~ ~ ~ [bd bd] ~ bd ~]>/2")
  .bank("AkaiLinn")
  .gain(1.0)

_$: // SNARE VARIATION — ghost note rolls (unmute for texture)
  sound("~ ~ [sd ~ sd ~] ~ ~ ~ [sd ~] ~")
  .bank("AkaiLinn")
  .gain("[1 .25 .25 .4]*2")

// ┌─────────────────────────────────────────────────────────────┐
// │  BASS                                                        │
// └─────────────────────────────────────────────────────────────┘

$: // SUB BASS — deep reese-style bass
  note("<[d1@3 ~ d1 ~] [c1@3 ~ c1 ~] [bb0@3 ~ bb0 ~] [a0@3 ~ a0 ~]>")
  .sound("sawtooth,triangle")
  .lpf(sine.range(80, 600).slow(4))
  .lpq(6)
  .gain(.95)
  .attack(.01).decay(.2).sustain(.7).release(.1)

_$: // BASS STAB — punchy rhythmic stabs (good for drops)
  note("<[d1 ~ d2 ~ ~ d1 ~ d2] [c1 ~ c2 ~ ~ c1 ~ c2]>/1")
  .sound("sawtooth")
  .lpf(700).lpq(4).gain(.85)
  .attack(.005).decay(.15).sustain(.3).release(.05)

// ┌─────────────────────────────────────────────────────────────┐
// │  CHORDS / PADS                                               │
// └─────────────────────────────────────────────────────────────┘

_$: // ATMOSPHERIC PAD — lush evolving texture
  chords.voicing()
  .sound("sawtooth")
  .lpf(sine.range(200, 900).slow(12))
  .room(.8).gain(.3)
  .attack(2).release(3)

_$: // PIANO — sparse hits between the beats
  chords.struct("~ ~ x ~")
  .voicing()
  .sound("gm_epiano1")
  .room(.5).gain(.4)
  .attack(.02).release(.4)

_$: // STRINGS — cinematic swell (great for builds/intros)
  chords.voicing()
  .sound("gm_string_ensemble2")
  .room(.8).gain(.35)
  .attack(3).release(4)
  .lpf(1500)

// ┌─────────────────────────────────────────────────────────────┐
// │  MELODY / LEAD                                               │
// └─────────────────────────────────────────────────────────────┘

_$: // LEAD SYNTH — neurofunk-style lead stab
  n("<[~ 7 ~ 5] [~ 3 ~ ~] [~ 5 ~ 3] [~ 2 ~ ~]>*2")
  .scale("D4:minor")
  .sound("sawtooth")
  .lpf(sine.range(600, 3000).slow(2))
  .lpq(8).room(.3).gain(.5)
  .attack(.005).decay(.1).sustain(.3).release(.08)

_$: // AMEN MELODY — melodic hook on top
  n(`<
    [~ 0 ~ 0 7 ~ 5 ~]
    [~ 3 ~ ~ 5 ~ 3 ~]
  >`)
  .scale("D4:minor")
  .sound("triangle")
  .room(.4).delay(.125).gain(.45)

_$: // VOCAL CHOP — chopped amen-era vocal texture
  n("<[0 ~ 5 ~] [3 ~ 7 ~] [2 ~ 3 ~] [0 ~ ~ ~]>*2")
  .scale("D4:minor")
  .sound("gm_voice_oohs")
  .speed("<1 1.5 .75 1>")
  .room(.4).gain(.4)
```

---

## Hip Hop Template (87 BPM, C minor)

```js
// ════════════════════════════════════════════════════════════════
// ░▒▓ HIP HOP TEMPLATE — 87 BPM — Key: C minor ▓▒░
// ════════════════════════════════════════════════════════════════
//
// HOW TO USE:
//   • Paste into https://strudel.cc/
//   • ctrl+enter  → play/update
//   • ctrl+.      → stop
//   • Change  $:  to  _$:  to MUTE a layer
//   • Change  _$: to  $:   to UNMUTE a layer
//
// SONG STRUCTURE APPROACH:
//   INTRO  → drums only or drums + keys. Set the mood.
//   VERSE  → All drums + bass. Sparse chords/keys.
//   HOOK   → Unmute melody. Add extra percussion.
//   BRIDGE → Mute drums. Chords + bass only (breakdown).
//   OUTRO  → Repeat hook, then mute layers slowly.
//
//   TIP: For boom bap feel, the SNARE is everything.
//        Swing comes from slight timing displacement —
//        try adding .late("0 .04 0 .04") to the hats.
// ════════════════════════════════════════════════════════════════

setcpm(87/4) // 87 BPM

// ── CHORD PROGRESSION ──────────────────────────────────────────
let chords = chord("<Cm7 Fm7 Bb7 Ab^7>/2")

// ┌─────────────────────────────────────────────────────────────┐
// │  DRUMS — boom bap pattern                                    │
// └─────────────────────────────────────────────────────────────┘

$: // KICK — boom bap syncopated kick
  sound("bd ~ ~ ~ ~ ~ bd ~")
  .bank("RolandTR808")
  .gain(1.1)

$: // SNARE — classic boom bap snare with crack
  sound("~ ~ ~ sd ~ ~ ~ sd")
  .bank("RolandTR808")
  .room(.15).gain(.95)

$: // HI-HATS — 16th notes with velocity swing
  sound("hh*8")
  .gain("[.4 .7 .5 .8 .4 .7 .5 1]*1")
  .late("0 .04 0 .04 0 .04 0 .04")   // swing feel
  .bank("RolandTR808")

_$: // OPEN HAT — off-beat accents
  sound("~ hh:1 ~ ~")
  .bank("RolandTR808")
  .gain(.6)
  .late(.03)

_$: // RIMSHOT / PERCUSSION — add texture
  sound("~ ~ rim ~ ~ rim ~ ~")
  .bank("RolandTR808")
  .gain(.5)

_$: // KICK VARIATION — double-time kicks for the hook
  sound("bd ~ ~ bd ~ bd ~ ~")
  .bank("RolandTR808")
  .gain(1.0)
  .mask("<0 0 1 0>/4") // only activates every 3rd bar

// ┌─────────────────────────────────────────────────────────────┐
// │  BASS                                                        │
// └─────────────────────────────────────────────────────────────┘

$: // 808 BASS — slides and long sustains
  note("<[c1@4 ~] [f1@4 ~] [bb0@4 ~] [ab0@4 ~]>")
  .sound("gm_synth_bass_2")
  .gain(1.0)
  .attack(.01).decay(.5).sustain(.8).release(.3)

_$: // BASS ALT — more rhythmic 808 pattern (for hooks)
  note("<[c1 ~ c1 c2 ~ ~ c1 ~] [f1 ~ f1 f2 ~ ~ f1 ~]>/1")
  .sound("gm_synth_bass_2")
  .gain(.95)
  .attack(.005).decay(.2).sustain(.6).release(.15)

// ┌─────────────────────────────────────────────────────────────┐
// │  CHORDS / KEYS                                               │
// └─────────────────────────────────────────────────────────────┘

$: // KEYS — muted Rhodes stabs (the classic hip hop feel)
  chords.struct("x ~ [~ x] ~")
  .voicing()
  .sound("gm_epiano1")
  .room(.3).gain(.5)
  .attack(.01).release(.2)

_$: // PAD — warm background texture
  chords.voicing()
  .sound("gm_string_ensemble1")
  .room(.6).gain(.3)
  .attack(1).release(2)
  .lpf(1400)

_$: // ORGAN — add gospel warmth
  chords.struct("x ~ x ~")
  .voicing()
  .sound("gm_drawbar_organ")
  .room(.4).gain(.35)
  .attack(.05).release(.3)

// ┌─────────────────────────────────────────────────────────────┐
// │  MELODY / LEAD                                               │
// └─────────────────────────────────────────────────────────────┘

_$: // PIANO MELODY — sparse, soulful hook
  n(`<
    [~ 0 ~ ~] [~ ~ 3 ~]
    [~ 2 ~ 0] [~ ~ ~ ~]
    [~ 5 ~ ~] [~ ~ 3 ~]
    [~ 2 ~ ~] [~ 0 ~ ~]
  >`)
  .scale("C4:minor")
  .sound("gm_epiano1")
  .room(.4).gain(.5)
  .attack(.02).release(.4)

_$: // VIBRAPHONE — floating melodic phrase
  n("<0 ~ [3 2] ~ 5 ~ [3 0] ~>*2")
  .scale("C4:minor:pentatonic")
  .sound("gm_vibraphone")
  .room(.5).delay(.25).gain(.4)

_$: // TRUMPET / HORN — soul-era melodic hook
  n("<~ 0 ~ 3 ~ 5 ~ [7 5]>")
  .scale("C4:minor")
  .sound("gm_trumpet")
  .room(.4).gain(.45)
  .attack(.05).release(.5)
```

---

## House Template (124 BPM, F minor)

```js
// ════════════════════════════════════════════════════════════════
// ░▒▓ HOUSE TEMPLATE — 124 BPM — Key: F minor ▓▒░
// ════════════════════════════════════════════════════════════════
//
// HOW TO USE:
//   • Paste into https://strudel.cc/
//   • ctrl+enter  → play/update
//   • ctrl+.      → stop
//   • Change  $:  to  _$:  to MUTE a layer
//   • Change  _$: to  $:   to UNMUTE a layer
//
// SONG STRUCTURE APPROACH:
//   INTRO  → kick + hats + bass. Keep it sparse.
//   VERSE  → Unmute chords (Rhodes). Add open hats.
//   HOOK   → Unmute melody. Groove in full swing.
//   BREAK  → Mute kick. Chords + bass only. Tension.
//   OUTRO  → Slowly mute layers. End on kick loop.
//
//   TIP: Classic house "piano stab" feel — try
//        .struct("x ~ [~ x] ~") for rhythmic chord hits.
// ════════════════════════════════════════════════════════════════

setcpm(124/4) // 124 BPM

// ── CHORD PROGRESSION ──────────────────────────────────────────
let chords = chord("<Fm7 Bbm7 Db^7 Eb7>/2")

// ┌─────────────────────────────────────────────────────────────┐
// │  DRUMS                                                       │
// └─────────────────────────────────────────────────────────────┘

$: // KICK — four on the floor (house classic)
  sound("bd*4")
  .bank("RolandTR909")
  .gain(1.0)

$: // CLAP — tight on 2 and 4
  sound("~ cp ~ cp")
  .bank("RolandTR909")
  .room(.2)

$: // CLOSED HI-HATS — off-beat 8ths
  sound("~ hh ~ hh ~ hh ~ hh")
  .bank("RolandTR909")
  .gain(.65)

$: // OPEN HI-HAT — classic house off-beat lift
  sound("[~ ~ ~ oh]*2")
  .bank("RolandTR909")
  .gain(.55)

_$: // SHAKER — adds swing and movement
  sound("hh*8")
  .bank("RolandTR707")
  .gain("[.2 .5 .3 .5 .2 .5 .3 .8]*2")

_$: // SNARE ROLL / FILL — plays on last cycle of every 4
  sound("~ ~ ~ [sd sd sd sd]")
  .bank("RolandTR909")
  .gain(.6)
  .mask("<0 0 0 1>/4")

// ┌─────────────────────────────────────────────────────────────┐
// │  BASS                                                        │
// └─────────────────────────────────────────────────────────────┘

$: // BASS — deep house groove with push and pull
  note("<[f1 ~ f2 ~ f1 ~ [f1 eb1]] [bb1 ~ bb2 ~ bb1 ~ [bb1 ab1]] [db2 ~ db2 ~ db2 ~ [c2 db2]] [eb1 ~ eb2 ~ eb1 ~ [eb1 db1]]>")
  .sound("gm_synth_bass_1")
  .lpf(800).gain(.9)
  .attack(.02).release(.15)

_$: // BASS ALT — simpler walking pattern (good for verses)
  note("<[f1@3 eb1] [bb1@3 ab1] [db2@3 c2] [eb1@3 db1]>")
  .sound("gm_acoustic_bass")
  .gain(.85)

// ┌─────────────────────────────────────────────────────────────┐
// │  CHORDS / PADS                                               │
// └─────────────────────────────────────────────────────────────┘

_$: // RHODES — soulful electric piano pad
  chords.voicing()
  .sound("gm_epiano1")
  .room(.4).gain(.5)
  .attack(.05).release(.5)

_$: // PIANO STAB — rhythmic house chord stab
  chords.struct("~ x ~ [~ x]")
  .voicing()
  .sound("gm_epiano1")
  .room(.2).gain(.55)
  .attack(.01).release(.1)

_$: // STRINGS — lush background texture
  chords.voicing()
  .sound("gm_string_ensemble1")
  .room(.7).gain(.3)
  .attack(1).release(2)
  .lpf(1200)

// ┌─────────────────────────────────────────────────────────────┐
// │  MELODY / LEAD                                               │
// └─────────────────────────────────────────────────────────────┘

_$: // VOCAL CHOP — classic house vocal texture
  n("<[0 ~ 3 ~] [2 ~ 0 ~] [5 ~ 3 ~] [2 ~ ~ ~]>*2")
  .scale("F4:minor")
  .sound("gm_voice_oohs")
  .room(.5).delay(.25).gain(.55)

_$: // LEAD SYNTH — soulful top-line melody
  n(`<
    [~ 0 ~ [3 2]] [~ 3 ~ ~]
    [~ 5 ~ [3 2]] [~ 0 ~ ~]
  >`)
  .scale("F4:minor")
  .sound("sawtooth")
  .lpf(2000).room(.4).gain(.45)
  .attack(.03).release(.4)

_$: // FLUTE — airy house melody (works well over the hook)
  n("<0 [~ 5] [3 ~] [7 5 3 ~]>")
  .scale("F4:minor")
  .sound("gm_flute")
  .room(.5).delay(.125).gain(.5)
```

---

## Soul Template (95 BPM, Eb major)

```js
// ════════════════════════════════════════════════════════════════
// ░▒▓ SOUL TEMPLATE — 95 BPM — Key: Eb major ▓▒░
// ════════════════════════════════════════════════════════════════
//
// HOW TO USE:
//   • Paste into https://strudel.cc/
//   • ctrl+enter  → play/update
//   • ctrl+.      → stop
//   • Change  $:  to  _$:  to MUTE a layer
//   • Change  _$: to  $:   to UNMUTE a layer
//
// SONG STRUCTURE APPROACH:
//   INTRO  → Keys + bass. Establish the groove and feel.
//   VERSE  → Add drums. Sparse but warm. Horns optional.
//   HOOK   → Full arrangement. Unmute melody + extra chords.
//   BRIDGE → Mute drums + bass. Solo piano/horn moment.
//   OUTRO  → Repeat hook, fade by muting layers one by one.
//
//   TIP: Soul feel lives in the POCKET — slight .late() on
//        the snare/kick pushes the human feel.
//        Try .late(.02) on the kick for a "behind the beat" feel.
// ════════════════════════════════════════════════════════════════

setcpm(95/4) // 95 BPM

// ── CHORD PROGRESSION ──────────────────────────────────────────
let chords = chord("<Eb^7 Cm7 Fm7 Bb7>/2")

// ┌─────────────────────────────────────────────────────────────┐
// │  DRUMS — live soul/funk feel                                 │
// └─────────────────────────────────────────────────────────────┘

$: // KICK — sitting slightly behind the beat
  sound("bd ~ ~ ~ bd ~ bd ~")
  .bank("RolandTR808")
  .gain(1.0)
  .late(.015)  // "behind the beat" pocket feel

$: // SNARE — fat snare on 2 and 4
  sound("~ ~ sd ~ ~ ~ sd ~")
  .bank("RolandTR808")
  .room(.25).gain(.9)
  .late(.02)

$: // HI-HATS — 16th note groove
  sound("hh*8")
  .gain("[.4 .5 .9 .5 .4 .6 .9 .5]*1")
  .late("0 .015 0 .015 0 .015 0 .015")  // slight swing
  .bank("RolandTR808")

_$: // OPEN HI-HAT — classic soul off-beat
  sound("~ ~ ~ oh ~ ~ ~ oh")
  .bank("RolandTR808")
  .gain(.55)

_$: // TAMBOURINE — adds gospel/soul energy to the 8th notes
  sound("~ perc ~ perc ~ perc ~ perc")
  .gain(".4 .4 .7 .4 .4 .4 .8 .4")

_$: // RIDE CYMBAL — for a jazzier verse section
  sound("rd*8")
  .gain("[.5 .7]*4")
  .room(.3)

// ┌─────────────────────────────────────────────────────────────┐
// │  BASS                                                        │
// └─────────────────────────────────────────────────────────────┘

$: // WALKING BASS — smooth soul bass line
  note("<[eb2 ~ g2 ~ bb2 ~ g2 ~] [c2 ~ eb2 ~ g2 ~ eb2 ~] [f2 ~ ab2 ~ c3 ~ ab2 ~] [bb1 ~ d2 ~ f2 ~ d2 ~]>")
  .sound("gm_acoustic_bass")
  .gain(.9)
  .attack(.01).release(.25)

_$: // BASS ALT — simpler, more Motown-style
  note("<[eb2@3 bb1] [c2@3 g2] [f2@3 c2] [bb1@3 f2]>")
  .sound("gm_acoustic_bass")
  .gain(.9)

// ┌─────────────────────────────────────────────────────────────┐
// │  CHORDS / KEYS                                               │
// └─────────────────────────────────────────────────────────────┘

$: // RHODES — warm electric piano (the heart of soul music)
  chords.voicing()
  .sound("gm_epiano1")
  .room(.35).gain(.55)
  .attack(.03).release(.6)

_$: // PIANO — add rhythmic comping on top
  chords.struct("x ~ [x ~] ~")
  .voicing()
  .sound("gm_acoustic_grand_piano")
  .room(.3).gain(.4)
  .attack(.02).release(.3)

_$: // ORGAN — gospel warmth underneath
  chords.voicing()
  .sound("gm_drawbar_organ")
  .room(.5).gain(.3)
  .attack(.1).release(1)
  .lpf(1600)

_$: // STRINGS — lush cinematic swells (hook/chorus)
  chords.voicing()
  .sound("gm_string_ensemble1")
  .room(.7).gain(.3)
  .attack(1.5).release(3)
  .lpf(1200)

// ┌─────────────────────────────────────────────────────────────┐
// │  MELODY / LEAD                                               │
// └─────────────────────────────────────────────────────────────┘

_$: // TRUMPET — classic soul horn melody
  n(`<
    [~ ~ 0 ~] [~ 2 ~ ~]
    [~ ~ 3 ~] [~ 5 ~ ~]
    [~ ~ 7 ~] [~ 5 3 ~]
    [2 ~ ~ ~] [~ ~ ~ ~]
  >`)
  .scale("Eb4:major")
  .sound("gm_trumpet")
  .room(.4).gain(.5)
  .attack(.04).release(.4)

_$: // SAX MELODY — smoother feel for verse/bridge
  n("<~ 0 ~ 3 ~ [5 3] 2 ~>*2")
  .scale("Eb4:major:pentatonic")
  .sound("gm_alto_sax")
  .room(.5).delay(.1875).gain(.45)
  .attack(.05).release(.5)

_$: // BACKING VOCALS — "ooh" harmony texture
  n("<[0,4,7] ~ [2,5,9] ~ [3,7,10] ~ [2,5,9] ~>")
  .scale("Eb4:major")
  .sound("gm_voice_oohs")
  .room(.6).gain(.35)
  .attack(.1).release(.8)
```

---

## Techno Template (140 BPM, A minor)

```js
// ════════════════════════════════════════════════════════════════
// ░▒▓ TECHNO TEMPLATE — 140 BPM — Key: A minor ▓▒░
// ════════════════════════════════════════════════════════════════
//
// HOW TO USE:
//   • Paste into https://strudel.cc/
//   • ctrl+enter  → play/update
//   • ctrl+.      → stop
//   • Change  $:  to  _$:  to MUTE a layer
//   • Change  _$: to  $:   to UNMUTE a layer
//
// SONG STRUCTURE APPROACH:
//   INTRO  → kick + hats only. Unmute bass after a few bars.
//   BUILD  → Unmute chords/pads. Filter sweeps up. Tension rises.
//   DROP   → Unmute all layers. Full energy hits.
//   BREAK  → Mute kick + bass. Let pads/melody breathe.
//   OUTRO  → Re-mute layers one by one until silence.
//
//   TIP: Add .mask("<0!8 1!8>/16") to any layer to automate
//        a silent intro → active drop after 8 cycles (~55s).
// ════════════════════════════════════════════════════════════════

setcpm(140/4) // 140 BPM  (setcpm = cycles per minute, 1 cycle = 4 beats)

// ── CHORD PROGRESSION ──────────────────────────────────────────
// Edit this one line to revoice the whole track
let chords = chord("<Am7 Gm7 Fm7 Em7>/2")

// ┌─────────────────────────────────────────────────────────────┐
// │  DRUMS                                                       │
// └─────────────────────────────────────────────────────────────┘

$: // KICK — four on the floor
  sound("bd*4")
  .bank("RolandTR909")
  .gain(1.1)

$: // CLAP — on beats 2 and 4
  sound("~ cp ~ cp")
  .bank("RolandTR909")
  .room(.15)

$: // CLOSED HI-HATS — 16ths with velocity accent
  sound("hh*16")
  .gain("[.35 .35 .7 .35]*4")
  .bank("RolandTR909")

_$: // OPEN HI-HAT — off-beat lift (unmute for groove)
  sound("~ oh ~ ~")
  .bank("RolandTR909")
  .gain(.55)

_$: // PERCUSSION FILL — plays only on the last cycle of every 8
  sound("rim ~ [rim rim] ~, perc*8")
  .bank("RolandTR909")
  .gain(.45)
  .mask("<0 0 0 0 0 0 0 1>/8")

// ┌─────────────────────────────────────────────────────────────┐
// │  BASS                                                        │
// └─────────────────────────────────────────────────────────────┘

$: // BASS — driving acid-style with auto filter sweep
  note("<[a1!2 ~ a1 ~]*2 [g1!2 ~ g1 ~]*2 [f1!2 ~ f1 ~]*2 [e1!2 ~ e1 ~]*2>")
  .sound("sawtooth")
  .lpf(sine.range(180, 1800).slow(8))  // slow LPF sweep over 8 cycles
  .lpq(10)                              // resonance amount
  .gain(.85)
  .attack(.005).decay(.1).sustain(.4).release(.08)

_$: // BASS ALT — more syncopated variation (swap with above)
  note("<[a1 ~ ~ ~ a1 ~ a1 ~] [g1 ~ ~ ~ g1 ~ g1 ~]>/1")
  .sound("sawtooth")
  .lpf(500).lpq(8).gain(.85)

// ┌─────────────────────────────────────────────────────────────┐
// │  CHORDS / PADS                                               │
// └─────────────────────────────────────────────────────────────┘

_$: // PAD — slow evolving chords (unmute for build and drop)
  chords.voicing()
  .sound("sawtooth")
  .lpf(sine.range(250, 1100).slow(16))
  .room(.7).gain(.35)
  .attack(1.5).release(2)

_$: // STAB — rhythmic chord hits (unmute at drop)
  chords.struct("~ [x ~] ~ ~")
  .voicing()
  .sound("square")
  .lpf(900).room(.25).gain(.45)
  .attack(.01).release(.15)

// ┌─────────────────────────────────────────────────────────────┐
// │  MELODY / LEAD                                               │
// └─────────────────────────────────────────────────────────────┘

_$: // ACID LEAD — TB-303 style (main hook)
  n("<[0 ~ 7 ~ 5 ~ 3 ~] [0 ~ 5 ~ 3 ~ 2 ~]>/2")
  .scale("A2:minor")
  .sound("sawtooth")
  .lpf(sine.range(350, 2200).slow(4))
  .lpq(14)
  .gain(.65)
  .attack(.005).decay(.07).sustain(.25).release(.04)

_$: // LEAD MELODY — atmospheric motif over the drop
  n("<0 ~ [7 5] ~ 3 ~ [5 3] ~>*2")
  .scale("A4:minor")
  .sound("triangle")
  .room(.5).delay(.125).gain(.45)
  .attack(.02).release(.3)
```

