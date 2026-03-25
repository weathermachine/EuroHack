/** Mood profile for emotional transformations */
interface MoodProfile {
  tempoMod: number;     // CPS multiplier adjustment (e.g., -0.1 = 10% slower)
  cutoffMod: number;    // LPF frequency offset
  roomMod: number;      // Reverb amount to add
  gainMod: number;      // Gain offset
  delayMod?: number;    // Delay amount to add
  description: string;
}

/** Energy level preset */
interface EnergyConfig {
  tempoAdjust: number;  // BPM percentage adjustment
  roomAmount: number;   // Reverb amount
  densityMod: string;   // Strudel modifier (.fast(), .slow(), or '')
  description: string;
}

export class Transforms {

  private static readonly MOODS: Record<string, MoodProfile> = {
    dark:        { tempoMod: -0.1,  cutoffMod: -200, roomMod: 0.2,  gainMod: -0.1,  description: 'Dark, brooding, heavy' },
    euphoric:    { tempoMod: 0.1,   cutoffMod: 400,  roomMod: 0.1,  gainMod: 0.1,   description: 'Uplifting, bright, open' },
    melancholic: { tempoMod: -0.15, cutoffMod: -100, roomMod: 0.3,  gainMod: -0.05, description: 'Sad, reflective, spacious' },
    aggressive:  { tempoMod: 0.15,  cutoffMod: 600,  roomMod: -0.1, gainMod: 0.15,  description: 'Intense, distorted, fast' },
    dreamy:      { tempoMod: -0.2,  cutoffMod: -300, roomMod: 0.4,  gainMod: -0.1, delayMod: 0.3, description: 'Ethereal, floaty, washed out' },
    peaceful:    { tempoMod: -0.25, cutoffMod: -200, roomMod: 0.25, gainMod: -0.15, description: 'Calm, minimal, gentle' },
    energetic:   { tempoMod: 0.2,   cutoffMod: 300,  roomMod: 0,    gainMod: 0.1,   description: 'High energy, driving, punchy' },
  };

  private static readonly ENERGY_LEVELS: Record<number, EnergyConfig> = {
    0:  { tempoAdjust: -20, roomAmount: 0.5,  densityMod: '.slow(4)',    description: 'minimal/ambient' },
    1:  { tempoAdjust: -15, roomAmount: 0.4,  densityMod: '.slow(3)',    description: 'very sparse' },
    2:  { tempoAdjust: -10, roomAmount: 0.3,  densityMod: '.slow(2)',    description: 'sparse' },
    3:  { tempoAdjust: -5,  roomAmount: 0.2,  densityMod: '.slow(1.5)',  description: 'light' },
    4:  { tempoAdjust: 0,   roomAmount: 0.15, densityMod: '',            description: 'relaxed' },
    5:  { tempoAdjust: 0,   roomAmount: 0.1,  densityMod: '',            description: 'normal' },
    6:  { tempoAdjust: 5,   roomAmount: 0.08, densityMod: '',            description: 'moderate' },
    7:  { tempoAdjust: 10,  roomAmount: 0.05, densityMod: '.fast(1.25)', description: 'driving' },
    8:  { tempoAdjust: 15,  roomAmount: 0.03, densityMod: '.fast(1.5)',  description: 'intense' },
    9:  { tempoAdjust: 18,  roomAmount: 0.02, densityMod: '.fast(1.75)', description: 'very intense' },
    10: { tempoAdjust: 20,  roomAmount: 0.01, densityMod: '.fast(2)',    description: 'maximum' },
  };

  /** Get available mood names */
  static getMoods(): string[] { return Object.keys(Transforms.MOODS); }

  /** Apply mood transformation to a pattern string.
   *  Returns a new pattern string with mood modifiers appended.
   *  intensity: 0-1 (how strongly to apply the mood)
   */
  static shiftMood(pattern: string, targetMood: string, intensity: number = 0.5): { code: string; description: string } {
    const mood = Transforms.MOODS[targetMood.toLowerCase()];
    if (!mood) throw new Error(`Unknown mood: ${targetMood}. Available: ${Transforms.getMoods().join(', ')}`);

    // Build modifier chain based on mood profile, scaled by intensity
    const mods: string[] = [];

    if (mood.cutoffMod !== 0) {
      const cutoff = Math.round(2000 + mood.cutoffMod * intensity);
      mods.push(`.lpf(${cutoff})`);
    }
    if (mood.roomMod > 0) {
      mods.push(`.room(${(mood.roomMod * intensity).toFixed(2)})`);
    }
    if (mood.gainMod !== 0) {
      const gain = Math.max(0.1, 1 + mood.gainMod * intensity);
      mods.push(`.gain(${gain.toFixed(2)})`);
    }
    if (mood.delayMod && mood.delayMod > 0) {
      mods.push(`.delay(${(mood.delayMod * intensity).toFixed(2)})`);
    }
    if (mood.tempoMod !== 0) {
      const speedFactor = 1 + mood.tempoMod * intensity;
      if (speedFactor < 0.9) mods.push(`.slow(${(1/speedFactor).toFixed(2)})`);
      else if (speedFactor > 1.1) mods.push(`.fast(${speedFactor.toFixed(2)})`);
    }

    const modChain = mods.join('');

    // Wrap the pattern: if it's a stack(), wrap the whole thing; otherwise append
    let code: string;
    if (pattern.trim().startsWith('stack(')) {
      code = `(${pattern.trim()})${modChain}`;
    } else {
      code = `${pattern.trim()}${modChain}`;
    }

    return {
      code,
      description: `Applied ${targetMood} mood (intensity: ${intensity}): ${mood.description}`,
    };
  }

