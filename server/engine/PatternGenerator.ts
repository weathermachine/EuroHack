import { MusicTheory } from './MusicTheory.js';

export class PatternGenerator {

  /** Generate a drum pattern for a given style and complexity (0-1) */
  static generateDrums(style: string, complexity: number = 0.7): string {
    // Complexity 0-1 selects from simple->complex patterns per style
    // Each style has 3-4 complexity levels
    const patterns: Record<string, string[]> = {
      techno: [
        's("Kicks*4")',
        's("Kicks*4, ~ Claps ~ Claps")',
        'stack(\n  s("Kicks*4"),\n  s("~ Claps ~ Claps"),\n  s("ClosedHats*8")\n)',
        'stack(\n  s("Kicks*4"),\n  s("~ Claps ~ Claps"),\n  s("[~ ClosedHats]*4"),\n  s("OpenHats ~ ~ ~")\n).swing(0.05)',
      ],
      house: [
        's("Kicks*4, ClosedHats*8")',
        'stack(\n  s("Kicks*4"),\n  s("ClosedHats*8"),\n  s("~ Claps ~ Claps")\n)',
        'stack(\n  s("Kicks*4"),\n  s("[~ ClosedHats]*4"),\n  s("~ Claps ~ Claps"),\n  s("OpenHats ~ OpenHats ~")\n)',
        'stack(\n  s("Kicks*4"),\n  s("[~ ClosedHats]*4"),\n  s("~ Claps ~ Claps")\n).every(4, x => x.fast(2))',
      ],
      dnb: [
        's("Kicks ~ ~ Kicks ~ ~ Kicks ~, ~ ~ Snares ~ ~ Snares ~ ~")',
        'stack(\n  s("Kicks ~ ~ [Kicks Kicks] ~ ~ Kicks ~"),\n  s("~ ~ Snares ~ ~ Snares ~ ~"),\n  s("ClosedHats*16")\n)',
        'stack(\n  s("Kicks ~ ~ [Kicks Kicks] ~ ~ Kicks ~"),\n  s("~ ~ Snares ~ [~ Snares] ~ Snares ~ ~"),\n  s("ClosedHats*16")\n).fast(2)',
      ],
      trap: [
        's("Kicks*2, ~ Claps ~ Claps")',
        'stack(\n  s("Kicks*2"),\n  s("~ Claps ~ Claps"),\n  s("ClosedHats*8")\n).every(2, x => x.fast(2))',
        'stack(\n  s("Kicks [Kicks Kicks] ~ Kicks"),\n  s("~ Claps ~ Claps"),\n  s("ClosedHats*16")\n).swing(0.2)',
      ],
      breakbeat: [
        's("Kicks ~ ~ Kicks ~ ~ ~ Kicks, ~ Snares ~ ~ Snares ~")',
        'stack(\n  s("Kicks ~ ~ Kicks ~ [~ Kicks] ~ Kicks"),\n  s("~ Snares ~ ~ Snares ~"),\n  s("ClosedHats*8")\n)',
        'stack(\n  s("Kicks ~ [~ Kicks] Kicks ~ [~ Kicks] ~ Kicks"),\n  s("~ Snares ~ ~ Snares [~ Snares]"),\n  s("ClosedHats*8")\n).swing(0.1)',
      ],
      ambient: [
        's("Kicks ~ ~ ~")',
        's("Kicks ~ ~ ~, ~ ~ ~ ClosedHats:8").room(0.9)',
        'stack(\n  s("Kicks ~ ~ ~"),\n  s("~ ~ ~ ClosedHats:8"),\n  s("~ ~ OpenHats:5 ~")\n).room(0.9).gain(0.5)',
      ],
      boom_bap: [
        's("Kicks ~ ~ ~ Snares ~ ~ ~, Kicks ~ ~ Kicks Snares ~ Kicks ~")',
        'stack(\n  s("Kicks ~ ~ ~ Snares ~ ~ ~, Kicks ~ ~ Kicks Snares ~ Kicks ~").gain(0.9),\n  s("ClosedHats*8").gain(0.4).hpf(5000),\n  s("~ ~ OpenHats ~ ~ ~ OpenHats ~").gain(0.3)\n).swing(0.08)',
        'stack(\n  s("Kicks ~ ~ [~ Kicks] Snares ~ ~ ~, Kicks ~ ~ Kicks Snares ~ [Kicks Kicks] ~").gain(0.9),\n  s("~ ~ ~ ~ Snares:3 ~ ~ ~").gain(0.3).room(0.2),\n  s("[~ ClosedHats]*8").gain(0.45).hpf(4000),\n  s("~ ~ OpenHats ~ ~ ~ ~ OpenHats:2").gain(0.25).room(0.3)\n).swing(0.1)',
      ],
      trip_hop: [
        's("Kicks ~ ~ ~, ~ ~ ~ Snares:3").room(0.5).gain(0.7)',
        'stack(\n  s("Kicks ~ ~ Kicks ~ ~ Kicks ~").gain(0.8),\n  s("~ ~ ~ ~ Snares ~ ~ ~").gain(0.7).room(0.4),\n  s("ClosedHats*8").gain(0.25).hpf(6000)\n)',
        'stack(\n  s("Kicks ~ [~ Kicks] ~ Kicks ~ ~ ~").gain(0.8),\n  s("~ ~ ~ ~ Snares ~ ~ Snares:2?").gain(0.7).room(0.5),\n  s("ClosedHats*8").gain(0.25).hpf(5000),\n  s("~ OpenHats ~ ~ ~ OpenHats ~ ~").gain(0.2).room(0.6)\n).slow(2)',
      ],
      experimental: [
        's("Kicks").euclid(5, 8)',
        'stack(\n  s("Kicks").euclid(5, 8),\n  s("Claps").euclid(3, 8)\n)',
        'stack(\n  s("Kicks").euclid(5, 8),\n  s("Claps").euclid(3, 8),\n  s("ClosedHats").euclid(7, 16)\n)',
      ],
    };

    // Handle style aliases
    const aliases: Record<string, string> = {
      'liquid_dnb': 'dnb', 'intelligent_dnb': 'dnb', 'liquid': 'dnb',
      'boombap': 'boom_bap', 'golden_era': 'boom_bap',
      'triphop': 'trip_hop', 'portishead': 'trip_hop',
      'garage': 'house', 'deep_house': 'house',
      'industrial': 'techno', 'minimal': 'techno',
    };
    const resolved = aliases[style.toLowerCase()] || style.toLowerCase();
    const pool = patterns[resolved] || patterns.techno;
    const idx = Math.min(Math.floor(complexity * pool.length), pool.length - 1);
    return pool[idx];
  }

