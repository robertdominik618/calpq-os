#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'FV13 TENANT GOVERNANCE: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] \
  || fail "FV-13 tests require POST_FV00_IMPLEMENTATION, got $phase"

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'

test_count="$(grep -Ec "^test\\('FV13-[0-9]{2}" packages/application/test/fv13-tenant-governance.test.ts)"
[[ "$test_count" -eq 24 ]] || fail "expected exactly 24 mandatory FV-13 runtime tests, got $test_count"

node --test packages/application/test/fv13-tenant-governance.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json

if grep -R -nE "from ['\"](react|react-native|expo|fastify|@?prisma|typeorm|sequelize|knex|drizzle|aws-sdk|@aws-sdk|openai|@anthropic-ai|tesseract|firebase)" \
  packages/application/src/tenant --include='*.ts' >/dev/null; then
  fail 'framework/provider/persistence dependency leaked into FV-13 tenant governance source'
fi

if grep -R -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' \
  packages/application/src/tenant --include='*.ts' >/dev/null; then
  fail 'ambient wall-clock/randomness detected in FV-13 tenant governance source'
fi

if grep -R -nE 'DEFAULT_TENANT|defaultTenant|ambientTenant|currentTenant' \
  packages/application/src/tenant --include='*.ts' >/dev/null; then
  fail 'ambient/default tenant state detected in FV-13 source'
fi

bash tests/fv12_professional_passport_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'FV13 TENANT GOVERNANCE: PASS / 24 TESTS / EXPLICIT SCOPE + ACCESS + AUDIT / FAIL CLOSED\n'
