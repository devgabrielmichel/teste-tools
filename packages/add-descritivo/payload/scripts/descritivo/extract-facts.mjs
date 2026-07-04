import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INTEGRATION_CATALOG } from './integration-catalog.mjs';
import { findProjectRoot, getPaths } from './project-root.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function walkDir(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, files);
    else if (/\.(js|jsx|ts|tsx|mjs)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function readCodebaseText(scanDirs) {
  const files = scanDirs.flatMap((d) => walkDir(d));
  return files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
}

function detectIntegrations(codeText) {
  return INTEGRATION_CATALOG.filter((item) =>
    item.patterns.some((re) => re.test(codeText)),
  );
}

function mergeIntegrations(content, detected) {
  const manual = (content.integracoes || []).filter((i) => !i.auto);
  const detectedIds = new Set(detected.map((d) => d.id));
  const autoFromCatalog = detected.map((d) => ({
    id: d.id,
    ecossistema: d.ecossistema,
    beneficio: d.beneficio,
    auto: true,
  }));
  const manualKeep = manual.filter((m) => !detectedIds.has(m.id));
  content.integracoes = [...autoFromCatalog, ...manualKeep];
  return content;
}

export function extractFacts({ write = true, root = findProjectRoot(__dirname) } = {}) {
  const paths = getPaths(root);
  const codeText = readCodebaseText(paths.scanDirs);
  const detected = detectIntegrations(codeText);
  const content = JSON.parse(fs.readFileSync(paths.contentPath, 'utf8'));
  mergeIntegrations(content, detected);

  if (write) {
    fs.writeFileSync(paths.contentPath, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
  }

  return { content, detectedIds: detected.map((d) => d.id), paths };
}
