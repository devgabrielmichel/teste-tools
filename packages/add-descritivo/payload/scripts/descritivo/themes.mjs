/** Presets visuais — https://www.conceitto.ind.br/ */
export const THEME_PRESETS = {
  default: {
    mode: 'light',
    primary: '#1152d4',
    primaryLight: '#3b82f6',
    bg: '#ffffff',
    surface: '#f6f6f8',
    text: '#101622',
    textBody: '#334155',
    muted: '#64748b',
    border: '#e2e8f0',
    bannerBg: '#101622',
    bannerAccent: '#93c5fd',
    bannerText: '#ffffff',
    bannerTextMuted: '#cbd5e1',
    grid: false,
  },
  conceitto: {
    mode: 'light',
    primary: '#39B54A',
    primaryLight: '#2d9a3d',
    bg: '#ffffff',
    surface: '#f4faf5',
    text: '#101622',
    textBody: '#334155',
    muted: '#64748b',
    border: '#d4e8d7',
    bannerBg: '#0f1f12',
    bannerAccent: '#4CD964',
    bannerText: '#ffffff',
    bannerTextMuted: '#c8dcc8',
    grid: false,
  },
  'conceitto-dark': {
    mode: 'dark',
    primary: '#39B54A',
    primaryLight: '#4CD964',
    bg: '#000000',
    surface: '#0a120a',
    text: '#ffffff',
    textBody: '#c8c8c8',
    muted: '#a0a0a0',
    border: '#1a3d1a',
    bannerBg: '#050805',
    bannerAccent: '#39B54A',
    bannerText: '#ffffff',
    bannerTextMuted: '#b8c8b8',
    grid: true,
  },
};

export function resolveTheme(config = {}) {
  const preset = THEME_PRESETS[config.theme?.preset] || THEME_PRESETS.default;
  const custom = config.theme || {};
  return { ...preset, ...custom, preset: config.theme?.preset || 'default' };
}

export function themeToCss(theme) {
  return `
    :root {
      --primary: ${theme.primary};
      --primary-light: ${theme.primaryLight};
      --bg: ${theme.bg};
      --surface: ${theme.surface};
      --text: ${theme.text};
      --text-body: ${theme.textBody};
      --muted: ${theme.muted};
      --border: ${theme.border};
      --banner-bg: ${theme.bannerBg};
      --banner-accent: ${theme.bannerAccent};
      --banner-text: ${theme.bannerText};
      --banner-text-muted: ${theme.bannerTextMuted};
    }
    body.theme-dark {
      background: var(--bg);
      color: var(--text-body);
    }
    body.theme-light {
      background: #fff;
      color: var(--text-body);
    }
    ${theme.grid ? `
    body.theme-dark .cover::before,
    body.theme-dark .page-inner::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(57, 181, 74, 0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(57, 181, 74, 0.06) 1px, transparent 1px);
      background-size: 24px 24px;
      pointer-events: none;
      z-index: 0;
    }
    body.theme-dark .cover > *, body.theme-dark .page-inner > * { position: relative; z-index: 1; }
    ` : ''}
  `;
}
