#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'FV07 PERSISTENCE UOW: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] \
  || fail "FV-07 tests require POST_FV00_IMPLEMENTATION, got $phase"

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'
command -v jq >/dev/null 2>&1 || fail 'jq is required'

node_major="$(node -p 'process.versions.node.split(".")[0]')"
[[ "$node_major" -ge 24 ]] || fail "Node.js 24+ is required, got $(node --version)"

test_count="$(grep -Ec "^test\\('FV07-[0-9]{2}" packages/application/test/fv07-persistence.test.ts)"
[[ "$test_count" -eq 18 ]] || fail "expected exactly 18 mandatory FV-07 runtime tests, got $test_count"

node --test packages/application/test/fv07-persistence.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json

if grep -R -nE "from ['\"](pg|postgres|mysql|sqlite|@?prisma|typeorm|sequelize|knex|drizzle|redis)" \
  packages/application/src --include='*.ts' >/dev/null; then
  fail 'database/ORM adapter dependency leaked into FV-07 Application contracts'
fi

if grep -R -nE '\b(UnitOfWorkPort|TenantScopedRepository)\b' packages/core/src --include='*.ts' >/dev/null; then
  fail 'persistence/Application contract leaked into Core'
fi

bash tests/fv06_application_layer_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'FV07 PERSISTENCE UOW: PASS / 18 TESTS / ATOMICITY + IDEMPOTENCY + OPTIMISTIC CONCURRENCY\n'
