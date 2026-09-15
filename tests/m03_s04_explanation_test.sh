#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M03 S04 EXPLANATION: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION"
  and .authorized_execution_entry == "M03_SLICE_01_DASHBOARD_READ_MODELS"' \
  docs/planning/m03-admission-decision.json >/dev/null || fail 'M03 is not formally admitted'

reviewed_s03_merge='f92032617783e1ddfc82aefc7e1bdea28534424a'
git cat-file -e "${reviewed_s03_merge}^{commit}" 2>/dev/null || fail 'reviewed Slice 03 merge commit is unavailable'
git merge-base --is-ancestor "$reviewed_s03_merge" HEAD || fail 'Slice 04 does not descend from reviewed Slice 03 merge'

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'

count="$(grep -Ec "^test\\('M03S04-[0-9]{2}" packages/application/test/m03-s04-explanation.test.ts)"
[[ "$count" -eq 26 ]] || fail "expected exactly 26 mandatory M03 S04 runtime tests, got $count"

node --test packages/application/test/m03-s04-explanation.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json

if grep -R -nE "from ['\"](react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|openai|@anthropic-ai|aws-sdk|@aws-sdk)" \
  packages/application/src/explanation --include='*.ts' >/dev/null; then
  fail 'framework/provider dependency leaked into explanation read model'
fi

if grep -R -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' \
  packages/application/src/explanation --include='*.ts' >/dev/null; then
  fail 'ambient time/randomness leaked into explanation read model'
fi

if grep -R -nE '\b(AuthorizationGrant|isValid|latest|current|active|expired)\b' \
  packages/application/src/explanation --include='*.ts' >/dev/null; then
  fail 'decision/lifecycle/authorization authority leaked into explanation read model'
fi

grep -R -q 'EligibilityAssessment' packages/application/src/explanation --include='*.ts' || fail 'authoritative EligibilityAssessment binding missing'
grep -R -q 'SourceReference' packages/application/src/explanation --include='*.ts' || fail 'governed SourceReference presentation missing'
grep -R -q 'EvidenceReference' packages/application/src/explanation --include='*.ts' || fail 'governed EvidenceReference presentation missing'
grep -R -q 'WHY' packages/application/src/explanation --include='*.ts' || fail 'explicit Why affordance missing'

bash tests/m03_s03_credential_card_test.sh >/dev/null
bash tests/m03_s02_passport_summary_test.sh >/dev/null
bash tests/m03_s01_dashboard_read_models_test.sh >/dev/null
bash tests/fv12_professional_passport_test.sh >/dev/null
bash tests/m03_admission_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'M03 S04 EXPLANATION: PASS / 26 TESTS / WHY AFFORDANCE / GOVERNED SOURCE+EVIDENCE / NO DECISION AUTHORITY\n'
