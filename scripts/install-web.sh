#!/usr/bin/env bash
# Scaffold web React + Node (base + variantes opcionais).
if [[ -z "${BASH_SOURCE[0]:-}" ]] || [[ ! -f "${BASH_SOURCE[0]:-}" ]]; then
  _repo="${CONCEITTO_REPO:-devgabrielmichel/teste-tools}"
  _ref="${CONCEITTO_REF:-main}"
  _tmp="$(mktemp -d)"
  echo "→ Baixando ${_repo} @ ${_ref}..."
  curl -fsSL "https://codeload.github.com/${_repo}/tar.gz/${_ref}" | tar -xz -C "$_tmp" --strip-components=1
  export CONCEITTO_TOOLS_DIR="$_tmp"
  exec /bin/bash "$_tmp/scripts/install-web.sh" "$@"
fi
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

FORCE=false
USE_VITE=false
USE_PRISMA=false
EXTRA=()

for arg in "$@"; do
  case "$arg" in
    --force) FORCE=true ;;
    --vite) USE_VITE=true ;;
    --prisma) USE_PRISMA=true ;;
    -*) EXTRA+=("$arg") ;;
    *) EXTRA+=("$arg") ;;
  esac
done

ROOT="$(conceitto_resolve_root "${EXTRA[@]}")"
TOOLS="$(conceitto_fetch_tools_dir)"
trap conceitto_cleanup_tools_dir EXIT

PKG="$TOOLS/packages/default-initial-web"
BASE="$PKG/base"

if [[ ! -d "$BASE" ]]; then
  echo "Erro: packages/default-initial-web/base não encontrado." >&2
  exit 1
fi

echo "→ Instalando scaffold web em $ROOT..."

conceitto_merge_dir "$BASE" "$ROOT" "$FORCE"

if [[ "$USE_VITE" == "true" && -d "$PKG/variants/vite" ]]; then
  echo "  + variante Vite"
  conceitto_merge_dir "$PKG/variants/vite" "$ROOT" "$FORCE"
fi

if [[ "$USE_PRISMA" == "true" && -d "$PKG/variants/prisma" ]]; then
  echo "  + variante Prisma"
  conceitto_merge_dir "$PKG/variants/prisma" "$ROOT" "$FORCE"
  MERGE="$PKG/variants/prisma/backend/package.json.merge.json"
  if [[ -f "$MERGE" && -f "$ROOT/backend/package.json" ]]; then
    node -e "
      import fs from 'fs';
      const pkg = JSON.parse(fs.readFileSync('$ROOT/backend/package.json', 'utf8'));
      const extra = JSON.parse(fs.readFileSync('$MERGE', 'utf8'));
      pkg.dependencies = { ...pkg.dependencies, ...extra.dependencies };
      pkg.devDependencies = { ...pkg.devDependencies, ...extra.devDependencies };
      fs.writeFileSync('$ROOT/backend/package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
  fi
fi

echo "✓ Scaffold web instalado."
echo "  Próximo: cd frontend && npm install  (e backend/, se aplicável)"
