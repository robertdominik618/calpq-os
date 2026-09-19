#!/usr/bin/env bash
set -euo pipefail
fail(){ printf 'M03-M05 PLANNING READINESS: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"

required=(
  docs/architecture/CALPQ_MILESTONE_ARCHITECTURE_M01_M12.md
  docs/planning/M03_PRODUCT_SURFACE_BASELINE.md
  docs/planning/M04_CATALOG_PATHS_GAP_BASELINE.md
  docs/planning/M05_EVIDENCE_VERIFICATION_FABRIC_BASELINE.md
  docs/planning/M03_M05_INTEGRATION_SEQUENCE.md
  docs/planning/M03_M05_READINESS_MATRIX.md
)
for f in "${required[@]}"; do [[ -f "$f" ]] || fail "missing $f"; done

for f in docs/planning/M03_PRODUCT_SURFACE_BASELINE.md docs/planning/M04_CATALOG_PATHS_GAP_BASELINE.md docs/planning/M05_EVIDENCE_VERIFICATION_FABRIC_BASELINE.md docs/planning/M03_M05_INTEGRATION_SEQUENCE.md docs/planning/M03_M05_READINESS_MATRIX.md; do
  grep -q 'PLANNING ONLY / BLOCKED' "$f" || fail "$f must remain planning-only and blocked"
done

criteria_count="$(grep -Ec '^[0-9]+\.' docs/planning/M03_M05_READINESS_MATRIX.md)"
[[ "$criteria_count" -eq 30 ]] || fail "readiness matrix must contain 30 criteria, got $criteria_count"

grep -q 'Professional Passport' docs/planning/M03_PRODUCT_SURFACE_BASELINE.md || fail 'M03 Passport baseline missing'
grep -q 'Credential Cards' docs/planning/M03_PRODUCT_SURFACE_BASELINE.md || fail 'M03 Credential Card baseline missing'
grep -q 'QualificationPath' docs/planning/M04_CATALOG_PATHS_GAP_BASELINE.md || fail 'M04 qualification path baseline missing'
grep -q 'Gap Navigator' docs/planning/M04_CATALOG_PATHS_GAP_BASELINE.md || fail 'M04 gap baseline missing'
grep -q 'Immutable Original' docs/planning/M05_EVIDENCE_VERIFICATION_FABRIC_BASELINE.md || fail 'M05 immutable original baseline missing'
grep -q 'Trust Registry' docs/planning/M05_EVIDENCE_VERIFICATION_FABRIC_BASELINE.md || fail 'M05 trust baseline missing'
grep -q 'M03 must not implement hidden eligibility logic' docs/planning/M03_M05_INTEGRATION_SEQUENCE.md || fail 'cross-milestone ownership rule missing'
grep -q 'implementation remains blocked' docs/planning/M03_M05_READINESS_MATRIX.md || fail 'readiness matrix governance boundary missing'

printf 'M03-M05 PLANNING READINESS: PASS / 30 OF 30 CRITERIA / PHASE %s\n' "$phase"
