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
