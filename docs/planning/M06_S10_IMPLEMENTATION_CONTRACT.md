# M06 Slice 10 — Milestone Integration Evidence

Status: `AUTHORIZED / CONTRACT BEFORE TEST IMPLEMENTATION / PREDECESSOR POST-MERGE VERIFIED`
Tracking issue #158; epic issue #36.
Owner authorization: **SCHVALUJI MERGE PR #157 A POKRAČOVÁNÍ NA M06 SLICE 10.**
Verified predecessor: PR #157 reviewed head `157e5b5112d8a1bf99b2d25822e21132a4adb9ad` merged as `302ce5c9feb6b15a0897c54f982a6883f9e98344`; PR #157 comment **5744011994** records actual merge-associated **51/51 completed SUCCESS**.

## Purpose
Slice 10 is the final M06 integration-evidence slice. It does not introduce a new lifecycle business engine. It proves that the already-authorized S01-S09 outputs compose coherently across the canonical milestone scenarios while preserving all authority, history, privacy and determinism boundaries.

## Canonical integration scenarios

### A. Expiry / renewal lifecycle
Evidence must show the governed chain from lifecycle basis and explicit calendar facts through:
- S01 lifecycle timeline;
- S02 expiry/renewal policy;
- S03 recurring obligations where applicable;
- S04 renewal workflow;
- S05 notification intent projection;
- S08 current continuous-compliance projection;
- S09 historical AS_WAS / AS_IS replay when comparison is requested.

The chain must preserve the rule that expiry/renewal planning does not self-issue authorization and notification delivery does not become domain truth.

### B. Changed evidence
Evidence must show:
- a governed evidence-verification change represented as an S06 change event;
- bounded S06 dependency traversal selecting only materially linked targets;
- S07 selective reevaluation producing new immutable decision evidence;
- S08 projection using governed reevaluation evidence without treating generic result text as compliance truth;
- S09 comparison preserving historical decision evidence and separating current state from historical state.

Unrelated targets must remain untouched; no global rebuild is permitted.

### C. Changed requirement / rule
Evidence must show:
- a governed rule or requirement-set change;
- exact graph/version/provenance linkage;
- bounded downstream candidate discovery;
- deterministic selective reevaluation;
- present/future continuous-compliance distinction;
- historical AS_WAS and current AS_IS separation;
- explainable difference metadata where inputs/versions differ.

Current rules must never be substituted into AS_WAS replay.

## Integration evidence model
The S10 executable test harness may define test-only immutable integration evidence records. These records are not production domain objects and MUST NOT be exported from `@calpq/application`.

Each integration evidence record must bind:
- scenario family and case ID;
- source slice references;
- exact input/output identity references;
- deterministic reason codes;
- explicit authority/mutation flags;
- evidence of cross-slice linkage;
- expected current/historical boundary;
- safe metadata only.

No new Application business source file is authorized by this slice.

## Determinism and immutability
The same governed inputs must yield byte-stable integration evidence. Input fixtures and existing S01-S09 outputs must remain unchanged.

The integration runner may call existing public slice APIs and unchanged existing test runners. It may not bypass public contracts by monkey-patching private state or replacing historical source files.

## Scope and privacy
All integrated examples remain tenant/organization/subject/purpose scoped where the contributing slice requires it.

Output evidence must exclude raw documents, storage locators, provider payloads, contact data and secrets.

## Required negative authority boundary
Every integration family must demonstrate that:
- authorization is not granted/revoked by S10;
- credential state is not mutated by S10;
- historical decisions are not rewritten;
- compliance projection remains projection-only;
- notification delivery remains non-authoritative;
- assignment authority is not inferred;
- provider invocation is absent;
- no event emission is introduced by S10;
- physical deletion is not authorized;
- production deployment is not authorized.

## Mandatory executable evidence
Acceptance requires:
- **136 ordered S10 integration scenarios**;
- **16 ordered S10 scope/governance scenarios**;
- **28 readonly/public-contract assertions** over the integrated existing output types under strict Application compilation;
- exact architecture-first ancestry;
- exact governed file delta;
- unchanged S09 **128/128**, S08 **120/120**, S07 **112/112**, S06 **104/104**, S05 **96/96**, S04 **88/88**, S03 **80/80**, S02 **72/72**, S01 **64/64** and all transitive predecessor gates on the current candidate checkout;
- full same-head pull-request workflow matrix independently complete.

The original closed S09 scope validator may execute only in a temporary historical worktree at the actual S09 merge.

## Milestone completion boundary
Successful S10 implementation and validation proves the M06 implementation package is technically complete across all ten admitted plan slices. M06 does not become production-released merely because S10 passes.

S10 merge, milestone technical acceptance/admission to the next milestone, and any production deployment remain separately governed owner decisions.

Accepted predecessor coverage is **M06 9/10 = 90%** and original v1 allocation **69/130 = 53.08%**. This contract itself adds no accepted delivery credit.
