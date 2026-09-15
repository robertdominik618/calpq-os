# CALPQ M03 Slice 03 Implementation Contract — Credential Card Separated State Presentation

Status: `IMPLEMENTED / VERIFICATION PENDING`
ID: `CALPQ-M03-S03-0001`

Admission: `CALPQ-M03-ADMIT-0001`.
Reviewed predecessor: M03 Slice 02 merge commit `953dac4785d613c9ab0c7247e8064f7de2b657de`.
Tracking issue: #61.

## Scope
Slice 03 introduces an immutable framework-neutral `CredentialCardReadModel` over one governed `ProfessionalPassportProjection` with four explicitly separate facets:
1. Document;
2. Verification;
3. Eligibility;
4. Lifecycle.

## Document facet
Document presentation is supplied only through an explicit `CredentialCardDocumentBinding` to a governed `CredentialArtifact`.

Rules:
- no binding means `SOURCE_NOT_AVAILABLE`, not "document missing";
- binding must name the same `credentialDefinitionId` as the card;
- the artifact must have an explicit subject matching the Passport subject;
- artifact identity/kind/format and issued/effective/expiry dates are presentation metadata only;
- document facet intentionally does not expose or collapse artifact verification state;
- explicit binding has `associationAuthority = false`.

## Verification facet
Verification presentation is a read-only summary of states already present in `ProfessionalPassportProjection` items:
- all six governed evidence `VerificationStateCode` values remain separately counted;
- all five governed `VerificationRecordState` values remain separately counted;
- evidence without a linked verification record remains explicitly counted as unlinked;
- no singular combined verification/validity decision is produced.

## Eligibility facet
Eligibility is direct passthrough of the authoritative projected assessment identity, four-outcome result, CredentialDefinition/RequirementSet versions and evaluation instant. Slice 03 does not re-run or reinterpret eligibility.

## Lifecycle facet
M03 does not own lifecycle truth. Until an admitted lifecycle source exists, the lifecycle facet is always explicit:
- availability `SOURCE_NOT_AVAILABLE`;
- source `NONE`;
- reason `LIFECYCLE_SOURCE_NOT_AVAILABLE_IN_M03`;
- lifecycle state and evaluation instant remain `null`.

Document `expiresOn`, `effectiveFrom` or `issuedOn` must never be converted by Slice 03 into ACTIVE, EXPIRED, RENEWAL_DUE or any equivalent lifecycle conclusion.

## Hard boundaries
- document != verification != eligibility != lifecycle != authorization;
- no generic `valid`, `isValid`, `current`, `latest`, `active` or `expired` credential conclusion at card level;
- no `AuthorizationGrant` issuance or implication;
- no M04 catalog/QualificationPath ownership;
- no M06 lifecycle authority;
- no provider SDK or UI framework dependency;
- no ambient wall-clock or randomness;
- UI consumers render the card contract rather than reproduce domain logic.

## Recovery / migration
No schema or data migration. Slice 03 is additive and reversible without changing M02 authoritative state or history.

## Verification target
- exactly 24 mandatory runtime scenarios;
- strict TypeScript immutability and controlled-type proof;
- reviewed Slice 02 ancestry guard;
- Slice 02 + Slice 01 + FV-12 predecessor regressions;
- M03 admission and architecture guards;
- global CALPQ regression workflows.

No mandatory evidence may be waived or deferred.
