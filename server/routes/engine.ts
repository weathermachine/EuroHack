import { Router } from 'express';
import { MusicTheory } from '../engine/MusicTheory.js';
import { PatternGenerator } from '../engine/PatternGenerator.js';
import { Transforms } from '../engine/Transforms.js';

const router = Router();

/** POST /api/engine/generate-drums */
router.post('/engine/generate-drums', (req, res) => {
  try {
    const { style = 'techno', complexity = 0.7 } = req.body;
    const code = PatternGenerator.generateDrums(style, complexity);
    res.json({ code });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

/** POST /api/engine/generate-bassline */
router.post('/engine/generate-bassline', (req, res) => {
  try {
    const { key = 'C', style = 'techno' } = req.body;
    const code = PatternGenerator.generateBassline(key, style);
    res.json({ code });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

/** POST /api/engine/generate-melody */
router.post('/engine/generate-melody', (req, res) => {
  try {
    const { root = 'C', scale = 'minor', length = 8, octaveRange = [3, 5] } = req.body;
    const code = PatternGenerator.generateMelody(root, scale, length, octaveRange);
    res.json({ code });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

/** POST /api/engine/generate-complete */
router.post('/engine/generate-complete', (req, res) => {
  try {
    const { style = 'techno', key = 'C', bpm = 120 } = req.body;
    const code = PatternGenerator.generateComplete(style, key, bpm);
    res.json({ code });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

/** POST /api/engine/generate-variation */
router.post('/engine/generate-variation', (req, res) => {
  try {
    const { pattern, type = 'subtle' } = req.body;
    if (!pattern) return res.status(400).json({ error: 'pattern is required' });
    const code = PatternGenerator.generateVariation(pattern, type);
    res.json({ code });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

/** POST /api/engine/generate-fill */
router.post('/engine/generate-fill', (req, res) => {
  try {
    const { style = 'techno', bars = 1 } = req.body;
    const code = PatternGenerator.generateFill(style, bars);
    res.json({ code });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

/** POST /api/engine/generate-polyrhythm */
router.post('/engine/generate-polyrhythm', (req, res) => {
  try {
    const { sounds = ['Kicks', 'Snares', 'ClosedHats'], hitCounts = [5, 3, 7], steps = 16 } = req.body;
    const code = PatternGenerator.generatePolyrhythm(sounds, hitCounts, steps);
    res.json({ code });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

/** POST /api/engine/scale */
router.post('/engine/scale', (req, res) => {
  try {
    const { root = 'C', scale = 'minor', octave = 3 } = req.body;
    const notes = MusicTheory.getScaleNotes(root, scale, octave);
    const noteNames = MusicTheory.generateScale(root, scale);
    res.json({ notes, noteNames, strudelScale: `${root}:${scale}` });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

/** POST /api/engine/chord-progression */
router.post('/engine/chord-progression', (req, res) => {
  try {
    const { key = 'C', style = 'pop' } = req.body;
    const chords = MusicTheory.generateProgression(key, style);
    const strudelChords = `<${chords.join(' ')}>`;
    res.json({ chords, strudelChords });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

/** POST /api/engine/euclidean */
router.post('/engine/euclidean', (req, res) => {
  try {
    const { hits = 5, steps = 8, sound = 'Kicks' } = req.body;
    const pattern = MusicTheory.euclideanRhythm(hits, steps);
    const miniNotation = MusicTheory.euclideanString(hits, steps, sound, '~');
    const strudelCode = `s("${sound}").euclid(${hits}, ${steps})`;
    res.json({ pattern, miniNotation, strudelCode });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

/** POST /api/engine/arpeggio */
router.post('/engine/arpeggio', (req, res) => {
  try {
    const { chord = 'Cm7', direction = 'up', octave = 3 } = req.body;
    const notes = MusicTheory.generateArpeggio(chord, direction, octave);
    const code = `note("${notes.join(' ')}").s("Synth")`;
    res.json({ notes, code });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

/** POST /api/engine/transform */
router.post('/engine/transform', (req, res) => {
  try {
    const { pattern, action, ...params } = req.body;
    if (!pattern) return res.status(400).json({ error: 'pattern is required' });
    if (!action) return res.status(400).json({ error: 'action is required' });

    let result: { code: string; description?: string };

    switch (action) {
      case 'mood':
        result = Transforms.shiftMood(pattern, params.mood, params.intensity);
        break;
      case 'energy':
        result = Transforms.setEnergy(pattern, params.level);
        break;
      case 'refine':
        result = Transforms.refine(pattern, params.direction);
        break;
      case 'transpose':
        result = { code: Transforms.transpose(pattern, params.semitones || 0) };
        break;
      case 'reverse':
        result = { code: Transforms.reverse(pattern) };
        break;
      case 'stretch':
        result = { code: Transforms.stretch(pattern, params.factor || 2) };
        break;
      case 'humanize':
        result = { code: Transforms.humanize(pattern, params.amount || 0.01) };
        break;
      case 'effect':
        result = { code: Transforms.addEffect(pattern, params.effect, params.params) };
        break;
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    res.json(result);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

/** GET /api/engine/info — list available styles, scales, moods */
router.get('/engine/info', (_req, res) => {
  res.json({
    scales: MusicTheory.getScaleNames(),
    progressionStyles: MusicTheory.getProgressionStyles(),
    moods: Transforms.getMoods(),
    drumStyles: ['techno', 'house', 'dnb', 'trap', 'breakbeat', 'ambient', 'boom_bap', 'trip_hop', 'experimental'],
    bassStyles: ['techno', 'house', 'dnb', 'acid', 'dub', 'funk', 'ambient', 'trip_hop', 'boom_bap'],
    refinements: ['faster', 'slower', 'louder', 'quieter', 'brighter', 'darker', 'more reverb', 'drier', 'more delay', 'more swing', 'distorted'],
  });
});

export default router;
