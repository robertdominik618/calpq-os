# M05 Slice 04 Exit Evidence — User/Reviewer Correction Workflow

Status: `IMPLEMENTED / VERIFIED / READY FOR REVIEW / MERGE NOT AUTHORIZED`

Tracking issue: #115  
Pull request: #116  
Parent epic: #34  
Reviewed Slice 03 merge: `0c61a1adbeec8f2c710b3b3a471fa2073b79f462`  
User authorization: `SCHVALUJI MERGE PR #114 A POKRAČOVÁNÍ NA M05 SLICE 04`

## 1. Scope

M05 Slice 04 implements the user/reviewer correction workflow required by `docs/planning/M05_EXECUTION_PACKAGE.md` and the canonical review contract `docs/contracts/EXTRACTION_PROPOSAL_REVIEW_MODEL.md`.

S04 is an Application-layer, append-only review history over the exact S03 `DerivedExtractionProposalRecord`. It does not mutate the S02 immutable original archive, the S03 proposal, prior review revisions or Core evidence authority.

## 2. Delivered semantics

- canonical review states:
  - `PROPOSED`
  - `USER_CONFIRMED`
  - `USER_CORRECTED`
  - `REJECTED`
  - `HUMAN_REVIEW_REQUIRED`
- controlled reviewer roles `USER | REVIEWER`;
- controlled field dispositions `CONFIRMED | CORRECTED | REJECTED | HUMAN_REVIEW_REQUIRED`;
- immutable `ExtractionFieldReviewDecision`;
- immutable numbered `ExtractionReviewRevision`;
- append-only `ExtractionProposalReviewHistory`;
- exact S03 proposal identity and exact proposal-field object binding;
- explicit actor, role, review time and reason;
- corrected scalar values aligned with S03, including explicit corrected-to-null presence;
- deterministic canonical field-decision ordering and serialization;
- reproducible sequential revisions while previous history remains immutable.

## 3. Authority boundary

The hard S04 boundary is:

`review/correction != verification != eligibility != recognition != authorization`

A user or reviewer confirmation/correction is an assertion/review result only. S04:

- does not create `VERIFIED` evidence;
- does not mutate the verification state of the S03 proposal;
- does not invoke verification orchestration;
- does not decide eligibility or recognition;
- does not issue authorization;
- does not implement S05 quarantine, S06 Trust Registry, S07 provider routing or S08 human-authority confirmation.

The canonical M01 review contract remains satisfied: user confirmation is not verification, and a correction creates a new review revision while the original extraction stays auditable.

## 4. Implementation lineage

Architecture / initial implementation commit:

`239227561a476924e8d0e0b04badd362f769203d`

Executable evidence / compile proof / CI commit:

`c0b6587c7762a344f2ea6cd60e7bd7e1e51eb561`

An intermediate validation/documentation head reached:

`ddfd892861e9dd7eddd76889f57bda63469a7432`

That head was **not** final-green. The S04 runtime suite itself passed all 48 mandatory scenarios, but strict TypeScript compilation correctly rejected three implementation typing defects in `packages/application/src/extraction/extraction-review.ts`:

1. broad `ExtractionFieldReviewDisposition` passed to a two-literal `includes()` check without safe narrowing;
2. a redundant comparison against `PROPOSED` after the input type had already excluded `PROPOSED`;
3. `fieldDecisions: undefined` supplied explicitly under `exactOptionalPropertyTypes` instead of omitting the optional property.

No S04 exit-evidence document existed on that failed head, and that failed head was not represented as completion evidence.

The defects were remediated without changing runtime/domain semantics in:

`b98fad7fffc3e99d98d02f1efdf0bc4e39b8e312` — `M05 S04: fix strict review typing`

Remediation:

- replaced the unsafe two-element `includes()` narrowing with explicit `CONFIRMED` / `CORRECTED` comparisons;
- removed the impossible `PROPOSED` comparison where the static type already excludes it;
- conditionally omitted `fieldDecisions` when absent so `exactOptionalPropertyTypes` is respected.

No Core or provider-adapter behavior was changed by this remediation.

## 5. Executable evidence

Mandatory runtime scenarios: **48**.

On the failed intermediate head the runtime suite already reported:

- tests: 48
- pass: 48
- fail: 0

The head was nevertheless rejected because compile proof is part of the exit gate.

After remediation, the dedicated S04 workflow run:

`35220450966` — `M05 Slice 04 Extraction Review`

completed **SUCCESS**, including:

- 48/48 runtime scenarios;
- strict TypeScript compile proof;
- exact S03 merge ancestry;
- no-production-Core guard;
- no-provider-adapter guard;
- no provider/framework SDK leakage;
- no ambient time/randomness;
- S01, S02, S03 regressions;
- FV09 and FV10 regressions;
- M05 Admission regression;
- architecture-boundary regression.

## 6. Full implementation-head CI

Remediated implementation head:

`b98fad7fffc3e99d98d02f1efdf0bc4e39b8e312`

Observed PR-triggered workflow matrix on this exact head: **30 / 30 SUCCESS**.

This includes S04, S03, S02, S01, FV06/FV07/FV08/FV09/FV11/FV12/FV13/FV15, Foundation Guard, M00/M02/program readiness and M03 S01-S10 regression workflows.

No failed, queued, in-progress or cancelled PR-triggered workflow remained when this exit evidence was prepared.

## 7. Diff boundary

Compared with reviewed S03 merge `0c61a1adbeec8f2c710b3b3a471fa2073b79f462`, S04 remains confined to Application-layer review/evidence/configuration files.

There is:

- no `packages/core/src/**` production change;
- no provider-adapter production implementation;
- no legal-eligibility or authorization authority added.

## 8. Exit assessment

M05 Slice 04 satisfies its functional and authority boundaries after strict-type remediation.

This document records review readiness only. It does **not** authorize merge of PR #116 and does **not** authorize M05 Slice 05.

PR #116 must remain OPEN / UNMERGED until a fresh explicit user merge authorization is given.
