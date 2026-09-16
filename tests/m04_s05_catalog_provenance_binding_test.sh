#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M04 S05 CATALOG PROVENANCE BINDING: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION"
  and .milestone == "M04"
  and .admission_transition_id == "CALPQ-M04-ADMIT-0001"' \
  docs/planning/m04-admission-decision.json >/dev/null || fail 'M04 is not formally admitted'

reviewed_s04_merge='9c5dbc0b70df6416897b9e83dc5e3327078ed570'
git cat-file -e "${reviewed_s04_merge}^{commit}" 2>/dev/null || fail 'reviewed Slice 04 merge is unavailable'
git merge-base --is-ancestor "$reviewed_s04_merge" HEAD || fail 'Slice 05 does not descend from reviewed Slice 04 merge'

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'

count="$(grep -Ec "^test\\('M04S05-[0-9]{2}" packages/core/test/m04-s05-catalog-provenance-binding.test.ts)"
[[ "$count" -eq 42 ]] || fail "expected exactly 42 mandatory M04 S05 runtime tests, got $count"

node --test packages/core/test/m04-s05-catalog-provenance-binding.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/core/tsconfig.json

source=packages/core/src/catalog/catalog-provenance-binding.ts

if grep -nEi "from ['\"](react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|sequelize|knex|drizzle|openai|@anthropic-ai|aws-sdk|@aws-sdk)" "$source" >/dev/null; then
  fail 'framework/provider dependency leaked into M04 S05 core'
fi

if grep -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' "$source" >/dev/null; then
  fail 'ambient time/randomness leaked into M04 S05 core'
fi

if grep -nE '\b(EquivalenceDecision|GapNavigator|AuthorizationGrant|EvidenceSnapshot|CredentialArtifact)\b|EligibilityAssessment\.evaluate' "$source" >/dev/null; then
  fail 'S06+ / evidence / authorization authority leaked into M04 S05'
fi

if grep -nE 'SourceReference\.create|ProvenanceEnvelope\.create|VerificationState\.from' "$source" >/dev/null; then
  fail 'M04 S05 must bind existing source/provenance snapshots, not create or promote them'
fi

grep -q 'class CatalogProvenanceBinding' "$source" || fail 'CatalogProvenanceBinding missing'
grep -q 'allSourcesVerified' "$source" || fail 'source verification read predicate missing'
grep -q 'requiresSourceReview' "$source" || fail 'source review predicate missing'
grep -q 'subject-free' "$source" || fail 'subject-free catalog provenance guard missing'
grep -q 'evidence-free' "$source" || fail 'evidence-free catalog provenance guard missing'
grep -q 'exact source snapshots' "$source" || fail 'exact source snapshot binding guard missing'

# Direct regressions once here. Older dedicated workflows independently execute their own full gates.
node --test \
  packages/core/test/m04-s04-qualification-path.test.ts \
  packages/core/test/m04-s03-requirement-set-versioning.test.ts \
  packages/core/test/m04-s02-credential-requirement-catalog.test.ts \
  packages/core/test/m04-s01-activity-profession-catalog.test.ts \
  packages/core/test/fv03-provenance.test.ts \
  packages/core/test/fv11-eligibility.test.ts >/dev/null
bash tests/m04_admission_test.sh >/dev/null
bash tests/m03_m08_execution_readiness_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'M04 S05 CATALOG PROVENANCE BINDING: PASS / 42 TESTS / EXACT SOURCE SNAPSHOTS / SUBJECT+EVIDENCE FREE PROVENANCE / NO VERIFICATION PROMOTION / NO S06+ AUTHORITY\n'
