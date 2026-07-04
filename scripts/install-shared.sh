#!/usr/bin/env bash
# Instala rules/skills/AGENTS.md padrão Conceitto (todo projeto).
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

SHARED="$TOOLS/shared"
if [[ ! -d "$SHARED" ]]; then
  echo "Erro: shared/ não encontrado no repositório." >&2
  exit 1
fi

echo "→ Instalando padrões Conceitto (rules + AGENTS.md) em $ROOT..."

conceitto_merge_dir "$SHARED/.cursor/rules" "$ROOT/.cursor/rules" "$FORCE"
conceitto_merge_dir "$SHARED/.cursor/skills" "$ROOT/.cursor/skills" "$FORCE"

if [[ "$FORCE" == "true" || ! -f "$ROOT/AGENTS.md" ]]; then
  if [[ -f "$SHARED/AGENTS.md" ]]; then
    cp "$SHARED/AGENTS.md" "$ROOT/AGENTS.md"
    echo "  + AGENTS.md"
  fi
fi

echo "✓ Padrões Conceitto instalados."
