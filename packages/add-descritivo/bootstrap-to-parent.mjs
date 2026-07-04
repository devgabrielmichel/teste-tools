#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const kitDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(kitDir, '..');
const quiet = process.argv.includes('--quiet');

function log(...msg) {
  if (!quiet) console.log(...msg);
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

const rootAgents = path.join(projectRoot, 'AGENTS.md');

// AGENTS.md do kit fica em descritivo-comercial-kit/AGENTS.md — não duplicar na raiz.
if (!fs.existsSync(rootAgents)) {
  fs.writeFileSync(
    rootAgents,
    `# Orientações para Agentes\n\nVeja \`descritivo-comercial-kit/AGENTS.md\` para o descritivo comercial.\n`,
    'utf8',
  );
}

copyDir(path.join(kitDir, 'seed', '.cursor'), path.join(projectRoot, '.cursor'));
log('Bootstrap OK');

export function bootstrapToParent() {
  return { projectRoot, kitDir };
}
