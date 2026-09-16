#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M04 S08 EXPLAINABILITY: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION"
  and .milestone == "M04"
  and .admission_transition_id == "CALPQ-M04-ADMIT-0001"' \
  docs/planning/m04-admission-decision.json >/dev/null || fail 'M04 is not formally admitted'

reviewed_s07_merge='944084ae05f3c40ec578bc43ee4b392349b8dbda'
git cat-file -e "${reviewed_s07_merge}^{commit}" 2>/dev/null || fail 'reviewed Slice 07 merge is unavailable'
git merge-base --is-ancestor "$reviewed_s07_merge" HEAD || fail 'Slice 08 does not descend from reviewed Slice 07 merge'

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'

count="$(grep -Ec "^test\\('M04S08-[0-9]{2}" packages/core/test/m04-s08-catalog-query-explainability.test.ts)"
[[ "$count" -eq 48 ]] || fail "expected exactly 48 mandatory M04 S08 runtime tests, got $count"

node --test packages/core/test/m04-s08-catalog-query-explainability.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/core/tsconfig.json

source=packages/core/src/catalog/catalog-query-explainability.ts

if grep -nEi "from ['\"](react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|sequelize|knex|drizzle|openai|@anthropic-ai|aws-sdk|@aws-sdk)" "$source" >/dev/null; then
  fail 'framework/provider/AI dependency leaked into M04 S08 core'
fi

if grep -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' "$source" >/dev/null; then
  fail 'ambient time/randomness leaked into M04 S08 core'
fi

if grep -nE 'EligibilityAssessment\.evaluate|EvidenceReference\.(original|derived)|VerificationState\.from|SourceReference\.create|RecognitionDecision\.create|EquivalenceRule\.create|RecognitionRoute\.create' "$source" >/dev/null; then
  fail 'S08 must explain governed results, not create/evaluate/promote authority'
fi

if grep -nE '\b(AuthorizationGrant|NextBestAction|selectedPathId)\b' "$source" >/dev/null; then
  fail 'authorization/NBA/path-selection authority leaked into M04 S08'
fi

grep -q 'class CatalogQueryExplanationGraph' "$source" || fail 'CatalogQueryExplanationGraph missing'
grep -q 'EXPLAINED' "$source" || fail 'EXPLAINED classification missing'
grep -q 'INDETERMINATE' "$source" || fail 'INDETERMINATE classification missing'
grep -q 'REVIEW_REQUIRED' "$source" || fail 'REVIEW_REQUIRED classification missing'
grep -q 'SUPPORTED_BY_SOURCE' "$source" || fail 'source linkage edge missing'
grep -q 'SUPPORTED_BY_RULE' "$source" || fail 'rule linkage edge missing'
grep -q 'SUPPORTED_BY_EVIDENCE' "$source" || fail 'evidence linkage edge missing'
grep -q 'HAS_RESIDUAL_REQUIREMENT' "$source" || fail 'residual-requirement linkage missing'

node --test \
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

printf 'M04 S08 EXPLAINABILITY: PASS / 48 TESTS / STRUCTURED GRAPH / FAIL-CLOSED SOURCES / S07 STATE IMMUTABLE / NO NEW AUTHORITY\n'