  /** Generate a bassline for a key and style */
  static generateBassline(key: string, style: string): string {
    const k = key.toLowerCase();
    const fourth = MusicTheory.transpose(key, 5).toLowerCase();
    const fifth = MusicTheory.transpose(key, 7).toLowerCase();
    const minSev = MusicTheory.transpose(key, 10).toLowerCase();
    const minThird = MusicTheory.transpose(key, 3).toLowerCase();

    const patterns: Record<string, string> = {
      techno: `note("${k}2 ${k}2 ${k}2 ${k}2").s("Bass").lpf(800).release(0.1)`,
      house: `note("${k}2 ~ ${k}2 ~").s("Bass").gain(0.8)`,
      dnb: `note("${k}1 ~ ~ ${k}2 ~ ${k}1 ~ ~").s("Bass").lpf(400)`,
      acid: `note("${k}2 ${k}3 ${k}2 ${minThird}2").s("Bass").lpf(sine.range(200, 2000).slow(4)).lpq(8)`,
      dub: `note("${k}1 ~ ~ ~ ${k}1 ~ ${fifth}1 ~").s("Bass").room(0.5)`,
      funk: `note("${k}2 ${k}2 ~ ${fifth}2 ~ ${k}2 ${fifth}2 ~").s("Bass").lpf(1200)`,
      ambient: `note("${k}1").s("Bass").attack(2).release(4).gain(0.6)`,
      trip_hop: `note("<${k}1 ~ ~ ${k}1> <~ ${fourth}1 ~ ~> <${fifth}1 ~ ${k}1 ~> <~ ~ ${fourth}1 ~>")\n    .s("Bass").gain(0.7).lpf(120).attack(0.02).release(0.8).room(0.3)`,
      boom_bap: `note("<${k}1 ~ ${k}1 ~> <${k}1 ${fourth}1 ~ ~> <${k}1 ~ ${fifth}1 ~> <${fourth}1 ~ ${k}1 ~>")\n    .s("Bass").gain(0.7).lpf(200).attack(0.01).release(0.3)`,
    };
    const aliases: Record<string, string> = {
      'liquid_dnb': 'dnb', 'triphop': 'trip_hop', 'boombap': 'boom_bap',
    };
    const resolved = aliases[style.toLowerCase()] || style.toLowerCase();
    return patterns[resolved] || patterns.techno;
  }

