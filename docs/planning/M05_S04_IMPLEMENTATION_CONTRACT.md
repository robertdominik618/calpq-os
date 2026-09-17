# M05 Slice 04 — User/Reviewer Correction Workflow Implementation Contract

Status: `AUTHORIZED / ARCHITECTURE LOCKED / IMPLEMENTATION IN PROGRESS`

Canonical predecessor merge: `0c61a1adbeec8f2c710b3b3a471fa2073b79f462`.
Tracking issue: #115.
Canonical M01 contract: `docs/contracts/EXTRACTION_PROPOSAL_REVIEW_MODEL.md`.

## Objective

Implement append-only user/reviewer review and correction history over the exact M05 S03 `DerivedExtractionProposalRecord` while keeping immutable originals, extraction proposals, reviewed assertions and verified facts structurally separate.

## Canonical review vocabulary

The M01 review states are preserved exactly:

`PROPOSED | USER_CONFIRMED | USER_CORRECTED | REJECTED | HUMAN_REVIEW_REQUIRED`

`PROPOSED` is the implicit initial state of a review history and is not emitted as a review revision.

Actor roles are controlled separately:

`USER | REVIEWER`

Field review dispositions are:

`CONFIRMED | CORRECTED | REJECTED | HUMAN_REVIEW_REQUIRED`

The actor role records who performed the review. It does not create a new authority class and does not alter the canonical M01 review-state vocabulary.

## Model

### ExtractionFieldReviewDecision

An immutable decision over one exact S03 `ExtractionFieldProposal` object.

- `CONFIRMED` preserves the proposed value;
- `CORRECTED` records an explicit replacement scalar and reason;
- `REJECTED` records rejection and reason;
- `HUMAN_REVIEW_REQUIRED` records escalation and reason.

Corrected scalars use the same JSON-safe scalar domain as S03: `string | finite number | boolean | null`. A dedicated presence flag distinguishes `corrected to null` from `no corrected value`.

### ExtractionReviewRevision

An immutable review event bound to one exact S03 proposal. It records:

- sequential revision number;
- canonical review state;
- exact `ActorReference`;
- controlled actor role;
- explicit `UtcInstant`;
- bounded non-empty reason;
- immutable canonical field decisions.

State consistency rules:

- `USER_CONFIRMED`: zero or more `CONFIRMED` field decisions only;
- `USER_CORRECTED`: at least one `CORRECTED` decision and any remaining decisions may only be `CONFIRMED`;
- `REJECTED`: zero or more `REJECTED` decisions only;
- `HUMAN_REVIEW_REQUIRED`: zero or more `HUMAN_REVIEW_REQUIRED` decisions only;
- `PROPOSED` cannot be appended as a revision.

A revision may reference each field path at most once and every referenced field proposal must be the exact object contained in its S03 source proposal.

### ExtractionProposalReviewHistory

An immutable append-only history over one exact S03 proposal.

- starts with state `PROPOSED` and zero revisions;
- append returns a new history; old history and revisions remain unchanged;
- revision numbers are deterministic and contiguous from 1;
- a revision cannot predate the S03 proposal or the preceding revision;
- current state is `PROPOSED` for an empty history, otherwise the state of the last revision;
- serialization is deterministic and preserves complete review history.

## Authority boundary

**review/correction != verification != eligibility != recognition != authorization**

A user-confirmed or user-corrected value remains an assertion/review result. S04 never creates VERIFIED evidence and never changes the `VerificationState` of the S03 derived evidence.

S04 does not create `EvidenceReference`, does not call verification orchestration and does not invoke legal/eligibility/recognition/authorization logic.

## Immutability and auditability

S04 must never mutate:

- S02 `OriginalArchiveEntry`;
- S03 `DerivedExtractionProposalRecord`;
- S03 field proposals;
- prior S04 review revisions or histories.

Corrections are new review revisions. The original extraction remains auditable exactly as required by the M01 contract.

## Explicitly out of scope

- S05 security quarantine/untrusted-content controls;
- S06 Trust Registry and authority identity resolution;
- S07 verification routes/provider adapters;
- S08 human legal/authority confirmation;
- S09 archive retention/link lifecycle mutation;
- eligibility, recognition or authorization issuance;
- OCR/AI/provider execution;
- UI business logic.

## Determinism and dependencies

All times, actors, values and reasons are explicit inputs. No ambient time or randomness is allowed. S04 remains Application-layer and provider-neutral. No production Core or provider-adapter changes are permitted.

## Merge boundary

This contract and its implementation are evidence for M05 Slice 04 only. Successful CI does not authorize merge or M05 Slice 05.
