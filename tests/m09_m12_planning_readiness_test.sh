#!/usr/bin/env bash
set -euo pipefail
fail(){ printf 'M09-M12 PLANNING READINESS: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"

required=(
  docs/architecture/CALPQ_MILESTONE_ARCHITECTURE_M01_M12.md
  docs/planning/M09_TRUST_SHARING_INTEROPERABILITY_BASELINE.md
  docs/planning/M10_INTELLIGENCE_GUIDED_DECISIONS_BASELINE.md
  docs/planning/M11_PRODUCTION_UX_OPERATIONS_BASELINE.md
  docs/planning/M12_PRODUCTION_HARDENING_GA_BASELINE.md
  docs/planning/M09_M12_INTEGRATION_SEQUENCE.md
  docs/planning/M09_M12_READINESS_MATRIX.md
)
for f in "${required[@]}"; do [[ -f "$f" ]] || fail "missing $f"; done

for f in docs/planning/M09_TRUST_SHARING_INTEROPERABILITY_BASELINE.md docs/planning/M10_INTELLIGENCE_GUIDED_DECISIONS_BASELINE.md docs/planning/M11_PRODUCTION_UX_OPERATIONS_BASELINE.md docs/planning/M12_PRODUCTION_HARDENING_GA_BASELINE.md docs/planning/M09_M12_INTEGRATION_SEQUENCE.md docs/planning/M09_M12_READINESS_MATRIX.md; do
  grep -q 'PLANNING ONLY / BLOCKED' "$f" || fail "$f must remain planning-only and blocked"
done

criteria_count="$(grep -Ec '^[0-9]+\.' docs/planning/M09_M12_READINESS_MATRIX.md)"
[[ "$criteria_count" -eq 40 ]] || fail "readiness matrix must contain 40 criteria, got $criteria_count"

grep -q 'selective disclosure' docs/planning/M09_TRUST_SHARING_INTEROPERABILITY_BASELINE.md || fail 'M09 selective disclosure missing'
grep -q 'EUDI Wallet' docs/planning/M09_TRUST_SHARING_INTEROPERABILITY_BASELINE.md || fail 'M09 interoperability boundary missing'
grep -q 'Next Best Action' docs/planning/M10_INTELLIGENCE_GUIDED_DECISIONS_BASELINE.md || fail 'M10 NBA baseline missing'
grep -q 'AI may not by itself' docs/planning/M10_INTELLIGENCE_GUIDED_DECISIONS_BASELINE.md || fail 'M10 authority boundary missing'
grep -q 'offline/cache' docs/planning/M11_PRODUCTION_UX_OPERATIONS_BASELINE.md || fail 'M11 offline/cache boundary missing'
grep -q 'Observability' docs/planning/M11_PRODUCTION_UX_OPERATIONS_BASELINE.md || fail 'M11 observability boundary missing'
grep -q 'General Availability' docs/planning/M12_PRODUCTION_HARDENING_GA_BASELINE.md || fail 'M12 GA baseline missing'
grep -q 'backup/restore' docs/planning/M12_PRODUCTION_HARDENING_GA_BASELINE.md || fail 'M12 recovery baseline missing'
grep -q 'M09 owns disclosure' docs/planning/M09_M12_INTEGRATION_SEQUENCE.md || fail 'M09-M12 ownership rules missing'
grep -q 'implementation remains blocked' docs/planning/M09_M12_READINESS_MATRIX.md || fail 'readiness governance boundary missing'

printf 'M09-M12 PLANNING READINESS: PASS / 40 OF 40 CRITERIA / PHASE %s\n' "$phase"
