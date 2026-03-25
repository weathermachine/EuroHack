// Note name constants
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
// Flat equivalents for display
const FLAT_NAMES: Record<string, string> = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };

export class MusicTheory {
  // --- Scale Definitions ---
  // Map of scale name → semitone intervals from root
  private static readonly SCALES: Record<string, number[]> = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    aeolian: [0, 2, 3, 5, 7, 8, 10],
    locrian: [0, 1, 3, 5, 6, 8, 10],
    minor_pentatonic: [0, 3, 5, 7, 10],
    major_pentatonic: [0, 2, 4, 7, 9],
    blues: [0, 3, 5, 6, 7, 10],
    chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    whole_tone: [0, 2, 4, 6, 8, 10],
    harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
    melodic_minor: [0, 2, 3, 5, 7, 9, 11],
    diminished: [0, 2, 3, 5, 6, 8, 9, 11],
    bebop: [0, 2, 4, 5, 7, 9, 10, 11],
  };

  // --- Chord interval definitions ---
  private static readonly CHORD_INTERVALS: Record<string, number[]> = {
    '': [0, 4, 7],           // major triad
    'm': [0, 3, 7],          // minor
    '7': [0, 4, 7, 10],      // dominant 7
    'maj7': [0, 4, 7, 11],   // major 7
    '^7': [0, 4, 7, 11],     // major 7 (Strudel notation)
    'm7': [0, 3, 7, 10],     // minor 7
    'm9': [0, 3, 7, 10, 14], // minor 9
    '9': [0, 4, 7, 10, 14],  // dominant 9
    'dim': [0, 3, 6],        // diminished
    'dim7': [0, 3, 6, 9],    // diminished 7
    'aug': [0, 4, 8],        // augmented
    'sus2': [0, 2, 7],       // suspended 2
    'sus4': [0, 5, 7],       // suspended 4
    '6': [0, 4, 7, 9],       // major 6
    'm6': [0, 3, 7, 9],      // minor 6
  };

  // --- Chord Progressions by style ---
  private static readonly PROGRESSIONS: Record<string, string[][]> = {
    pop: [
      ['I', 'V', 'vi', 'IV'],
      ['I', 'IV', 'V', 'IV'],
      ['vi', 'IV', 'I', 'V'],
    ],
    jazz: [
      ['ii7', 'V7', 'I^7', 'I^7'],
      ['I^7', 'vi7', 'ii7', 'V7'],
      ['ii7', 'V7', 'iii7', 'vi7'],
    ],
    blues: [
      ['I7', 'I7', 'I7', 'I7', 'IV7', 'IV7', 'I7', 'I7', 'V7', 'IV7', 'I7', 'V7'],
    ],
    soul: [
      ['im7', 'iv7', 'bVII7', 'bIII^7'],
      ['im7', 'iv7', 'vm7', 'IVm7'],
    ],
    edm: [
      ['im', 'bVI', 'bIII', 'bVII'],
      ['im', 'bVII', 'bVI', 'bIII'],
    ],
    lofi: [
      ['im7', 'iv7', 'bVII^7', 'bIII^7'],
      ['ii7', 'V7', 'I^7', 'vi7'],
    ],
    rock: [
      ['I', 'bVII', 'IV', 'I'],
      ['I', 'IV', 'V', 'V'],
    ],
    classical: [
      ['I', 'IV', 'V', 'I'],
      ['I', 'vi', 'IV', 'V'],
    ],
    dark: [
      ['im', 'bVI', 'bIII', 'bVII'],
      ['im', 'ivm', 'im', 'V'],
    ],
  };

  // --- Public Methods ---

  /** Get list of available scale names */
  static getScaleNames(): string[] { return Object.keys(MusicTheory.SCALES); }

  /** Get list of available progression styles */
  static getProgressionStyles(): string[] { return Object.keys(MusicTheory.PROGRESSIONS); }

  /** Transpose a note name by N semitones. Returns note name (no octave). */
  static transpose(note: string, semitones: number): string {
    const normalized = MusicTheory.normalizeNoteName(note);
    const idx = NOTE_NAMES.indexOf(normalized);
    if (idx === -1) return note;
    return NOTE_NAMES[((idx + semitones) % 12 + 12) % 12];
  }

  /** Normalize a note name to sharp notation (e.g., 'Bb' → 'A#', 'Db' → 'C#') */
  static normalizeNoteName(name: string): string {
    const upper = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    const flatToSharp: Record<string, string> = {
      'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B',
    };
    return flatToSharp[upper] || upper;
  }

  /** Generate scale note names for a root and scale type */
  static generateScale(root: string, scaleName: string): string[] {
    const intervals = MusicTheory.SCALES[scaleName];
    if (!intervals) throw new Error(`Unknown scale: ${scaleName}. Available: ${MusicTheory.getScaleNames().join(', ')}`);
    const rootNorm = MusicTheory.normalizeNoteName(root);
    const rootIdx = NOTE_NAMES.indexOf(rootNorm);
    if (rootIdx === -1) throw new Error(`Invalid root note: ${root}`);
    return intervals.map(i => NOTE_NAMES[(rootIdx + i) % 12]);
  }

  /** Generate scale notes with octave numbers, in Strudel lowercase format (e.g., ['c3', 'd3', 'e3']) */
  static getScaleNotes(root: string, scaleName: string, octave: number = 3): string[] {
    return MusicTheory.generateScale(root, scaleName).map(n => `${n.toLowerCase()}${octave}`);
  }

  /** Get notes of a chord (e.g., 'Cm7' → ['C', 'D#', 'G', 'A#']) */
  static getChordNotes(chord: string): string[] {
    // Parse chord: root (1-2 chars) + quality (rest)
    const match = chord.match(/^([A-Ga-g][#b]?)(.*)/);
    if (!match) return [chord];
    const [, rootRaw, quality] = match;
    const root = MusicTheory.normalizeNoteName(rootRaw);
    const intervals = MusicTheory.CHORD_INTERVALS[quality] || MusicTheory.CHORD_INTERVALS[''];
    return intervals.map(i => NOTE_NAMES[(NOTE_NAMES.indexOf(root) + i) % 12]);
  }

  /** Generate a chord progression as Strudel chord symbols for a key and style.
   *  Returns array of chord symbol strings (e.g., ['Cm7', 'Fm7', 'Bb7', 'Ebmaj7'])
   */
  static generateProgression(key: string, style: string): string[] {
    const progs = MusicTheory.PROGRESSIONS[style];
    if (!progs) throw new Error(`Unknown style: ${style}. Available: ${MusicTheory.getProgressionStyles().join(', ')}`);
    // Pick a random progression from the style
    const prog = progs[Math.floor(Math.random() * progs.length)];
    return prog.map(numeral => MusicTheory.numeralToChord(key, numeral));
  }

  /** Convert a Roman numeral to a chord symbol in a key.
   *  E.g., key='C', numeral='ii7' → 'Dm7'
   *        key='C', numeral='bVII' → 'Bb'
   */
  static numeralToChord(key: string, numeral: string): string {
    const root = MusicTheory.normalizeNoteName(key);

    // Parse numeral: optional 'b' prefix, roman numeral, optional quality suffix
    const match = numeral.match(/^(b?)(VII|VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i)(.*)/);
    if (!match) return numeral;
    const [, flat, roman, suffix] = match;

    const isMinor = roman === roman.toLowerCase();

    // Map roman numeral to scale degree (semitones)
    const degreeMap: Record<string, number> = {
      'i': 0, 'ii': 2, 'iii': 4, 'iv': 5, 'v': 7, 'vi': 9, 'vii': 11,
      'I': 0, 'II': 2, 'III': 4, 'IV': 5, 'V': 7, 'VI': 9, 'VII': 11,
    };

    const romanLower = roman.toLowerCase();
    let semitones = degreeMap[romanLower] ?? 0;
    if (flat === 'b') semitones -= 1;

    const chordRoot = NOTE_NAMES[((NOTE_NAMES.indexOf(root) + semitones) % 12 + 12) % 12];

    // Determine quality suffix
    let quality = suffix;
    if (!quality && isMinor) quality = 'm';
    // Map numeral suffixes to Strudel chord suffixes
    const suffixMap: Record<string, string> = {
      '7': isMinor ? 'm7' : '7',
      '^7': '^7',
      '9': isMinor ? 'm9' : '9',
    };
    if (suffix && suffixMap[suffix]) quality = suffixMap[suffix];

    return `${chordRoot}${quality}`;
  }

  /** Generate Euclidean rhythm as a boolean pattern.
   *  E.g., euclideanRhythm(3, 8) → [true, false, false, true, false, false, true, false]
   */
  static euclideanRhythm(hits: number, steps: number): boolean[] {
    if (hits > steps) throw new Error('Hits cannot exceed steps');
    const pattern: boolean[] = new Array(steps).fill(false);
    const interval = steps / hits;
    for (let i = 0; i < hits; i++) {
      pattern[Math.floor(i * interval)] = true;
    }
    return pattern;
  }

  /** Generate euclidean rhythm as mini-notation string: "x ~ x ~ x ~ ~ ~" */
  static euclideanString(hits: number, steps: number, hit: string = 'x', rest: string = '~'): string {
    return MusicTheory.euclideanRhythm(hits, steps).map(h => h ? hit : rest).join(' ');
  }

  /** Generate arpeggio pattern from chord in Strudel note format */
  static generateArpeggio(chord: string, direction: 'up' | 'down' | 'updown' | 'random' = 'up', octave: number = 3): string[] {
    const notes = MusicTheory.getChordNotes(chord).map(n => `${n.toLowerCase()}${octave}`);
    switch (direction) {
      case 'down': return [...notes].reverse();
      case 'updown': return [...notes, ...notes.slice(1, -1).reverse()];
      case 'random': return notes.sort(() => Math.random() - 0.5);
      default: return notes;
    }
  }
}
