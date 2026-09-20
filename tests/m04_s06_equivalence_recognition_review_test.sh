#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M04 S06 EQUIVALENCE RECOGNITION REVIEW: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION"
  and .milestone == "M04"
  and .admission_transition_id == "CALPQ-M04-ADMIT-0001"' \
  docs/planning/m04-admission-decision.json >/dev/null || fail 'M04 is not formally admitted'

reviewed_s05_merge='b2e1184563b7368c63d9fd4bbfe417282b6792bb'
git cat-file -e "${reviewed_s05_merge}^{commit}" 2>/dev/null || fail 'reviewed Slice 05 merge is unavailable'
git merge-base --is-ancestor "$reviewed_s05_merge" HEAD || fail 'Slice 06 does not descend from reviewed Slice 05 merge'

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'

count="$(grep -Ec "^test\\('M04S06-[0-9]{2}" packages/core/test/m04-s06-equivalence-recognition-review.test.ts)"
[[ "$count" -eq 48 ]] || fail "expected exactly 48 mandatory M04 S06 runtime tests, got $count"

node --test packages/core/test/m04-s06-equivalence-recognition-review.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/core/tsconfig.json

source=packages/core/src/catalog/equivalence-recognition-review.ts

if grep -nEi "from ['\"](react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|sequelize|knex|drizzle|openai|@anthropic-ai|aws-sdk|@aws-sdk)" "$source" >/dev/null; then
  fail 'framework/provider/AI dependency leaked into M04 S06 core'
fi

if grep -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' "$source" >/dev/null; then
  fail 'ambient time/randomness leaked into M04 S06 core'
fi

if grep -nE '\b(GapNavigator|AuthorizationGrant|CredentialArtifact|EvidenceSnapshot)\b|EligibilityAssessment\.evaluate' "$source" >/dev/null; then
  fail 'S07 / evidence-artifact / authorization / eligibility authority leaked into M04 S06'
fi

if grep -nE 'SourceReference\.create|VerificationState\.from|EvidenceReference\.(original|derived)' "$source" >/dev/null; then
  fail 'M04 S06 must consume existing source/evidence references, not create or promote them'
fi

grep -q 'class EquivalenceRule' "$source" || fail 'EquivalenceRule missing'
grep -q 'class RecognitionRoute' "$source" || fail 'RecognitionRoute missing'
grep -q 'class RecognitionDecision' "$source" || fail 'RecognitionDecision missing'
grep -q 'class RecognitionReviewCase' "$source" || fail 'RecognitionReviewCase missing'
grep -q 'UNKNOWN_REVIEW_REQUIRED' "$source" || fail 'UNKNOWN_REVIEW_REQUIRED route guard missing'
grep -q 'already-VERIFIED source snapshots' "$source" || fail 'authoritative decision verified-source guard missing'
grep -q 'independent approval' "$source" || fail 'segregation-of-duties review guard missing'

node --test \
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

printf 'M04 S06 EQUIVALENCE RECOGNITION REVIEW: PASS / 48 TESTS / EXPLICIT GOVERNED BASIS / ROUTE != DECISION / HUMAN REVIEW / NO S07+ AUTHORITY\n'
