/**
 * Scans public/samples/ for subfolders and .wav files,
 * then writes public/samples/index.json manifest.
 * Run automatically on server startup.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLES_DIR = path.resolve(__dirname, '..', 'public', 'samples');
const INDEX_PATH = path.join(SAMPLES_DIR, 'index.json');

export function buildSampleIndex(): void {
  if (!fs.existsSync(SAMPLES_DIR)) {
    console.warn('[Samples] No public/samples/ directory found — skipping index build');
    return;
  }

  const entries = fs.readdirSync(SAMPLES_DIR, { withFileTypes: true });
  const sampleMap: Record<string, string[]> = {};
  let totalFiles = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const folderName = entry.name;
    const folderPath = path.join(SAMPLES_DIR, folderName);
    const files = fs.readdirSync(folderPath)
      .filter(f => /\.(wav|mp3|ogg|flac|aif|aiff)$/i.test(f))
      .sort((a, b) => {
        // Sort numerically by the N in FolderName_N.ext
        const numA = parseInt(a.match(/_(\d+)\./)?.[1] || '0', 10);
        const numB = parseInt(b.match(/_(\d+)\./)?.[1] || '0', 10);
        return numA - numB;
      })
      .map(f => `${folderName}/${f}`);

    if (files.length > 0) {
      sampleMap[folderName] = files;
      totalFiles += files.length;
    }
  }

  const json = JSON.stringify(sampleMap, null, 2);
  fs.writeFileSync(INDEX_PATH, json, 'utf-8');

  const groups = Object.keys(sampleMap);
  console.log(`[Samples] Built index.json: ${groups.length} groups, ${totalFiles} files (${groups.join(', ')})`);
}
