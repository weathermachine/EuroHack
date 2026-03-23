import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load all .md files from the knowledge directory, sorted by filename
const knowledgeDir = __dirname;
const files = fs.readdirSync(knowledgeDir)
  .filter(f => f.endsWith('.md'))
  .sort();

export const KNOWLEDGE_BASE = files
  .map(f => {
    const content = fs.readFileSync(path.join(knowledgeDir, f), 'utf-8');
    return content;
  })
  .join('\n\n---\n\n');

export const KNOWLEDGE_FILES = files;

console.log(`[Knowledge] Loaded ${files.length} knowledge files (${Math.round(KNOWLEDGE_BASE.length / 1024)}KB)`);
