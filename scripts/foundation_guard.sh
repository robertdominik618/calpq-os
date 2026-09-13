#!/usr/bin/env bash
set -euo pipefail

fail() {
  printf 'FOUNDATION GUARD: %s\n' "$1" >&2
  exit 1
}

[[ -f foundation/manifest.json ]] || fail "manifest missing"

required_files="$(
  sed -n '/"required_artifacts": \[/,/\]/p' foundation/manifest.json \
    | sed -n 's/.*"\([^"]*\)".*/\1/p'
)"

while IFS= read -r file; do
  [[ -z "$file" || -f "$file" ]] || fail "missing required artifact: $file"
done <<< "$required_files"

grep -q '"milestone": "M00 FOUNDATION"' foundation/manifest.json \
  || fail "manifest milestone is not M00 FOUNDATION"
grep -q '"change_intake": "CALPQ-PRIPOJ"' foundation/manifest.json \
  || fail "CALPQ-PRIPOJ intake rule is missing"
grep -q 'Architecture before implementation' docs/foundation/CONSTITUTION.md \
  || fail "constitution principle set is incomplete"

if grep -q '"feature_development": "FROZEN"' foundation/manifest.json; then
  forbidden_dirs=(src app apps packages services features modules)
  for path in "${forbidden_dirs[@]}"; do
    [[ ! -e "$path" ]] || fail "feature development is FROZEN; forbidden path exists: $path"
  done

  forbidden_manifests=(
    package.json pyproject.toml requirements.txt Package.swift Podfile
    go.mod Cargo.toml pom.xml build.gradle Gemfile composer.json
  )
  for file in "${forbidden_manifests[@]}"; do
    [[ ! -e "$file" ]] || fail "technology stack is not approved; forbidden manifest exists: $file"
  done

  code_patterns=('*.swift' '*.kt' '*.java' '*.ts' '*.tsx' '*.js' '*.jsx' '*.py' '*.go' '*.rs' '*.cs' '*.dart')
  for pattern in "${code_patterns[@]}"; do
    match="$(find . -type f -name "$pattern" -not -path './.git/*' -print -quit)"
    [[ -z "$match" ]] || fail "product code detected while feature development is FROZEN: $match"
  done
fi

printf 'FOUNDATION GUARD: PASS\n'
