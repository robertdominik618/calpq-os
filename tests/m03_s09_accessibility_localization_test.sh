#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M03 S09 ACCESSIBILITY LOCALIZATION: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION"
  and .authorized_execution_entry == "M03_SLICE_01_DASHBOARD_READ_MODELS"' \
  docs/planning/m03-admission-decision.json >/dev/null || fail 'M03 is not formally admitted'

reviewed_s08_merge='d6ce5ab80b07c8f5802193d33f81437c04e4c21c'
git cat-file -e "${reviewed_s08_merge}^{commit}" 2>/dev/null || fail 'reviewed Slice 08 merge commit is unavailable'
git merge-base --is-ancestor "$reviewed_s08_merge" HEAD || fail 'Slice 09 does not descend from reviewed Slice 08 merge'

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'

count="$(grep -Ec "^test\\('M03S09-[0-9]{2}" packages/application/test/m03-s09-accessibility-localization.test.ts)"
[[ "$count" -eq 34 ]] || fail "expected exactly 34 mandatory M03 S09 runtime tests, got $count"

node --test packages/application/test/m03-s09-accessibility-localization.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json

if grep -R -nEi "from ['\"](react|react-native|expo|next|vue|svelte|@angular|flutter|swiftui|openai|@anthropic-ai)" \
  packages/application/src/accessibility --include='*.ts' >/dev/null; then
  fail 'UI/provider dependency leaked into accessibility/localization foundation'
fi

if grep -R -nEi '\b(window|document|navigator|userAgent|matchMedia|screen\.width|innerWidth)\b' \
  packages/application/src/accessibility --include='*.ts' >/dev/null; then
  fail 'ambient browser/device dependency leaked into accessibility/localization foundation'
fi

if grep -R -nE '\bIntl\.|Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' \
  packages/application/src/accessibility --include='*.ts' >/dev/null; then
  fail 'ambient locale/time/randomness leaked into accessibility/localization foundation'
fi

if grep -R -nE '\b(AuthorizationGrant|QualificationPath|CredentialCatalog|aggregateRequirementGroup)\b|EligibilityAssessment\.evaluate' \
  packages/application/src/accessibility --include='*.ts' >/dev/null; then
  fail 'domain/catalog/eligibility authority leaked into accessibility/localization foundation'
fi

grep -R -q "CS_CZ: 'cs-CZ'" packages/application/src/accessibility --include='*.ts' || fail 'controlled Czech locale missing'
grep -R -q "EN_GB: 'en-GB'" packages/application/src/accessibility --include='*.ts' || fail 'controlled English locale missing'
grep -R -q 'colorOnlyMeaning = false' packages/application/src/accessibility --include='*.ts' || fail 'non-color-only meaning contract missing'
grep -R -q 'keyboardReachable = true' packages/application/src/accessibility --include='*.ts' || fail 'keyboard reachability contract missing'
grep -R -q 'screenReaderVisible = true' packages/application/src/accessibility --include='*.ts' || fail 'screen-reader visibility contract missing'
grep -R -q 'SOURCE_VALUE_UNCHANGED' packages/application/src/accessibility --include='*.ts' || fail 'canonical time invariance contract missing'
grep -R -q 'accessibilityAuthority = false' packages/application/src/accessibility --include='*.ts' || fail 'accessibility authority boundary missing'
grep -R -q 'localizationAuthority = false' packages/application/src/accessibility --include='*.ts' || fail 'localization authority boundary missing'

# Execute predecessor runtime regressions exactly once. Dedicated workflows for
# S01-S08 continue to execute their own complete gates independently.
node --test packages/application/test/m03-s08-responsive.test.ts >/dev/null
node --test packages/application/test/m03-s07-search.test.ts >/dev/null
node --test packages/application/test/m03-s06-guidance.test.ts >/dev/null
node --test packages/application/test/m03-s05-timeline.test.ts >/dev/null
node --test packages/application/test/m03-s04-explanation.test.ts >/dev/null
node --test packages/application/test/m03-s03-credential-card.test.ts >/dev/null
node --test packages/application/test/m03-s02-passport-summary.test.ts >/dev/null
node --test packages/application/test/m03-s01-dashboard.test.ts >/dev/null
node --test packages/application/test/fv12-professional-passport.test.ts >/dev/null
node --test packages/core/test/fv11-eligibility.test.ts >/dev/null
npx --yes --package=typescript@7.0.2 -- tsc -p packages/core/tsconfig.json
bash tests/m03_admission_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'M03 S09 ACCESSIBILITY LOCALIZATION: PASS / 34 TESTS / KEYBOARD+SCREEN READER / CS-CZ+EN-GB / MACHINE SEMANTICS INVARIANT / NO NEW AUTHORITY\n'
