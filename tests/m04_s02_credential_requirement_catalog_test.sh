#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M04 S02 CREDENTIAL REQUIREMENT CATALOG: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION"
  and .milestone == "M04"
  and .admission_transition_id == "CALPQ-M04-ADMIT-0001"
  and .authorized_execution_entry == "M04_SLICE_01_ACTIVITY_PROFESSION_CATALOG_MODEL"' \
  docs/planning/m04-admission-decision.json >/dev/null || fail 'M04 is not formally admitted'

reviewed_s01_merge='057f39ab18c663c5bb89a531d41d4095968cac6b'
git cat-file -e "${reviewed_s01_merge}^{commit}" 2>/dev/null || fail 'reviewed Slice 01 merge is unavailable'
git merge-base --is-ancestor "$reviewed_s01_merge" HEAD || fail 'Slice 02 does not descend from reviewed Slice 01 merge'

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'

count="$(grep -Ec "^test\\('M04S02-[0-9]{2}" packages/core/test/m04-s02-credential-requirement-catalog.test.ts)"
[[ "$count" -eq 32 ]] || fail "expected exactly 32 mandatory M04 S02 runtime tests, got $count"

node --test packages/core/test/m04-s02-credential-requirement-catalog.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/core/tsconfig.json

source=packages/core/src/catalog/credential-requirement-catalog.ts

if grep -nEi "from ['\"](react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|sequelize|knex|drizzle|openai|@anthropic-ai|aws-sdk|@aws-sdk)" "$source" >/dev/null; then
  fail 'framework/provider dependency leaked into M04 S02 catalog core'
fi

if grep -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' "$source" >/dev/null; then
  fail 'ambient time/randomness leaked into M04 S02 catalog core'
fi

if grep -nE '\b(RequirementSet|RequirementGroup|QualificationPath|ProvenanceEnvelope|EquivalenceDecision|GapNavigator|AuthorizationGrant|EligibilityAssessment)\b' "$source" >/dev/null; then
  fail 'later-slice or decision authority leaked into M04 S02'
fi

if grep -nE '\b(CredentialArtifact|EvidenceSnapshot|EvidenceReference)\b' "$source" >/dev/null; then
  fail 'personal artifact/evidence state leaked into CredentialDefinition catalog model'
fi

if grep -nE "from ['\"]\.\./provenance/" "$source" >/dev/null; then
  fail 'full provenance binding leaked into M04 S02 before Slice 05'
fi

grep -q 'class CredentialDefinition' "$source" || fail 'CredentialDefinition missing'
grep -q 'class RequirementDefinition' "$source" || fail 'RequirementDefinition missing'
grep -q 'RequirementDefinitionId' packages/core/src/ids.ts || fail 'RequirementDefinitionId missing'
grep -q 'isEffectiveOn(date: DateOnly)' "$source" || fail 'explicit-date effective evaluation missing'

bash tests/m04_s01_activity_profession_catalog_test.sh >/dev/null
bash tests/fv01_core_primitives_test.sh >/dev/null
bash tests/fv05_credential_evidence_test.sh >/dev/null
bash tests/fv11_eligibility_test.sh >/dev/null
bash tests/m04_admission_test.sh >/dev/null
bash tests/m03_m08_execution_readiness_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'M04 S02 CREDENTIAL REQUIREMENT CATALOG: PASS / 32 TESTS / STABLE IDS+CODES / DEFINITION NOT ARTIFACT OR OUTCOME / NO S03+ AUTHORITY\n'
