#!/usr/bin/env bash
set -euo pipefail
fail(){ printf 'M06-M08 PLANNING READINESS: %s\n' "$1" >&2; exit 1; }

required=(
  docs/architecture/CALPQ_MILESTONE_ARCHITECTURE_M01_M12.md
  docs/planning/M06_LIFECYCLE_CONTINUOUS_COMPLIANCE_BASELINE.md
  docs/planning/M07_REGULATORY_INTELLIGENCE_RADAR_BASELINE.md
  docs/planning/M08_ORGANIZATION_B2B_ASSIGNMENT_BASELINE.md
  docs/planning/M06_M08_INTEGRATION_SEQUENCE.md
  docs/planning/M06_M08_READINESS_MATRIX.md
)
for f in "${required[@]}"; do [[ -f "$f" ]] || fail "missing $f"; done

for f in docs/planning/M06_LIFECYCLE_CONTINUOUS_COMPLIANCE_BASELINE.md docs/planning/M07_REGULATORY_INTELLIGENCE_RADAR_BASELINE.md docs/planning/M08_ORGANIZATION_B2B_ASSIGNMENT_BASELINE.md docs/planning/M06_M08_INTEGRATION_SEQUENCE.md docs/planning/M06_M08_READINESS_MATRIX.md; do
  grep -q 'PLANNING ONLY / BLOCKED' "$f" || fail "$f must remain planning-only and blocked"
done

criteria_count="$(grep -Ec '^[0-9]+\.' docs/planning/M06_M08_READINESS_MATRIX.md)"
[[ "$criteria_count" -eq 30 ]] || fail "readiness matrix must contain 30 criteria, got $criteria_count"

grep -q 'Renewal Autopilot' docs/planning/M06_LIFECYCLE_CONTINUOUS_COMPLIANCE_BASELINE.md || fail 'M06 renewal baseline missing'
grep -q 'dependency graph' docs/planning/M06_LIFECYCLE_CONTINUOUS_COMPLIANCE_BASELINE.md || fail 'M06 reevaluation baseline missing'
grep -q 'Regulatory Radar' docs/planning/M07_REGULATORY_INTELLIGENCE_RADAR_BASELINE.md || fail 'M07 radar baseline missing'
grep -q 'Source Change' docs/planning/M07_REGULATORY_INTELLIGENCE_RADAR_BASELINE.md || fail 'M07 impact spine missing'
grep -q 'AssignmentRequirementProfile' docs/planning/M08_ORGANIZATION_B2B_ASSIGNMENT_BASELINE.md || fail 'M08 assignment profile missing'
grep -q 'ASSIGNABLE_WITH_CONDITIONS' docs/planning/M08_ORGANIZATION_B2B_ASSIGNMENT_BASELINE.md || fail 'M08 guard outcomes missing'
grep -q 'M06 owns lifecycle' docs/planning/M06_M08_INTEGRATION_SEQUENCE.md || fail 'cross-milestone ownership rule missing'
grep -q 'implementation remains blocked' docs/planning/M06_M08_READINESS_MATRIX.md || fail 'readiness governance boundary missing'
grep -q '"state": "LOCKED"' foundation/feature-development-gate.json || fail 'feature development gate must remain locked'

printf 'M06-M08 PLANNING READINESS: PASS / 30 OF 30 CRITERIA / IMPLEMENTATION BLOCKED\n'
