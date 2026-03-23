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
