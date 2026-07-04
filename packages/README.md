# Pacotes Conceitto

Cada pasta é um **pacote** instalável via script em `scripts/`. Componha com `init.sh` (projeto novo) ou `install-*.sh` (projeto existente).

| Pacote | Script | Função |
|--------|--------|--------|
| `shared/` (raiz do repo) | `install-shared.sh` | Rules core + `AGENTS.md` |
| `add-descritivo` | `install-descritivo.sh` | PDF comercial + hooks Cursor |
| `default-initial-web` | `install-web.sh` | Scaffold React + Node |
| `default-initial-app` | `init.sh --profile app` | Flutter (futuro) |
| `workflow-github-instructions` | `install-workflow.sh` | `.github/` + rule de PR |
| `generate-documentations` | `install-docs.sh` | Templates `/docs` + skill |

## Variantes web

Flags no `init.sh` ou `install-web.sh`:

- `--vite` — `vite.config.js` no frontend (base já usa Vite)
- `--prisma` — `backend/prisma/schema.prisma` + deps Prisma

## Projeto novo (tudo de uma vez)

```bash
curl -fsSL .../init.sh | bash -s -- \
  --profile web \
  --vite --prisma \
  --with-descritivo \
  --with-workflow \
  --with-docs
```

## Projeto existente (só o que faltar)

```bash
curl -fsSL .../install-descritivo.sh | bash
curl -fsSL .../install-workflow.sh | bash
```
