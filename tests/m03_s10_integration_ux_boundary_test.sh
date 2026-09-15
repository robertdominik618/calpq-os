#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M03 S10 INTEGRATION UX BOUNDARY: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION"
  and .authorized_execution_entry == "M03_SLICE_01_DASHBOARD_READ_MODELS"' \
  docs/planning/m03-admission-decision.json >/dev/null || fail 'M03 is not formally admitted'

reviewed_s09_merge='1d87412aa54a18bda4c8015824085102a5a73055'
git cat-file -e "${reviewed_s09_merge}^{commit}" 2>/dev/null || fail 'reviewed Slice 09 merge commit is unavailable'
git merge-base --is-ancestor "$reviewed_s09_merge" HEAD || fail 'Slice 10 does not descend from reviewed Slice 09 merge'

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'

count="$(grep -Ec "^test\\('M03S10-[0-9]{2}" packages/application/test/m03-s10-integration-ux-boundary.test.ts)"
[[ "$count" -eq 42 ]] || fail "expected exactly 42 mandatory M03 S10 runtime tests, got $count"

grep -Fq '10. M03 integration evidence and UX boundary tests.' docs/planning/M03_EXECUTION_PACKAGE.md \
  || fail 'Slice 10 execution-package scope is not present'

node --test packages/application/test/m03-s10-integration-ux-boundary.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json

m03_dirs=(
  packages/application/src/dashboard
  packages/application/src/passport
  packages/application/src/credential-card
  packages/application/src/explanation
  packages/application/src/timeline
  packages/application/src/guidance
  packages/application/src/search
  packages/application/src/responsive
  packages/application/src/accessibility
)

if grep -R -nEi "from ['\"](react|react-native|expo|next|vue|svelte|@angular|flutter|swiftui|openai|@anthropic-ai|aws-sdk|@aws-sdk)" \
  "${m03_dirs[@]}" --include='*.ts' >/dev/null; then
  fail 'UI/provider dependency leaked into M03 product surface'
fi

if grep -R -nEi 'window\.|navigator\.|globalThis\.document|document\.(querySelector|getElementById|createElement|body|addEventListener)|userAgent|matchMedia|screen\.width|innerWidth' \
  "${m03_dirs[@]}" --include='*.ts' >/dev/null; then
  fail 'ambient browser/device dependency leaked into M03 product surface'
fi

if grep -R -nE '\bIntl\.|Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' \
  "${m03_dirs[@]}" --include='*.ts' >/dev/null; then
  fail 'ambient locale/time/randomness leaked into M03 product surface'
fi

if grep -R -nE '\b(AuthorizationGrant|QualificationPath|CredentialCatalog|aggregateRequirementGroup)\b|EligibilityAssessment\.evaluate' \
  "${m03_dirs[@]}" --include='*.ts' >/dev/null; then
  fail 'domain/catalog/eligibility authority leaked into M03 product surface'
fi

# Execute each predecessor runtime regression exactly once. Dedicated workflows
# continue to execute their own complete slice gates independently.
node --test packages/application/test/m03-s09-accessibility-localization.test.ts >/dev/null
node --test packages/application/test/m03-s08-responsive.test.ts >/dev/null
node --test packages/application/test/m03-s07-search.test.ts >/dev/null
node --test packages/application/test/m03-s06-guidance.test.ts >/dev/null
node --test packages/application/test/m03-s05-timeline.test.ts >/dev/null
node --test packages/application/test/m03-s04-explanation.test.ts >/dev/null
node --test packages/application/test/m03-s03-credential-card.test.ts >/dev/null
node --test packages/application/test/m03-s02-passport-summary.test.ts >/dev/null
node --test packages/application/test/m03-s01-dashboard.test.ts >/dev/null
node --test packages/application/test/fv12-professional-passport.test.ts >/dev/null
node --test packages/application/test/fv09-document-intake.test.ts >/dev/null
node --test packages/core/test/fv11-eligibility.test.ts >/dev/null
npx --yes --package=typescript@7.0.2 -- tsc -p packages/core/tsconfig.json
bash tests/m03_admission_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'M03 S10 INTEGRATION UX BOUNDARY: PASS / 42 TESTS / M02->M03 JOURNEY / UX BOUNDARIES / NO NEW AUTHORITY\n'
