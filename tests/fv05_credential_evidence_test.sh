#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'FV05 CREDENTIAL EVIDENCE: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] \
  || fail "FV-05 tests require POST_FV00_IMPLEMENTATION, got $phase"

command -v node >/dev/null 2>&1 || fail 'node is required'
command -v npm >/dev/null 2>&1 || fail 'npm is required for pinned TypeScript compiler execution'
command -v jq >/dev/null 2>&1 || fail 'jq is required'

node_major="$(node -p 'process.versions.node.split(".")[0]')"
[[ "$node_major" -ge 24 ]] || fail "Node.js 24+ is required, got $(node --version)"

test_count="$(grep -Ec "^test\\('FV05-[0-9]{2}" packages/core/test/fv05-credential-artifact.test.ts)"
[[ "$test_count" -eq 18 ]] || fail "expected exactly 18 mandatory FV-05 runtime tests, got $test_count"

node --test packages/core/test/fv05-credential-artifact.test.ts
npx --yes --package=typescript@7.0.2 -- tsc -p packages/core/tsconfig.json

jq -e '((.dependencies // {}) | length) == 0 and ((.optionalDependencies // {}) | length) == 0 and ((.peerDependencies // {}) | length) == 0' \
  packages/core/package.json >/dev/null \
  || fail '@calpq/core must remain runtime-dependency free in FV-05'

if grep -R -nE "from ['\"](react|react-native|expo|fastify|@?prisma|typeorm|sequelize|knex|drizzle|aws-sdk|@aws-sdk|openai|@anthropic-ai|tesseract|firebase)" \
  packages/core/src packages/core/test-support --include='*.ts' >/dev/null; then
  fail 'forbidden framework/provider dependency imported into FV-05 Core surface'
fi

if grep -R -nE 'Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(' \
  packages/core/src packages/core/test-support --include='*.ts' >/dev/null; then
  fail 'global wall-clock/randomness/UUID generation detected in deterministic Core'
fi

if grep -R -nE '\b(AuthorizationGrant|EligibilityAssessment|GrantAuthorization|RequirementSet)\b' \
  packages/core/src/credential --include='*.ts' >/dev/null; then
  fail 'eligibility/grant capability leaked into FV-05 credential evidence source'
fi

if grep -R -nE '\b(W3C|OpenID|EUDI|mdoc|OID4VC|VC-JOSE|SD-JWT)\b' \
  packages/core/src/credential --include='*.ts' >/dev/null; then
  fail 'provider/interoperability protocol type leaked into Core credential evidence source'
fi

bash tests/fv04_transition_kernel_test.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

printf 'FV05 CREDENTIAL EVIDENCE: PASS / 18 TESTS / IMMUTABLE SNAPSHOT / NO ELIGIBILITY OR GRANT SEMANTICS\n'
