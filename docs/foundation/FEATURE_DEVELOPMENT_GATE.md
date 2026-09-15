# CALPQ Feature Development Gate

Status: `FOUNDATION GOVERNANCE / NORMATIVE`  
ID: `CALPQ-FEATURE-GATE-0001`  
Date: `2026-09-14`

## Purpose

The Feature Development Gate separates release of the CALPQ M00 Foundation from authorization to create product implementation code.

M00 release is a prerequisite, not an implicit authorization to implement product features.

## State model

### LOCKED

Machine state:
- `foundation/manifest.json -> feature_development = FROZEN`;
- `foundation/feature-development-gate.json -> state = LOCKED`.

While LOCKED, Foundation Guard rejects product source files and feature source directories. Architecture, planning, governance and explicitly permitted bootstrap shells remain allowed.

### OPEN

Machine state:
- `foundation/manifest.json -> m00_release_status = RELEASED`;
- `foundation/manifest.json -> feature_development = AUTHORIZED`;
- `foundation/manifest.json -> quality_gates.feature_development_gate = OPEN`;
- `foundation/feature-development-gate.json -> state = OPEN`.

OPEN requires complete transition evidence: opening revision, transition ID, approving identity, approval timestamp and the next gate `FV00_FORMAL_ADMISSION`.

## Required predecessor evidence

The gate may not open unless all of the following are true:

1. M00 is explicitly `RELEASED`;
2. the M00 release decision is `APPROVED`;
3. the M00 release evidence contains no remaining blockers;
4. `CALPQ main protection` remains externally observable and valid;
5. feature development is still `FROZEN` immediately before transition;
6. the feature gate is still `LOCKED` immediately before transition;
7. a separate explicit feature-development approval is supplied.

## Explicit approval

The canonical transition requires:

`CALPQ_FEATURE_DEVELOPMENT_APPROVAL=APPROVE_CALPQ_FEATURE_DEVELOPMENT`

and a non-empty:

`CALPQ_FEATURE_DEVELOPMENT_APPROVED_BY`.

The canonical transaction is `scripts/feature_development_gate_transition.sh`.

## Atomic transition

The only approved transition is:

- `feature_development: FROZEN -> AUTHORIZED`;
- `feature-development-gate.state: LOCKED -> OPEN`.

The transition records:
- reviewed/opening revision;
- transition ID `CALPQ-FEATURE-GATE-OPEN-0001`;
- approving identity;
- approval timestamp;
- next governance boundary `FV00_FORMAL_ADMISSION`.

The transaction validates generated state before replacement and restores prior files if post-transition consistency checks fail.

## Non-effects

Opening this gate does **not**:
- admit FV-00;
- admit any later vertical;
- authorize a specific implementation batch;
- waive architecture, security, privacy, legal, source or evidence constraints;
- authorize M02 Batch A by itself;
- authorize GA or production deployment.

After this gate is OPEN, the next required project decision is a separate FV-00 formal admission decision.

## Enforcement

`scripts/feature_development_gate_check.sh` verifies the manifest/gate/release relationship.

`Foundation Guard` invokes that check on every run. While the feature state is `FROZEN`, product source remains forbidden. Product source becomes structurally permissible only when the gate is OPEN and the M00 release evidence is valid.

`tests/feature_development_gate_test.sh` provides positive and negative transition self-tests, including attempts to open the gate before M00 release, manifest-only opening, gate-only opening and missing explicit approval.
