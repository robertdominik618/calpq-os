#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'FV04 TRANSITION KERNEL: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] \
  || fail "FV-04 tests require POST_FV00_IMPLEMENTATION, got $phase"

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'
command -v jq >/dev/null 2>&1 || fail 'jq is required'

node_major="$(node -p 'process.versions.node.split(".")[0]')"
[[ "$node_major" -ge 24 ]] || fail "Node.js 24+ is required, got $(node --version)"

test_count="$(grep -Ec "^test\\('FV04-[0-9]{2}" packages/core/test/fv04-transition-kernel.test.ts)"
[[ "$test_count" -eq 18 ]] || fail "expected exactly 18 mandatory FV-04 runtime tests, got $test_count"

node --test packages/core/test/fv04-transition-kernel.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/core/tsconfig.json

jq -e '((.dependencies // {}) | length) == 0 and ((.optionalDependencies // {}) | length) == 0 and ((.peerDependencies // {}) | length) == 0' \
  packages/core/package.json >/dev/null \
  || fail '@calpq/core must remain runtime-dependency free in FV-04'

if grep -R -nE "from ['\"](react|react-native|expo|fastify|@?prisma|typeorm|sequelize|knex|drizzle|aws-sdk|@aws-sdk|openai|@anthropic-ai|tesseract|firebase)" \
  packages/core/src packages/core/test-support --include='*.ts' >/dev/null; then
  fail 'forbidden framework/provider dependency imported into FV-04 Core surface'
fi

if grep -R -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' \
  packages/core/src packages/core/test-support --include='*.ts' >/dev/null; then
  fail 'global wall-clock/randomness/UUID generation detected in deterministic Core'
fi

if grep -R -nE "from ['\"][^'\"]*(prisma|typeorm|sequelize|knex|drizzle|redis|postgres|mysql|sqlite|repository|storage)" \
  packages/core/src/transition --include='*.ts' >/dev/null; then
  fail 'persistence/idempotency storage dependency leaked into transition kernel'
fi

if grep -R -nE '\b(CredentialArtifact|EligibilityAssessment|AuthorizationGrant)\b' \
  packages/core/src packages/core/test-support --include='*.ts' >/dev/null; then
  fail 'later-phase domain capability leaked into FV-04 source'
fi

bash tests/fv03_core_provenance_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'FV04 TRANSITION KERNEL: PASS / 18 TESTS / REVISION + REPLAY + IMMUTABLE EVENTS / NO STORAGE COUPLING\n'
