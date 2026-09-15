#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M01 AUDIT LEDGER: %s\n' "$1" >&2; exit 1; }
phase="$(bash scripts/governance_lifecycle_phase.sh)"

required=(
  docs/contracts/AUDIT_LEDGER_MODEL.md
  docs/contracts/AUDIT_TAMPER_EVIDENCE_MODEL.md
  docs/contracts/DECISION_REPLAY_MODEL.md
  docs/contracts/COMPLIANCE_EXPORT_MODEL.md
  docs/prep/M01_AUDIT_LEDGER_BASELINE.md
  docs/prep/M01_AUDIT_LEDGER_TEST_MATRIX.md
)
for file in "${required[@]}"; do
  [[ -f "$file" ]] || fail "missing artifact: $file"
  grep -q 'PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION' "$file" || fail "missing pre-M01 boundary: $file"
done

grep -q 'append-only' docs/contracts/AUDIT_LEDGER_MODEL.md || fail 'append-only audit rule missing'
grep -q 'MUST NOT itself issue credentials' docs/contracts/AUDIT_LEDGER_MODEL.md || fail 'audit/source-of-truth boundary missing'
grep -q 'does not prove that the original statement was legally correct' docs/contracts/AUDIT_TAMPER_EVIDENCE_MODEL.md || fail 'integrity/truth boundary missing'
grep -q '`AS_WAS`' docs/contracts/DECISION_REPLAY_MODEL.md || fail 'historical replay mode missing'
grep -q 'replay is read-only' docs/contracts/DECISION_REPLAY_MODEL.md || fail 'replay mutation boundary missing'
grep -q 'Minimum-necessary disclosure applies' docs/contracts/COMPLIANCE_EXPORT_MODEL.md || fail 'export minimization missing'
grep -q 'NOT_ADMITTED_FOR_IMPLEMENTATION' docs/prep/M01_AUDIT_LEDGER_BASELINE.md || fail 'admission boundary missing'
grep -q 'Lawfully unavailable historical payload is not reconstructed by AI' docs/prep/M01_AUDIT_LEDGER_TEST_MATRIX.md || fail 'AI reconstruction boundary missing'

printf 'M01 AUDIT LEDGER: PASS / PHASE %s\n' "$phase"
