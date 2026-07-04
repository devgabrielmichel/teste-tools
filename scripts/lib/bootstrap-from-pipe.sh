# Uso: no topo de cada script público, antes de set -u:
#   _conceitto_script="init.sh"
#   # shellcheck source=lib/bootstrap-from-pipe.sh
#   source "$(dirname "${BASH_SOURCE[0]:-$0}")/lib/bootstrap-from-pipe.sh" 2>/dev/null || true
#
# Como curl | bash não tem BASH_SOURCE, cada script inclui o bloco abaixo inline.

_conceitto_bootstrap() {
  local script_name="$1"
  shift
  local src="${BASH_SOURCE[1]:-${BASH_SOURCE[0]:-}}"
  if [[ -n "$src" && -f "$src" ]]; then
    return 0
  fi
  local repo="${CONCEITTO_REPO:-devgabrielmichel/teste-tools}"
  local ref="${CONCEITTO_REF:-main}"
  local tmp
  tmp="$(mktemp -d)"
  echo "→ Baixando ${repo} @ ${ref}..."
  curl -fsSL "https://codeload.github.com/${repo}/tar.gz/${ref}" | tar -xz -C "$tmp" --strip-components=1
  export CONCEITTO_TOOLS_DIR="$tmp"
  exec /bin/bash "$tmp/scripts/${script_name}" "$@"
}
