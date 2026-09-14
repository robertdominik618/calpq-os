# CALPQ FV-00 Domain and State Boundary

Status: `PLANNING / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M02-FV00-DOM-0001`

## Separation rule
`OriginalArtifact != extracted value != reviewed fact != VerificationRecord != EligibilityAssessment != Passport projection != AuthorizationGrant`.

## Mutable state
Only minimum intake/linking state may be mutable. It uses stable CALPQ IDs, explicit revision, expected-revision checks and stable command identity.

## Immutable records
Accepted evidence and decision records are append-only snapshots. Corrections create linked successor records instead of silently rewriting history.

## Projection
Professional Passport is read-only projection data rebuilt from authoritative inputs. It is never mutation authority.

## Verification outcomes
`UNVERIFIED`, `VERIFIED`, `FAILED`, `STALE`, `REVIEW_REQUIRED`, `NOT_APPLICABLE`.

## Eligibility outcomes
`SATISFIED`, `NOT_SATISFIED`, `INDETERMINATE`, `REVIEW_REQUIRED`.

Eligibility records exact CredentialDefinition, RequirementSet, source and evidence versions.

## Forbidden behavior
- derived content overwriting the immutable original;
- verification alone creating legal/operational authorization;
- historical eligibility being rewritten in place;
- Passport projection authorizing a regulated mutation;
- tenant-private mutation without explicit TenantContext;
- stale revision silently overwriting current state;
- replay/rebuild creating new authorization state.

## Persistence rule
Database rows, sequences, ORM entities and projections are not CALPQ domain identity or domain truth. Repositories expose domain records and UnitOfWork coordinates authoritative mutation, revision, event/outbox, outcome and audit reference where required.
