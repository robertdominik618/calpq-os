#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'FV09 DOCUMENT INTAKE: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] \
  || fail "FV-09 tests require POST_FV00_IMPLEMENTATION, got $phase"

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'

test_count="$(grep -Ec "^test\\('FV09-[0-9]{2}" packages/application/test/fv09-document-intake.test.ts)"
[[ "$test_count" -eq 20 ]] || fail "expected exactly 20 mandatory FV-09 runtime tests, got $test_count"

node --test packages/application/test/fv09-document-intake.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json

if grep -R -nE "from ['\"](react|react-native|expo|fastify|@?prisma|typeorm|openai|@anthropic-ai|tesseract|aws-sdk|@aws-sdk)" \
  packages/application/src/intake --include='*.ts' >/dev/null; then
  fail 'framework/provider SDK dependency leaked into FV-09 intake source'
fi

if grep -R -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' \
  packages/application/src/intake --include='*.ts' >/dev/null; then
  fail 'ambient time/randomness detected in FV-09 intake source'
fi

if grep -R -nE '\b(EligibilityAssessment|AuthorizationGrant)\b' \
  packages/application/src/intake --include='*.ts' >/dev/null; then
  fail 'eligibility/authorization capability leaked into FV-09 intake source'
fi

bash tests/fv08_migration_delivery_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'FV09 DOCUMENT INTAKE: PASS / 20 TESTS / IMMUTABLE ORIGINAL + LINKED CORRECTION / NO TRUST ESCALATION\n'
