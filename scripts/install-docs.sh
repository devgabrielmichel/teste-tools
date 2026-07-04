#!/usr/bin/env bash
# Scaffold /docs + skill para documentar módulos.
if [[ -z "${BASH_SOURCE[0]:-}" ]] || [[ ! -f "${BASH_SOURCE[0]:-}" ]]; then
  _repo="${CONCEITTO_REPO:-devgabrielmichel/teste-tools}"
  _ref="${CONCEITTO_REF:-main}"
  _tmp="$(mktemp -d)"
  echo "→ Baixando ${_repo} @ ${_ref}..."
  curl -fsSL "https://codeload.github.com/${_repo}/tar.gz/${_ref}" | tar -xz -C "$_tmp" --strip-components=1
  export CONCEITTO_TOOLS_DIR="$_tmp"
  exec /bin/bash "$_tmp/scripts/install-docs.sh" "$@"
fi
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

FORCE=false
EXTRA=()
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=true ;;
    -*) EXTRA+=("$arg") ;;
    *) EXTRA+=("$arg") ;;
  esac
done

ROOT="$(conceitto_resolve_root "${EXTRA[@]}")"
TOOLS="$(conceitto_fetch_tools_dir)"
trap conceitto_cleanup_tools_dir EXIT

PKG="$TOOLS/packages/generate-documentations"
if [[ ! -d "$PKG/templates" ]]; then
  echo "Erro: generate-documentations/templates não encontrado." >&2
  exit 1
fi

echo "→ Instalando scaffold de documentação em $ROOT..."

conceitto_merge_dir "$PKG/templates/docs" "$ROOT/docs" "$FORCE"
conceitto_merge_dir "$PKG/.cursor/skills" "$ROOT/.cursor/skills" "$FORCE"
conceitto_merge_dir "$PKG/.cursor/rules" "$ROOT/.cursor/rules" "$FORCE"

echo "✓ Documentação scaffold instalada."
