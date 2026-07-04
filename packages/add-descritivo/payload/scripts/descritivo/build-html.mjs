/**
 * Gera descritivo-tecnico-comercial.html a partir de descritivo.content.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { findProjectRoot, getPaths } from './project-root.mjs';
import { resolveTheme, themeToCss } from './themes.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatDateBR(date = new Date()) {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateShort(date = new Date()) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = String(date.getFullYear()).slice(-2);
  return `${d}${m}${y}`;
}

function benefitList(items) {
  return `<ul class="benefit-list">\n${items
    .map(
      (b) =>
        `      <li><strong>${esc(b.titulo)}:</strong> ${b.texto}</li>`,
    )
    .join('\n')}\n    </ul>`;
}

function tableRows(rows, cols) {
  const head = cols.map((c) => `<th>${esc(c)}</th>`).join('');
  const body = rows
    .map(
      (r) =>
        `<tr>${r.map((cell) => `<td>${cell}</td>`).join('')}</tr>`,
    )
    .join('\n        ');
  return `<table>\n      <thead><tr>${head}</tr></thead>\n      <tbody>\n        ${body}\n      </tbody>\n    </table>`;
}

export function buildHtml(content, generatedAt = new Date(), paths = getPaths(findProjectRoot(__dirname))) {
  const { meta, problema, solucao, perfis, jornada, diferenciais, compliance, integracoes, plataforma, modeloComercial } = content;
  const version = meta.version.startsWith('v') ? meta.version : `v${meta.version}`;
  const dateBR = formatDateBR(generatedAt);
  const dateShort = formatDateShort(generatedAt);
  const dateFile = generatedAt.toLocaleDateString('pt-BR');
  const theme = resolveTheme(paths.config);
  const bodyClass = theme.mode === 'dark' ? 'theme-dark' : 'theme-light';

  let logoBlock = `<div class="cover-logo"><span class="cover-logo-text">${esc(meta.product)}</span></div>`;
  if (paths.config.logoPath) {
    const logoAbs = path.join(paths.root, paths.config.logoPath);
    if (fs.existsSync(logoAbs)) {
      const rel = path.relative(paths.outputDir, logoAbs).replace(/\\/g, '/');
      logoBlock = `<div class="cover-logo"><img src="${rel}" alt="${esc(meta.product)}" /></div>`;
    }
  }

  const perfisSections = perfis
    .map(
      (p) => `
  <div class="section">
    <div class="section-header"><div class="section-num">2</div><h2>${esc(p.title)}</h2></div>
    ${benefitList(p.beneficios)}
  </div>`,
    )
    .join('\n');

  const flowHtml = jornada.flowSteps
    .map(
      (step, i) =>
        `${i > 0 ? '      <span class="flow-arrow">→</span>\n      ' : ''}<span class="flow-step">${esc(step)}</span>`,
    )
    .join('\n      ');

  const stepsHtml = jornada.steps
    .map((s) => `      <li><strong>${esc(s.titulo)}.</strong> ${s.texto}</li>`)
    .join('\n');

  const diferenciaisRows = diferenciais.map((d) => [esc(d.nome), esc(d.beneficio)]);
  const integracoesRows = integracoes.map((i) => [esc(i.ecossistema), esc(i.beneficio)]);

  const styles = fs.readFileSync(paths.stylesPath, 'utf8');
  const themeCss = themeToCss(theme);

  return `<!DOCTYPE html>
<!-- Gerado automaticamente por npm run descritivo — edite docs/comercial/descritivo.content.json -->
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(meta.product)}: Descritivo Técnico Comercial</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Urbanist:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
${themeCss}
${styles}
  </style>
</head>
<body class="${bodyClass}">

  <section class="cover">
    <div class="cover-frame">
      <header class="cover-header">
        ${logoBlock}
      </header>
      <div class="cover-hero">
        <p class="cover-kicker">${esc(meta.badge)}</p>
        <h1>Descritivo Técnico <span>Comercial</span></h1>
        <div class="cover-divider" aria-hidden="true"></div>
        <p class="cover-product">${esc(meta.product)}</p>
        <p class="cover-subtitle">${esc(meta.tagline)}</p>
      </div>
      <footer class="cover-footer">
        <span>${esc(meta.site)}</span>
        <span class="cover-footer-meta">${version} · ${dateBR}</span>
      </footer>
    </div>
  </section>

  <section class="toc-page">
    <h2>Sumário</h2>
    <p class="toc-intro">Estrutura do documento — seis blocos com a proposta de valor, jornada operacional e modelo de contratação da plataforma.</p>
    <ol class="toc-list">
      <li class="toc-item">
        <a href="#secao-1" class="toc-link">
          <span class="toc-num">1</span>
          <div class="toc-text"><strong>O Problema e a Solução</strong><span>Contexto das compras por dispensa, dores dos órgãos e fornecedores, e como a plataforma unifica o fluxo.</span></div>
        </a>
      </li>
      <li class="toc-item">
        <a href="#secao-2" class="toc-link">
          <span class="toc-num">2</span>
          <div class="toc-text"><strong>Proposta de Valor por Perfil</strong><span>Benefícios práticos para gestor, comprador, fornecedor e operador da plataforma.</span></div>
        </a>
      </li>
      <li class="toc-item">
        <a href="#secao-3" class="toc-link">
          <span class="toc-num">3</span>
          <div class="toc-text"><strong>Jornada do Cliente</strong><span>Do cadastro à entrega: catálogo, carrinho inteligente, empenho, rastreio e auditoria.</span></div>
        </a>
      </li>
      <li class="toc-item">
        <a href="#secao-4" class="toc-link">
          <span class="toc-num">4</span>
          <div class="toc-text"><strong>Diferenciais e Automações</strong><span>Controles automáticos de conformidade com a Lei 14.133 e trilha para prestação de contas.</span></div>
        </a>
      </li>
      <li class="toc-item">
        <a href="#secao-5" class="toc-link">
          <span class="toc-num">5</span>
          <div class="toc-text"><strong>Integrações e Ecossistema</strong><span>PNCP, Compras.gov.br, validações governamentais e conexão com sistemas do fornecedor.</span></div>
        </a>
      </li>
      <li class="toc-item">
        <a href="#secao-6" class="toc-link">
          <span class="toc-num">6</span>
          <div class="toc-text"><strong>Modelo de Contratação</strong><span>Licenciamento gratuito para órgãos públicos e modelo de receita sobre transações de fornecedores.</span></div>
        </a>
      </li>
    </ol>
  </section>

  <div class="page-inner content-start">
  <div class="section" id="secao-1">
    <div class="section-header"><div class="section-num">1</div><h2>O Problema e a Solução</h2></div>
    <h3>A dor atual</h3>
    <p class="lead">${problema.lead}</p>
    ${problema.paragraphs.map((p) => `<p>${p}</p>`).join('\n    ')}
    ${tableRows(
      problema.indicadores.map((i) => [esc(i.label), esc(i.value)]),
      ['Indicador', 'Estimativa'],
    )}
    <h3>Como a ${esc(meta.product)} resolve</h3>
    <p class="lead">${solucao.lead}</p>
    <p>${solucao.paragraph}</p>
    <div class="pillars">
      ${solucao.pillars
        .map(
          (p) => `<div class="pillar"><h4>${esc(p.title)}</h4><p>${esc(p.text)}</p></div>`,
        )
        .join('\n      ')}
    </div>
  </div>

  <section class="chapter" id="secao-2">
  <div class="part-banner">
    <div class="part-label">Proposta de Valor</div>
    <h2>Benefícios por perfil de usuário</h2>
    <p>O que cada ator ganha na prática — sem complicação</p>
  </div>

${perfisSections}
  </section>

  <section class="chapter" id="secao-3">
  <div class="part-banner">
    <div class="part-label">Jornada do Cliente</div>
    <h2>Como funciona na prática</h2>
    <p>As etapas lógicas do negócio — do catálogo à entrega</p>
  </div>

  <div class="section">
    <div class="section-header"><div class="section-num">3</div><h2>Fluxo principal</h2></div>
    <div class="flow-wrap">
      <div class="flow">
      ${flowHtml}
      </div>
    </div>
    <ol class="steps">
${stepsHtml}
    </ol>
  </div>

  <div class="section">
    <div class="section-header"><div class="section-num">3</div><h2>Como os atores se conectam</h2></div>
    <p>A operação da ${esc(meta.product)} conecta os principais atores do processo. Abaixo, o fluxo de responsabilidades entre eles.</p>
    <div class="architecture">${jornada.diagrama}</div>
    <div class="two-col-section">
      <div>
        <h3>Primeiro acesso</h3>
        <p>${jornada.primeiroAcesso}</p>
      </div>
      <div>
        <div class="highlight-box"><strong>Segurança do acesso:</strong> ${jornada.segurancaAcesso}</div>
      </div>
    </div>
  </div>
  </section>

  <section class="chapter" id="secao-4">
  <div class="part-banner">
    <div class="part-label">Diferenciais</div>
    <h2>Automações e conformidade legal</h2>
    <p>Tecnologia a serviço do negócio — traduzida em resultados</p>
  </div>

  <div class="section">
    <div class="section-header"><div class="section-num">4</div><h2>Controles automáticos</h2></div>
    ${tableRows(diferenciaisRows, ['Diferencial', 'Benefício para o cliente'])}
    <h3>Conformidade regulatória</h3>
    <ul class="benefit-list">${compliance.map((c) => `\n      <li>${c}</li>`).join('')}\n    </ul>
  </div>
  </section>

  <section class="chapter" id="secao-5">
  <div class="part-banner">
    <div class="part-label">Ecossistema</div>
    <h2>Integrações e capacidade de conexão</h2>
    <p>Conexões estáveis com o ecossistema de compras públicas</p>
  </div>

  <div class="section">
    <div class="section-header"><div class="section-num">5</div><h2>Sistemas externos conectados</h2></div>
    ${integracoesRows.length ? tableRows(integracoesRows, ['Ecossistema', 'O que isso significa para você']) : '<p class="lead">Integrações detectadas automaticamente a partir do código do projeto.</p>'}
    <div class="highlight-box"><strong>Plataforma web em nuvem:</strong> ${plataforma}</div>
  </div>
  </section>

  <section class="chapter" id="secao-6">
  <div class="part-banner">
    <div class="part-label">Contratação</div>
    <h2>Modelo de Contratação</h2>
    <p>Como órgãos e fornecedores aderem à plataforma</p>
  </div>

  <div class="section">
    <div class="section-header"><div class="section-num">6</div><h2>Condições comerciais</h2></div>
    <ul class="benefit-list">
      ${modeloComercial.map((m) => `<li><strong>${esc(m.titulo)}</strong> ${m.texto}</li>`).join('\n      ')}
    </ul>
    <div class="doc-footer">
      <strong>${esc(meta.product)}</strong> · ${esc(meta.site)} · Documento gerado em ${dateFile} · ${version}<br />
      © ${generatedAt.getFullYear()} ${esc(meta.product)}
    </div>
  </div>
  </section>
  </div>

</body>
</html>
`;
}

export function writeHtml(content, generatedAt = new Date(), root = findProjectRoot(__dirname)) {
  const paths = getPaths(root);
  const html = buildHtml(content, generatedAt, paths);
  fs.writeFileSync(paths.htmlPath, html, 'utf8');
  return paths.htmlPath;
}
