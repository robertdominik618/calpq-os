#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'M01 PREIMPLEMENTATION INTEGRITY: %s\n' "$1" >&2; exit 1; }

# This check is deliberately state-neutral. The older M01 planning guards continue
# to prove the pre-M00 BLOCKED/FROZEN state; this check proves that the immutable
# M01 design/contract package is still intact at the later FV-00 admission boundary.

required=(
  docs/prep/M01_CORE_KERNEL_CONTRACT_PACK.md
  docs/contracts/CORE_PRIMITIVES.md
  docs/contracts/CORE_PROVENANCE_AND_EVIDENCE.md
  docs/contracts/CORE_RESULT_AND_ERROR_MODEL.md
  docs/architecture/M01_CORE_IMPLEMENTATION_ORDER.md
  docs/prep/M01_CORE_KERNEL_TEST_MATRIX.md
  docs/contracts/AGGREGATE_COMMAND_EVENT_STATE_TRANSITION.md
  docs/contracts/COMMAND_EVENT_ENVELOPES.md
  docs/contracts/IDEMPOTENCY_AND_CONCURRENCY.md
  docs/contracts/STATE_TRANSITION_INVARIANTS.md
  docs/contracts/PERSISTENCE_AUTHORITY_BOUNDARY.md
  docs/contracts/UNIT_OF_WORK_TRANSACTION_MODEL.md
  docs/contracts/OUTBOX_INBOX_DELIVERY_MODEL.md
  docs/contracts/SCHEMA_MIGRATION_EVOLUTION_MODEL.md
  docs/contracts/DATA_INTEGRITY_RECONCILIATION_MODEL.md
  docs/prep/M01_PERSISTENCE_TRANSACTION_BASELINE.md
  docs/prep/M01_PERSISTENCE_TRANSACTION_TEST_MATRIX.md
  docs/contracts/APPLICATION_USE_CASE_HANDLER_MODEL.md
  docs/contracts/APPLICATION_EXECUTION_CONTEXT_MODEL.md
  docs/contracts/APPLICATION_PORT_CATALOG.md
  docs/contracts/APPLICATION_POLICY_ORCHESTRATION_BOUNDARY.md
  docs/contracts/APPLICATION_TRANSACTION_SIDE_EFFECT_ORDER.md
  docs/prep/M01_APPLICATION_LAYER_BASELINE.md
  docs/prep/M01_APPLICATION_LAYER_TEST_MATRIX.md
  docs/domain/CREDENTIAL_AUTHORIZATION_DOMAIN_BASELINE.md
  docs/domain/REQUIREMENT_ELIGIBILITY_MODEL.md
  docs/domain/CREDENTIAL_LIFECYCLE_STATE_MACHINE.md
  docs/domain/CREDENTIAL_COMMAND_EVENT_CATALOG.md
  docs/domain/CREDENTIAL_EVIDENCE_BINDING.md
  docs/interoperability/CREDENTIAL_INTEROPERABILITY_BOUNDARY.md
  docs/prep/M01_CREDENTIAL_DOMAIN_TEST_MATRIX.md
  docs/contracts/TRUST_REGISTRY_MODEL.md
  docs/contracts/AUTHORITY_RESOLUTION_MODEL.md
  docs/contracts/VERIFICATION_ORCHESTRATION_MODEL.md
  docs/contracts/VERIFIER_RELYING_PARTY_TRUST_MODEL.md
  docs/architecture/TRUST_SOURCE_ADAPTER_BOUNDARY.md
  docs/prep/M01_TRUST_REGISTRY_BASELINE.md
  docs/prep/M01_TRUST_REGISTRY_TEST_MATRIX.md
  docs/prep/M01_VERTICAL_ADMISSION_GATE.md
)

for file in "${required[@]}"; do
  [[ -f "$file" ]] || fail "missing contract artifact: $file"
  grep -q 'PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION' "$file" \
    || fail "M01 design boundary missing: $file"
done

