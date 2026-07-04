#!/usr/bin/env bash
if [[ -z "${BASH_SOURCE[0]:-}" ]] || [[ ! -f "${BASH_SOURCE[0]:-}" ]]; then
  _repo="${CONCEITTO_REPO:-devgabrielmichel/teste-tools}"
  _ref="${CONCEITTO_REF:-main}"
  _tmp="$(mktemp -d)"
  echo "→ Baixando ${_repo} @ ${_ref}..."
  curl -fsSL "https://codeload.github.com/${_repo}/tar.gz/${_ref}" | tar -xz -C "$_tmp" --strip-components=1
  export CONCEITTO_TOOLS_DIR="$_tmp"
  exec /bin/bash "$_tmp/scripts/init.sh" "$@"
fi
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

PROFILE="web"
WITH_DESCRITIVO=false
WITH_WORKFLOW=false
WITH_DOCS=false
USE_VITE=false
USE_PRISMA=false
FORCE=false
ROOT=""
EXTRA=()

args=("$@")
i=0
while [[ $i -lt ${#args[@]} ]]; do
  arg="${args[$i]}"
  case "$arg" in
    --profile)
      i=$((i + 1))
      PROFILE="${args[$i]:-web}"
      ;;
    --profile=*)
      PROFILE="${arg#*=}"
      ;;
    --with-descritivo) WITH_DESCRITIVO=true ;;
    --with-workflow) WITH_WORKFLOW=true ;;
    --with-docs) WITH_DOCS=true ;;
    --vite) USE_VITE=true ;;
    --prisma) USE_PRISMA=true ;;
    --force) FORCE=true ;;
    -*) EXTRA+=("$arg") ;;
    *)
      if [[ -z "$ROOT" ]]; then
        ROOT="$(cd "$arg" && pwd)"
      else
        EXTRA+=("$arg")
      fi
      ;;
  esac
  i=$((i + 1))
done

[[ -z "$ROOT" ]] && ROOT="$(pwd)"

TOOLS="$(conceitto_fetch_tools_dir)"
export CONCEITTO_TOOLS_DIR="$TOOLS"

echo "=== Conceitto init ==="
echo "  Projeto: $ROOT"
echo "  Perfil:  $PROFILE"
echo ""

bash "$SCRIPT_DIR/install-shared.sh" ${FORCE:+--force} "$ROOT"

case "$PROFILE" in
  web)
    WEB_ARGS=()
    [[ "$USE_VITE" == "true" ]] && WEB_ARGS+=(--vite)
    [[ "$USE_PRISMA" == "true" ]] && WEB_ARGS+=(--prisma)
    [[ "$FORCE" == "true" ]] && WEB_ARGS+=(--force)
    bash "$SCRIPT_DIR/install-web.sh" "${WEB_ARGS[@]}" "$ROOT"
    ;;
  app)
    APP_BASE="$TOOLS/packages/default-initial-app/base"
    if [[ ! -d "$APP_BASE" ]]; then
      echo "⚠ Perfil app (Flutter): pacote em preparação — veja packages/default-initial-app/README.md"
    else
      conceitto_merge_dir "$APP_BASE" "$ROOT" "$FORCE"
    fi
    ;;
  *)
    echo "Erro: perfil desconhecido: $PROFILE (use web ou app)" >&2
    exit 1
    ;;
esac

[[ "$WITH_DOCS" == "true" ]] && bash "$SCRIPT_DIR/install-docs.sh" ${FORCE:+--force} "$ROOT"
[[ "$WITH_WORKFLOW" == "true" ]] && bash "$SCRIPT_DIR/install-workflow.sh" ${FORCE:+--force} "$ROOT"
[[ "$WITH_DESCRITIVO" == "true" ]] && bash "$SCRIPT_DIR/install-descritivo.sh" ${FORCE:+--force} "$ROOT"

conceitto_cleanup_tools_dir
trap - EXIT

echo ""
echo "✓ Projeto inicializado em: $ROOT"
echo "  Próximos passos:"
echo "    1. git add . && git commit -m \"chore: init conceitto\""
echo "    2. cd frontend && npm install"
if [[ "$WITH_DESCRITIVO" == "true" ]]; then
  echo "    3. npx playwright install chromium"
  echo "    4. No Cursor: gere o descritivo comercial em PDF"
fi