  /** Apply energy level (0-10) to a pattern.
   *  Returns modified pattern with speed/reverb/gain adjustments.
   */
  static setEnergy(pattern: string, level: number): { code: string; description: string } {
    const lvl = Math.max(0, Math.min(10, Math.round(level)));
    const config = Transforms.ENERGY_LEVELS[lvl];

    const mods: string[] = [];
    if (config.densityMod) mods.push(config.densityMod);
    if (config.roomAmount > 0) mods.push(`.room(${config.roomAmount})`);

    const modChain = mods.join('');
    let code: string;
    if (pattern.trim().startsWith('stack(')) {
      code = `(${pattern.trim()})${modChain}`;
    } else {
      code = `${pattern.trim()}${modChain}`;
    }

    return {
      code,
      description: `Energy level ${lvl}/10: ${config.description}`,
    };
  }

  /** Apply incremental refinement to a pattern.
   *  direction: 'faster', 'slower', 'louder', 'quieter', 'brighter', 'darker', 'more reverb', 'drier'
   */
  static refine(pattern: string, direction: string): { code: string; description: string } {
    const dirMap: Record<string, { mod: string; desc: string }> = {
      'faster':      { mod: '.fast(1.25)',        desc: 'Increased speed by 25%' },
      'slower':      { mod: '.slow(1.25)',        desc: 'Decreased speed by 25%' },
      'louder':      { mod: '.gain(1.2)',         desc: 'Increased volume by 20%' },
      'quieter':     { mod: '.gain(0.8)',         desc: 'Decreased volume by 20%' },
      'brighter':    { mod: '.lpf(6000)',         desc: 'Opened filter to 6kHz' },
      'darker':      { mod: '.lpf(1500)',         desc: 'Closed filter to 1.5kHz' },
      'more reverb': { mod: '.room(0.4).size(0.6)', desc: 'Added reverb' },
      'drier':       { mod: '.room(0.01)',        desc: 'Removed reverb' },
      'more delay':  { mod: '.delay(0.3).delaytime(0.25).delayfeedback(0.4)', desc: 'Added delay' },
      'more swing':  { mod: '.swing(0.08)',       desc: 'Added swing feel' },
      'distorted':   { mod: '.distort(0.3)',      desc: 'Added distortion' },
    };

    const d = dirMap[direction.toLowerCase()];
    if (!d) throw new Error(`Unknown direction: ${direction}. Available: ${Object.keys(dirMap).join(', ')}`);

    let code: string;
    if (pattern.trim().startsWith('stack(')) {
      code = `(${pattern.trim()})${d.mod}`;
    } else {
      code = `${pattern.trim()}${d.mod}`;
    }

    return { code, description: d.desc };
  }

  /** Transpose all notes in a pattern by N semitones.
   *  This appends .note(N) to shift pitch.
   */
  static transpose(pattern: string, semitones: number): string {
    if (semitones === 0) return pattern;
    if (pattern.trim().startsWith('stack(')) {
      return `(${pattern.trim()}).note(${semitones})`;
    }
    return `${pattern.trim()}.note(${semitones})`;
  }

  /** Reverse a pattern */
  static reverse(pattern: string): string {
    if (pattern.trim().startsWith('stack(')) {
      return `(${pattern.trim()}).rev()`;
    }
    return `${pattern.trim()}.rev()`;
  }

  /** Time stretch a pattern */
  static stretch(pattern: string, factor: number): string {
    if (factor === 1) return pattern;
    const mod = factor > 1 ? `.slow(${factor})` : `.fast(${(1/factor).toFixed(2)})`;
    if (pattern.trim().startsWith('stack(')) {
      return `(${pattern.trim()})${mod}`;
    }
    return `${pattern.trim()}${mod}`;
  }

  /** Add humanization (subtle timing variation) */
  static humanize(pattern: string, amount: number = 0.01): string {
    const mod = `.nudge(rand.range(-${amount}, ${amount}))`;
    if (pattern.trim().startsWith('stack(')) {
      return `(${pattern.trim()})${mod}`;
    }
    return `${pattern.trim()}${mod}`;
  }

  /** Add an effect by name */
  static addEffect(pattern: string, effect: string, params?: string): string {
    const mod = params ? `.${effect}(${params})` : `.${effect}()`;
    if (pattern.trim().startsWith('stack(')) {
      return `(${pattern.trim()})${mod}`;
    }
    return `${pattern.trim()}${mod}`;
  }
}
