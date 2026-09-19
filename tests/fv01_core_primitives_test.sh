#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'FV01 CORE PRIMITIVES: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] \
  || fail "FV-01 tests require POST_FV00_IMPLEMENTATION, got $phase"

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'
command -v jq >/dev/null 2>&1 || fail 'jq is required'

node_major="$(node -p 'process.versions.node.split(".")[0]')"
[[ "$node_major" -ge 24 ]] || fail "Node.js 24+ is required, got $(node --version)"

test_count="$(grep -Ec "^test\\('FV01-[0-9]{2}" packages/core/test/fv01-primitives.test.ts)"
[[ "$test_count" -eq 21 ]] || fail "expected exactly 21 mandatory FV-01 runtime tests, got $test_count"

node --test packages/core/test/fv01-primitives.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/core/tsconfig.json

jq -e '((.dependencies // {}) | length) == 0 and ((.optionalDependencies // {}) | length) == 0 and ((.peerDependencies // {}) | length) == 0' \
  packages/core/package.json >/dev/null \
  || fail '@calpq/core must remain runtime-dependency free in FV-01'

if grep -R -nE "from ['\"](react|react-native|expo|fastify|@?prisma|typeorm|sequelize|knex|drizzle|aws-sdk|@aws-sdk|openai|@anthropic-ai|tesseract|firebase)" packages/core/src --include='*.ts' >/dev/null; then
  fail 'forbidden framework/provider dependency imported into Core'
fi

if grep -R -nE 'Date\.now\(|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' packages/core/src --include='*.ts' >/dev/null; then
  fail 'global wall-clock/randomness access detected in deterministic Core primitives'
fi

fv01_owned=(
  packages/core/src/ids.ts
  packages/core/src/time.ts
  packages/core/src/revision.ts
  packages/core/src/version.ts
  packages/core/src/party-references.ts
  packages/core/src/jurisdiction.ts
  packages/core/src/verification-state.ts
)
if grep -nE '\b(CredentialArtifact|EligibilityAssessment|AuthorizationGrant)\b' "${fv01_owned[@]}" >/dev/null; then
  fail 'later-phase domain capability leaked into FV-01-owned primitive source'
fi

printf 'FV01 CORE PRIMITIVES: PASS / 21 TESTS / TYPE BOUNDARIES / DEPENDENCY BOUNDARY\n'
