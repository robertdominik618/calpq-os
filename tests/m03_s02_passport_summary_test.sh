#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M03 S02 PASSPORT SUMMARY: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION"' docs/planning/m03-admission-decision.json >/dev/null \
  || fail 'M03 is not formally admitted'

reviewed_predecessor='0f25c2637e774dede94749019cfe3f3231610c40'
git cat-file -e "${reviewed_predecessor}^{commit}" 2>/dev/null \
  || fail 'reviewed Slice 01 merge commit is unavailable in checkout history'
git merge-base --is-ancestor "$reviewed_predecessor" HEAD \
  || fail 'Slice 02 must descend from reviewed Slice 01 merge result'

[[ -f docs/planning/M03_S01_EXIT_EVIDENCE.md ]] || fail 'Slice 01 durable exit evidence missing'
grep -q 'EXIT EVIDENCE GREEN' docs/planning/M03_S01_EXIT_EVIDENCE.md \
  || fail 'Slice 01 exit evidence is not green'

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'

count="$(grep -Ec "^test\\('M03S02-[0-9]{2}" packages/application/test/m03-s02-passport-summary.test.ts)"
[[ "$count" -eq 22 ]] || fail "expected exactly 22 mandatory M03 S02 runtime tests, got $count"

node --test packages/application/test/m03-s02-passport-summary.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json

scope=(
  packages/application/src/passport/professional-passport-summary.ts
  packages/application/src/passport/passport-read-metrics.ts
)

if grep -nE "from ['\"](react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|openai|@anthropic-ai|aws-sdk|@aws-sdk)" "${scope[@]}" >/dev/null; then
  fail 'framework/provider dependency leaked into Passport summary'
fi

if grep -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' "${scope[@]}" >/dev/null; then
  fail 'ambient time/randomness leaked into Passport summary'
fi

if grep -nE '\b(AuthorizationGrant|EligibilityAssessment|VerificationRecord|QualificationPath|isValid|valid|current|latest)\b' "${scope[@]}" >/dev/null; then
  fail 'authoritative/catalog/collapsed-current semantics leaked into Passport summary'
fi

grep -q 'ProfessionalPassportProjection' packages/application/src/passport/professional-passport-summary.ts \
  || fail 'Passport summary does not bind to governed ProfessionalPassportProjection'
grep -q 'credentialDefinitionId' packages/application/src/passport/professional-passport-summary.ts \
  || fail 'credential grouping identity is missing'

bash tests/m03_s01_dashboard_read_models_test.sh >/dev/null
bash tests/fv12_professional_passport_test.sh >/dev/null
bash tests/m03_admission_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'M03 S02 PASSPORT SUMMARY: PASS / 22 TESTS / REVIEWED S01 BASE / VERSION-PRESERVING GROUPING / NO CURRENT-VALID INFERENCE\n'
