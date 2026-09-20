#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M05 S07 VERIFICATION ROUTES: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

base="7f479f9e5807ab3493b9183a6e1169d48bceda13"
git cat-file -e "${base}^{commit}" 2>/dev/null || fail 'reviewed S06 merge missing'
git merge-base --is-ancestor "$base" HEAD || fail 'S07 does not descend from reviewed S06 merge'

contract=docs/planning/M05_S07_IMPLEMENTATION_CONTRACT.md
index=docs/planning/M05_S07_TEST_INDEX.md
source=packages/application/src/verification/verification-route-registry.ts
public=packages/application/src/verification/index.ts
runtime=packages/application/test/m05-s07-verification-route-registry.test.ts
compile=packages/application/test/m05-s07-types.compile.ts
for f in "$contract" "$index" "$source" "$public" "$runtime" "$compile"; do [[ -f "$f" ]] || fail "missing $f"; done

grep -q 'route availability != authority != route result != evidence verification beyond checked claims != eligibility != authorization' "$contract" || fail 'authority boundary missing'
grep -q 'Provider outage or timeout must be `INDETERMINATE`' "$contract" || fail 'provider outage boundary missing'
grep -q 'Fallback may keep or increase assurance but must never silently lower it' "$contract" || fail 'assurance fallback boundary missing'
grep -q 'S08 owns human-review/manual-authority confirmation' "$contract" || fail 'S08 ownership boundary missing'

test_count="$(grep -Ec "^test\\('M05S07-[0-9]{2}" "$runtime")"
[[ "$test_count" -eq 54 ]] || fail "expected exactly 54 mandatory runtime tests, got $test_count"
index_count="$(grep -Ec '^\| M05S07-[0-9]{2} \|' "$index")"
[[ "$index_count" -eq 54 ]] || fail "expected exactly 54 indexed scenarios, got $index_count"

node --test "$runtime"
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json

scope_tip=HEAD
if [[ -f docs/planning/m07-s01-activation.json ]]; then
  node scripts/ci/m07-admission.mjs
  scope_tip=1c379ba6a488d7a2dea5eb13ed987ebfb5e51b8b
  git merge-base --is-ancestor "$scope_tip" HEAD || fail 'reviewed S07 merge must remain an ancestor of M07 successor'
fi
changed="$(git diff --name-only "$base"... "$scope_tip")"
if grep -E '^packages/core/src/' <<<"$changed" >/dev/null; then fail 'S07 must not change production Core source'; fi
if grep -E '^packages/adapters/src/' <<<"$changed" >/dev/null; then fail 'S07 must not implement concrete provider adapters'; fi

if grep -R -nE "from ['\"](react|react-native|expo|fastify|@?prisma|typeorm|openai|@anthropic-ai|axios|node-fetch|@aws-sdk|@google-cloud|@azure/)" packages/application/src/verification --include='*.ts' >/dev/null; then
  fail 'framework/provider SDK dependency leaked into S07 Application source'
fi
if grep -R -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' packages/application/src/verification --include='*.ts' >/dev/null; then
  fail 'ambient time/randomness detected'
fi
if grep -R -nE 'https?://|api[_-]?key|access[_-]?token|client[_-]?secret|AuthorizationGrant|EligibilityAssessment|RecognitionDecision' packages/application/src/verification --include='*.ts' >/dev/null; then
  fail 'provider secret/protocol or legal authority leaked into S07 source'
fi
if grep -R -nE 'throw .*provider.*(error|response)|rawProvider|providerError' packages/application/src/verification --include='*.ts' >/dev/null; then
  fail 'raw provider errors leaked into Application contract'
fi

grep -q "PROVIDER_UNAVAILABLE.*PROVIDER_TIMEOUT\|PROVIDER_TIMEOUT.*PROVIDER_UNAVAILABLE" "$source" || fail 'outage normalization guard missing'
grep -q 'INSUFFICIENT_VERIFIER_AUTHORITY' "$source" || fail 'authority downgrade guard missing'
grep -q 'CONFLICTING_SUCCESSFUL_ROUTE_ASSERTIONS' "$source" || fail 'conflicting success guard missing'

bash tests/m05_s06_trust_registry_test.sh >/dev/null
bash tests/m05_s05_security_quarantine_test.sh >/dev/null
bash tests/m05_s04_extraction_review_test.sh >/dev/null
bash tests/m05_s03_derived_extraction_test.sh >/dev/null
bash tests/m05_s02_original_archive_test.sh >/dev/null
bash tests/m05_s01_multi_channel_intake_test.sh >/dev/null
bash tests/fv09_document_intake_test.sh >/dev/null
bash tests/fv10_verification_test.sh >/dev/null
bash tests/m05_admission_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'M05 S07 VERIFICATION ROUTES: PASS / 54 TESTS / AUTHORITY-GATED ROUTES / OUTAGE=INDETERMINATE / CLAIM-LEVEL CONFLICT REVIEW / S01-S06+FV09+FV10+ADMISSION GREEN / NO CORE OR ADAPTER DIFF\n'