grep -q 'UUIDv7' docs/contracts/CORE_PRIMITIVES.md || fail 'UUIDv7 identity policy missing'
grep -q 'Clock' docs/contracts/CORE_PRIMITIVES.md || fail 'Clock boundary missing'
grep -q 'REVIEW_REQUIRED' docs/contracts/CORE_RESULT_AND_ERROR_MODEL.md || fail 'review-required outcome missing'
grep -q 'expected_revision' docs/contracts/AGGREGATE_COMMAND_EVENT_STATE_TRANSITION.md || fail 'optimistic concurrency input missing'
grep -q 'No silent last-write-wins' docs/contracts/IDEMPOTENCY_AND_CONCURRENCY.md || fail 'last-write-wins prohibition missing'
grep -q 'Single mutation authority' docs/contracts/STATE_TRANSITION_INVARIANTS.md || fail 'aggregate mutation invariant missing'
grep -q 'database sequences and storage keys are never domain identity' docs/contracts/PERSISTENCE_AUTHORITY_BOUNDARY.md || fail 'persistence identity boundary missing'
grep -q 'at-least-once delivery' docs/contracts/OUTBOX_INBOX_DELIVERY_MODEL.md || fail 'persistence delivery boundary missing'
grep -q 'Applied migrations are immutable' docs/contracts/SCHEMA_MIGRATION_EVOLUTION_MODEL.md || fail 'persistence migration boundary missing'
grep -q 'legal/catalog version changes are domain versioning, not schema migration' docs/prep/M01_PERSISTENCE_TRANSACTION_BASELINE.md || fail 'domain/schema boundary missing'
grep -q 'Application orchestration != domain policy' docs/prep/M01_APPLICATION_LAYER_BASELINE.md || fail 'application orchestration boundary missing'
grep -q 'Query handler MUST NOT mutate authoritative state' docs/contracts/APPLICATION_USE_CASE_HANDLER_MODEL.md || fail 'query mutation boundary missing'
grep -q 'Application does not import provider SDKs' docs/contracts/APPLICATION_PORT_CATALOG.md || fail 'application port boundary missing'
grep -q 'only after durable commit' docs/contracts/APPLICATION_TRANSACTION_SIDE_EFFECT_ORDER.md || fail 'side-effect order missing'
grep -q 'AuthorizationGrant' docs/domain/CREDENTIAL_AUTHORIZATION_DOMAIN_BASELINE.md || fail 'authorization grant boundary missing'
grep -q 'AT_LEAST' docs/domain/REQUIREMENT_ELIGIBILITY_MODEL.md || fail 'eligibility threshold aggregation missing'
grep -q 'Two-axis model' docs/domain/CREDENTIAL_LIFECYCLE_STATE_MACHINE.md || fail 'two-axis lifecycle missing'
grep -q 'GrantAuthorization' docs/domain/CREDENTIAL_COMMAND_EVENT_CATALOG.md || fail 'grant command boundary missing'
grep -q 'immutable evidence snapshot' docs/domain/CREDENTIAL_EVIDENCE_BINDING.md || fail 'immutable evidence snapshot missing'
grep -q 'External credential formats' docs/interoperability/CREDENTIAL_INTEROPERABILITY_BOUNDARY.md || fail 'external credential adapter boundary missing'
grep -q 'Authority MUST NOT be inferred' docs/contracts/TRUST_REGISTRY_MODEL.md || fail 'identity/authority boundary missing'
grep -q 'cryptographic signature' docs/contracts/AUTHORITY_RESOLUTION_MODEL.md || fail 'signature/authority boundary missing'
grep -q 'Provider outage yields `INDETERMINATE`' docs/contracts/VERIFICATION_ORCHESTRATION_MODEL.md || fail 'provider outage semantic missing'
grep -q 'minimum necessary claims' docs/contracts/VERIFIER_RELYING_PARTY_TRUST_MODEL.md || fail 'verifier minimization missing'
grep -q 'Core MUST NOT depend' docs/architecture/TRUST_SOURCE_ADAPTER_BOUNDARY.md || fail 'trust adapter boundary missing'
grep -q 'verification never creates EligibilityAssessment or AuthorizationGrant by itself' docs/prep/M01_TRUST_REGISTRY_BASELINE.md || fail 'verification non-escalation missing'
grep -q 'AI may recommend a route but cannot promote authority state by itself' docs/prep/M01_TRUST_REGISTRY_TEST_MATRIX.md || fail 'AI authority boundary missing'
grep -q 'ADMITTED_FOR_IMPLEMENTATION' docs/prep/M01_VERTICAL_ADMISSION_GATE.md || fail 'vertical admission result contract missing'

# Admission is still a pre-implementation boundary. Product source before the
# formal FV-00 decision would make the admission evidence invalid.
implementation="$(find packages apps workers -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -o -name '*.swift' -o -name '*.kt' -o -name '*.java' -o -name '*.py' -o -name '*.go' -o -name '*.rs' -o -name '*.cs' -o -name '*.dart' \) -print -quit)"
[[ -z "$implementation" ]] || fail "product implementation source exists before FV-00 admission: $implementation"

printf 'M01 PREIMPLEMENTATION INTEGRITY: PASS\n'
