#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M05 S04 EXTRACTION REVIEW: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

base="0c61a1adbeec8f2c710b3b3a471fa2073b79f462"
git cat-file -e "${base}^{commit}" 2>/dev/null || fail 'reviewed S03 merge missing'
git merge-base --is-ancestor "$base" HEAD || fail 'S04 does not descend from reviewed S03 merge'

contract=docs/planning/M05_S04_IMPLEMENTATION_CONTRACT.md
index=docs/planning/M05_S04_TEST_INDEX.md
source=packages/application/src/extraction/extraction-review.ts
runtime=packages/application/test/m05-s04-extraction-review.test.ts
compile=packages/application/test/m05-s04-types.compile.ts
for f in "$contract" "$index" "$source" "$runtime" "$compile"; do [[ -f "$f" ]] || fail "missing $f"; done

grep -q 'PROPOSED | USER_CONFIRMED | USER_CORRECTED | REJECTED | HUMAN_REVIEW_REQUIRED' "$contract" || fail 'canonical review-state contract missing'
grep -q 'review/correction != verification != eligibility != recognition != authorization' "$contract" || fail 'authority boundary missing'
grep -q 'does not authorize merge or M05 Slice 05' "$contract" || fail 'S05 sequence boundary missing'

test_count="$(grep -Ec "^test\\('M05S04-[0-9]{2}" "$runtime")"
[[ "$test_count" -eq 48 ]] || fail "expected exactly 48 mandatory runtime tests, got $test_count"
index_count="$(grep -Ec '^\| M05S04-[0-9]{2} \|' "$index")"
[[ "$index_count" -eq 48 ]] || fail "expected exactly 48 indexed scenarios, got $index_count"

node --test "$runtime"
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json

changed="$(git diff --name-only "$base"...HEAD)"
if grep -E '^packages/core/src/' <<<"$changed" >/dev/null; then fail 'S04 must not change production Core source'; fi
if grep -E '^packages/adapters/src/' <<<"$changed" >/dev/null; then fail 'S04 must not change provider adapters'; fi

if grep -R -nE "from ['\"](react|react-native|expo|fastify|@?prisma|typeorm|openai|@anthropic-ai|tesseract|aws-sdk|@aws-sdk|@google-cloud/storage|@azure/storage-blob)" packages/application/src/extraction --include='*.ts' >/dev/null; then
  fail 'framework/provider SDK dependency leaked into extraction source'
fi
if grep -R -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' packages/application/src/extraction --include='*.ts' >/dev/null; then
  fail 'ambient time/randomness detected'
fi
if grep -nE 'VerificationState\.from|orchestrateVerification|EligibilityAssessment|RecognitionDecision|AuthorizationGrant|EvidenceReference\.(original|derived)' "$source" >/dev/null; then
  fail 'verification/evidence creation/later authority leaked into S04 review source'
fi

bash tests/m05_s03_derived_extraction_test.sh >/dev/null
bash tests/m05_s02_original_archive_test.sh >/dev/null
bash tests/m05_s01_multi_channel_intake_test.sh >/dev/null
bash tests/fv09_document_intake_test.sh >/dev/null
bash tests/fv10_verification_test.sh >/dev/null
bash tests/m05_admission_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'M05 S04 EXTRACTION REVIEW: PASS / 48 TESTS / APPEND-ONLY REVISIONS / ORIGINAL+PROPOSAL IMMUTABLE / USER ASSERTION != VERIFICATION / S01-S03+FV09+FV10+ADMISSION GREEN / NO CORE OR ADAPTER DIFF\n'
