import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DEFAULTS = {
  watchDirs: ['frontend/src', 'backend/src', 'src'],
  outputDir: 'docs/comercial',
  logoPath: null,
  pdfFileName: 'Descritivo-Tecnico-Comercial.pdf',
  footerTitle: 'Descritivo Técnico Comercial',
  integrationScanDirs: ['frontend/src', 'backend/src', 'src'],
  theme: { preset: 'conceitto' },
};

export function findProjectRoot(startDir = path.dirname(fileURLToPath(import.meta.url))) {
  let dir = startDir;
  while (true) {
    if (fs.existsSync(path.join(dir, 'descritivo.kit.json'))) return dir;
    if (fs.existsSync(path.join(dir, 'docs', 'comercial', '.descritivo-installed'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(
    'Raiz do projeto não encontrada. Crie descritivo.kit.json na raiz ou rode install.mjs.',
  );
}

export function loadKitConfig(root) {
  const configPath = path.join(root, 'descritivo.kit.json');
  if (!fs.existsSync(configPath)) return { ...DEFAULTS };
  return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(configPath, 'utf8')) };
}

export function getPaths(root, config = loadKitConfig(root)) {
  const outputDir = path.join(root, config.outputDir);
  return {
    root,
    config,
    outputDir,
    contentPath: path.join(outputDir, 'descritivo.content.json'),
    stylesPath: path.join(outputDir, 'descritivo.styles.css'),
    htmlPath: path.join(outputDir, 'descritivo-tecnico-comercial.html'),
    pdfPath: path.join(outputDir, config.pdfFileName),
    statePath: path.join(outputDir, '.descritivo-state.json'),
    templatesDir: path.join(outputDir, 'templates'),
    hooksExample: path.join(outputDir, 'cursor-hooks.example.json'),
    watchDirs: config.watchDirs
      .map((d) => path.join(root, d))
      .filter((d) => fs.existsSync(d)),
    scanDirs: config.integrationScanDirs
      .map((d) => path.join(root, d))
      .filter((d) => fs.existsSync(d)),
  };
}
