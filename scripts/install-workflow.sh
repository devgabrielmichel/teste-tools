#!/usr/bin/env bash
# Templates GitHub (.github/) + rule de workflow git/PR.
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

FILES="$TOOLS/packages/workflow-github-instructions/files"
if [[ ! -d "$FILES" ]]; then
  echo "Erro: workflow-github-instructions/files não encontrado." >&2
  exit 1
fi

echo "→ Instalando workflow GitHub em $ROOT..."

conceitto_merge_dir "$FILES/.github" "$ROOT/.github" "$FORCE"
conceitto_merge_dir "$FILES/.cursor/rules" "$ROOT/.cursor/rules" "$FORCE"

echo "✓ Workflow GitHub instalado."
