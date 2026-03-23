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
