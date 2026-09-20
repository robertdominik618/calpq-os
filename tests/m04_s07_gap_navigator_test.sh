#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M04 S07 GAP NAVIGATOR: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION"
  and .milestone == "M04"
  and .admission_transition_id == "CALPQ-M04-ADMIT-0001"' \
  docs/planning/m04-admission-decision.json >/dev/null || fail 'M04 is not formally admitted'

reviewed_s06_merge='3ccc09f8421faa6482506b00320e3c6fd43cd910'
git cat-file -e "${reviewed_s06_merge}^{commit}" 2>/dev/null || fail 'reviewed Slice 06 merge is unavailable'
git merge-base --is-ancestor "$reviewed_s06_merge" HEAD || fail 'Slice 07 does not descend from reviewed Slice 06 merge'

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'

count="$(grep -Ec "^test\\('M04S07-[0-9]{2}" packages/core/test/m04-s07-gap-navigator.test.ts)"
[[ "$count" -eq 48 ]] || fail "expected exactly 48 mandatory M04 S07 runtime tests, got $count"

node --test packages/core/test/m04-s07-gap-navigator.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/core/tsconfig.json

source=packages/core/src/catalog/gap-navigator.ts

if grep -nEi "from ['\"](react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|sequelize|knex|drizzle|openai|@anthropic-ai|aws-sdk|@aws-sdk)" "$source" >/dev/null; then
  fail 'framework/provider/AI dependency leaked into M04 S07 core'
fi

if grep -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' "$source" >/dev/null; then
  fail 'ambient time/randomness leaked into M04 S07 core'
fi

if grep -nE 'EligibilityAssessment\.evaluate|EvidenceReference\.(original|derived)|VerificationState\.from|SourceReference\.create' "$source" >/dev/null; then
  fail 'S07 must consume authoritative eligibility/evidence/source state, not create or promote it'
fi

if grep -nE '\b(AuthorizationGrant|NextBestAction)\b' "$source" >/dev/null; then
  fail 'authorization or downstream next-best-action authority leaked into M04 S07'
fi

grep -q 'class GapNavigatorEvaluation' "$source" || fail 'GapNavigatorEvaluation missing'
grep -q 'ALREADY_SATISFIED' "$source" || fail 'canonical gap states missing'
grep -q 'RECOGNITION_POSSIBLE' "$source" || fail 'recognition-possible state missing'
grep -q 'INFORMATION_MISSING' "$source" || fail 'information-missing state missing'
grep -q 'residualRequirementCount' "$source" || fail 'residual obligation guard missing'
grep -q 'selectedPathId: null' "$source" || fail 'advisory path comparison must not select a winner'

node --test \
  packages/core/test/m04-s06-equivalence-recognition-review.test.ts \
  packages/core/test/m04-s05-catalog-provenance-binding.test.ts \
  packages/core/test/m04-s04-qualification-path.test.ts \
  packages/core/test/m04-s03-requirement-set-versioning.test.ts \
  packages/core/test/m04-s02-credential-requirement-catalog.test.ts \
  packages/core/test/m04-s01-activity-profession-catalog.test.ts \
  packages/core/test/fv03-provenance.test.ts \
  packages/core/test/fv11-eligibility.test.ts >/dev/null
bash tests/m04_admission_test.sh >/dev/null
bash tests/m03_m08_execution_readiness_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'M04 S07 GAP NAVIGATOR: PASS / 48 TESTS / EXACT FV11 INPUTS / RESIDUAL OBLIGATIONS / ROUTE != SATISFACTION / ADVISORY COMPARISON\n'
