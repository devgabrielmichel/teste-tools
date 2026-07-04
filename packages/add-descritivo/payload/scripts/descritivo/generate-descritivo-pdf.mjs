import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { findProjectRoot, getPaths } from './project-root.mjs';
import { resolveTheme } from './themes.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = findProjectRoot(__dirname);
const paths = getPaths(root);

if (!fs.existsSync(paths.htmlPath)) {
  console.error('HTML não encontrado:', paths.htmlPath);
  process.exit(1);
}

const content = JSON.parse(fs.readFileSync(paths.contentPath, 'utf8'));
const theme = resolveTheme(paths.config);
const footerTitle = `${content.meta.product}: ${paths.config.footerTitle}`;
const footerColor = theme.mode === 'dark' ? theme.muted : '#64748b';

const htmlUrl = `file:///${paths.htmlPath.replace(/\\/g, '/')}`;
const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto(htmlUrl, { waitUntil: 'networkidle' });
await page.emulateMedia({ media: 'print' });

await page.pdf({
  path: paths.pdfPath,
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: '10mm', bottom: '14mm', left: '0', right: '0' },
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate: `
    <div style="width:100%;font-family:Urbanist,Inter,system-ui,sans-serif;font-size:8px;color:${footerColor};padding:0 14mm;display:flex;justify-content:space-between;">
      <span>${footerTitle.replace(/</g, '')}</span>
      <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
    </div>
  `,
});

await browser.close();
console.log('PDF gerado:', paths.pdfPath);
