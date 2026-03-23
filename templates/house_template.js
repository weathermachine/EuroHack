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