  /** Generate a melody from a scale. Returns Strudel note() pattern. */
  static generateMelody(root: string, scaleName: string, length: number = 8, octaveRange: [number, number] = [3, 5]): string {
    const scale = MusicTheory.generateScale(root, scaleName);
    const notes: string[] = [];
    let lastIdx = Math.floor(Math.random() * scale.length);

    for (let i = 0; i < length; i++) {
      // Prefer stepwise motion (70%) over leaps
      const useStep = Math.random() < 0.7;
      let idx: number;
      if (useStep) {
        const step = Math.random() < 0.5 ? 1 : -1;
        idx = (lastIdx + step + scale.length) % scale.length;
      } else {
        idx = Math.floor(Math.random() * scale.length);
      }
      const octave = octaveRange[0] + Math.floor(Math.random() * (octaveRange[1] - octaveRange[0] + 1));
      notes.push(`${scale[idx].toLowerCase()}${octave}`);
      lastIdx = idx;
    }
    return `note("${notes.join(' ')}").s("Synth").release(0.3)`;
  }

  /** Generate a complete multi-layer pattern for a style/key/bpm */
  static generateComplete(style: string, key: string = 'C', bpm: number = 120): string {
    const drums = PatternGenerator.generateDrums(style, 0.7);
    const bass = PatternGenerator.generateBassline(key, style);

    // Choose scale based on style
    const scaleMap: Record<string, string> = {
      jazz: 'dorian', blues: 'blues', ambient: 'major_pentatonic',
      dark: 'minor', techno: 'minor', dnb: 'minor',
    };
    const scaleName = scaleMap[style.toLowerCase()] || 'minor';
    const melody = PatternGenerator.generateMelody(key, scaleName);

    // Choose chord progression style
    const chordStyleMap: Record<string, string> = {
      jazz: 'jazz', house: 'pop', techno: 'edm', ambient: 'lofi',
      dnb: 'edm', trip_hop: 'soul', boom_bap: 'soul',
    };
    const chordStyle = chordStyleMap[style.toLowerCase()] || 'pop';
    const chords = MusicTheory.generateProgression(key, chordStyle);
    const chordStr = chords.join(' ');

    return `// ${style} pattern in ${key} at ${bpm} BPM
setcps(${bpm}/240)

stack(
  // Drums
  ${drums},

  // Bass
  ${bass},

  // Chords
  chord("<${chordStr}>").s("Stabs").voicing().gain(0.5),

  // Melody
  ${melody}.gain(0.4).room(0.3).delay(0.2)
).gain(0.8)`;
  }

  /** Generate a variation of an existing pattern */
  static generateVariation(pattern: string, type: 'subtle' | 'moderate' | 'extreme' | 'glitch' | 'evolving' = 'subtle'): string {
    const mods: Record<string, string> = {
      subtle: '.sometimes(x => x.fast(2))',
      moderate: '.every(4, x => x.rev()).sometimes(x => x.fast(2))',
      extreme: '.every(2, x => x.jux(rev)).sometimes(x => x.iter(4))',
      glitch: '.sometimes(x => x.chop(8).rev()).rarely(x => x.speed(-1))',
      evolving: '.slow(4).every(8, x => x.fast(2)).every(16, x => x.palindrome())',
    };
    return pattern + (mods[type] || mods.subtle);
  }

  /** Generate a drum fill */
  static generateFill(style: string, bars: number = 1): string {
    const fills: Record<string, string> = {
      techno: `s("Kicks*8, Claps*4").fast(${bars})`,
      house: `s("Kicks*4, Claps*2, ClosedHats*16").fast(${bars})`,
      dnb: `s("Kicks*8, Snares*8").fast(${bars * 2})`,
      trap: `s("Kicks*4, ClosedHats*32").fast(${bars})`,
      breakbeat: `s("Kicks Snares Kicks Snares, ClosedHats*8").iter(4).fast(${bars})`,
      trip_hop: `s("Kicks ~ Snares ~, ClosedHats*4").room(0.5).fast(${bars})`,
      boom_bap: `s("Kicks Snares Kicks Snares, ClosedHats*8").swing(0.1).fast(${bars})`,
    };
    return fills[style.toLowerCase()] || fills.techno;
  }

  /** Generate polyrhythm pattern */
  static generatePolyrhythm(sounds: string[], hitCounts: number[], steps: number = 16): string {
    if (sounds.length !== hitCounts.length) throw new Error('sounds and hitCounts must have same length');
    const layers = sounds.map((s, i) => `  s("${s}").euclid(${hitCounts[i]}, ${steps})`);
    return `stack(\n${layers.join(',\n')}\n)`;
  }
}
