/**
 * Scans templates/ folder for .js template files and the README,
 * then writes server/knowledge/12-templates.md with their content.
 * Run automatically on server startup so new templates are picked up.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, '..', 'templates');
const OUTPUT_PATH = path.resolve(__dirname, 'knowledge', '12-templates.md');

export function buildTemplateKnowledge(): void {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.warn('[Templates] No templates/ directory found — skipping knowledge build');
    return;
  }

  const jsFiles = fs.readdirSync(TEMPLATES_DIR)
    .filter(f => f.endsWith('.js'))
    .sort();

  if (jsFiles.length === 0) {
    console.warn('[Templates] No .js template files found in templates/');
    return;
  }

  // Build the knowledge file
  let md = `# Genre Templates\n\n`;
  md += `The following genre templates are available. Each is a complete, ready-to-play Strudel pattern using the \`$:\` / \`_$:\` stem system. All templates share a single \`let chords = chord(...)\` variable so changing the progression revoices the entire track.\n\n`;

  // Summary table
  md += `| Template | Genre | BPM | Key |\n`;
  md += `|----------|-------|-----|-----|\n`;

  const templates: { name: string; content: string; genre: string; bpm: string; key: string }[] = [];

  for (const file of jsFiles) {
    const content = fs.readFileSync(path.join(TEMPLATES_DIR, file), 'utf-8');
    const genre = file.replace('_template.js', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    // Extract BPM from setcpm line
    const bpmMatch = content.match(/setcpm\((\d+)/);
    const bpm = bpmMatch ? bpmMatch[1] : '?';

    // Extract key from first comment line or chord definition
    const keyMatch = content.match(/Key:\s*([A-G][b#]?\s*\w+)/i);
    const key = keyMatch ? keyMatch[1].trim() : '?';

    templates.push({ name: genre, content, genre, bpm, key });
    md += `| \`${file}\` | ${genre} | ${bpm} | ${key} |\n`;
  }

  md += `\n---\n\n`;
  md += `## How Templates Work\n\n`;
  md += `- Each layer uses \`$:\` (active) or \`_$:\` (muted)\n`;
  md += `- Toggle layers live: change \`$:\` to \`_$:\` and press Ctrl+Enter\n`;
  md += `- All layers share a single \`let chords = chord(...)\` variable — change it to revoice everything\n`;
  md += `- \`.bank("RolandTR909")\` etc. for drum machine sounds\n`;
  md += `- Use \`.mask()\` for automated arrangement\n\n`;

  md += `## Template Structure\n\n`;
  md += `Every template follows this layout:\n`;
  md += `\`\`\`\n`;
  md += `setcpm(BPM/4)\n`;
  md += `let chords = chord("<...>/2")\n\n`;
  md += `DRUMS:    $: kick, $: snare/clap, $: hats, _$: fills/variations\n`;
  md += `BASS:     $: main bass, _$: alt bass\n`;
  md += `CHORDS:   _$: pad, _$: stabs, _$: strings\n`;
  md += `MELODY:   _$: lead, _$: secondary melody\n`;
  md += `\`\`\`\n\n`;

  // Full template code
  for (const t of templates) {
    md += `---\n\n`;
    md += `## ${t.name} Template (${t.bpm} BPM, ${t.key})\n\n`;
    md += `\`\`\`js\n${t.content}\`\`\`\n\n`;
  }

  fs.writeFileSync(OUTPUT_PATH, md, 'utf-8');
  console.log(`[Templates] Built 12-templates.md: ${templates.length} templates (${templates.map(t => t.name).join(', ')})`);
}
