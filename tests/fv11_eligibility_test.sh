#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'FV11 ELIGIBILITY: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] \
  || fail "FV-11 tests require POST_FV00_IMPLEMENTATION, got $phase"

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'
command -v jq >/dev/null 2>&1 || fail 'jq is required'

node_major="$(node -p 'process.versions.node.split(".")[0]')"
[[ "$node_major" -ge 24 ]] || fail "Node.js 24+ is required, got $(node --version)"

test_count="$(grep -Ec "^test\\('FV11-[0-9]{2}" packages/core/test/fv11-eligibility.test.ts)"
[[ "$test_count" -eq 24 ]] || fail "expected exactly 24 mandatory FV-11 runtime tests, got $test_count"

node --test packages/core/test/fv11-eligibility.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/core/tsconfig.json

jq -e '((.dependencies // {}) | length) == 0 and ((.optionalDependencies // {}) | length) == 0 and ((.peerDependencies // {}) | length) == 0' \
  packages/core/package.json >/dev/null \
  || fail '@calpq/core must remain runtime-dependency free in FV-11'

if grep -R -nE "from ['\"](react|react-native|expo|fastify|@?prisma|typeorm|sequelize|knex|drizzle|aws-sdk|@aws-sdk|openai|@anthropic-ai|tesseract|firebase)" \
  packages/core/src/eligibility --include='*.ts' >/dev/null; then
  fail 'framework/provider/persistence dependency leaked into FV-11 eligibility source'
fi

if grep -R -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' \
  packages/core/src/eligibility --include='*.ts' >/dev/null; then
  fail 'ambient wall-clock/randomness detected in deterministic FV-11 source'
fi

if grep -R -nE '\bAuthorizationGrant\b' packages/core/src/eligibility --include='*.ts' >/dev/null; then
  fail 'AuthorizationGrant behavior leaked into FV-11 eligibility source'
fi

bash tests/fv10_verification_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'FV11 ELIGIBILITY: PASS / 24 TESTS / VERSIONED RULES + EVIDENCE SNAPSHOT / NO GRANT SEMANTICS\n'
