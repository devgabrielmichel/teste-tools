# Agentes — Descritivo Comercial

> **Não peça ao usuário para configurar hooks manualmente.**  
> O `npm install` no frontend já executa `descritivo-comercial-kit/install.mjs`, que instala scripts e mescla o hook `stop` no `.cursor/hooks.json`.

Se `docs/comercial/.descritivo-installed` **não existir** ou faltar `frontend/scripts/descritivo/sync.mjs`, execute **agora e em silêncio**:

```bash
node descritivo-comercial-kit/install.mjs --quiet
```

## Atualização automática (só quando necessário)

| Gatilho | O que acontece |
|---------|----------------|
| Fim de sessão do Agent (hook `stop`) | `sync.mjs --quiet` em background |
| Código em `watchDirs` mudou | Regenera HTML + PDF; incrementa patch da versão |
| `descritivo.content.json` mudou | Regenera HTML + PDF |
| CSS/scripts do kit mudaram (`install --force`) | Regenera no próximo sync |
| Nada mudou (hash igual) | Sai em ~1s: *"já está atualizado"* — **não gera PDF de novo** |

**Não bloqueie o chat esperando o PDF.** O hook roda em background.

Na primeira vez, preencha `docs/comercial/descritivo.content.json` e rode `npm run descritivo:pdf` se o PDF ainda não existir.

---
## Regras

- Proibido no PDF: rotas `/login`, JWT, React, Node, APIs, stack técnica.
- Editar `descritivo.content.json` — nunca o HTML gerado.
- PDF atualiza em background no hook `stop` — não bloqueie a resposta esperando o PDF.
- Ajuste `descritivo.kit.json` se as pastas do projeto não forem `frontend/src` e `backend/src`.

## Tema visual (Conceitto)

O kit usa por padrão o preset **`conceitto`** — verde da marca (`#39B54A`) em **fundo branco** (como documento comercial normal), inspirado em [conceitto.ind.br](https://www.conceitto.ind.br/).

Em `descritivo.kit.json`:

```json
"theme": { "preset": "conceitto" }
```

Para tema azul clássico: `"preset": "default"`. Para fundo preto (site): `"preset": "conceitto-dark"`.

## Densidade de conteúdo (obrigatório)

O PDF **não pode** ter páginas quase vazias. Ao preencher o JSON:

| Seção | Mínimo |
|-------|--------|
| `problema.paragraphs` | 3 parágrafos de 2–4 linhas cada |
| `problema.indicadores` | 4–6 linhas na tabela |
| `perfis[].beneficios` | **5–7 bullets** por perfil; incluir 4 perfis quando o produto tiver gestor, comprador, fornecedor e operador |
| `jornada.flowSteps` | 6–8 etapas no fluxo visual |
| `jornada.steps` | **8–10 passos** detalhados |
| `diferenciais` | 6–8 linhas na tabela |
| `compliance` | 4–6 itens |
| `modeloComercial` | 3–4 itens |

Regra do **"E daí?"**: cada bullet deve responder o benefício prático para o cliente, não a feature técnica.
