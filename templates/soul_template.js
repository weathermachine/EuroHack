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
