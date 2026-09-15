#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M04 S01 ACTIVITY PROFESSION CATALOG: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION"
  and .milestone == "M04"
  and .admission_transition_id == "CALPQ-M04-ADMIT-0001"
  and .authorized_execution_entry == "M04_SLICE_01_ACTIVITY_PROFESSION_CATALOG_MODEL"' \
  docs/planning/m04-admission-decision.json >/dev/null || fail 'M04 is not formally admitted for Slice 01'

reviewed_m04_admission_merge='d1251424127904a8a1ac0b8ad28cee91558408a5'
git cat-file -e "${reviewed_m04_admission_merge}^{commit}" 2>/dev/null || fail 'reviewed M04 admission merge is unavailable'
git merge-base --is-ancestor "$reviewed_m04_admission_merge" HEAD || fail 'Slice 01 does not descend from reviewed M04 admission merge'

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'

count="$(grep -Ec "^test\\('M04S01-[0-9]{2}" packages/core/test/m04-s01-activity-profession-catalog.test.ts)"
[[ "$count" -eq 32 ]] || fail "expected exactly 32 mandatory M04 S01 runtime tests, got $count"

node --test packages/core/test/m04-s01-activity-profession-catalog.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/core/tsconfig.json

if grep -R -nEi "from ['\"](react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|sequelize|knex|drizzle|openai|@anthropic-ai|aws-sdk|@aws-sdk)" \
  packages/core/src/catalog --include='*.ts' >/dev/null; then
  fail 'framework/provider dependency leaked into M04 catalog core'
fi

if grep -R -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' \
  packages/core/src/catalog --include='*.ts' >/dev/null; then
  fail 'ambient time/randomness leaked into M04 catalog core'
fi

if grep -R -nE '\b(AuthorizationGrant|CredentialDefinitionReference|RequirementSet|EligibilityAssessment|QualificationPath|ProvenanceEnvelope)\b' \
  packages/core/src/catalog --include='*.ts' >/dev/null; then
  fail 'later-slice or authorization authority leaked into M04 S01'
fi

if grep -R -nE "from ['\"]\.\./provenance/" packages/core/src/catalog --include='*.ts' >/dev/null; then
  fail 'full provenance binding leaked into M04 S01 before Slice 05'
fi

grep -R -q 'ActivityDefinition' packages/core/src/catalog --include='*.ts' || fail 'ActivityDefinition missing'
grep -R -q 'ProfessionDefinition' packages/core/src/catalog --include='*.ts' || fail 'ProfessionDefinition missing'
grep -R -q 'UNKNOWN_REVIEW_REQUIRED' packages/core/src/catalog --include='*.ts' || fail 'review-required regulatory status missing'
grep -R -q 'CANDIDATE' packages/core/src/catalog --include='*.ts' || fail 'candidate external mapping semantics missing'
grep -R -q 'isEffectiveOn(date: DateOnly)' packages/core/src/catalog --include='*.ts' || fail 'explicit-date effective-period evaluation missing'

bash tests/fv01_core_primitives_test.sh >/dev/null
bash tests/fv03_core_provenance_test.sh >/dev/null
bash tests/fv11_eligibility_test.sh >/dev/null
bash tests/m04_admission_test.sh >/dev/null
bash tests/m03_m08_execution_readiness_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'M04 S01 ACTIVITY PROFESSION CATALOG: PASS / 32 TESTS / DISTINCT IDS / VERSIONED EFFECTIVE NODES / EXTERNAL IDS NON-PRIMARY / NO LATER-SLICE AUTHORITY\n'
