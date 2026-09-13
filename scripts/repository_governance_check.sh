#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'REPOSITORY GOVERNANCE: %s\n' "$1" >&2; exit 1; }

if [[ -n "${CALPQ_BRANCH_METADATA_FILE:-}" ]]; then
  metadata="$(cat "$CALPQ_BRANCH_METADATA_FILE")"
else
  repository="${GITHUB_REPOSITORY:-robertdominik618/calpq-os}"
  api="${GITHUB_API_URL:-https://api.github.com}"
  headers=(-H 'Accept: application/vnd.github+json')
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    headers+=(-H "Authorization: Bearer ${GITHUB_TOKEN}")
  fi
  metadata="$(curl -fsSL "${headers[@]}" "$api/repos/$repository/branches/main")" || fail "cannot read main branch metadata"
fi

if ! grep -Eq '"protected"[[:space:]]*:[[:space:]]*true' <<< "$metadata"; then
  fail "main is not protected"
fi

printf 'REPOSITORY GOVERNANCE: main protection detected\n'
