#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'FV08 MIGRATION DELIVERY: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] \
  || fail "FV-08 tests require POST_FV00_IMPLEMENTATION, got $phase"

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'
command -v jq >/dev/null 2>&1 || fail 'jq is required'
command -v sha256sum >/dev/null 2>&1 || fail 'sha256sum is required for migration integrity evidence'

test_count="$(grep -Ec "^test\\('FV08-[0-9]{2}" packages/adapters/test/fv08-migrations-delivery.test.ts)"
[[ "$test_count" -eq 16 ]] || fail "expected exactly 16 mandatory FV-08 runtime tests, got $test_count"

manifest='packages/adapters/migrations/postgresql/manifest.json'
while IFS=$'\t' read -r file expected; do
  actual="$(sha256sum "packages/adapters/migrations/postgresql/$file" | awk '{print $1}')"
  [[ "$actual" == "$expected" ]] || fail "migration checksum mismatch for $file: expected $expected got $actual"
done < <(jq -r '.migrations[] | [.file, .checksumSha256] | @tsv' "$manifest")

node --test packages/adapters/test/fv08-migrations-delivery.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/adapters/tsconfig.json

if grep -R -nE "from ['\"](react|react-native|expo|fastify|@?prisma|typeorm|sequelize|knex|drizzle|aws-sdk|@aws-sdk|openai|@anthropic-ai|tesseract|firebase)" \
  packages/adapters/src --include='*.ts' >/dev/null; then
  fail 'framework/provider SDK dependency leaked into FV-08 adapter semantics'
fi

if grep -R -nE 'db[[:space:]]+push|auto.?migrat|synchronize[[:space:]]*:[[:space:]]*true|schema.?sync' \
  packages/adapters/package.json packages/adapters/src --include='*.ts' >/dev/null; then
  fail 'ORM auto-migration mechanism detected'
fi

if grep -R -nE "from ['\"][^'\"]*(packages/adapters|@calpq/adapters)" \
  packages/core/src packages/application/src --include='*.ts' >/dev/null; then
  fail 'Core/Application must not depend outward on adapters'
fi

bash tests/fv07_persistence_uow_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'FV08 MIGRATION DELIVERY: PASS / 16 TESTS / IMMUTABLE MIGRATIONS / AT-LEAST-ONCE + DEDUP + REVIEW\n'
