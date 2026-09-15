#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M03 S03 CREDENTIAL CARD: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION"
  and .authorized_execution_entry == "M03_SLICE_01_DASHBOARD_READ_MODELS"' \
  docs/planning/m03-admission-decision.json >/dev/null || fail 'M03 is not formally admitted'

reviewed_s02_merge='953dac4785d613c9ab0c7247e8064f7de2b657de'
git cat-file -e "${reviewed_s02_merge}^{commit}" 2>/dev/null || fail 'reviewed Slice 02 merge commit is unavailable'
git merge-base --is-ancestor "$reviewed_s02_merge" HEAD || fail 'Slice 03 does not descend from reviewed Slice 02 merge'

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'

count="$(grep -Ec "^test\\('M03S03-[0-9]{2}" packages/application/test/m03-s03-credential-card.test.ts)"
[[ "$count" -eq 24 ]] || fail "expected exactly 24 mandatory M03 S03 runtime tests, got $count"

node --test packages/application/test/m03-s03-credential-card.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json

if grep -R -nE "from ['\"](react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|openai|@anthropic-ai|aws-sdk|@aws-sdk)" \
  packages/application/src/credential-card --include='*.ts' >/dev/null; then
  fail 'framework/provider dependency leaked into Credential Card read model'
fi

if grep -R -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' \
  packages/application/src/credential-card --include='*.ts' >/dev/null; then
  fail 'ambient time/randomness leaked into Credential Card read model'
fi

if grep -R -nE '\b(AuthorizationGrant|isValid|valid|current|latest|active|expired)\b' \
  packages/application/src/credential-card --include='*.ts' >/dev/null; then
  fail 'collapsed validity/current/lifecycle authority leaked into Credential Card read model'
fi

grep -R -q 'ProfessionalPassportProjection' packages/application/src/credential-card --include='*.ts' \
  || fail 'Credential Card does not bind to governed Professional Passport projection'
grep -R -q 'CredentialArtifact' packages/application/src/credential-card --include='*.ts' \
  || fail 'Credential Card document facet lacks governed CredentialArtifact binding'
grep -R -q 'LIFECYCLE_SOURCE_NOT_AVAILABLE_IN_M03' packages/application/src/credential-card --include='*.ts' \
  || fail 'Credential Card lifecycle boundary is not explicit'

bash tests/m03_s02_passport_summary_test.sh >/dev/null
bash tests/m03_s01_dashboard_read_models_test.sh >/dev/null
bash tests/fv12_professional_passport_test.sh >/dev/null
bash tests/m03_admission_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'M03 S03 CREDENTIAL CARD: PASS / 24 TESTS / 4 SEPARATE FACETS / NO COLLAPSED VALIDITY / LIFECYCLE SOURCE UNAVAILABLE\n'
