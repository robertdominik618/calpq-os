# Credential / Authorization Command & Event Catalog

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`  
ID: `CALPQ-DOM-CMD-0001`

## Commands

### Assessment

- `AssessEligibility`
- `ReassessEligibility`

Both bind a subject, credential definition, requirement-set version and evidence snapshot. Reassessment creates a new immutable assessment rather than changing an old one.

### Grant lifecycle

- `GrantAuthorization`
- `SuspendAuthorization`
- `ReinstateAuthorization`
- `RevokeAuthorization`
- `RenewAuthorization`
- `SupersedeAuthorization`

All state-changing commands use the shared command envelope, `expected_revision` and idempotency semantics from `CALPQ-M01-PREP-0002`.

## Grant decision basis

`GrantAuthorization` must reference one of:

1. a current admissible `EligibilityAssessment` with result `SATISFIED`; or
2. an attributable authority decision permitted by the applicable rule/policy.

`INDETERMINATE` and `REVIEW_REQUIRED` never auto-grant.

A `NOT_SATISFIED` result requires an explicit, policy-permitted discretionary override path; absence of such a policy is a hard domain rejection.

## Events

- `EligibilityAssessed`
- `AuthorizationGranted`
- `AuthorizationSuspended`
- `AuthorizationReinstated`
- `AuthorizationRevoked`
- `AuthorizationRenewed`
- `AuthorizationSuperseded`

Every event uses the shared event envelope and must include resulting aggregate revision plus causation/correlation metadata.

## Event payload rules

Events record decision-relevant facts, not UI labels. At minimum a lifecycle event identifies:

- authorization grant ID;
- subject and credential-definition references;
- prior/new lifecycle state where applicable;
- validity window changes where applicable;
- reason code;
- decision/authority attribution;
- evidence/provenance references.

## No hidden transitions

Repository adapters, jobs, UI actions, wallet importers and AI/OCR adapters may request commands but may not mutate authorization state directly.

Time passing may change the projected effective status but emits no fake domain event unless a separate business process actually records a decision.
