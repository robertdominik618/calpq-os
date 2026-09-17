# M05 Slice 07 — Verification Route Registry & Provider-Neutral Adapter Interface — Implementation Contract

Status: `IMPLEMENTATION AUTHORIZED / S07 BOUNDARY LOCKED`
Tracking issue: #121
Reviewed predecessor merge: `7f479f9e5807ab3493b9183a6e1169d48bceda13`

## Purpose

Implement the provider-neutral Application-layer registry and boundary for choosing and executing verification routes without allowing route availability, provider output, technical signatures, network success or provider-specific semantics to become evidence truth by themselves.

S07 answers three bounded questions:

1. Which governed verification routes are applicable to a request?
2. In which explicit policy order may those routes be attempted without lowering required assurance?
3. How is a provider result normalized into CALPQ route-result semantics while preserving S06 authority resolution and claim-level provenance?

## Canonical contract inputs

- `VERIFICATION_ORCHESTRATION_MODEL.md`
- `DOCUMENT_VERIFICATION_BOUNDARY.md`
- `APPLICATION_PORT_CATALOG.md`
- `TRUST_REGISTRY_MODEL.md`
- `AUTHORITY_RESOLUTION_MODEL.md`
- M05 S01–S06 reviewed implementation contracts and public Application surfaces

## Owned production model

S07 owns:

- caller-supplied stable UUIDv7 route, registry, request and attempt identifiers;
- controlled provider-neutral verification methods;
- controlled assurance levels and explicit assurance ordering;
- immutable `VerificationRouteDefinition` records;
- immutable `VerificationRouteRegistrySnapshot` objects;
- immutable `VerificationRequest` objects;
- deterministic claim-aware route selection using explicit route priority only;
- exact S06 `AuthorityResolutionResult` binding for each selected claim/route;
- a provider-neutral `VerificationProviderPort` interface;
- provider-neutral request/result envelopes with opaque adapter/result references only;
- normalized route outcomes `VERIFIED | FAILED | INDETERMINATE | REVIEW_REQUIRED | NOT_SUPPORTED`;
- claim-level aggregation that fails closed on conflicting successful assertions;
- deterministic serialization, explicit time and idempotency references.

## Verification methods

`OFFICIAL_REGISTRY_LOOKUP | ISSUER_API | TRUST_LIST_VALIDATION | SIGNED_DOCUMENT_VALIDATION | WALLET_PRESENTATION_VALIDATION | MANUAL_AUTHORITY_CONFIRMATION | HUMAN_REVIEW`

S07 may register manual/human routes but does not execute S08-owned manual authority confirmation. Provider-port requests reject manual/human workflow routes.

## Assurance levels

`BASIC | SUBSTANTIAL | HIGH`

Assurance comparison is explicit data in S07. Fallback may keep or increase assurance but must never silently lower it.

## Selection outcomes

`ROUTES_SELECTED | PARTIAL_ROUTES_SELECTED | REVIEW_REQUIRED | NOT_SUPPORTED`

A selected route is only eligible for a claim when:

- method is acceptable for the request;
- route assurance meets or exceeds required assurance;
- route jurisdiction and effective period match;
- route explicitly supports the claim;
- exact S06 authority resolution binds the same verifier entity, authority role, claim scope, jurisdiction and evaluation/knowledge instants;
- authority result is `AUTHORIZED` or `AUTHORIZED_WITH_CONDITIONS`.

## Provider-neutral adapter boundary

The Application port exposes CALPQ intent only. Provider URLs, SDK classes, credentials, tokens, protocol details and raw provider error objects are adapter-owned and must not cross into the Application/Core contract.

Normalized provider outcomes are:

`VERIFIED | FAILED | INDETERMINATE | REVIEW_REQUIRED | NOT_SUPPORTED`

Provider outage or timeout must be `INDETERMINATE`; it must never become `FAILED` claim truth. Provider output marked `VERIFIED` is normalized to `REVIEW_REQUIRED` when sufficient S06 authority is absent.

## Claim-level semantics

- partial verification affects only claims actually checked;
- unchecked claims remain unverified by S07;
- two successful route results for one claim with different assertion fingerprints require review;
- successful results with the same assertion fingerprint may agree without creating legal eligibility or authorization;
- route/result objects preserve exact checked claims, verifier/adapter identity, S06 authority resolution, source snapshot/version, checked-at time and opaque provider-result reference where needed;
- no raw document body or provider secret belongs in ordinary S07 records.

## Idempotency

Each provider execution request carries an explicit idempotency key. Repeating the same governed route request must not require or imply a new authoritative record. S07 never generates hidden IDs, time or randomness.

## Fail-closed rules

1. Route availability is not verification.
2. Provider reachability is not verification.
3. Technical signature validity proves only the checked cryptographic property.
4. Verified identity is not authority.
5. Authority alone is not a verification result.
6. Provider `VERIFIED` without sufficient S06 authority normalizes to `REVIEW_REQUIRED`.
7. Provider outage/timeout is `INDETERMINATE`, not `FAILED`.
8. Conflicting successful assertion fingerprints require review.
9. Fallback may not lower required assurance.
10. Manual/human routes remain S08-owned for execution.
11. No provider-specific status may become Core truth.
12. No S07 object creates `EligibilityAssessment`, `RecognitionDecision` or `AuthorizationGrant`.

## Immutability and time

All S07 route definitions, registry snapshots, requests, selections, provider envelopes and normalized results are immutable. Arrays are defensively copied/frozen. Evaluation time and knowledge cutoff are explicit inputs; no ambient clock is permitted.

## Non-goals / ownership boundary

S07 does **not**:

- implement concrete provider SDK adapters;
- store provider credentials, URLs or raw error payloads;
- execute S08 manual-authority confirmation;
- mutate S02 originals, S03 proposals or S04 review history;
- bypass S05 quarantine;
- mutate S06 Trust Registry snapshots or authority results;
- create final legal eligibility, recognition or authorization decisions.

S08 owns human-review/manual-authority confirmation.

**route availability != authority != route result != evidence verification beyond checked claims != eligibility != authorization**

## Exit evidence target

S07 must ship with:

- exactly 54 mandatory runtime scenarios;
- strict readonly TypeScript compile proof;
- exact ancestry from reviewed S06 merge;
- zero production Core/provider-adapter diff;
- no framework/provider SDK, ambient time or randomness dependency;
- S01–S06 + FV09/FV10 + M05 Admission + architecture regressions;
- dedicated S07 GitHub Actions workflow;
- durable test index and exit evidence.