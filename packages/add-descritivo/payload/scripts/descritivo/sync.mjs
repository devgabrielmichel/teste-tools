import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { extractFacts } from './extract-facts.mjs';
import { buildHtml } from './build-html.mjs';
import { findProjectRoot, getPaths } from './project-root.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = new Set(process.argv.slice(2));
const force = args.has('--force');
const quiet = args.has('--quiet');
const noPdf = args.has('--no-pdf');

function log(...msg) {
  if (!quiet) console.log(...msg);
}

function walkDir(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, files);
    else if (/\.(js|jsx|ts|tsx|mjs|json|css)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function hashFiles(files) {
  const hash = crypto.createHash('sha256');
  for (const file of [...files].sort()) {
    if (!fs.existsSync(file)) continue;
    hash.update(file.replace(/\\/g, '/'));
    hash.update(fs.readFileSync(file));
  }
  return hash.digest('hex');
}

function computeHash(paths) {
  const dirs = paths.watchDirs.length ? paths.watchDirs : paths.scanDirs;
  const files = [...dirs.flatMap((d) => walkDir(d)), paths.contentPath];
  return hashFiles(files);
}

function computeMotorHash(paths, scriptsDir) {
  const motorFiles = [
    paths.stylesPath,
    ...walkDir(scriptsDir).filter((f) => f.endsWith('.mjs')),
  ];
  return hashFiles(motorFiles);
}

function computeSourceHash(paths, scriptsDir = path.dirname(fileURLToPath(import.meta.url))) {
  const productDirs = paths.watchDirs.length ? paths.watchDirs : paths.scanDirs;
  const productHash = computeHash({ ...paths, watchDirs: productDirs, contentPath: paths.contentPath });
  const motorHash = computeMotorHash(paths, scriptsDir);
  const contentOnly = crypto.createHash('sha256');
  contentOnly.update(fs.readFileSync(paths.contentPath));
  const contentHash = contentOnly.digest('hex');
  return {
    productHash,
    motorHash,
    contentHash,
    fullHash: crypto
      .createHash('sha256')
      .update(productHash)
      .update(motorHash)
      .update(contentHash)
      .digest('hex'),
  };
}

function bumpPatchVersion(content) {
  const parts = String(content.meta.version).replace(/^v/, '').split('.').map(Number);
  while (parts.length < 3) parts.push(0);
  parts[2] += 1;
  content.meta.version = parts.join('.');
  return content;
}

function generatePdf(root, paths, quietMode) {
  const pkgPath = [path.join(root, 'package.json'), path.join(root, 'frontend', 'package.json')].find((p) =>
    fs.existsSync(p),
  );
  const npmCwd = pkgPath?.includes('frontend') ? path.join(root, 'frontend') : root;
  const pdfScript = path.join(path.dirname(fileURLToPath(import.meta.url)), 'generate-descritivo-pdf.mjs');
  const result = spawnSync(process.execPath, [pdfScript], {
    cwd: npmCwd,
    stdio: quietMode ? 'pipe' : 'inherit',
    encoding: 'utf8',
  });
  if (result.status !== 0) throw new Error(result.stderr || 'Falha ao gerar PDF');
}

export function syncDescritivo(options = {}) {
  const opts = {
    force: options.force ?? force,
    quiet: options.quiet ?? quiet,
    noPdf: options.noPdf ?? noPdf,
    root: options.root ?? findProjectRoot(__dirname),
  };

  const paths = getPaths(opts.root);
  const hashes = computeSourceHash(paths);
  const prev = fs.existsSync(paths.statePath)
    ? JSON.parse(fs.readFileSync(paths.statePath, 'utf8'))
    : null;

  if (!opts.force && prev?.fullHash === hashes.fullHash) {
    log('Descritivo comercial já está atualizado.');
    return { updated: false, reason: 'unchanged' };
  }

  const productChanged = !prev || prev.productHash !== hashes.productHash;
  const motorChanged = !prev || prev.motorHash !== hashes.motorHash;
  const contentChanged = !prev || prev.contentHash !== hashes.contentHash;
  const generatedAt =
    !prev || productChanged || contentChanged || opts.force
      ? new Date()
      : new Date(prev.updatedAt || Date.now());

  const { content } = extractFacts({ write: false, root: opts.root });

  if (productChanged && prev) {
    bumpPatchVersion(content);
    log(`Código alterado — versão v${content.meta.version}`);
  }

  const contentStr = `${JSON.stringify(content, null, 2)}\n`;
  const prevContent = fs.readFileSync(paths.contentPath, 'utf8');
  if (contentStr !== prevContent) fs.writeFileSync(paths.contentPath, contentStr, 'utf8');

  const html = buildHtml(content, generatedAt, paths);
  const prevHtml = fs.existsSync(paths.htmlPath) ? fs.readFileSync(paths.htmlPath, 'utf8') : '';
  if (html !== prevHtml) {
    fs.writeFileSync(paths.htmlPath, html, 'utf8');
    log('HTML atualizado:', paths.htmlPath);
  }

  if (!opts.noPdf && (html !== prevHtml || productChanged || motorChanged || contentStr !== prevContent || opts.force)) {
    generatePdf(opts.root, paths, opts.quiet);
    log('PDF atualizado:', paths.pdfPath);
  }

  fs.writeFileSync(
    paths.statePath,
    `${JSON.stringify({ ...computeSourceHash(paths), updatedAt: generatedAt.toISOString() }, null, 2)}\n`,
    'utf8',
  );

  return { updated: true, version: content.meta.version };
}

const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  try {
    syncDescritivo();
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}
