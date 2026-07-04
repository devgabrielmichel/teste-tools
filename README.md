# conceittodev-tools

Repositório padrão Conceitto: **regras de projeto**, **scaffold de stack** e **ferramentas** instaláveis por um comando — sem npm pago, sem copiar ZIP.

Repo: [github.com/devgabrielmichel/teste-tools](https://github.com/devgabrielmichel/teste-tools)

---

## Projeto novo (recomendado)

```bash
mkdir meu-produto && cd meu-produto && git init
curl -fsSL https://raw.githubusercontent.com/devgabrielmichel/teste-tools/main/scripts/bootstrap-init.sh | bash -s -- \
  --profile web \
  --with-descritivo \
  --with-workflow \
  --with-docs
```

Variantes da stack web:

```bash
# ... | bash -s -- --profile web --vite --prisma --with-descritivo
```

Depois:

```bash
cd frontend && npm install
cd ../backend && npm install
npx playwright install chromium   # se usou --with-descritivo
```

---

## Projeto existente (Mapa, VrBrokers, etc.)

Instale **só o que precisar** — cada pacote é independente:

```bash
# Padrões Conceitto (rules + AGENTS.md)
curl -fsSL .../install-shared.sh | bash

# Descritivo comercial PDF
curl -fsSL .../install-descritivo.sh | bash

# Templates GitHub / PR
curl -fsSL .../install-workflow.sh | bash

# Scaffold /docs
curl -fsSL .../install-docs.sh | bash
```

Substitua `...` por:

`https://raw.githubusercontent.com/devgabrielmichel/teste-tools/main/scripts`

---

## Pacotes disponíveis

| Pacote | Uso |
|--------|-----|
| `shared/` | Rules Cursor + AGENTS.md (sempre no init) |
| `add-descritivo` | PDF comercial + IA no Cursor |
| `default-initial-web` | React + Node (+ `--vite`, `--prisma`) |
| `default-initial-app` | Flutter — em preparação |
| `workflow-github-instructions` | `.github/` + PR template |
| `generate-documentations` | Templates e skill para `/docs` |

Detalhes: [packages/README.md](packages/README.md)

---

## Estrutura do repositório

```
teste-tools/
├── shared/                 # rules/skills que TODO projeto recebe
├── packages/               # pacotes combináveis (visão Camila)
│   ├── add-descritivo/
│   ├── default-initial-web/
│   ├── default-initial-app/
│   ├── workflow-github-instructions/
│   └── generate-documentations/
└── scripts/
    ├── init.sh             # projeto novo
    ├── install-shared.sh
    ├── install-descritivo.sh
    ├── install-web.sh
    ├── install-workflow.sh
    └── install-docs.sh
```

---

## Versão fixa

```bash
CONCEITTO_REF=v1.0.0 curl -fsSL .../init.sh | bash -s -- --profile web --with-descritivo
```

---

## Cursor / Trae

- **Cursor:** `.cursor/rules`, `.cursor/skills`, hooks (descritivo)
- **Trae / outros:** `AGENTS.md` na raiz + `/docs`

---

## Desenvolvimento

Altere `packages/` ou `shared/` → commit → push. Projetos rodam de novo com `--force` nos scripts de install.
