#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'FV15 OPERATIONAL RESILIENCE: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] \
  || fail "FV-15 tests require POST_FV00_IMPLEMENTATION, got $phase"

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'

test_count="$(grep -Ec "^test\\('FV15-[0-9]{2}" packages/application/test/fv15-operational-resilience.test.ts)"
[[ "$test_count" -eq 22 ]] || fail "expected exactly 22 mandatory FV-15 runtime tests, got $test_count"

node --test packages/application/test/fv15-operational-resilience.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json

if grep -R -nE "from ['\"](amqplib|bullmq|kafkajs|redis|pg|postgres|mysql|sqlite|@?prisma|typeorm|sequelize|knex|drizzle|aws-sdk|@aws-sdk)" \
  packages/application/src/runtime --include='*.ts' >/dev/null; then
  fail 'queue/database/provider dependency leaked into FV-15 Application runtime source'
fi

if grep -R -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' \
  packages/application/src/runtime --include='*.ts' >/dev/null; then
  fail 'ambient wall-clock/randomness detected in FV-15 runtime source'
fi

if grep -R -nE '\bAuthorizationGrant\b' packages/application/src/runtime --include='*.ts' >/dev/null; then
  fail 'authorization issuance behavior leaked into FV-15 runtime source'
fi

if grep -R -nE '\b(RetryDisposition|InMemoryDeliveryDeduplicator|reconcileRuntime|validateRecovery)\b' packages/core/src --include='*.ts' >/dev/null; then
  fail 'runtime/infrastructure resilience semantics leaked into Core'
fi

bash tests/fv14_rest_openapi_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'FV15 OPERATIONAL RESILIENCE: PASS / 22 TESTS / DUPLICATE SAFE + RETRY + RECONCILIATION + RECOVERY\n'
