import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { findProjectRoot } from './project-root.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = findProjectRoot(__dirname);
const syncScript = path.join(__dirname, 'sync.mjs');

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

try {
  if ((await readStdin()).length) {
    /* hook input opcional */
  }
} catch {
  /* ignore */
}

const child = spawn(process.execPath, [syncScript, '--quiet'], {
  cwd: root,
  detached: true,
  stdio: 'ignore',
  windowsHide: true,
});
child.unref();

process.stdout.write('{}');
process.exit(0);
