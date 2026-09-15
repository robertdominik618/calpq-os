# CALPQ M03 Slice 07 Implementation Contract — Intent-Oriented Search over Approved Query Models

Status: `IMPLEMENTING / EXECUTABLE EVIDENCE ADDED`
ID: `CALPQ-M03-S07-0001`

Admission: `CALPQ-M03-ADMIT-0001`.
Reviewed predecessor: M03 Slice 06 merge commit `54189c3a08cceb5c457a595a18288fd59e674bb9`.
Tracking issue: #72.
Implementation branch: `impl/m03-s07-intent-search`.

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
`IntentSearchIntent` is closed to:
1. `CREDENTIAL` — Passport summary and Credential Card records only;
2. `EVIDENCE` — source/evidence/verification presentation records only;
3. `EXPLANATION` — source/evidence/verification plus requirement-reason presentation;
4. `ACTIVITY` — timeline events/omissions only;
5. `NEXT_ACTION` — missing-condition and governed-next-action records only.

M03 does not use free-form AI classification to select an intent.

## Matching and ranking
Search terms are normalized deterministically with Unicode NFKC, trim and lowercase. A record matches only if every query term matches at least one admitted record token. Supported match semantics are closed to `EXACT` and `PREFIX`.

The score is a presentation-only deterministic weight used solely for ordering search results. Exact matches receive a fixed advantage over prefix matches. Ties are broken deterministically by source kind, record kind and stable record ID. Input model ordering must not affect output ordering.

`rankingAuthority = false`; ranking cannot create facts, modify eligibility or imply legal priority.

## Subject and source isolation
Every query carries an explicit `SubjectReference`. Every admitted query model must belong to that same subject or composition fails closed. Intent scope filters source kinds and record kinds before matching.

Raw provider payloads, unapproved storage records, external search indexes and arbitrary free-form domain objects are not accepted.

## Result contract
Search returns immutable `IntentSearchHit` records containing only source kind, record kind, stable record ID, score, matched fields/match kinds and governed supporting references. Zero-result cases are explicit as `NO_MATCHING_APPROVED_RECORDS`. Result truncation is explicit.

All root/query/model/hit authority flags remain false: `searchAuthority`, `rankingAuthority`, `decisionAuthority`, `authorizationAuthority` where applicable.

## Hard boundaries
- no business/legal truth computed by search;
- no eligibility recomputation or requirement aggregation;
- no verification promotion;
- no lifecycle inference;
- no AuthorizationGrant issuance or implication;
- no M04 Credential Catalog or QualificationPath ownership;
- no provider SDK/search-engine dependency;
- no embeddings, vector/semantic similarity, fuzzy search or LLM classification in M03 Slice 07;
- no ambient time or randomness;
- no cross-subject retrieval;
- no search result/ranking treated as domain evidence or decision;
- deterministic serialization and immutable nested output.

## Verification target
Dedicated evidence must prove exactly 36 runtime scenarios plus strict TypeScript proof, reviewed Slice 06 ancestry, controlled intent/source isolation, subject isolation, deterministic ranking and input-order independence, explicit no-result/truncation semantics, authority-zero boundaries and regressions through M03 Slice 01 plus relevant FV contracts.

No mandatory test is waived or deferred.
