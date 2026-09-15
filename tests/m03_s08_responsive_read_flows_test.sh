#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M03 S08 RESPONSIVE FLOWS: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION"
  and .authorized_execution_entry == "M03_SLICE_01_DASHBOARD_READ_MODELS"' \
  docs/planning/m03-admission-decision.json >/dev/null || fail 'M03 is not formally admitted'

reviewed_s07_merge='8ad7ad8cffc51b0f18cb29408436cec52438ada7'
git cat-file -e "${reviewed_s07_merge}^{commit}" 2>/dev/null || fail 'Slice 07 merge commit is unavailable'
git merge-base --is-ancestor "$reviewed_s07_merge" HEAD || fail 'Slice 08 does not descend from Slice 07 merge'

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'

count="$(grep -Ec "^test\\('M03S08-[0-9]{2}" packages/application/test/m03-s08-responsive.test.ts)"
[[ "$count" -eq 32 ]] || fail "expected exactly 32 mandatory M03 S08 runtime tests, got $count"

node --test packages/application/test/m03-s08-responsive.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json

if grep -R -nEi "from ['\"](react|react-native|expo|next|vue|svelte|@angular|flutter|swiftui)" \
  packages/application/src/responsive --include='*.ts' >/dev/null; then
  fail 'UI framework dependency leaked into responsive contract'
fi

if grep -R -nEi 'window\.|document\.|navigator\.|userAgent|matchMedia|screen\.width|innerWidth' \
  packages/application/src/responsive --include='*.ts' >/dev/null; then
  fail 'ambient browser/device viewport dependency leaked into responsive contract'
fi

if grep -R -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' \
  packages/application/src/responsive --include='*.ts' >/dev/null; then
  fail 'ambient time/randomness leaked into responsive contract'
fi

if grep -R -nE '\b(AuthorizationGrant|QualificationPath|CredentialCatalog|aggregateRequirementGroup)\b|EligibilityAssessment\.evaluate' \
  packages/application/src/responsive --include='*.ts' >/dev/null; then
  fail 'domain/catalog/eligibility authority leaked into responsive contract'
fi

grep -R -q 'ALWAYS_AVAILABLE' packages/application/src/responsive --include='*.ts' || fail 'material-section availability contract missing'
grep -R -q 'layoutAuthority = false' packages/application/src/responsive --include='*.ts' || fail 'layout authority boundary missing'
grep -R -q 'TWO_PANE_MASTER_DETAIL' packages/application/src/responsive --include='*.ts' || fail 'expanded responsive layout missing'

bash tests/m03_s07_intent_search_test.sh >/dev/null
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

printf 'M03 S08 RESPONSIVE FLOWS: PASS / 32 TESTS / MOBILE+WEB SEMANTIC PARITY / NO MATERIAL CONTENT LOSS / NO NEW AUTHORITY\n'
