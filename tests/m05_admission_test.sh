#!/usr/bin/env bash
set -euo pipefail
fail(){ printf 'M05 ADMISSION: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

record=docs/planning/M05_ADMISSION_RECORD.md
decision=docs/planning/m05-admission-decision.json
package=docs/planning/M05_EXECUTION_PACKAGE.md
m04_exit=docs/planning/M04_S10_EXIT_EVIDENCE.md

for f in "$record" "$decision" "$package" "$m04_exit" docs/planning/M04_ADMISSION_RECORD.md docs/planning/m04-admission-decision.json; do
  [[ -f "$f" ]] || fail "missing $f"
done

contracts=(
  docs/contracts/DOCUMENT_INTAKE_MODEL.md
  docs/contracts/ORIGINAL_DOCUMENT_ARCHIVE_MODEL.md
  docs/contracts/EXTRACTION_PROPOSAL_REVIEW_MODEL.md
  docs/contracts/DOCUMENT_VERIFICATION_BOUNDARY.md
  docs/contracts/DOCUMENT_INTAKE_SECURITY_PRIVACY_MODEL.md
  docs/contracts/TRUST_REGISTRY_MODEL.md
  docs/contracts/VERIFICATION_ORCHESTRATION_MODEL.md
  docs/contracts/VERIFIER_RELYING_PARTY_TRUST_MODEL.md
  docs/contracts/UNTRUSTED_CONTENT_AI_SECURITY_BOUNDARY.md
  docs/contracts/CREDENTIAL_ARCHIVE_LINKING_MODEL.md
  docs/contracts/HUMAN_REVIEW_CASE_MODEL.md
  docs/contracts/CORE_PROVENANCE_AND_EVIDENCE.md
)
for f in "${contracts[@]}"; do [[ -s "$f" ]] || fail "missing/empty M05 contract $f"; done

runtime_evidence=(
  tests/fv09_document_intake_test.sh
  tests/fv10_verification_test.sh
  .github/workflows/fv09-document-intake.yml
  .github/workflows/fv10-verification.yml
)
for f in "${runtime_evidence[@]}"; do [[ -s "$f" ]] || fail "missing/empty predecessor runtime evidence $f"; done

grep -q 'FORMALLY ADMITTED / IMPLEMENTATION MAY BEGIN AFTER MERGE + POST-MERGE GREEN' "$record" \
  || fail 'Markdown admission record is not in controlled admitted state'
grep -q 'ADMITTED / IMPLEMENTATION AUTHORIZED AFTER MERGE + POST-MERGE GREEN' "$package" \
  || fail 'M05 execution package is not conditionally implementation-authorized'

slices="$(grep -Ec '^[0-9]+\.' "$package")"
[[ "$slices" -eq 10 ]] || fail "M05 must contain 10 delivery slices, got $slices"
grep -q 'Multi-channel intake contracts' "$package" || fail 'Slice 01 intake scope missing'
grep -q 'Immutable original archive' "$package" || fail 'immutable original boundary missing'
grep -q 'OCR/AI confidence becomes verification' "$package" || fail 'OCR/AI verification stop condition missing'
grep -q 'provider-specific status leaks into Core truth' "$package" || fail 'provider-status Core boundary missing'

jq -e '.schema_version == 1
  and .decision_id == "CALPQ-M05-ADM-DEC-0001"
  and .admission_record_id == "CALPQ-M05-ADM-0001"
  and .milestone == "M05"
  and .candidate == "Evidence & Verification Fabric"
  and .issue_number == 34
  and .state == "ADMITTED_FOR_IMPLEMENTATION"
  and .admission_transition_id == "CALPQ-M05-ADMIT-0001"
  and .approved_by == "robertdominik618"
  and .approved_at == null
  and .approval_time_precision == "NOT_INDEPENDENTLY_CAPTURED"
  and .approval_text == "tak jedeme"
  and .authorized_execution_entry == "M05_SLICE_01_MULTI_CHANNEL_INTAKE_CONTRACTS"
  and .admission_effective_condition == "ADMISSION_PR_MERGED_AND_POST_MERGE_VERIFIED"
  and .m04_reviewed_merge == "d2f04aa2bcc68edf1d20deb345faa8a8c239e23d"
  and .admitted_revision == .m04_reviewed_merge
  and (.blocking_reviews | length == 0)' "$decision" >/dev/null \
  || fail 'machine decision integrity failed'

admitted_revision="$(jq -r '.admitted_revision' "$decision")"
git cat-file -e "${admitted_revision}^{commit}" 2>/dev/null || fail 'reviewed M04 predecessor revision missing'
git merge-base --is-ancestor "$admitted_revision" HEAD || fail 'reviewed M04 predecessor is not in current history'

if git diff --name-only "${admitted_revision}...HEAD" -- packages/core/src | grep -q .; then
  fail 'M05 admission transition must not change production Core source'
fi

if [[ -f docs/planning/m06-admission-decision.json ]]; then
  node scripts/ci/m06-admission.mjs
else
  grep -q 'IMPLEMENTATION BLOCKED' docs/planning/M06_EXECUTION_PACKAGE.md \
    || fail 'M06 requires a valid separate admission decision'
fi

for m in 07 08; do
  grep -q 'IMPLEMENTATION BLOCKED' "docs/planning/M${m}_EXECUTION_PACKAGE.md" \
    || fail "M${m} must remain implementation-blocked"
done

scope_boundary="$(jq -r '.scope_boundary' "$decision")"
[[ "$scope_boundary" == *'transport does not grant trust'* ]] || fail 'transport/trust boundary missing'
[[ "$scope_boundary" == *'OCR/AI confidence is not verification'* ]] || fail 'OCR/AI verification boundary missing'
[[ "$scope_boundary" == *'provider-specific status'* ]] || fail 'provider-specific status boundary missing'
[[ "$scope_boundary" == *'legal eligibility'* ]] || fail 'legal eligibility boundary missing'
[[ "$scope_boundary" == *'AuthorizationGrant'* ]] || fail 'AuthorizationGrant boundary missing'
[[ "$scope_boundary" == *'M06-M08'* ]] || fail 'later-milestone boundary missing'

bash tests/fv09_document_intake_test.sh
bash tests/fv10_verification_test.sh

printf 'M05 ADMISSION: PASS / M04 MERGE VERIFIED / M01 CONTRACTS + FV09/FV10 RUNTIME PRESENT / SLICE 01 CONDITIONALLY AUTHORIZED / M06 SEPARATELY VALIDATED / M07-M08 BLOCKED\n'
