# CALPQ M03 Slice 03 Implementation Contract — Credential Card Separated State Presentation

Status: `COMPLETED / VERIFIED`
ID: `CALPQ-M03-S03-0001`

Admission: `CALPQ-M03-ADMIT-0001`.
Reviewed predecessor: M03 Slice 02 merge commit `953dac4785d613c9ab0c7247e8064f7de2b657de`.
Tracking issue: #61.
Source-boundary commit: `fc9fe52772fa5bb21f36b7a369505c6b83fe841a`.
Executable-evidence commit: `c53d0f116d2214e3a0988a0a73cd33e9a06b6fbb`.
Compile-proof correction / verified pre-exit head: `391b7fd6c102df22ee48e690de8439bb45903ca0`.

## Scope
Slice 03 introduces an immutable framework-neutral `CredentialCardReadModel` over one governed `ProfessionalPassportProjection` with four explicitly separate facets:
1. Document;
2. Verification;
3. Eligibility;
4. Lifecycle.

## Document facet
Document presentation is supplied only through an explicit `CredentialCardDocumentBinding` to a governed `CredentialArtifact`.

Verified rules:
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
M03 does not own lifecycle truth. Until an admitted lifecycle source exists, the lifecycle facet is explicitly:
- availability `SOURCE_NOT_AVAILABLE`;
- source `NONE`;
- reason `LIFECYCLE_SOURCE_NOT_AVAILABLE_IN_M03`;
- lifecycle state and evaluation instant `null`.

Document `expiresOn`, `effectiveFrom` or `issuedOn` is never converted by Slice 03 into ACTIVE, EXPIRED, RENEWAL_DUE or an equivalent lifecycle conclusion.

## Hard boundaries verified
- document != verification != eligibility != lifecycle != authorization;
- no generic `valid`, `isValid`, `current`, `latest`, `active` or `expired` credential conclusion at card level;
- no `AuthorizationGrant` issuance or implication;
- no M04 catalog/QualificationPath ownership;
- no M06 lifecycle authority;
- no provider SDK or UI framework dependency;
- no ambient wall-clock or randomness;
- UI consumers render the card contract rather than reproduce domain logic.

## Verification evidence
On `391b7fd6c102df22ee48e690de8439bb45903ca0`:
- M03 Slice 03 Credential Card #4 — SUCCESS;
- exact runtime result: 24 tests, 24 pass, 0 fail, 0 skipped, 0 todo;
- strict TypeScript compile-time proof — PASS;
- reviewed Slice 02 ancestry guard — PASS;
- M03 Slice 02 Passport Summary #11 — SUCCESS;
- M03 Slice 01 Dashboard Read Models #18 — SUCCESS;
- FV-12 Professional Passport #55 — SUCCESS;
- M03-M08 Execution Readiness #267 — SUCCESS;
- Foundation Guard #1008 — SUCCESS;
- M00 Readiness #887 — SUCCESS;
- M02 Batch Readiness #296 — SUCCESS;
- Program Execution Readiness #310 — SUCCESS;
- CALPQ v1 Execution Index #247 — SUCCESS;
- M09-M12 Execution Readiness #256 and all other triggered FV/global regressions — SUCCESS.

The earlier dedicated run #2 proved all 24 runtime scenarios but exposed a compile-proof annotation-location error only. Commit `391b7fd6c102df22ee48e690de8439bb45903ca0` moved the `@ts-expect-error` to the actual TypeScript diagnostic line; product source and runtime behavior were unchanged. Run #4 then proved both runtime and compile-time evidence green.

## Recovery / migration
No schema or data migration. Slice 03 is additive and reversible without changing M02 authoritative state or history.

No mandatory test was waived or deferred. Hard blockers: 0.
