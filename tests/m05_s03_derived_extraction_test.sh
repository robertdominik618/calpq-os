#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M05 S03 DERIVED EXTRACTION: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

base="ba68cdb04faa7a4cfcbfbea2e247d0271c532f05"
git cat-file -e "${base}^{commit}" 2>/dev/null || fail 'reviewed S02 merge commit missing'
git merge-base --is-ancestor "$base" HEAD || fail 'S03 does not descend from reviewed S02 merge'

[[ -f docs/planning/m05-admission-decision.json ]] || fail 'M05 admission decision missing'
jq -e '.milestone == "M05"
  and .state == "ADMITTED_FOR_IMPLEMENTATION"
  and .admission_transition_id == "CALPQ-M05-ADMIT-0001"
  and .authorized_execution_entry == "M05_SLICE_01_MULTI_CHANNEL_INTAKE_CONTRACTS"
  and (.blocking_reviews | length == 0)' docs/planning/m05-admission-decision.json >/dev/null \
  || fail 'M05 admission decision integrity failed'

contract=docs/planning/M05_S03_IMPLEMENTATION_CONTRACT.md
index=docs/planning/M05_S03_TEST_INDEX.md
source=packages/application/src/extraction/derived-extraction-proposal.ts
barrel=packages/application/src/extraction/index.ts
runtime=packages/application/test/m05-s03-derived-extraction.test.ts
compile=packages/application/test/m05-s03-types.compile.ts

for f in "$contract" "$index" "$source" "$barrel" "$runtime" "$compile"; do
  [[ -f "$f" ]] || fail "missing $f"
done

grep -q 'Proposal ≠ correction ≠ verified fact ≠ eligibility ≠ authorization' "$contract" \
  || fail 'authority-separation invariant missing'
grep -q 'every lineage MUST resolve to one exact S02 original archive entry' "$contract" \
  || fail 'root-lineage invariant missing'
grep -q 'does not authorize merge or M05 Slice 04' "$contract" \
  || fail 'S04 sequence boundary missing'

test_count="$(grep -Ec "^test\\('M05S03-[0-9]{2}" "$runtime")"
[[ "$test_count" -eq 46 ]] || fail "expected exactly 46 mandatory runtime tests, got $test_count"
index_count="$(grep -Ec '^\| M05S03-[0-9]{2} \|' "$index")"
[[ "$index_count" -eq 46 ]] || fail "expected exactly 46 indexed runtime scenarios, got $index_count"

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required'
node --test "$runtime"
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json

changed="$(git diff --name-only "$base"...HEAD)"
if grep -E '^packages/core/src/' <<<"$changed" >/dev/null; then
  fail 'S03 must not change production Core source'
fi
if grep -E '^packages/adapters/src/' <<<"$changed" >/dev/null; then
  fail 'S03 must not implement provider adapters'
fi

if grep -R -nE "from ['\"](react|react-native|expo|fastify|@?prisma|typeorm|openai|@anthropic-ai|tesseract|aws-sdk|@aws-sdk|@google-cloud/storage|@azure/storage-blob)" \
  packages/application/src/extraction --include='*.ts' >/dev/null; then
  fail 'framework/provider SDK dependency leaked into S03 extraction source'
fi

if grep -R -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' \
  packages/application/src/extraction --include='*.ts' >/dev/null; then
  fail 'ambient time/randomness detected in S03 extraction source'
fi

if grep -R -nE '\b(EligibilityAssessment|RecognitionDecision|AuthorizationGrant|IntakeCorrectionRecord|VerificationProviderPort|TrustRegistry|Quarantine)\b|EvidenceReference\.derived\s*\(|VerificationState\.from\s*\(|orchestrateVerification\s*\(' \
  packages/application/src/extraction --include='*.ts' >/dev/null; then
  fail 'later-slice authority, verification execution or evidence construction leaked into S03 extraction source'
fi

grep -q '"./extraction": "./src/extraction/index.ts"' packages/application/package.json \
  || fail 'public extraction package surface missing'
grep -q '"test:m05s03": "node --test test/m05-s03-derived-extraction.test.ts"' packages/application/package.json \
  || fail 'S03 package test script missing'
grep -q '"test/m05-s03-types.compile.ts"' packages/application/tsconfig.json \
  || fail 'S03 compile proof not included in TypeScript project'

bash tests/m05_s02_original_archive_test.sh >/dev/null
bash tests/m05_s01_multi_channel_intake_test.sh >/dev/null
bash tests/fv09_document_intake_test.sh >/dev/null
bash tests/fv10_verification_test.sh >/dev/null
bash tests/m05_admission_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'M05 S03 DERIVED EXTRACTION: PASS / 46 TESTS / EXACT PARENT LINEAGE / IMMUTABLE ROOT / CONFIDENCE != VERIFICATION / S01+S02+FV09+FV10+ADMISSION GREEN / NO CORE OR ADAPTER DIFF\n'
