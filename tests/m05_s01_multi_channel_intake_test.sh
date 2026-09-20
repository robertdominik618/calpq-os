#!/usr/bin/env bash
set -euo pipefail
fail(){ printf 'M05 S01 MULTI-CHANNEL INTAKE: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

base="b7a5080394c3c285fdd90ce4a3bc458b0d8afd91"
git cat-file -e "${base}^{commit}" 2>/dev/null || fail 'reviewed M05 admission merge is missing'
git merge-base --is-ancestor "$base" HEAD || fail 'S01 does not descend from reviewed M05 admission merge'

for f in \
  docs/planning/M05_ADMISSION_RECORD.md \
  docs/planning/m05-admission-decision.json \
  docs/planning/M05_EXECUTION_PACKAGE.md \
  docs/planning/M05_S01_IMPLEMENTATION_CONTRACT.md \
  docs/planning/M05_S01_TEST_INDEX.md \
  packages/application/src/intake/index.ts \
  packages/application/src/intake/multi-channel-intake.ts \
  packages/application/test/m05-s01-multi-channel-intake.test.ts \
  packages/application/test/m05-s01-types.compile.ts; do
  [[ -f "$f" ]] || fail "missing $f"
done

jq -e '.milestone == "M05"
  and .state == "ADMITTED_FOR_IMPLEMENTATION"
  and .authorized_execution_entry == "M05_SLICE_01_MULTI_CHANNEL_INTAKE_CONTRACTS"
  and .m04_reviewed_merge == "d2f04aa2bcc68edf1d20deb345faa8a8c239e23d"
  and (.blocking_reviews | length == 0)' docs/planning/m05-admission-decision.json >/dev/null \
  || fail 'M05 admission decision does not authorize Slice 01'

test_count="$(grep -Ec "^test\\('M05S01-[0-9]{2}" packages/application/test/m05-s01-multi-channel-intake.test.ts)"
[[ "$test_count" -eq 40 ]] || fail "expected exactly 40 mandatory runtime tests, got $test_count"

grep -q '40 MANDATORY RUNTIME SCENARIOS' docs/planning/M05_S01_TEST_INDEX.md \
  || fail '40-scenario test index marker missing'
grep -q 'transport-normalization contract' docs/planning/M05_S01_IMPLEMENTATION_CONTRACT.md \
  || fail 'implementation purpose marker missing'
grep -q 'transport value answers only' docs/planning/M05_S01_IMPLEMENTATION_CONTRACT.md \
  || fail 'transport-not-trust boundary missing'
grep -q 'discards any extra provider payload/status/confidence fields' docs/planning/M05_S01_IMPLEMENTATION_CONTRACT.md \
  || fail 'provider sanitization boundary missing'
grep -q '"./intake": "./src/intake/index.ts"' packages/application/package.json \
  || fail 'public intake package subpath missing'
grep -q 'MultiChannelIntakeSubmission' packages/application/src/intake/index.ts \
  || fail 'public intake barrel does not expose S01 model'

source_file=packages/application/src/intake/multi-channel-intake.ts
for required in CAMERA SCAN FILE_UPLOAD EMAIL_ATTACHMENT SHARE_SHEET URL PROVIDER_ADAPTER; do
  grep -q "$required" "$source_file" || fail "missing transport channel $required"
done
grep -q 'IntakeSourceChannel.API' "$source_file" || fail 'provider-to-generic-API normalization missing'
grep -q 'class MultiChannelIntakeSubmission' "$source_file" || fail 'normalized submission model missing'
grep -q 'class IntakeChannelProvenance' "$source_file" || fail 'channel provenance model missing'
grep -q 'interface IntakeProviderAdapterPort' "$source_file" || fail 'provider-neutral adapter port missing'
grep -q 'normalizeProviderIntakeProvenance' "$source_file" || fail 'provider provenance normalizer missing'

if git diff --name-only "$base"...HEAD | grep -q '^packages/core/src/'; then
  fail 'Slice 01 must not modify production Core'
fi
if git diff --name-only "$base"...HEAD | grep -q '^packages/adapters/src/'; then
  fail 'Slice 01 is a provider-neutral contract slice and must not add provider implementation code'
fi

if grep -nE "from ['\"](react|react-native|expo|fastify|@?prisma|typeorm|openai|@anthropic-ai|tesseract|aws-sdk|@aws-sdk)" "$source_file" >/dev/null; then
  fail 'framework/provider SDK leaked into S01 application contract'
fi
if grep -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' "$source_file" >/dev/null; then
  fail 'ambient time/randomness detected in S01 source'
fi
if grep -nE '\b(EligibilityAssessment|RecognitionDecision|AuthorizationGrant)\b' "$source_file" >/dev/null; then
  fail 'legal/eligibility/authorization capability leaked into S01 source'
fi
if grep -nE 'VerificationState\.from|VerificationStateCode\.VERIFIED' "$source_file" >/dev/null; then
  fail 'verification promotion leaked into S01 source'
fi

node --test packages/application/test/m05-s01-multi-channel-intake.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json

bash tests/fv09_document_intake_test.sh >/dev/null
bash tests/fv10_verification_test.sh >/dev/null
bash tests/m05_admission_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'M05 S01 MULTI-CHANNEL INTAKE: PASS / 40 TESTS / PROVIDER-NEUTRAL TRANSPORT / FV09+FV10+M05 ADMISSION GREEN / NO CORE DIFF\n'
