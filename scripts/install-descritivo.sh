#!/usr/bin/env bash
# Instala o kit descritivo comercial em um projeto existente.
if [[ -z "${BASH_SOURCE[0]:-}" ]] || [[ ! -f "${BASH_SOURCE[0]:-}" ]]; then
  _repo="${DESCRITIVO_REPO:-${CONCEITTO_REPO:-devgabrielmichel/teste-tools}}"
  _ref="${DESCRITIVO_REF:-${CONCEITTO_REF:-main}}"
  _tmp="$(mktemp -d)"
  echo "→ Baixando ${_repo} @ ${_ref}..."
  curl -fsSL "https://codeload.github.com/${_repo}/tar.gz/${_ref}" | tar -xz -C "$_tmp" --strip-components=1
  export CONCEITTO_TOOLS_DIR="$_tmp"
  exec /bin/bash "$_tmp/scripts/install-descritivo.sh" "$@"
fi
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

# Compatibilidade com variáveis antigas
CONCEITTO_REPO="${DESCRITIVO_REPO:-${CONCEITTO_REPO:-devgabrielmichel/teste-tools}}"
CONCEITTO_REF="${DESCRITIVO_REF:-${CONCEITTO_REF:-main}}"
export CONCEITTO_REPO CONCEITTO_REF

EXTRA_ARGS=()
ROOT=""
for arg in "$@"; do
  case "$arg" in
    -*) EXTRA_ARGS+=("$arg") ;;
    *)
      if [[ -z "$ROOT" ]]; then
        ROOT="$(cd "$arg" && pwd)"
      else
        EXTRA_ARGS+=("$arg")
      fi
      ;;
  esac
done

[[ -z "$ROOT" ]] && ROOT="$(pwd)"

if [[ ! -f "$ROOT/package.json" && ! -d "$ROOT/frontend" && ! -d "$ROOT/.git" ]]; then
  echo "Aviso: não parece a raiz de um projeto (sem package.json, frontend/ ou .git)." >&2
  echo "Continuando em: $ROOT" >&2
fi

TOOLS="$(conceitto_fetch_tools_dir)"
trap conceitto_cleanup_tools_dir EXIT

KIT_SRC="$TOOLS/packages/add-descritivo"
KIT_DEST="$ROOT/descritivo-comercial-kit"

if [[ ! -f "$KIT_SRC/install.mjs" ]]; then
  echo "Erro: kit não encontrado em packages/add-descritivo." >&2
  exit 1
fi

echo "→ Copiando kit para $KIT_DEST..."
rm -rf "$KIT_DEST"
mkdir -p "$(dirname "$KIT_DEST")"
cp -R "$KIT_SRC" "$KIT_DEST"

echo "→ Executando instalação..."
if ((${#EXTRA_ARGS[@]} > 0)); then
  (cd "$ROOT" && node descritivo-comercial-kit/install.mjs "${EXTRA_ARGS[@]}")
else
  (cd "$ROOT" && node descritivo-comercial-kit/install.mjs)
fi

conceitto_cleanup_tools_dir
trap - EXIT

echo ""
echo "✓ Descritivo comercial instalado em: $ROOT"
echo "  Próximos passos:"
echo "    1. npm install   (na raiz ou em frontend/)"
echo "    2. npx playwright install chromium   (uma vez por máquina)"
echo "    3. No Cursor: peça para gerar o descritivo comercial em PDF"
