#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M03 S05 TIMELINE: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION"
  and .authorized_execution_entry == "M03_SLICE_01_DASHBOARD_READ_MODELS"' \
  docs/planning/m03-admission-decision.json >/dev/null || fail 'M03 is not formally admitted'

reviewed_s04_merge='378705302a0a4e507018e437bc329b42979e60cb'
git cat-file -e "${reviewed_s04_merge}^{commit}" 2>/dev/null || fail 'reviewed Slice 04 merge commit is unavailable'
git merge-base --is-ancestor "$reviewed_s04_merge" HEAD || fail 'Slice 05 does not descend from reviewed Slice 04 merge'

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'

count="$(grep -Ec "^test\\('M03S05-[0-9]{2}" packages/application/test/m03-s05-timeline.test.ts)"
[[ "$count" -eq 30 ]] || fail "expected exactly 30 mandatory M03 S05 runtime tests, got $count"

node --test packages/application/test/m03-s05-timeline.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json

if grep -R -nE "from ['\"](react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|openai|@anthropic-ai|aws-sdk|@aws-sdk)" \
  packages/application/src/timeline --include='*.ts' >/dev/null; then
  fail 'framework/provider dependency leaked into timeline read model'
fi

if grep -R -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' \
  packages/application/src/timeline --include='*.ts' >/dev/null; then
  fail 'ambient time/randomness leaked into timeline read model'
fi

if grep -R -nE '\b(AuthorizationGrant|isValid|latest|current|active|expired)\b' \
  packages/application/src/timeline --include='*.ts' >/dev/null; then
  fail 'decision/lifecycle/authorization authority leaked into timeline read model'
fi

if grep -R -n 'passport\.generatedAt' packages/application/src/timeline --include='*.ts' >/dev/null; then
  fail 'presentation generation time was incorrectly promoted into activity history'
fi

grep -R -q 'VERIFICATION_EVENT_TIME_NOT_AVAILABLE' packages/application/src/timeline --include='*.ts' || fail 'explicit verification-time omission semantics missing'
grep -R -q 'OCCURRED_AT_DESC_NON_CAUSAL_TIE_BREAK' packages/application/src/timeline --include='*.ts' || fail 'non-causal deterministic tie-break contract missing'
grep -R -q 'DecisionProvenancePresentation' packages/application/src/timeline --include='*.ts' || fail 'decision provenance presentation missing'

bash tests/m03_s04_explanation_test.sh >/dev/null
bash tests/m03_s03_credential_card_test.sh >/dev/null
bash tests/m03_s02_passport_summary_test.sh >/dev/null
bash tests/m03_s01_dashboard_read_models_test.sh >/dev/null
bash tests/fv12_professional_passport_test.sh >/dev/null
bash tests/fv11_eligibility_test.sh >/dev/null
bash tests/fv09_document_intake_test.sh >/dev/null
bash tests/m03_admission_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'M03 S05 TIMELINE: PASS / 30 TESTS / EXPLICIT TIMES / NON-CAUSAL ORDER / DECISION PROVENANCE / NO NEW AUTHORITY\n'
