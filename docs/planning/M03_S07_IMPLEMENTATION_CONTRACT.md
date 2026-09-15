# CALPQ M03 Slice 07 Implementation Contract — Intent-Oriented Search over Approved Query Models

Status: `COMPLETED / VERIFIED`
ID: `CALPQ-M03-S07-0001`

Admission: `CALPQ-M03-ADMIT-0001`.
Reviewed predecessor: M03 Slice 06 merge commit `54189c3a08cceb5c457a595a18288fd59e674bb9`.
Tracking issue: #72.
Pull request: #73.
Implementation branch: `impl/m03-s07-intent-search`.
Verified implementation head: `a4d742f43a4fca93baf289e68df2005b4fd14bdf`.

## Scope
Slice 07 implements the seventh delivery slice from `M03_EXECUTION_PACKAGE.md`: intent-oriented search over approved query models.

M03 search is a deterministic presentation/retrieval capability. It consumes only read models already approved in M03 and never creates new legal/domain truth.

## Approved searchable surfaces
- `ProfessionalPassportSummaryReadModel`;
- `CredentialCardReadModel`;
- `CredentialExplanationReadModel`;
- `ActivityTimelineReadModel`;
- `MissingConditionNextActionReadModel`.

Each source is transformed into an immutable `ApprovedSearchQueryModel` containing only explicitly admitted stable machine-readable fields and governed references.

## Controlled intents
`IntentSearchIntent` is closed to Credential, Evidence, Explanation, Activity and Next Action. M03 does not use free-form AI classification to select an intent.

## Matching and ranking
Search terms are normalized deterministically with Unicode NFKC, trim and lowercase. Records use closed EXACT and PREFIX matching. Every query term must match within the same approved record.

Scoring is presentation-only. Exact matches receive a fixed advantage over prefix matches. Ties are broken deterministically by source kind, record kind and stable record ID; input model order does not affect output order. `rankingAuthority = false`.

## Subject and source isolation
Every query carries an explicit `SubjectReference`. Every admitted query model must belong to that subject or composition fails closed. Intent scope filters approved source/record kinds before matching. Raw provider payloads and arbitrary free-form domain objects are not accepted.

## Result contract
Search returns immutable hits containing source kind, record kind, stable ID, score, matched fields/match kinds and governed supporting references. Zero-result cases are explicit as `NO_MATCHING_APPROVED_RECORDS`; truncation is explicit.

All query/model/result/hit authority flags remain false: `searchAuthority`, `rankingAuthority`, `decisionAuthority`, `authorizationAuthority` where applicable.

## Hard boundaries
- no business/legal truth computed by search;
- no eligibility recomputation or requirement aggregation;
- no verification promotion;
- no lifecycle inference;
- no AuthorizationGrant issuance or implication;
- no M04 Credential Catalog or QualificationPath ownership;
- no provider/search-engine SDK dependency;
- no embeddings, vector/semantic similarity, fuzzy search or LLM intent classification;
- no ambient time or randomness;
- no cross-subject retrieval;
- no search ranking treated as domain evidence or decision;
- deterministic serialization and immutable nested output.

## Verification evidence
On `a4d742f43a4fca93baf289e68df2005b4fd14bdf`:
- M03 Slice 07 Intent Search #6 — SUCCESS;
- exactly 36/36 mandatory runtime scenarios — PASS;
- strict TypeScript compile-time proof — PASS;
- reviewed Slice 06 ancestry guard — PASS;
- controlled-intent and subject/source isolation — PASS;
- deterministic matching/ranking and input-order independence — PASS;
- explicit no-result/truncation semantics — PASS;
- architecture/authority boundaries — PASS;
- all 23 observed PR-triggered workflows — SUCCESS.

No mandatory test was waived or deferred. Hard blockers: 0.

The evidence-packaging commit remains subject to final CI before PR #73 is marked ready for review.