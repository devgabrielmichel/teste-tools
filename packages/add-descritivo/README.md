# Kit Descritivo Comercial

## Para o dev

1. Copie a pasta **`descritivo-comercial-kit`** para a raiz do projeto.
2. Abra no Cursor e peça: *"Gere o descritivo comercial em PDF analisando este projeto"*.

A IA lê `descritivo-comercial-kit/AGENTS.md`, instala tudo e gera o documento.

Para o PDF funcionar (uma vez na máquina): `npm install` e `npx playwright install chromium` no diretório onde está o `package.json` do projeto.

## Para você distribuir

Envie a pasta `descritivo-comercial-kit/` ou um ZIP dela.

```powershell
Compress-Archive -Path descritivo-comercial-kit -DestinationPath descritivo-comercial-kit.zip
```

## O que tem dentro

| Arquivo | Função |
|---------|--------|
| `AGENTS.md` | Instruções para a IA (fica dentro do kit) |
| `install.mjs` | Instala scripts, docs, hooks e config no projeto |
| `bootstrap-to-parent.mjs` | Promove AGENTS + `.cursor` para a raiz |
| `payload/` | Templates e scripts instalados no projeto |
| `descritivo.kit.json.example` | Config de pastas, logo e nome do PDF |

## Personalizar

Após instalação, edite na raiz do projeto:

- `descritivo.kit.json` — pastas monitoradas, logo, nome do PDF, **tema visual**
- `docs/comercial/descritivo.content.json` — textos comerciais **deste produto**

### Tema Conceitto (padrão)

```json
"theme": { "preset": "conceitto" }
```

Verde da marca em fundo branco — ideal para PDF comercial. Fundo preto (estilo site): `"preset": "conceitto-dark"`. Tema azul: `"preset": "default"`.

## O que vai para o Git

| Versionar | Não versionar (gerado no `npm install` / `descritivo:pdf`) |
|-----------|-----------------------------------------------------------|
| `descritivo-comercial-kit/` (motor portátil) | `frontend/scripts/descritivo/` |
| `docs/comercial/descritivo.content.json` | `docs/comercial/*.pdf` |
| `descritivo.kit.json` | `docs/comercial/descritivo-tecnico-comercial.html` |
| | `docs/comercial/descritivo.styles.css`, `templates/` |

Em projeto novo: copie só a pasta **`descritivo-comercial-kit`**. O `install.mjs` cria o resto localmente.

### Atualizar kit em projeto existente

```powershell
# substitua a pasta descritivo-comercial-kit pelo ZIP novo, depois:
node descritivo-comercial-kit/install.mjs --force
cd frontend && npm run descritivo:pdf
```

O `descritivo.content.json` **não é apagado** (use `--reset-content` só se quiser recomeçar do template).

## Atualização automática

| Etapa | Comportamento |
|-------|----------------|
| `npm install` | Instala/valida kit + mescla hook `stop` no `.cursor/` |
| Fim de sessão do Agent | `sync --quiet` em background |
| Hash inalterado | Não regera PDF (rápido) |
| Código ou JSON alterado | Regenera HTML + PDF |

**Pré-requisito único (1× por máquina):** `npx playwright install chromium` para gerar PDF.
