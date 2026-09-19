# CALPQ M03 Admission Record — Professional Passport Product Surface

Status: `FORMALLY ADMITTED / IMPLEMENTATION MAY BEGIN`
ID: `CALPQ-M03-ADM-0001`

## Milestone
`M03 — Professional Passport Product Surface`

## Decision
`ADMITTED_FOR_IMPLEMENTATION`

Machine-readable companion: `docs/planning/m03-admission-decision.json`.

## Admission basis
M03 admission is based on the reviewed and merged M02 First Vertical result, not merely on planning readiness.

Verified predecessor evidence:
- M02 First Vertical issue #23 = `REVIEWED / MERGED / POST-MERGE VERIFIED`;
- M02 reviewed merge commit = `387dbfa0246d36e576ff15a6e5bb1016e051093c`;
- FV-01 through FV-15 post-merge workflows = SUCCESS;
- Foundation Guard #979 = SUCCESS;
- M00 Readiness #858 = SUCCESS;
- M02 Batch Readiness #267 = SUCCESS;
- Program Execution Readiness #281 = SUCCESS;
- M03-M08 Execution Readiness #238 = SUCCESS;
- durable M02 exit evidence exists in `docs/planning/M02_EXIT_EVIDENCE.md`.

## Accepted M03 scope
The admitted scope is the existing `M03_EXECUTION_PACKAGE.md` and `M03_PRODUCT_SURFACE_BASELINE.md` only:
1. dashboard shell and governed read-model navigation;
2. Professional Passport summary/read flows;
3. Credential Card presentation with distinct artifact/verification/eligibility/lifecycle semantics;
4. evidence/source explanation and `Why?` views;
5. activity/decision timeline presentation;
6. missing-condition/next-action presentation from governed outputs;
7. intent-oriented read/search over approved query models;
8. mobile/web responsive read flows;
9. accessibility/localization foundations;
10. integration evidence and UX-boundary tests.

## Authority boundary
M03 presentation and read-model composition remain non-authoritative. Admission does not authorize:
- UI-owned eligibility or verification logic;
- evidence promotion or legal-authority decisions;
- AuthorizationGrant issuance, mutation, suspension or revocation;
- M04 catalog/path/gap implementation;
- M05 universal intake/verification fabric implementation;
- M06 lifecycle automation;
- M07 regulatory automation;
- M08 B2B assignment implementation;
- M10 AI decision authority.

M04–M08 execution packages remain `IMPLEMENTATION BLOCKED` until separately admitted.

## Formal transition
- Transition: `CALPQ-M03-ADMIT-0001`
- Admitted predecessor revision: `387dbfa0246d36e576ff15a6e5bb1016e051093c`
- Approved by: `robertdominik618`
- Approved at: `2026-09-15T10:57:00Z`
- Approval wording: `Schváleno další krok povolen`
- Context: the immediately preceding assistant message explicitly identified M03 admission as the next governance step and stated that this approval would be used for that admission.
- Authorized execution entry: `M03_SLICE_01_DASHBOARD_READ_MODELS`

Admission authorizes implementation to begin at slice 1. It does not mark M03 complete and does not admit any later milestone.
