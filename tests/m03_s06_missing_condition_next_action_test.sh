#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M03 S06 GUIDANCE: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION"
  and .authorized_execution_entry == "M03_SLICE_01_DASHBOARD_READ_MODELS"' \
  docs/planning/m03-admission-decision.json >/dev/null || fail 'M03 is not formally admitted'

reviewed_s05_merge='41ed1dc445276cf88d5a3584a7d259d24c2f96b1'
git cat-file -e "${reviewed_s05_merge}^{commit}" 2>/dev/null || fail 'reviewed Slice 05 merge commit is unavailable'
git merge-base --is-ancestor "$reviewed_s05_merge" HEAD || fail 'Slice 06 does not descend from reviewed Slice 05 merge'

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'

count="$(grep -Ec "^test\\('M03S06-[0-9]{2}" packages/application/test/m03-s06-guidance.test.ts)"
[[ "$count" -eq 34 ]] || fail "expected exactly 34 mandatory M03 S06 runtime tests, got $count"

node --test packages/application/test/m03-s06-guidance.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json

if grep -R -nE "from ['\"](react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|openai|@anthropic-ai|aws-sdk|@aws-sdk)" \
  packages/application/src/guidance --include='*.ts' >/dev/null; then
  fail 'framework/provider dependency leaked into guidance read model'
fi

if grep -R -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' \
  packages/application/src/guidance --include='*.ts' >/dev/null; then
  fail 'ambient time/randomness leaked into guidance read model'
fi

if grep -R -nE '\b(AuthorizationGrant|isValid|latest|current|active|expired)\b' \
  packages/application/src/guidance --include='*.ts' >/dev/null; then
  fail 'authorization/lifecycle authority leaked into guidance read model'
fi

if grep -R -nE 'reasonCode\.(startsWith|endsWith|match|search|toLowerCase|toUpperCase)\(' \
  packages/application/src/guidance --include='*.ts' >/dev/null; then
  fail 'next action is being inferred from reason-code text'
fi

grep -R -q 'NOT_AVAILABLE_FROM_GOVERNED_OUTPUTS' packages/application/src/guidance --include='*.ts' || fail 'explicit unavailable next-action semantics missing'
grep -R -q 'EXPLICIT_GOVERNED_REFERENCE' packages/application/src/guidance --include='*.ts' || fail 'explicit governed action source semantics missing'
grep -R -q 'MissingConditionNextActionReadModel' packages/application/src/guidance --include='*.ts' || fail 'missing-condition read model missing'
grep -R -q 'actionRecommendationAuthority = false' packages/application/src/guidance --include='*.ts' || fail 'zero action-recommendation authority marker missing'

bash tests/m03_s05_activity_timeline_test.sh >/dev/null
bash tests/m03_s04_explanation_test.sh >/dev/null
bash tests/m03_s03_credential_card_test.sh >/dev/null
bash tests/m03_s02_passport_summary_test.sh >/dev/null
bash tests/m03_s01_dashboard_read_models_test.sh >/dev/null
bash tests/fv12_professional_passport_test.sh >/dev/null
bash tests/fv11_eligibility_test.sh >/dev/null
bash tests/m03_admission_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'M03 S06 GUIDANCE: PASS / 34 TESTS / MISSING STATES PRESERVED / GOVERNED ACTIONS ONLY / NO ACTION INFERENCE / NO NEW AUTHORITY\n'
