#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M04 S04 QUALIFICATION PATH: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION"
  and .milestone == "M04"
  and .admission_transition_id == "CALPQ-M04-ADMIT-0001"' \
  docs/planning/m04-admission-decision.json >/dev/null || fail 'M04 is not formally admitted'

reviewed_s03_merge='62be074297dad3beca1cf53794fdca63c6ba8853'
git cat-file -e "${reviewed_s03_merge}^{commit}" 2>/dev/null || fail 'reviewed Slice 03 merge is unavailable'
git merge-base --is-ancestor "$reviewed_s03_merge" HEAD || fail 'Slice 04 does not descend from reviewed Slice 03 merge'

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'

count="$(grep -Ec "^test\\('M04S04-[0-9]{2}" packages/core/test/m04-s04-qualification-path.test.ts)"
[[ "$count" -eq 44 ]] || fail "expected exactly 44 mandatory M04 S04 runtime tests, got $count"

node --test packages/core/test/m04-s04-qualification-path.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/core/tsconfig.json

source=packages/core/src/catalog/qualification-path.ts

if grep -nEi "from ['\"](react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|sequelize|knex|drizzle|openai|@anthropic-ai|aws-sdk|@aws-sdk)" "$source" >/dev/null; then
  fail 'framework/provider dependency leaked into M04 S04 core'
fi

if grep -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' "$source" >/dev/null; then
  fail 'ambient time/randomness leaked into M04 S04 core'
fi

if grep -nE '\b(ProvenanceEnvelope|SourceReference|EquivalenceDecision|GapNavigator|AuthorizationGrant|EvidenceSnapshot|CredentialArtifact|SubjectReference)\b|EligibilityAssessment\.evaluate' "$source" >/dev/null; then
  fail 'S05+ / subject-evidence / authorization authority leaked into M04 S04'
fi

if grep -nEi '\b(llm|embedding|semanticSimilarity|fuzzySearch|shortestPath|lowestCost|highestConfidence|recommendedPath)\b' "$source" >/dev/null; then
  fail 'AI or hidden path ranking authority leaked into M04 S04'
fi

grep -q 'class QualificationPathDefinition' "$source" || fail 'QualificationPathDefinition missing'
grep -q 'class QualificationPathStep' "$source" || fail 'QualificationPathStep missing'
grep -q 'MULTIPLE_APPLICABLE' "$source" || fail 'multiple applicable state missing'
grep -q 'AMBIGUOUS_REVIEW_REQUIRED' "$source" || fail 'ambiguity review state missing'
grep -q 'selectQualificationPath' "$source" || fail 'explicit path selector missing'
grep -q 'isEffectiveOn(date: DateOnly, jurisdiction: Jurisdiction)' "$source" || fail 'explicit date+jurisdiction evaluation missing'

# Direct runtime regressions once here; independent workflows still execute their full gates.
node --test packages/core/test/m04-s03-requirement-set-versioning.test.ts >/dev/null
node --test packages/core/test/m04-s02-credential-requirement-catalog.test.ts >/dev/null
node --test packages/core/test/m04-s01-activity-profession-catalog.test.ts >/dev/null
node --test packages/core/test/fv11-eligibility.test.ts >/dev/null
bash tests/m04_admission_test.sh >/dev/null
bash tests/m03_m08_execution_readiness_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'M04 S04 QUALIFICATION PATH: PASS / 44 TESTS / GOVERNED DAG + ALTERNATIVES / EXPLICIT TARGET+DATE+JURISDICTION / NO HIDDEN RANKING / NO S05+ AUTHORITY\n'
