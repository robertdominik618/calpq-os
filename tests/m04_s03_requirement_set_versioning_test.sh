#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M04 S03 REQUIREMENT SET VERSIONING: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION"
  and .milestone == "M04"
  and .admission_transition_id == "CALPQ-M04-ADMIT-0001"' \
  docs/planning/m04-admission-decision.json >/dev/null || fail 'M04 is not formally admitted'

reviewed_s02_merge='a1367a5e5b874ab0a891a5675f30377cff530431'
git cat-file -e "${reviewed_s02_merge}^{commit}" 2>/dev/null || fail 'reviewed Slice 02 merge is unavailable'
git merge-base --is-ancestor "$reviewed_s02_merge" HEAD || fail 'Slice 03 does not descend from reviewed Slice 02 merge'

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'

count="$(grep -Ec "^test\\('M04S03-[0-9]{2}" packages/core/test/m04-s03-requirement-set-versioning.test.ts)"
[[ "$count" -eq 34 ]] || fail "expected exactly 34 mandatory M04 S03 runtime tests, got $count"

node --test packages/core/test/m04-s03-requirement-set-versioning.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/core/tsconfig.json

source=packages/core/src/catalog/requirement-set-versioning.ts

if grep -nEi "from ['\"](react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|sequelize|knex|drizzle|openai|@anthropic-ai|aws-sdk|@aws-sdk)" "$source" >/dev/null; then
  fail 'framework/provider dependency leaked into M04 S03 core'
fi

if grep -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' "$source" >/dev/null; then
  fail 'ambient time/randomness leaked into M04 S03 core'
fi

if grep -nE '\b(QualificationPath|ProvenanceEnvelope|EquivalenceDecision|GapNavigator|AuthorizationGrant|EvidenceSnapshot|CredentialArtifact)\b|EligibilityAssessment\.evaluate' "$source" >/dev/null; then
  fail 'S04+ / evidence / authorization authority leaked into M04 S03'
fi

if grep -nEi '\b(currentVersion|latestVersion|activeVersion|selectLatest|mostRecent)\b' "$source" >/dev/null; then
  fail 'implicit latest/current version preference leaked into M04 S03'
fi

grep -q 'class GovernedRequirementSetVersion' "$source" || fail 'GovernedRequirementSetVersion missing'
grep -q 'AMBIGUOUS_REVIEW_REQUIRED' "$source" || fail 'ambiguity review state missing'
grep -q 'selectRequirementSetVersion' "$source" || fail 'explicit version selector missing'
grep -q 'isEffectiveOn(date: DateOnly, jurisdiction: Jurisdiction)' "$source" || fail 'explicit date+jurisdiction evaluation missing'

bash tests/m04_s02_credential_requirement_catalog_test.sh >/dev/null
bash tests/m04_s01_activity_profession_catalog_test.sh >/dev/null
bash tests/fv11_eligibility_test.sh >/dev/null
bash tests/m04_admission_test.sh >/dev/null
bash tests/m03_m08_execution_readiness_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'M04 S03 REQUIREMENT SET VERSIONING: PASS / 34 TESTS / EXPLICIT DATE+JURISDICTION / AMBIGUITY REVIEW / NO S04+ AUTHORITY\n'
