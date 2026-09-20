#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M05 S06 TRUST REGISTRY: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

base="154bb21d9146daa71757340f20e90064a242923c"
git cat-file -e "${base}^{commit}" 2>/dev/null || fail 'reviewed S05 merge missing'
git merge-base --is-ancestor "$base" HEAD || fail 'S06 does not descend from reviewed S05 merge'

contract=docs/planning/M05_S06_IMPLEMENTATION_CONTRACT.md
index=docs/planning/M05_S06_TEST_INDEX.md
source=packages/application/src/trust/trust-registry.ts
runtime=packages/application/test/m05-s06-trust-registry.test.ts
compile=packages/application/test/m05-s06-types.compile.ts
for f in "$contract" "$index" "$source" "$runtime" "$compile"; do [[ -f "$f" ]] || fail "missing $f"; done

grep -q 'identity != authority != verification route != evidence verification != eligibility != authorization' "$contract" || fail 'authority boundary missing'
grep -q 'Weak signals may produce candidates but \*\*must not independently produce `SAME_SUBJECT`\*\*' "$contract" || fail 'weak-signal boundary missing'
grep -q 'S07 owns route selection/orchestration' "$contract" || fail 'S07 ownership boundary missing'

test_count="$(grep -Ec "^test\\('M05S06-[0-9]{2}" "$runtime")"
[[ "$test_count" -eq 52 ]] || fail "expected exactly 52 mandatory runtime tests, got $test_count"
index_count="$(grep -Ec '^\| M05S06-[0-9]{2} \|' "$index")"
[[ "$index_count" -eq 52 ]] || fail "expected exactly 52 indexed scenarios, got $index_count"

node --test "$runtime"
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json

scope_tip=HEAD
if [[ -f docs/planning/m07-s01-activation.json ]]; then
  node scripts/ci/m07-admission.mjs
  scope_tip=7f479f9e5807ab3493b9183a6e1169d48bceda13
  git merge-base --is-ancestor "$scope_tip" HEAD || fail 'reviewed S06 merge must remain an ancestor of M07 successor'
fi
changed="$(git diff --name-only "${base}...${scope_tip}")"
if grep -E '^packages/core/src/' <<<"$changed" >/dev/null; then fail 'S06 must not change production Core source'; fi
if grep -E '^packages/adapters/src/' <<<"$changed" >/dev/null; then fail 'S06 must not implement concrete provider adapters'; fi

if grep -R -nE "from ['\"](react|react-native|expo|fastify|@?prisma|typeorm|openai|@anthropic-ai|axios|node-fetch|@aws-sdk|@google-cloud|@azure/)" packages/application/src/trust --include='*.ts' >/dev/null; then
  fail 'framework/provider SDK dependency leaked into S06 Application source'
fi
if grep -R -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' packages/application/src/trust --include='*.ts' >/dev/null; then
  fail 'ambient time/randomness detected'
fi
if grep -R -nE 'VerificationProviderPort|VerificationRoute|orchestrateVerification|TechnicalVerificationResult|AuthorizationGrant|EligibilityAssessment|RecognitionDecision' packages/application/src/trust --include='*.ts' >/dev/null; then
  fail 'S07/verification/legal authority leaked into S06 source'
fi

bash tests/m05_s05_security_quarantine_test.sh >/dev/null
bash tests/m05_s04_extraction_review_test.sh >/dev/null
bash tests/m05_s03_derived_extraction_test.sh >/dev/null
bash tests/m05_s02_original_archive_test.sh >/dev/null
bash tests/m05_s01_multi_channel_intake_test.sh >/dev/null
bash tests/fv09_document_intake_test.sh >/dev/null
bash tests/fv10_verification_test.sh >/dev/null
bash tests/m05_admission_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'M05 S06 TRUST REGISTRY: PASS / 52 TESTS / IDENTITY != AUTHORITY / ROLE+SCOPE+JURISDICTION+TIME / HISTORICAL SNAPSHOTS / S01-S05+FV09+FV10+ADMISSION GREEN / NO CORE OR ADAPTER DIFF\n'
