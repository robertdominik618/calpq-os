#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M03 S07 INTENT SEARCH: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION"
  and .authorized_execution_entry == "M03_SLICE_01_DASHBOARD_READ_MODELS"' \
  docs/planning/m03-admission-decision.json >/dev/null || fail 'M03 is not formally admitted'

reviewed_s06_merge='54189c3a08cceb5c457a595a18288fd59e674bb9'
git cat-file -e "${reviewed_s06_merge}^{commit}" 2>/dev/null || fail 'reviewed Slice 06 merge commit is unavailable'
git merge-base --is-ancestor "$reviewed_s06_merge" HEAD || fail 'Slice 07 does not descend from reviewed Slice 06 merge'

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'

count="$(grep -Ec "^test\\('M03S07-[0-9]{2}" packages/application/test/m03-s07-search.test.ts)"
[[ "$count" -eq 36 ]] || fail "expected exactly 36 mandatory M03 S07 runtime tests, got $count"

node --test packages/application/test/m03-s07-search.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json

if grep -R -nEi "from ['\"](react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|openai|@anthropic-ai|aws-sdk|@aws-sdk|elasticsearch|@elastic|algoliasearch|meilisearch)" \
  packages/application/src/search --include='*.ts' >/dev/null; then
  fail 'framework/provider/search-engine dependency leaked into M03 intent search'
fi

if grep -R -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' \
  packages/application/src/search --include='*.ts' >/dev/null; then
  fail 'ambient time/randomness leaked into M03 intent search'
fi

if grep -R -nEi '\b(embedding|vectorSearch|semanticSimilarity|fuzzySearch|chatCompletion|llm)\b' \
  packages/application/src/search --include='*.ts' >/dev/null; then
  fail 'AI/fuzzy semantic authority leaked into M03 intent search'
fi

if grep -R -nE '\b(AuthorizationGrant|QualificationPath|CredentialCatalog|aggregateRequirementGroup)\b|EligibilityAssessment\.evaluate' \
  packages/application/src/search --include='*.ts' >/dev/null; then
  fail 'domain/catalog/eligibility authority leaked into M03 intent search'
fi

grep -R -q 'IntentSearchIntent' packages/application/src/search --include='*.ts' || fail 'controlled intent contract missing'
grep -R -q 'IntentSearchMatchKind' packages/application/src/search --include='*.ts' || fail 'controlled match-kind contract missing'
grep -R -q 'searchAuthority = false' packages/application/src/search --include='*.ts' || fail 'search authority boundary missing'
grep -R -q 'rankingAuthority = false' packages/application/src/search --include='*.ts' || fail 'ranking authority boundary missing'
grep -R -q 'decisionAuthority = false' packages/application/src/search --include='*.ts' || fail 'decision authority boundary missing'

bash tests/m03_s06_missing_condition_next_action_test.sh >/dev/null
bash tests/m03_s05_activity_timeline_test.sh >/dev/null
bash tests/m03_s04_explanation_test.sh >/dev/null
bash tests/m03_s03_credential_card_test.sh >/dev/null
bash tests/m03_s02_passport_summary_test.sh >/dev/null
bash tests/m03_s01_dashboard_read_models_test.sh >/dev/null
bash tests/fv12_professional_passport_test.sh >/dev/null
bash tests/fv11_eligibility_test.sh >/dev/null
bash tests/m03_admission_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'M03 S07 INTENT SEARCH: PASS / 36 TESTS / APPROVED QUERY MODELS / DETERMINISTIC RANKING / NO NEW AUTHORITY\n'
