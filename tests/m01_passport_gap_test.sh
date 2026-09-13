#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'M01 PASSPORT GAP: %s\n' "$1" >&2; exit 1; }

required=(
  docs/contracts/SUBJECT_PROFILE_PROFESSIONAL_PASSPORT.md
  docs/contracts/PASSPORT_EVIDENCE_PROJECTION.md
  docs/contracts/GAP_NAVIGATOR_MODEL.md
  docs/contracts/NEXT_BEST_ACTION_MODEL.md
  docs/contracts/PASSPORT_LIFECYCLE_RENEWAL_PROJECTION.md
  docs/contracts/PASSPORT_SELECTIVE_SHARING.md
  docs/prep/M01_PASSPORT_GAP_NAVIGATOR_BASELINE.md
  docs/prep/M01_PASSPORT_GAP_TEST_MATRIX.md
  docs/contracts/DOCUMENT_INTAKE_MODEL.md
  docs/contracts/ORIGINAL_DOCUMENT_ARCHIVE_MODEL.md
  docs/contracts/EXTRACTION_PROPOSAL_REVIEW_MODEL.md
  docs/contracts/DOCUMENT_VERIFICATION_BOUNDARY.md
  docs/contracts/CREDENTIAL_ARCHIVE_LINKING_MODEL.md
  docs/contracts/DOCUMENT_INTAKE_SECURITY_PRIVACY_MODEL.md
  docs/prep/M01_DOCUMENT_INTAKE_BASELINE.md
  docs/prep/M01_DOCUMENT_INTAKE_TEST_MATRIX.md
  docs/contracts/SUBJECT_IDENTITY_MODEL.md
  docs/contracts/ENTITY_RESOLUTION_MODEL.md
  docs/contracts/REGISTRY_LINKING_MODEL.md
  docs/contracts/ACCOUNT_SUBJECT_BINDING_MODEL.md
  docs/contracts/IDENTITY_MERGE_SPLIT_GOVERNANCE.md
  docs/prep/M01_SUBJECT_IDENTITY_BASELINE.md
  docs/prep/M01_SUBJECT_IDENTITY_TEST_MATRIX.md
)

for file in "${required[@]}"; do
  [[ -f "$file" ]] || fail "missing artifact: $file"
  grep -q 'PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION' "$file" || fail "missing pre-M01 boundary: $file"
done

grep -q 'document status' docs/contracts/SUBJECT_PROFILE_PROFESSIONAL_PASSPORT.md || fail 'state separation missing'
grep -q 'No projection may upgrade' docs/contracts/PASSPORT_EVIDENCE_PROJECTION.md || fail 'evidence non-escalation missing'
grep -q 'ACTION_REQUIRED' docs/contracts/GAP_NAVIGATOR_MODEL.md || fail 'gap result missing'
grep -q 'bypass a mandatory prerequisite' docs/contracts/NEXT_BEST_ACTION_MODEL.md || fail 'next-action hard constraint missing'
grep -q 'Passing a date alone MUST NOT fabricate an authority event' docs/contracts/PASSPORT_LIFECYCLE_RENEWAL_PROJECTION.md || fail 'time boundary missing'
grep -q 'minimum necessary disclosure' docs/contracts/PASSPORT_SELECTIVE_SHARING.md || fail 'selective disclosure rule missing'

grep -q 'MUST NOT directly create' docs/contracts/DOCUMENT_INTAKE_MODEL.md || fail 'intake authority boundary missing'
grep -q 'MUST NOT be overwritten' docs/contracts/ORIGINAL_DOCUMENT_ARCHIVE_MODEL.md || fail 'original immutability missing'
grep -q 'never authoritative facts' docs/contracts/EXTRACTION_PROPOSAL_REVIEW_MODEL.md || fail 'extraction proposal boundary missing'
grep -q 'UNVERIFIED | VERIFIED | FAILED | STALE | REVIEW_REQUIRED | NOT_APPLICABLE' docs/contracts/DOCUMENT_VERIFICATION_BOUNDARY.md || fail 'verification states missing'
grep -q 'archive is not the legal source of truth' docs/contracts/CREDENTIAL_ARCHIVE_LINKING_MODEL.md || fail 'archive authority boundary missing'
grep -q 'minimum-necessary data exposure' docs/contracts/DOCUMENT_INTAKE_SECURITY_PRIVACY_MODEL.md || fail 'privacy minimization missing'
grep -q 'verified document or signature does not automatically equal' docs/prep/M01_DOCUMENT_INTAKE_BASELINE.md || fail 'verification/grant separation missing'

grep -q 'A login account, wallet unit, registry record or credential artifact is never itself the canonical subject' docs/contracts/SUBJECT_IDENTITY_MODEL.md || fail 'canonical subject boundary missing'
grep -q 'POSSIBLE_MATCH' docs/contracts/ENTITY_RESOLUTION_MODEL.md || fail 'resolution uncertainty state missing'
grep -q 'Only `VERIFIED` links may be used as authoritative identity evidence' docs/contracts/REGISTRY_LINKING_MODEL.md || fail 'registry verification boundary missing'
grep -q 'successful login proves control of an account' docs/contracts/ACCOUNT_SUBJECT_BINDING_MODEL.md || fail 'authentication identity boundary missing'
grep -q 'MUST NOT be silently transferred' docs/contracts/IDENTITY_MERGE_SPLIT_GOVERNANCE.md || fail 'merge grant-transfer boundary missing'
grep -q 'AI/OCR may propose matches but cannot independently approve' docs/prep/M01_SUBJECT_IDENTITY_BASELINE.md || fail 'AI merge boundary missing'
grep -q 'NOT_ADMITTED_FOR_IMPLEMENTATION' docs/prep/M01_SUBJECT_IDENTITY_TEST_MATRIX.md || fail 'subject identity admission boundary missing'

grep -q '"m00_release_status": "BLOCKED"' foundation/manifest.json || fail 'M00 unexpectedly released'
grep -q '"feature_development": "FROZEN"' foundation/manifest.json || fail 'feature development unexpectedly enabled'

printf 'M01 SUBJECT IDENTITY: PASS\n'
printf 'M01 DOCUMENT INTAKE: PASS\n'
printf 'M01 PASSPORT GAP: PASS\n'
