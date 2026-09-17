# M05 Slice 06 — Trust Registry & Issuer/Verifier Identity Resolution — Implementation Contract

Status: `IMPLEMENTATION AUTHORIZED / S06 BOUNDARY LOCKED`
Tracking issue: #119
Reviewed predecessor merge: `154bb21d9146daa71757340f20e90064a242923c`

## Purpose

Implement the provider-neutral Application-layer Trust Registry required by M05 without turning identity, technical reachability, signatures, names or provider output into authority.

S06 answers two different questions:

1. **Identity resolution:** do two identity records refer to the same real-world subject?
2. **Authority resolution:** is one resolved TrustEntity authoritative for one explicit role + claim scope + jurisdiction + effective time under known trust anchors?

These questions remain separate by construction.

## Canonical contract inputs

- `TRUST_REGISTRY_MODEL.md`
- `ENTITY_RESOLUTION_MODEL.md`
- `AUTHORITY_RESOLUTION_MODEL.md`
- `DOCUMENT_VERIFICATION_BOUNDARY.md`
- `VERIFIER_RELYING_PARTY_TRUST_MODEL.md`
- `VERIFICATION_ORCHESTRATION_MODEL.md` only as the S07 ownership boundary

## Owned production model

S06 owns:

- caller-supplied stable UUIDv7 Trust Registry identifiers;
- immutable `TrustEntity` records;
- controlled entity status/kind and identifiers;
- immutable `AuthorityScope` records;
- immutable `TrustAnchorRecord` source snapshots;
- exact verification states `VERIFIED | UNVERIFIED | STALE | REVOKED | SUSPENDED | REVIEW_REQUIRED`;
- immutable `TrustRegistrySnapshot` objects with valid-time and knowledge-time inputs;
- explicit identity-resolution signals and deterministic outcomes;
- deterministic authority resolution with exact matched scope/anchor provenance;
- historical reproducibility: later trust changes create a new snapshot and never rewrite an old result.

## Controlled authority roles

`ISSUER | VERIFIER | REGISTRY_OPERATOR | SUPERVISORY_BODY | TRUST_SERVICE_PROVIDER | ACCREDITATION_BODY | OTHER`

## Identity-resolution outcomes

`SAME_SUBJECT | DIFFERENT_SUBJECTS | POSSIBLE_MATCH | REVIEW_REQUIRED | INDETERMINATE`

Weak signals may produce candidates but **must not independently produce `SAME_SUBJECT`**.

## Authority-resolution outcomes

`AUTHORIZED | AUTHORIZED_WITH_CONDITIONS | NOT_AUTHORIZED | INDETERMINATE | REVIEW_REQUIRED`

Authority is evaluated only against exact role + claim scope + jurisdiction + effective time and only from trust anchors known by the explicit `asKnownAt` cutoff.

## Fail-closed rules

1. Verified identity does not imply authority.
2. Name/domain/logo/signature/employment/reachability do not independently establish authority.
3. A scope without a known sufficient trust anchor cannot produce unconditional `AUTHORIZED`.
4. `UNVERIFIED`, `STALE` or `REVIEW_REQUIRED` anchors route to review/indeterminate semantics.
5. `REVOKED` or `SUSPENDED` anchors never silently authorize.
6. A conflicting verified/adverse anchor set routes to `REVIEW_REQUIRED`.
7. A strong authoritative identity conflict prevents silent subject merge.
8. Organization authority never auto-propagates to employees/subcontractors/subsidiaries.
9. Cryptographic validity is not legal/domain authority.
10. Source priority is explicit data/policy input; AI may not guess it.

## Temporal semantics

S06 separates:

- `evaluationInstant`: when the requested authority must have been effective;
- `asKnownAt`: latest source retrieval/knowledge instant allowed in the decision.

A trust anchor retrieved after `asKnownAt` is invisible to that resolution. This prevents hindsight in historical replay.

## Immutability

All registry entities, scopes, anchors, snapshots, signals and resolution results are immutable. Arrays are defensively copied/frozen. Superseding registry states require new objects/snapshots.

## Non-goals / hard ownership boundary

S06 does **not**:

- select or rank verification routes;
- call issuer/registry/trust-service/provider SDKs;
- own network URLs, credentials or protocol details;
- create `TechnicalVerificationResult`;
- promote evidence to VERIFIED;
- determine `EligibilityAssessment`;
- create `RecognitionDecision` or `AuthorizationGrant`;
- implement S07 provider-neutral adapter routing;
- implement S08 manual authority confirmation workflow.

**identity != authority != verification route != evidence verification != eligibility != authorization**

## Exit evidence target

S06 must ship with:

- exactly 52 mandatory runtime scenarios;
- strict readonly TypeScript compile proof;
- exact ancestry from reviewed S05 merge;
- no production Core/provider-adapter diff;
- no framework/provider SDK, ambient time or randomness dependency;
- S01-S05 + FV09/FV10 + M05 Admission + architecture regressions;
- dedicated S06 GitHub Actions workflow;
- durable test index and exit evidence.
