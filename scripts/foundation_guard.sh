#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'FOUNDATION GUARD: %s\n' "$1" >&2; exit 1; }

[[ -f foundation/manifest.json ]] || fail "manifest missing"
required_files="$(sed -n '/"required_artifacts": \[/,/\]/p' foundation/manifest.json | sed '1d;$d' | sed -n 's/.*"\([^"]*\)".*/\1/p')"
while IFS= read -r file; do
  [[ -z "$file" || -f "$file" ]] || fail "missing required artifact: $file"
done <<< "$required_files"

grep -q '"milestone": "M00 FOUNDATION"' foundation/manifest.json || fail "wrong milestone"
grep -q '"change_intake": "CALPQ-PRIPOJ"' foundation/manifest.json || fail "intake rule missing"
grep -q 'Architecture before implementation' docs/foundation/CONSTITUTION.md || fail "constitution principle missing"

bash scripts/feature_development_gate_check.sh >/dev/null
bash scripts/fv00_admission_check.sh >/dev/null
feature_state="$(jq -r '.feature_development' foundation/manifest.json)"

case "$feature_state" in
  FROZEN)
    for path in src app services features modules; do
      [[ ! -e "$path" ]] || fail "feature development is FROZEN; forbidden path exists: $path"
    done

    if grep -q '"status": "APPROVED"' foundation/manifest.json; then
      grep -q '"decision": "ADR-0002"' foundation/manifest.json || fail "approved stack lacks ADR-0002 reference"
      grep -q 'Status: `ACCEPTED`' docs/adr/ADR-0002-technology-stack-selection.md || fail "ADR-0002 is not accepted"
      for root in packages apps workers; do
        [[ -d "$root" ]] || fail "approved bootstrap shell missing: $root"
        bad="$(find "$root" -type f ! -name 'README.md' ! -name 'package.json' -print -quit)"
        [[ -z "$bad" ]] || fail "non-bootstrap file detected while feature development is FROZEN: $bad"
        srcdir="$(find "$root" -type d -name src -print -quit)"
        [[ -z "$srcdir" ]] || fail "source directory detected while feature development is FROZEN: $srcdir"
      done
    else
      for path in apps packages workers; do
        [[ ! -e "$path" ]] || fail "technology stack is not approved; bootstrap path exists: $path"
      done
      for file in package.json pnpm-workspace.yaml tsconfig.base.json pyproject.toml Package.swift go.mod Cargo.toml; do
        [[ ! -e "$file" ]] || fail "technology stack is not approved; manifest exists: $file"
      done
    fi

    for pattern in '*.swift' '*.kt' '*.java' '*.ts' '*.tsx' '*.js' '*.jsx' '*.py' '*.go' '*.rs' '*.cs' '*.dart'; do
      match="$(find . -type f -name "$pattern" -not -path './.git/*' -not -path './node_modules/*' -print -quit)"
      [[ -z "$match" ]] || fail "product source file detected while feature development is FROZEN: $match"
    done
    ;;
  AUTHORIZED)
    jq -e '.m00_release_status == "RELEASED" and .quality_gates.m00_release_decision == "APPROVED" and .quality_gates.feature_development_gate == "OPEN"' foundation/manifest.json >/dev/null \
      || fail "AUTHORIZED feature development lacks released M00/open feature gate evidence"
    ;;
  *)
    fail "unsupported feature development state: $feature_state"
    ;;
esac

node scripts/ci/ai-economy-architecture-gate.mjs >/dev/null

printf 'FOUNDATION GUARD: PASS\n'
