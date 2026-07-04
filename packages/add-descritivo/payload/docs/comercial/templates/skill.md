---
name: gerar-descritivo-comercial
description: Gera descritivos técnicos-comerciais em PDF. Use para documentação comercial, material de vendas ou atualização do PDF em docs/comercial/.
---

# Gerar Descritivo Técnico-Comercial

## Bootstrap (só se o kit não estiver instalado)

Se `docs/comercial/.descritivo-installed` não existir:

```bash
node descritivo-comercial-kit/install.mjs --quiet
```

## Fluxo padrão

1. Analise o código do projeto.
2. Atualize `docs/comercial/descritivo.content.json` (texto comercial **denso**).
3. `npm run descritivo` ou `npm run descritivo:pdf`
4. Não edite o HTML gerado.

## Regra do "E daí?"

Traduzir técnico → benefício. Sem rotas, JWT, stack, status em inglês.

## Densidade mínima

- 5–7 benefícios por perfil; 4 perfis quando aplicável
- 8–10 passos na jornada; 6–8 etapas no fluxo visual
- 6–8 diferenciais; 4–6 indicadores de problema
- Parágrafos com substância — evitar folhas com 3–4 frases soltas

## Tema

Preset padrão: `conceitto` (verde `#39B54A`, fundo branco). Fundo preto: `conceitto-dark`.

## Estrutura (6 seções)

Problema/Solução · Valor por Perfil · Jornada · Diferenciais · Integrações · Contratação
