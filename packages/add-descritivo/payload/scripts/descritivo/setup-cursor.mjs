import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { findProjectRoot, getPaths } from './project-root.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = new Set(process.argv.slice(2));
const quiet = args.has('--quiet');
const force = args.has('--force');
const HOOK_MARKER = 'cursor-hook-on-stop.mjs';

function log(...msg) {
  if (!quiet) console.log(...msg);
}

function readHookCommand(hooksExamplePath) {
  if (!fs.existsSync(hooksExamplePath)) return null;
  const example = JSON.parse(fs.readFileSync(hooksExamplePath, 'utf8'));
  return example?.hooks?.stop?.[0]?.command ?? null;
}

function mergeStopHook(hooksJson, hookCommand) {
  if (!hookCommand) return false;

  const data = fs.existsSync(hooksJson)
    ? JSON.parse(fs.readFileSync(hooksJson, 'utf8'))
    : { version: 1, hooks: {} };

  data.hooks = data.hooks || {};
  data.hooks.stop = data.hooks.stop || [];

  const hasHook = data.hooks.stop.some((h) => String(h.command || '').includes(HOOK_MARKER));
  if (hasHook) return false;

  data.hooks.stop.push({ command: hookCommand });
  fs.writeFileSync(hooksJson, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return true;
}

export function setupCursor(options = {}) {
  const opts = { quiet: options.quiet ?? quiet, force: options.force ?? force };
  const root = options.root ?? findProjectRoot(__dirname);
  const paths = getPaths(root);
  const cursorDir = path.join(root, '.cursor');
  const hooksJson = path.join(cursorDir, 'hooks.json');
  const hookCommand = readHookCommand(paths.hooksExample);

  if (!hookCommand) {
    throw new Error(`Hook não encontrado: ${paths.hooksExample}`);
  }

  fs.mkdirSync(path.join(cursorDir, 'skills', 'gerar-descritivo-comercial'), { recursive: true });
  fs.mkdirSync(path.join(cursorDir, 'rules'), { recursive: true });

  const skillSrc = path.join(paths.templatesDir, 'skill.md');
  const ruleSrc = path.join(paths.templatesDir, 'descritivo-comercial.mdc');
  const skillDest = path.join(cursorDir, 'skills', 'gerar-descritivo-comercial', 'SKILL.md');
  const ruleDest = path.join(cursorDir, 'rules', 'descritivo-comercial.mdc');

  if (opts.force || !fs.existsSync(skillDest)) fs.copyFileSync(skillSrc, skillDest);
  if (opts.force || !fs.existsSync(ruleDest)) fs.copyFileSync(ruleSrc, ruleDest);

  let hooksChanged = false;
  if (opts.force || !fs.existsSync(hooksJson)) {
    fs.copyFileSync(paths.hooksExample, hooksJson);
    hooksChanged = true;
  } else {
    hooksChanged = mergeStopHook(hooksJson, hookCommand);
  }

  if (hooksChanged) log('Hook stop do descritivo configurado em .cursor/hooks.json');
  else if (!opts.quiet) log('Cursor já configurado para descritivo comercial.');

  return { created: hooksChanged, hooksOk: true };
}

const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) setupCursor();
