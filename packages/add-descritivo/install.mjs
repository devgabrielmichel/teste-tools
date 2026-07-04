#!/usr/bin/env node
/**
 * Instala o kit no projeto pai.
 * Uso: node descritivo-comercial-kit/install.mjs [--quiet] [--force] [--bootstrap-only]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { bootstrapToParent } from './bootstrap-to-parent.mjs';

const kitDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(kitDir, '..');
const payloadDir = path.join(kitDir, 'payload');
const args = new Set(process.argv.slice(2));
const quiet = args.has('--quiet');
const force = args.has('--force');
const bootstrapOnly = args.has('--bootstrap-only');
const resetContent = args.has('--reset-content');

const MARKER = path.join(projectRoot, 'docs', 'comercial', '.descritivo-installed');

function log(...msg) {
  if (!quiet) console.log(...msg);
}

function copyRecursive(src, dest, { skipFiles = [] } = {}) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (skipFiles.includes(entry.name) && fs.existsSync(destPath)) continue;
    if (entry.isDirectory()) copyRecursive(srcPath, destPath, { skipFiles });
    else fs.copyFileSync(srcPath, destPath);
  }
}

function findPackageJson() {
  return [path.join(projectRoot, 'package.json'), path.join(projectRoot, 'frontend', 'package.json')].find(
    (p) => fs.existsSync(p),
  );
}

function patchPackageJson(scriptsDest) {
  const pkgPath = findPackageJson();
  const prefix = scriptsDest.includes(`${path.sep}frontend${path.sep}`)
    ? 'node scripts/descritivo'
    : 'node scripts/descritivo';
  const scripts = {
    descritivo: `${prefix}/sync.mjs`,
    'descritivo:pdf': `${prefix}/sync.mjs --force`,
    'descritivo:html': `${prefix}/sync.mjs --force --no-pdf`,
    'descritivo:setup-cursor': `${prefix}/setup-cursor.mjs`,
  };
  const kitInstallRel = path
    .relative(projectRoot, path.join(kitDir, 'install.mjs'))
    .replace(/\\/g, '/');
  const setupCmd = `node ${kitInstallRel} --quiet`;

  if (!pkgPath) {
    fs.writeFileSync(
      path.join(projectRoot, 'package.json'),
      `${JSON.stringify({ name: path.basename(projectRoot), private: true, type: 'module', scripts: { ...scripts, postinstall: setupCmd }, devDependencies: { '@playwright/test': '^1.52.0' } }, null, 2)}\n`,
      'utf8',
    );
    log('  + package.json');
    return;
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.scripts = { ...(pkg.scripts || {}), ...scripts };
  const kitInstallNeedle = 'descritivo-comercial-kit/install.mjs';
  if (!pkg.scripts.postinstall?.includes(kitInstallNeedle)) {
    const prev = pkg.scripts.postinstall;
    pkg.scripts.postinstall = prev ? `${prev} && ${setupCmd}` : setupCmd;
  }
  pkg.devDependencies = { ...(pkg.devDependencies || {}), '@playwright/test': '^1.52.0' };
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
  log('  +', path.relative(projectRoot, pkgPath));
}

function getScriptsDest() {
  const pkgPath = findPackageJson();
  return pkgPath?.includes(`${path.sep}frontend${path.sep}`)
    ? path.join(projectRoot, 'frontend', 'scripts', 'descritivo')
    : path.join(projectRoot, 'scripts', 'descritivo');
}

function scriptsMissing(dest) {
  return !fs.existsSync(path.join(dest, 'sync.mjs'));
}

function runSetupCursor(scriptsDest, opts) {
  const setupScript = path.join(scriptsDest, 'setup-cursor.mjs');
  if (!fs.existsSync(setupScript)) return;
  spawnSync(process.execPath, [path.relative(projectRoot, setupScript).replace(/\\/g, '/'), '--quiet'], {
    cwd: projectRoot,
    stdio: opts.quiet ? 'pipe' : 'inherit',
  });
}

/** Garante scripts + hook Cursor sem reinstalação completa (roda no postinstall). */
export function ensureDescritivo(options = {}) {
  const opts = { quiet: options.quiet ?? quiet, force: options.force ?? force };

  if (!fs.existsSync(path.join(kitDir, 'payload'))) {
    return { ok: false, reason: 'kit-not-found' };
  }

  const dest = getScriptsDest();

  if (scriptsMissing(dest)) {
    return installKit({ ...opts, force: true });
  }

  if (!fs.existsSync(MARKER)) {
    return installKit({ ...opts, force: true });
  }

  // Kit instalado: só revalida hook/skill/rule (mescla se faltar stop hook)
  runSetupCursor(dest, opts);
  if (!opts.quiet) log('Descritivo comercial: OK (sync automático ativo).');
  return { ok: true, ensured: true };
}

export function installKit(options = {}) {
  const opts = { quiet: options.quiet ?? quiet, force: options.force ?? force, resetContent: options.resetContent ?? resetContent };

  bootstrapToParent();

  if (bootstrapOnly && fs.existsSync(MARKER) && !opts.force) {
    return { installed: false, bootstrapped: true };
  }

  if (!opts.force && fs.existsSync(MARKER)) {
    return ensureDescritivo(opts);
  }

  if (!opts.quiet) log('Instalando descritivo comercial...');

  const scriptsDest = getScriptsDest();

  copyRecursive(path.join(payloadDir, 'docs', 'comercial'), path.join(projectRoot, 'docs', 'comercial'), {
    skipFiles: opts.resetContent ? [] : ['descritivo.content.json'],
  });
  copyRecursive(path.join(payloadDir, 'scripts', 'descritivo'), scriptsDest);

  const hooksRel = scriptsDest.includes(`${path.sep}frontend${path.sep}`)
    ? 'node frontend/scripts/descritivo/cursor-hook-on-stop.mjs'
    : 'node scripts/descritivo/cursor-hook-on-stop.mjs';

  fs.writeFileSync(
    path.join(projectRoot, 'docs', 'comercial', 'cursor-hooks.example.json'),
    `${JSON.stringify({ version: 1, hooks: { stop: [{ command: hooksRel }] } }, null, 2)}\n`,
    'utf8',
  );

  const kitConfig = path.join(projectRoot, 'descritivo.kit.json');
  if (!fs.existsSync(kitConfig)) {
    fs.copyFileSync(path.join(kitDir, 'descritivo.kit.json.example'), kitConfig);
    log('  + descritivo.kit.json');
  }

  patchPackageJson(scriptsDest);
  fs.writeFileSync(MARKER, `${new Date().toISOString()}\n`, 'utf8');

  runSetupCursor(scriptsDest, opts);

  if (!opts.quiet) log('Instalação concluída.');
  return { installed: true };
}

const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  try {
    const mode = args.has('--ensure-only') ? 'ensure' : 'install';
    if (mode === 'ensure') ensureDescritivo();
    else installKit();
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}
