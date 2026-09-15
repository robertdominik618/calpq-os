# CALPQ M03 Slice 06 — Missing Condition & Governed Next Action Presentation

Status: `IMPLEMENTING`
ID: `CALPQ-M03-S06-IMPL-0001`
Tracking: issue #70
Reviewed predecessor: M03 Slice 05 merge `41ed1dc445276cf88d5a3584a7d259d24c2f96b1`

## Objective
Present what is missing or uncertain from the authoritative eligibility assessment and present a next action only when that action is explicitly supplied as a governed reference. M03 must not become a qualification-path, lifecycle, legal-advice, or action-recommendation authority.

## Authoritative inputs
- `EligibilityAssessment` is authoritative for subject, assessment identity, credential-definition/version, requirement-set/version, evaluated-at instant, atomic outcomes, atomic reason codes, evaluator and provenance.
- `CredentialExplanationReadModel` is accepted only as a non-authoritative presentation input and must be exactly bound to the same assessment/provenance/rule context.
- `GovernedNextActionReference` is an explicit presentation input. Its existence is never inferred from reason-code wording, dates, verification state, UI state or historical ordering.

## Missing-condition semantics
Only atomic requirements whose authoritative outcome is not `SATISFIED` are presented as missing/attention conditions.

The three non-satisfied states remain distinct:
- `NOT_SATISFIED` — authoritative requirement result is not satisfied;
- `INDETERMINATE` — authoritative result is indeterminate;
- `REVIEW_REQUIRED` — authoritative result requires review.

No group result is recomputed and no root eligibility outcome is recalculated.

## Governed next-action semantics
A next action is `AVAILABLE` only when an explicit `GovernedNextActionReference` is supplied and all bindings pass fail-closed validation:
- same assessment ID;
- same decision/provenance identity;
- referenced requirement exists;
- referenced requirement is not `SATISFIED`;
- referenced reason code is present verbatim in the authoritative atomic result;
- every supporting source ID belongs to assessment provenance;
- every supporting evidence ID belongs to assessment provenance.

Without such an explicit reference, the condition returns:
`NOT_AVAILABLE_FROM_GOVERNED_OUTPUTS`
with presentation reason:
`NO_GOVERNED_ACTION_REFERENCE`.

This is intentional. M03 must not guess that a reason code containing words such as MISSING, EXPIRY, REVIEW, EVIDENCE or SOURCE implies a particular legal or operational action.

## Output contract
`MissingConditionNextActionReadModel` exposes:
- subject and exact assessment/credential/requirement-set identities and versions;
- authoritative evaluated-at instant;
- provenance identity and rule-set/version;
- authoritative root eligibility outcome without re-evaluation;
- ordered `MissingConditionPresentation` entries preserving authoritative atomic order and reason-code order;
- explicit next-action availability/reason;
- zero or more deterministic `GovernedNextActionPresentation` entries;
- counts for missing conditions and conditions with governed actions;
- `authorizationAuthority = false`;
- `decisionAuthority = false`;
- `actionRecommendationAuthority = false`.

## Determinism and immutability
- no ambient clock;
- no random IDs;
- no provider state;
- missing-condition order preserves authoritative atomic-result order;
- multiple governed actions for one condition are sorted deterministically by action code, reason code and label key;
- root and nested arrays/objects are immutable;
- serialization is deterministic for identical inputs.

## Hard boundaries
Prohibited in Slice 06:
- eligibility re-evaluation or group recomputation;
- action inference from reason-code text or presentation labels;
- verification promotion;
- lifecycle/expiry inference;
- `AuthorizationGrant` issuance or implication;
- M04 qualification-path authority;
- M06 lifecycle/renewal authority;
- AI/provider decision authority;
- UI-framework or provider SDK dependency;
- ambient time/randomness.

## Evidence requirements
- exactly 34 dedicated runtime scenarios;
- strict TypeScript compile proof;
- reviewed Slice 05 ancestry guard;
- source-level architecture guards for framework/provider leakage, ambient time/randomness, lifecycle/authorization authority and reason-code text inference;
- embedded regression of M03 S05/S04/S03/S02/S01, FV-12, FV-11, M03 Admission and architecture boundaries;
- normal PR-wide workflow matrix.

No mandatory evidence may be waived or deferred.
