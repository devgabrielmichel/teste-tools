#!/usr/bin/env bash
# Funções compartilhadas pelos scripts install-*.sh e init.sh
set -euo pipefail

CONCEITTO_REPO="${CONCEITTO_REPO:-devgabrielmichel/teste-tools}"
CONCEITTO_REF="${CONCEITTO_REF:-main}"

_conceitto_downloaded_tmp=""

conceitto_resolve_root() {
  local root
  root="$(pwd)"
  for arg in "$@"; do
    case "$arg" in
      -*) ;;
      *)
        if [[ "$root" == "$(pwd)" ]]; then
          root="$(cd "$arg" && pwd)"
        fi
        ;;
    esac
  done
  echo "$root"
}

conceitto_fetch_tools_dir() {
  if [[ -n "${CONCEITTO_TOOLS_DIR:-}" && -d "${CONCEITTO_TOOLS_DIR}/packages" ]]; then
    echo "$CONCEITTO_TOOLS_DIR"
    return 0
  fi

  _conceitto_downloaded_tmp="$(mktemp -d)"
  echo "→ Baixando ${CONCEITTO_REPO} @ ${CONCEITTO_REF}..." >&2
  curl -fsSL "https://codeload.github.com/${CONCEITTO_REPO}/tar.gz/${CONCEITTO_REF}" \
    | tar -xz -C "$_conceitto_downloaded_tmp" --strip-components=1
  echo "$_conceitto_downloaded_tmp"
}

conceitto_cleanup_tools_dir() {
  if [[ -n "$_conceitto_downloaded_tmp" && -d "$_conceitto_downloaded_tmp" ]]; then
    rm -rf "$_conceitto_downloaded_tmp"
    _conceitto_downloaded_tmp=""
  fi
}

conceitto_copy_tree() {
  local src="$1"
  local dest="$2"
  local force="${3:-false}"

  if [[ ! -d "$src" ]]; then
    echo "Erro: pasta não encontrada: $src" >&2
    return 1
  fi

  if [[ "$force" == "true" ]]; then
    mkdir -p "$dest"
    cp -R "$src"/. "$dest/"
    return 0
  fi

  mkdir -p "$dest"
  for entry in "$src"/* "$src"/.[!.]* "$src"/..?*; do
    [[ -e "$entry" ]] || continue
    local name
    name="$(basename "$entry")"
    local target="$dest/$name"
    if [[ -e "$target" ]]; then
      continue
    fi
    cp -R "$entry" "$target"
  done
}

conceitto_merge_dir() {
  local src="$1"
  local dest="$2"
  local force="${3:-false}"

  if [[ ! -d "$src" ]]; then
    return 0
  fi

  mkdir -p "$dest"
  if command -v rsync >/dev/null 2>&1; then
    local flags=(--archive)
    if [[ "$force" != "true" ]]; then
      flags+=(--ignore-existing)
    fi
    rsync "${flags[@]}" "$src"/ "$dest"/
  else
    conceitto_copy_tree "$src" "$dest" "$force"
  fi
}

has_flag() {
  local needle="$1"
  shift
  for arg in "$@"; do
    [[ "$arg" == "$needle" ]] && return 0
  done
  return 1
}
