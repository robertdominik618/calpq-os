#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'FV00 ADMISSION TRANSITION: %s\n' "$1" >&2; exit 1; }

approval="${CALPQ_FV00_ADMISSION_APPROVAL:-}"
approver="${CALPQ_FV00_ADMISSION_APPROVED_BY:-}"
approved_at="${CALPQ_FV00_ADMISSION_APPROVED_AT:-$(date -u +%Y-%m-%dT%H:%M:%SZ)}"
revision="${CALPQ_FV00_ADMISSION_REVISION:-}"

[[ "$approval" == "APPROVE_CALPQ_FV00_ADMISSION" ]] \
  || fail "explicit FV-00 admission approval token missing"
[[ -n "$approver" ]] || fail "CALPQ_FV00_ADMISSION_APPROVED_BY is required"
command -v jq >/dev/null 2>&1 || fail "jq is required"

if [[ -z "$revision" ]]; then
  revision="$(git rev-parse HEAD 2>/dev/null || true)"
fi
[[ -n "$revision" ]] || fail "admission revision cannot be resolved"

bash scripts/m00_release_gate.sh >/dev/null
bash scripts/repository_governance_check.sh >/dev/null
bash scripts/feature_development_gate_check.sh >/dev/null
bash scripts/fv00_admission_check.sh >/dev/null
bash tests/m01_preimplementation_integrity_test.sh >/dev/null
bash tests/m02_preimplementation_integrity_test.sh >/dev/null

jq -e '.m00_release_status == "RELEASED" and .feature_development == "AUTHORIZED" and .quality_gates.feature_development_gate == "OPEN"' foundation/manifest.json >/dev/null \
  || fail "project-wide implementation prerequisites are not open"
jq -e '.state == "OPEN" and .next_gate == "FV00_FORMAL_ADMISSION"' foundation/feature-development-gate.json >/dev/null \
  || fail "feature-development gate is not ready for FV-00 admission"
jq -e '.state == "BLOCKED_PENDING_PREREQUISITES" and (.blocking_reviews | length) == 0' docs/planning/fv00-admission-decision.json >/dev/null \
  || fail "FV-00 decision is not in admissible blocked state or has blocking reviews"

if [[ -n "${CALPQ_FV00_ISSUE_FILE:-}" ]]; then
  issue="$(cat "$CALPQ_FV00_ISSUE_FILE")"
else
  repository="${GITHUB_REPOSITORY:-robertdominik618/calpq-os}"
  api="${GITHUB_API_URL:-https://api.github.com}"
  headers=(-H 'Accept: application/vnd.github+json')
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    headers+=(-H "Authorization: Bearer ${GITHUB_TOKEN}")
  fi
  issue="$(curl -fsSL "${headers[@]}" "$api/repos/$repository/issues/7")" \
    || fail "cannot read FV-00 issue #7"
fi
jq -e '.number == 7 and .state == "open"' >/dev/null <<< "$issue" \
  || fail "FV-00 governance issue #7 must be open at admission time"

tmpdir="$(mktemp -d)"
backupdir="$(mktemp -d)"
rollback_needed=0
cleanup() { rm -rf "$tmpdir" "$backupdir"; }
rollback() {
  if [[ "$rollback_needed" == "1" ]]; then
    cp "$backupdir/fv00-admission-decision.json" docs/planning/fv00-admission-decision.json
    cp "$backupdir/FV00_VERTICAL_ADMISSION_RECORD.md" docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md
  fi
  cleanup
}
trap rollback ERR
trap cleanup EXIT

cp docs/planning/fv00-admission-decision.json "$backupdir/fv00-admission-decision.json"
cp docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md "$backupdir/FV00_VERTICAL_ADMISSION_RECORD.md"

jq \
  --arg revision "$revision" \
  --arg approver "$approver" \
  --arg approved_at "$approved_at" '
  .state = "ADMITTED_FOR_IMPLEMENTATION"
  | .admitted_revision = $revision
  | .admitted_by_transition = "CALPQ-FV00-ADMIT-0001"
  | .approved_by = $approver
  | .approved_at = $approved_at
  | .authorized_execution_entry = "M02_BATCH_A_FV01"
  | .last_updated = $approved_at
' docs/planning/fv00-admission-decision.json > "$tmpdir/fv00-admission-decision.json"

sed \
  -e 's|^Status: `PLANNING COMPLETE / READY_FOR_FORMAL_ADMISSION_AFTER_M00`$|Status: `FORMALLY ADMITTED / IMPLEMENTATION MAY BEGIN UNDER M02 BATCH PLAN`|' \
  -e 's|^`BLOCKED_PENDING_PREREQUISITES`$|`ADMITTED_FOR_IMPLEMENTATION`|' \
  docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md > "$tmpdir/FV00_VERTICAL_ADMISSION_RECORD.md"
cat >> "$tmpdir/FV00_VERTICAL_ADMISSION_RECORD.md" <<EOF

## Formal admission evidence
- Transition: \`CALPQ-FV00-ADMIT-0001\`
- Admitted revision: \`$revision\`
- Approved by: \`$approver\`
- Approved at: \`$approved_at\`
- Authorized execution entry: \`M02_BATCH_A_FV01\`
- Scope remains constrained by the existing FV-00/M02 execution package and explicit non-goals.
EOF

jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION" and .admitted_by_transition == "CALPQ-FV00-ADMIT-0001" and .authorized_execution_entry == "M02_BATCH_A_FV01" and (.admitted_revision | length > 0) and (.approved_by | length > 0) and (.approved_at | length > 0)' "$tmpdir/fv00-admission-decision.json" >/dev/null \
  || fail "generated FV-00 admission decision is invalid"
grep -q '^`ADMITTED_FOR_IMPLEMENTATION`$' "$tmpdir/FV00_VERTICAL_ADMISSION_RECORD.md" \
  || fail "generated FV-00 markdown decision is invalid"

rollback_needed=1
mv "$tmpdir/fv00-admission-decision.json" docs/planning/fv00-admission-decision.json
mv "$tmpdir/FV00_VERTICAL_ADMISSION_RECORD.md" docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md
bash scripts/fv00_admission_check.sh >/dev/null
bash scripts/foundation_guard.sh >/dev/null
rollback_needed=0

printf 'FV00 ADMISSION TRANSITION: ADMITTED_FOR_IMPLEMENTATION / ENTRY M02_BATCH_A_FV01\n'
