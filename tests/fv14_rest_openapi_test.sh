#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'FV14 REST OPENAPI: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] \
  || fail "FV-14 tests require POST_FV00_IMPLEMENTATION, got $phase"

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'

test_count="$(grep -Ec "^test\\('FV14-[0-9]{2}" apps/api/test/fv14-rest-openapi.test.ts)"
[[ "$test_count" -eq 20 ]] || fail "expected exactly 20 mandatory FV-14 runtime tests, got $test_count"

node --test apps/api/test/fv14-rest-openapi.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p apps/api/tsconfig.json

if grep -R -nE "from ['\"](react|react-native|expo|fastify|@?prisma|typeorm|sequelize|knex|drizzle|pg|postgres|mysql|sqlite|aws-sdk|@aws-sdk|openai|@anthropic-ai|tesseract|firebase)" \
  apps/api/src --include='*.ts' >/dev/null; then
  fail 'framework/provider/database dependency leaked into FV-14 transport source'
fi

if grep -R -nE '\b(EligibilityAssessment|RequirementSet|AuthorizationGrant|TenantAccessDecision|orchestrateVerification)\b' \
  apps/api/src --include='*.ts' >/dev/null; then
  fail 'business policy leaked into FV-14 transport source'
fi

if grep -R -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' \
  apps/api/src --include='*.ts' >/dev/null; then
  fail 'ambient wall-clock/randomness detected in FV-14 transport source'
fi

bash tests/fv13_tenant_governance_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'FV14 REST OPENAPI: PASS / 20 TESTS / REST JSON + OPENAPI 3.1 / APPLICATION-ONLY MAPPING\n'
