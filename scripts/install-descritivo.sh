#!/usr/bin/env bash
# Instala o kit descritivo comercial em um projeto existente.
# Uso:
#   curl -fsSL https://raw.githubusercontent.com/devgabrielmichel/teste-tools/main/scripts/install-descritivo.sh | bash
#   curl -fsSL ... | bash -s -- /caminho/do/projeto
#   curl -fsSL ... | bash -s -- --force
set -euo pipefail

REPO="${DESCRITIVO_REPO:-devgabrielmichel/teste-tools}"
REF="${DESCRITIVO_REF:-main}"

# Raiz do projeto = diretório atual ou primeiro argumento que não é flag
ROOT="$(pwd)"
EXTRA_ARGS=()
for arg in "$@"; do
  case "$arg" in
    -*) EXTRA_ARGS+=("$arg") ;;
    *)
      if [[ "$ROOT" == "$(pwd)" ]]; then
        ROOT="$(cd "$arg" && pwd)"
      else
        EXTRA_ARGS+=("$arg")
      fi
      ;;
  esac
done

if [[ ! -f "$ROOT/package.json" && ! -d "$ROOT/frontend" && ! -d "$ROOT/.git" ]]; then
  echo "Aviso: não parece a raiz de um projeto (sem package.json, frontend/ ou .git)." >&2
  echo "Continuando em: $ROOT" >&2
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "→ Baixando ${REPO} @ ${REF}..."
curl -fsSL "https://codeload.github.com/${REPO}/tar.gz/${REF}" | tar -xz -C "$TMP" --strip-components=1

KIT_SRC="$TMP/packages/add-descritivo"
KIT_DEST="$ROOT/descritivo-comercial-kit"

if [[ ! -f "$KIT_SRC/install.mjs" ]]; then
  echo "Erro: kit não encontrado em packages/add-descritivo no repositório." >&2
  exit 1
fi

echo "→ Copiando kit para $KIT_DEST..."
rm -rf "$KIT_DEST"
mkdir -p "$(dirname "$KIT_DEST")"
cp -R "$KIT_SRC" "$KIT_DEST"

echo "→ Executando instalação..."
(cd "$ROOT" && node "$KIT_DEST/install.mjs" "${EXTRA_ARGS[@]}")

echo ""
echo "✓ Descritivo comercial instalado em: $ROOT"
echo "  Próximos passos:"
echo "    1. npm install   (na raiz ou em frontend/, conforme o projeto)"
echo "    2. npx playwright install chromium   (uma vez por máquina)"
echo "    3. No Cursor: peça para gerar o descritivo comercial em PDF"
