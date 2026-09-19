#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'FV12 PROFESSIONAL PASSPORT: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] \
  || fail "FV-12 tests require POST_FV00_IMPLEMENTATION, got $phase"

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'

test_count="$(grep -Ec "^test\\('FV12-[0-9]{2}" packages/application/test/fv12-professional-passport.test.ts)"
[[ "$test_count" -eq 16 ]] || fail "expected exactly 16 mandatory FV-12 runtime tests, got $test_count"

node --test packages/application/test/fv12-professional-passport.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json

if grep -R -nE "from ['\"](react|react-native|expo|fastify|@?prisma|typeorm|sequelize|knex|drizzle|aws-sdk|@aws-sdk|openai|@anthropic-ai|tesseract|firebase)" \
  packages/application/src/passport --include='*.ts' >/dev/null; then
  fail 'framework/provider/persistence dependency leaked into FV-12 passport projection'
fi

if grep -R -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' \
  packages/application/src/passport --include='*.ts' >/dev/null; then
  fail 'ambient time/randomness detected in deterministic FV-12 projection'
fi

if grep -R -nE '\bAuthorizationGrant\b' packages/application/src/passport --include='*.ts' >/dev/null; then
  fail 'AuthorizationGrant behavior leaked into FV-12 Passport projection'
fi

bash tests/fv11_eligibility_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'FV12 PROFESSIONAL PASSPORT: PASS / 16 TESTS / REBUILDABLE READ MODEL / NO AUTHORITY PROMOTION\n'
