#!/usr/bin/env bash
# Entry point mínimo para curl | bash — sem dependências externas.
if [[ -z "${BASH_SOURCE[0]:-}" ]] || [[ ! -f "${BASH_SOURCE[0]:-}" ]]; then
  _repo="${DESCRITIVO_REPO:-${CONCEITTO_REPO:-devgabrielmichel/teste-tools}}"
  _ref="${DESCRITIVO_REF:-${CONCEITTO_REF:-main}}"
  _tmp="$(mktemp -d)"
  echo "→ Baixando ${_repo} @ ${_ref}..."
  curl -fsSL "https://codeload.github.com/${_repo}/tar.gz/${_ref}" | tar -xz -C "$_tmp" --strip-components=1
  exec /bin/bash "$_tmp/scripts/install-descritivo.sh" "$@"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec /bin/bash "$SCRIPT_DIR/install-descritivo.sh" "$@"
