# CALPQ M03 Slice 04 Implementation Contract — Evidence & Source Explanation Views / Why? Affordance

Status: `IMPLEMENTING / EXECUTABLE EVIDENCE ADDED`
ID: `CALPQ-M03-S04-0001`

Admission: `CALPQ-M03-ADMIT-0001`.
Reviewed predecessor: M03 Slice 03 merge commit `f92032617783e1ddfc82aefc7e1bdea28534424a`.
Tracking issue: #64.
Implementation branch: `impl/m03-s04-evidence-source-explanation`.

## Scope
Slice 04 implements the fourth delivery slice from `M03_EXECUTION_PACKAGE.md`: evidence and source explanation views with an explicit `Why?` affordance.

The implementation adds an immutable framework-neutral `CredentialExplanationReadModel` bound simultaneously to:
1. a governed `CredentialCardReadModel`;
2. its governed `ProfessionalPassportProjection`;
3. the authoritative `EligibilityAssessment` from which the presentation projection originates.

The read model exposes explanation data only. It does not create, re-run or upgrade domain decisions.

## Explanation contract
Every Credential Card facet receives an explicit machine-readable `WHY` affordance: Document, Verification, Eligibility and Lifecycle.

`WHY` is an interaction/presentation affordance, not a new authority state. Each explanation carries a stable reason code, source-detail availability, governed source/evidence references when available, supporting references and `decisionAuthority = false`.

## Document explanation
Document explanation preserves only facts already present in Slice 03:
- unavailable source remains `DOCUMENT_SOURCE_NOT_AVAILABLE`;
- an explicitly bound artifact is explained by `DOCUMENT_PRESENTED_FROM_EXPLICIT_BINDING`;
- artifact and binding identifiers may be exposed as supporting references;
- Slice 04 does not invent `SourceReference` provenance for a document when that provenance was not admitted by Slice 03.

Therefore document source detail remains `SOURCE_NOT_AVAILABLE` until a governed document-provenance source is explicitly admitted.

## Verification explanation
Verification explanation is derived only from the governed Professional Passport projection and matching governed `EvidenceReference` values present in assessment provenance. It preserves evidence ID, provenance identity, evidence origin/authority class, evidence verification state, verification-record state/method, verifier/reviewer attribution, verification instant, source versions and content reference/hash.

No singular combined verification result is created. Absence of a governed EvidenceReference is explicitly represented as `SOURCE_NOT_AVAILABLE` with `GOVERNED_EVIDENCE_REFERENCE_NOT_AVAILABLE`.

## Eligibility explanation
Eligibility explanation is a direct presentation of the authoritative assessment. CredentialDefinition/RequirementSet identity/version, authoritative instant and outcome must match the Credential Card and Passport. Atomic requirement IDs, outcomes and reason codes are preserved, together with provenance identity, rule-set ID/version, evaluator attribution, governed `SourceReference` and governed `EvidenceReference` values.

Slice 04 never re-aggregates requirements and never recalculates eligibility.

## Lifecycle explanation
M03 still has no admitted lifecycle-authority source. Slice 04 therefore preserves `LIFECYCLE_SOURCE_NOT_AVAILABLE_IN_M03`, source detail `SOURCE_NOT_AVAILABLE`, and performs no lifecycle inference from document dates.

## Cross-input integrity
Composition fails closed if Credential Card, Passport or EligibilityAssessment has the wrong type; subject identity differs; assessment identity differs; CredentialDefinition or RequirementSet identity/version differs; authoritative eligibility outcome differs; evaluation instants differ; Passport item provenance differs from assessment provenance; or presentation inputs claim authorization authority.

## Source and evidence presentation
`CredentialSourceExplanation` exposes governed SourceReference identity/type, authority, jurisdiction, canonical locator, version/effective dates, retrieval instant, source verification state and content hash without reinterpretation.

`CredentialEvidenceExplanation` exposes governed EvidenceReference identity/kind/class, content reference/media type/hash, acquisition instant/actor, linked source identity, derivation parent and evidence verification state without reinterpretation.

## Hard boundaries
- no hidden eligibility rules or eligibility re-evaluation;
- no verification promotion;
- no combined credential/legal state;
- no lifecycle inference;
- no authorization issuance or implication;
- no M04 catalog/qualification-path ownership;
- no M06 lifecycle authority;
- no provider SDK or UI-framework dependency;
- no ambient wall-clock or randomness;
- no generated human-readable legal explanation as domain truth;
- stable reason/source/evidence references remain machine-readable and traceable;
- all nested outputs are immutable and deterministic.

## Verification target
Dedicated executable evidence must prove exactly 26 runtime scenarios plus strict TypeScript proof, reviewed Slice 03 ancestry, M03 S03/S02/S01 and FV-12 regressions, and architecture boundaries.

No mandatory test is waived or deferred.
