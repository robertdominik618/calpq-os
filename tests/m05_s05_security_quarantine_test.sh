#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M05 S05 SECURITY QUARANTINE: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

base="70b67617d0fad3d19c4cb9fc6b34f9daa8988dd7"
git cat-file -e "${base}^{commit}" 2>/dev/null || fail 'reviewed S04 merge missing'
git merge-base --is-ancestor "$base" HEAD || fail 'S05 does not descend from reviewed S04 merge'

contract=docs/planning/M05_S05_IMPLEMENTATION_CONTRACT.md
index=docs/planning/M05_S05_TEST_INDEX.md
source=packages/application/src/security/intake-security-quarantine.ts
runtime=packages/application/test/m05-s05-security-quarantine.test.ts
compile=packages/application/test/m05-s05-types.compile.ts
for f in "$contract" "$index" "$source" "$runtime" "$compile"; do [[ -f "$f" ]] || fail "missing $f"; done

grep -q 'technical processing safety != evidence verification != issuer trust != eligibility != authorization' "$contract" || fail 'authority boundary missing'
grep -q 'QUARANTINED > HUMAN_REVIEW_REQUIRED > PROCESSING_ALLOWED' "$contract" || fail 'fail-closed priority missing'
grep -q 'Concrete scanners, malware engines, OCR/AI systems and cloud provider SDKs remain outside Application/Core' "$contract" || fail 'provider-neutral scanner boundary missing'

test_count="$(grep -Ec "^test\\('M05S05-[0-9]{2}" "$runtime")"
[[ "$test_count" -eq 50 ]] || fail "expected exactly 50 mandatory runtime tests, got $test_count"
index_count="$(grep -Ec '^\| M05S05-[0-9]{2} \|' "$index")"
[[ "$index_count" -eq 50 ]] || fail "expected exactly 50 indexed scenarios, got $index_count"

node --test "$runtime"
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json

changed="$(git diff --name-only "$base"...HEAD)"
if grep -E '^packages/core/src/' <<<"$changed" >/dev/null; then fail 'S05 must not change production Core source'; fi
if grep -E '^packages/adapters/src/' <<<"$changed" >/dev/null; then fail 'S05 must not implement concrete provider adapters'; fi

if grep -R -nE "from ['\"](react|react-native|expo|fastify|@?prisma|typeorm|openai|@anthropic-ai|tesseract|clamav|aws-sdk|@aws-sdk|@google-cloud|@azure/)" packages/application/src/security --include='*.ts' >/dev/null; then
  fail 'framework/scanner/provider SDK dependency leaked into S05 Application source'
fi
if grep -R -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' packages/application/src/security --include='*.ts' >/dev/null; then
  fail 'ambient time/randomness detected'
fi
if grep -nE 'VerificationState\.from|EvidenceReference\.(original|derived)|AuthorizationGrant|EligibilityAssessment|RecognitionDecision|TrustEntity|TrustRegistry|orchestrateVerification' "$source" >/dev/null; then
  fail 'trust/verification/later authority leaked into S05 source'
fi
if grep -nE 'documentBody|extractedSecret|rawContent|instructionText|toolCall|executeInstruction' "$source" >/dev/null; then
  fail 'raw sensitive content or executable instruction field leaked into S05 security records'
fi

bash tests/m05_s04_extraction_review_test.sh >/dev/null
bash tests/m05_s03_derived_extraction_test.sh >/dev/null
bash tests/m05_s02_original_archive_test.sh >/dev/null
bash tests/m05_s01_multi_channel_intake_test.sh >/dev/null
bash tests/fv09_document_intake_test.sh >/dev/null
bash tests/fv10_verification_test.sh >/dev/null
bash tests/m05_admission_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'M05 S05 SECURITY QUARANTINE: PASS / 50 TESTS / FAIL-CLOSED QUARANTINE+REVIEW / TECHNICAL SAFETY != VERIFICATION / ORIGINAL IMMUTABLE / S01-S04+FV09+FV10+ADMISSION GREEN / NO CORE OR ADAPTER DIFF\n'
