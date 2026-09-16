#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M04 S10 INTEGRATION EVIDENCE: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION" and .milestone == "M04" and .admission_transition_id == "CALPQ-M04-ADMIT-0001"' \
  docs/planning/m04-admission-decision.json >/dev/null || fail 'M04 is not formally admitted'

reviewed_s09_merge='160ed37e6e1e7264d1dd9843906c098758dbc7bb'
git cat-file -e "${reviewed_s09_merge}^{commit}" 2>/dev/null || fail 'reviewed Slice 09 merge is unavailable'
git merge-base --is-ancestor "$reviewed_s09_merge" HEAD || fail 'Slice 10 does not descend from reviewed Slice 09 merge'

# S10 is deliberately evidence-only. Any new production Core logic belongs to a
# separately admitted slice/milestone, not to the M04 integration closure.
git diff --quiet "${reviewed_s09_merge}...HEAD" -- packages/core/src \
  || fail 'S10 must not modify production Core source'

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'

count="$(grep -Ec "^test\\('M04S10-[0-9]{2}" packages/core/test/m04-s10-integration-evidence.test.ts)"
[[ "$count" -eq 48 ]] || fail "expected exactly 48 mandatory M04 S10 runtime tests, got $count"

grep -Fq '10. M04 integration evidence against representative target-profession scenarios.' docs/planning/M04_EXECUTION_PACKAGE.md \
  || fail 'Slice 10 execution-package scope is not present'
grep -Fq 'synthetic test fixtures' docs/planning/M04_S10_IMPLEMENTATION_CONTRACT.md \
  || fail 'S10 synthetic/non-legal fixture boundary is not documented'

node --test packages/core/test/m04-s10-integration-evidence.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/core/tsconfig.json

s10_test=packages/core/test/m04-s10-integration-evidence.test.ts
if grep -nEi "from ['\"](react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|sequelize|knex|drizzle|openai|@anthropic-ai|aws-sdk|@aws-sdk)" "$s10_test" >/dev/null; then
  fail 'framework/provider/AI dependency leaked into M04 S10 evidence'
fi
if grep -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' "$s10_test" >/dev/null; then
  fail 'ambient time/randomness leaked into M04 S10 evidence'
fi
if grep -nE '\bAuthorizationGrant\.(create|issue)|\bNextBestAction\.(create|evaluate)|RecognitionDecision\.create' "$s10_test" >/dev/null; then
  fail 'new authorization/NBA/recognition-decision authority leaked into S10 evidence'
fi

# Run each predecessor M04 runtime regression exactly once. Dedicated slice
# workflows continue to own their deeper static/governance gates independently.
node --test \
  packages/core/test/m04-s09-historical-version-replay.test.ts \
  packages/core/test/m04-s08-catalog-query-explainability.test.ts \
  packages/core/test/m04-s07-gap-navigator.test.ts \
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

printf 'M04 S10 INTEGRATION EVIDENCE: PASS / 48 TESTS / S01-S09 COMPOSITION / REPRESENTATIVE SYNTHETIC PROFESSIONS / NO NEW AUTHORITY\n'
