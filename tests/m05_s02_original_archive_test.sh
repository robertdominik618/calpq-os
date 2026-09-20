#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M05 S02 ORIGINAL ARCHIVE: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

base="4251030104521e6f9ae9d88af2b7eae87fa8e9c0"
git cat-file -e "${base}^{commit}" 2>/dev/null || fail 'reviewed S01 merge commit missing'
git merge-base --is-ancestor "$base" HEAD || fail 'S02 does not descend from reviewed S01 merge'

[[ -f docs/planning/m05-admission-decision.json ]] || fail 'M05 admission decision missing'
jq -e '.milestone == "M05"
  and .state == "ADMITTED_FOR_IMPLEMENTATION"
  and .admission_transition_id == "CALPQ-M05-ADMIT-0001"
  and .authorized_execution_entry == "M05_SLICE_01_MULTI_CHANNEL_INTAKE_CONTRACTS"
  and (.blocking_reviews | length == 0)' docs/planning/m05-admission-decision.json >/dev/null \
  || fail 'M05 admission decision integrity failed'

contract=docs/planning/M05_S02_IMPLEMENTATION_CONTRACT.md
index=docs/planning/M05_S02_TEST_INDEX.md
source=packages/application/src/archive/original-document-archive.ts
runtime=packages/application/test/m05-s02-original-archive.test.ts
compile=packages/application/test/m05-s02-types.compile.ts

for f in "$contract" "$index" "$source" "$runtime" "$compile"; do [[ -f "$f" ]] || fail "missing $f"; done

grep -q 'hash equality' "$contract" || fail 'hash-equality non-authority boundary missing'
grep -q 'REPLACES | SUPPLEMENTS | DUPLICATES | RELATED_TO' "$contract" || fail 'archive relationship contract missing'
grep -q 'does not authorize merge or S03' "$contract" || fail 'S03 sequence boundary missing'

test_count="$(grep -Ec "^test\\('M05S02-[0-9]{2}" "$runtime")"
[[ "$test_count" -eq 42 ]] || fail "expected exactly 42 mandatory runtime tests, got $test_count"
index_count="$(grep -Ec '^\| M05S02-[0-9]{2} \|' "$index")"
[[ "$index_count" -eq 42 ]] || fail "expected exactly 42 indexed runtime scenarios, got $index_count"

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required'
node --test "$runtime"
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json

changed="$(git diff --name-only "$base"...HEAD)"
if grep -E '^packages/core/src/' <<<"$changed" >/dev/null; then
  fail 'S02 must not change production Core source'
fi
if grep -E '^packages/adapters/src/' <<<"$changed" >/dev/null; then
  fail 'S02 must not implement provider/storage adapters'
fi

if grep -R -nE "from ['\"](react|react-native|expo|fastify|@?prisma|typeorm|openai|@anthropic-ai|tesseract|aws-sdk|@aws-sdk|@google-cloud/storage|@azure/storage-blob)" \
  packages/application/src/archive --include='*.ts' >/dev/null; then
  fail 'framework/provider SDK dependency leaked into S02 archive source'
fi

if grep -R -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' \
  packages/application/src/archive --include='*.ts' >/dev/null; then
  fail 'ambient time/randomness detected in S02 archive source'
fi

if grep -R -nE '\b(EligibilityAssessment|RecognitionDecision|AuthorizationGrant)\b|EvidenceReference\.derived\s*\(|VerificationState\.from\s*\(' \
  packages/application/src/archive --include='*.ts' >/dev/null; then
  fail 'later authority or verification-promotion capability leaked into S02 archive source'
fi

if grep -R -nE '\b(OCR_TEXT|AI_SUMMARY|NORMALIZED_FIELDS|EXTRACTED_METADATA)\b' \
  packages/application/src/archive --include='*.ts' >/dev/null; then
  fail 'derived/extraction S03 vocabulary leaked into S02 archive source'
fi

bash tests/m05_s01_multi_channel_intake_test.sh >/dev/null
bash tests/fv09_document_intake_test.sh >/dev/null
bash tests/fv10_verification_test.sh >/dev/null
bash tests/m05_admission_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'M05 S02 ORIGINAL ARCHIVE: PASS / 42 TESTS / IMMUTABLE ORIGINAL / SHA-256 CONTENT ADDRESS / BYTE IDENTITY != TRUST / S01+FV09+FV10+ADMISSION GREEN / NO CORE OR ADAPTER DIFF\n'
