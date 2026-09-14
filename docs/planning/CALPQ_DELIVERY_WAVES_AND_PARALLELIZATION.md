# CALPQ Delivery Waves & Parallelization

Status: `PLANNING ONLY / IMPLEMENTATION BLOCKED`
ID: `CALPQ-PROGRAM-WAVES-0001`

## Purpose
Define where work may run in parallel and where CALPQ requires a hard serial dependency.

## Hard serial spine
`M00 governance -> M02 admission -> M02 first vertical proof -> M06 lifecycle -> M07 regulatory impact -> M09 interoperability -> M10 governed intelligence -> M12 GA evidence`

This spine may not be bypassed by UI or commercial pressure.

## Parallel lane A — Product experience
After M02 contracts stabilize:
- M03 dashboard / Passport / Credential Cards;
- M03 explainability and timeline;
- mobile/web read experience;
- accessibility/localization foundations.

Depends on authoritative read models. Must not own eligibility or verification truth.

## Parallel lane B — Knowledge and paths
After M02 domain contracts stabilize:
- M04 Activity/Profession/Credential/Requirement catalogs;
- QualificationPaths;
- RequirementSet versioning;
- Gap Navigator;
- equivalence/recognition workflows;
- source-backed explainability.

Must remain versioned and source-backed. Stored configuration may not become ungoverned executable law.

## Parallel lane C — Evidence fabric
After M02 intake/verification proof:
- M05 multi-channel intake;
- immutable archive;
- extraction/review pipeline;
- Trust Registry / authority resolution;
- verification adapters;
- security/privacy for untrusted content.

Provider failure or confidence score may not change legal/domain truth.

## Parallel lane D — Organization/B2B
May begin domain/application work after M06 semantics and M01 tenant/access/B2B contracts are stable. M08 assignment decisions must consume credential/eligibility/compliance truth rather than duplicate it.

## Parallel lane E — Platform operations
Selected M11 enablers may be delivered incrementally earlier when required by active milestones:
- observability plumbing;
- background runtime;
- notification infrastructure;
- reviewer/admin shell;
- performance harnesses;
- support diagnostics.

Early platform work is enabling infrastructure only; M11 exit remains a later program gate.

## Parallelization constraints
1. At most one milestone owns a given authoritative concept.
2. UI/read models may lag but may not redefine truth.
3. Adapters normalize external systems; providers never define Core semantics.
4. Catalog/rule changes create versions, never mutate historical decision inputs.
5. Shared infrastructure must expose ports/contracts rather than create circular package dependencies.
6. A milestone may consume earlier contracts before earlier milestone product polish is complete, but only if its required semantic contract is stable and tested.

## Suggested execution batches after admission
Batch A: M02 FV-01..05.
Batch B: M02 FV-06..10.
Batch C: M02 FV-11..15 and first end-to-end proof.
Batch D: M03 + M04 + M05 in controlled parallel.
Batch E: M06 plus selected M11 runtime enablers.
Batch F: M07 + M08 with shared continuous-compliance inputs.
Batch G: M09.
Batch H: M10 plus mature M11 UX/operations.
Batch I: M12 pilot/GA.

## Merge discipline
Each batch stays behind its own admission/exit evidence. Stacked planning or implementation branches do not imply merge authorization. Cross-milestone merge order must preserve the dependency spine.