# teste-tools — Kit Descritivo Comercial

Ferramentas da Conceitto para gerar **descritivo comercial em PDF** com IA no Cursor.

## Projeto existente (Mapa, VrBrokers, etc.)

Na raiz do projeto:

```bash
curl -fsSL https://raw.githubusercontent.com/devgabrielmichel/teste-tools/main/scripts/install-descritivo.sh | bash
```

Com flags do instalador:

```bash
curl -fsSL https://raw.githubusercontent.com/devgabrielmichel/teste-tools/main/scripts/install-descritivo.sh | bash -s -- --force
```

Depois:

```bash
npm install
npx playwright install chromium   # uma vez por máquina
```

No Cursor: *"Gere o descritivo comercial em PDF analisando este projeto"*.

## Estrutura deste repositório

| Caminho | Função |
|---------|--------|
| `packages/add-descritivo/` | Motor do kit (scripts, templates, AGENTS.md) |
| `scripts/install-descritivo.sh` | Baixa o kit e instala no projeto alvo |

## Atualizar kit em projeto já instalado

```bash
curl -fsSL https://raw.githubusercontent.com/devgabrielmichel/teste-tools/main/scripts/install-descritivo.sh | bash -s -- --force
```

O `descritivo.content.json` do projeto **não é apagado** (use `--reset-content` só para recomeçar do template).

## Versão específica

```bash
DESCRITIVO_REF=v1.0.0 curl -fsSL .../install-descritivo.sh | bash
```

## Desenvolvimento

Alterações em `packages/add-descritivo/` → commit + push → projetos rodam o script de novo com `--force` para atualizar.
