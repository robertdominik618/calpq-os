#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'FV06 APPLICATION LAYER: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] \
  || fail "FV-06 tests require POST_FV00_IMPLEMENTATION, got $phase"

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'
command -v jq >/dev/null 2>&1 || fail 'jq is required'

node_major="$(node -p 'process.versions.node.split(".")[0]')"
[[ "$node_major" -ge 24 ]] || fail "Node.js 24+ is required, got $(node --version)"

test_count="$(grep -Ec "^test\\('FV06-[0-9]{2}" packages/application/test/fv06-application-context.test.ts)"
[[ "$test_count" -eq 16 ]] || fail "expected exactly 16 mandatory FV-06 runtime tests, got $test_count"

node --test packages/application/test/fv06-application-context.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json

jq -e '((.dependencies // {}) | length) == 0 and ((.optionalDependencies // {}) | length) == 0 and ((.peerDependencies // {}) | length) == 0' \
  packages/application/package.json >/dev/null \
  || fail '@calpq/application must remain free of provider/framework runtime dependencies in FV-06'

if grep -R -nE "from ['\"](react|react-native|expo|fastify|@?prisma|typeorm|sequelize|knex|drizzle|aws-sdk|@aws-sdk|openai|@anthropic-ai|tesseract|firebase)" \
  packages/application/src --include='*.ts' >/dev/null; then
  fail 'provider/framework dependency imported into FV-06 Application source'
fi

if grep -R -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' \
  packages/application/src --include='*.ts' >/dev/null; then
  fail 'ambient wall-clock/randomness access detected in FV-06 Application source'
fi

if grep -R -nE '\b(EligibilityAssessment|AuthorizationGrant)\b' packages/application/src --include='*.ts' >/dev/null; then
  fail 'authoritative domain-policy capability leaked into FV-06 Application source'
fi

if grep -R -nE 'application' packages/core/src --include='*.ts' >/dev/null; then
  fail 'Core must not depend on Application'
fi

bash tests/architecture_boundaries_test.sh >/dev/null

printf 'FV06 APPLICATION LAYER: PASS / 16 TESTS / ENTRYPOINT PARITY / PORT + POLICY BOUNDARIES\n'
