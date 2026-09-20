#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M03 S01 DASHBOARD READ MODELS: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION"
  and .authorized_execution_entry == "M03_SLICE_01_DASHBOARD_READ_MODELS"' \
  docs/planning/m03-admission-decision.json >/dev/null || fail 'M03 Slice 01 is not formally admitted'

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'

count="$(grep -Ec "^test\\('M03S01-[0-9]{2}" packages/application/test/m03-s01-dashboard.test.ts)"
[[ "$count" -eq 16 ]] || fail "expected exactly 16 mandatory M03 S01 runtime tests, got $count"

node --test packages/application/test/m03-s01-dashboard.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json

if grep -R -nE "from ['\"](react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|openai|@anthropic-ai|aws-sdk|@aws-sdk)" \
  packages/application/src/dashboard --include='*.ts' >/dev/null; then
  fail 'framework/provider dependency leaked into dashboard read model'
fi

if grep -R -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' \
  packages/application/src/dashboard --include='*.ts' >/dev/null; then
  fail 'ambient time/randomness leaked into dashboard read model'
fi

if grep -R -nE '\b(AuthorizationGrant|EligibilityAssessment|VerificationRecord|isValid|valid)\b' \
  packages/application/src/dashboard --include='*.ts' >/dev/null; then
  fail 'authoritative or collapsed validity semantics leaked into dashboard read model'
fi

grep -R -q 'ProfessionalPassportProjection' packages/application/src/dashboard --include='*.ts' \
  || fail 'dashboard does not bind to governed Professional Passport projection'

bash tests/fv12_professional_passport_test.sh >/dev/null
bash tests/m03_admission_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'M03 S01 DASHBOARD READ MODELS: PASS / 16 TESTS / GOVERNED PROJECTION ONLY / UI BUSINESS LOGIC ABSENT\n'
