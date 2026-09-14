# CALPQ v1 Execution Index

Status: `PLANNING COMPLETE / MACHINE-VERIFIED / IMPLEMENTATION BLOCKED`
ID: `CALPQ-V1-EXEC-INDEX-0001`

## Purpose
Provide one repository-backed index for CALPQ OS v1 execution from M02 through M12 without changing M00 governance or admitting product implementation.

## Program spine
`M00 Governance -> M01 Architecture -> M02 First Vertical -> M03/M04/M05 -> M06 -> M07/M08 -> M09 -> M10 -> M11 -> M12 -> GA`

## M02 — First Vertical
Status: `FULL PRE-IMPLEMENTATION READY / IMPLEMENTATION BLOCKED`
Execution model:
- Batch A: FV-01..FV-05 Core Kernel — issue #47;
- Batch B: FV-06..FV-10 Application/Persistence/Evidence — issue #48;
- Batch C: FV-11..FV-15 Decision/Passport/Runtime — issue #49.
Planning granularity: 30 planned implementation commits across A/B/C.
Machine evidence: M02 Batch Readiness 60/60; M02 planning readiness 285 test/check points; FV-00 traceability 45/45.
Admission: requires M00 governance PASS, explicit M00 release, feature-development gate transition under approved governance and FV-00 formal admission.

## M03 — Professional Passport Product Surface
Status: `EXECUTION PACKAGE READY / IMPLEMENTATION BLOCKED`
Epic: #32.
Execution package: `docs/planning/M03_EXECUTION_PACKAGE.md`.
Granularity: 10 delivery slices.
Start: stable M02 read-model contracts + separate admission.

## M04 — Catalog / Qualification Paths / Gap
Status: `EXECUTION PACKAGE READY / IMPLEMENTATION BLOCKED`
Epic: #33.
Execution package: `docs/planning/M04_EXECUTION_PACKAGE.md`.
Granularity: 10 delivery slices.
Start: stable M02 Core/evidence/eligibility semantics + separate admission.

## M05 — Evidence & Verification Fabric
Status: `EXECUTION PACKAGE READY / IMPLEMENTATION BLOCKED`
Epic: #34.
Execution package: `docs/planning/M05_EXECUTION_PACKAGE.md`.
Granularity: 10 delivery slices.
Start: stable M02 intake/verification contracts + separate admission.

## M06 — Lifecycle / Renewal / Continuous Compliance
Status: `EXECUTION PACKAGE READY / IMPLEMENTATION BLOCKED`
Epic: #36.
Execution package: `docs/planning/M06_EXECUTION_PACKAGE.md`.
Granularity: 10 delivery slices.
Start: sufficient M04 versioned-requirement semantics and M05 evidence/verification capability.

## M07 — Regulatory Intelligence
Status: `EXECUTION PACKAGE READY / IMPLEMENTATION BLOCKED`
Epic: #37.
Execution package: `docs/planning/M07_EXECUTION_PACKAGE.md`.
Granularity: 10 delivery slices.
Start: source governance + stable M04/M06 version/impact contracts.

## M08 — Organization / B2B Assignment
Status: `EXECUTION PACKAGE READY / IMPLEMENTATION BLOCKED`
Epic: #38.
Execution package: `docs/planning/M08_EXECUTION_PACKAGE.md`.
Granularity: 10 delivery slices.
Start: organization/tenant/access contracts + M06 compliance semantics.

## M09 — Trust / Sharing / Interoperability
Status: `EXECUTION PACKAGE READY / IMPLEMENTATION BLOCKED`
Epic: #40.
Execution package: `docs/planning/M09_EXECUTION_PACKAGE.md`.
Granularity: 10 delivery slices.
Start: stable verified claims, access/purpose rules and relying-party use cases.

## M10 — Intelligence Layer
Status: `EXECUTION PACKAGE READY / IMPLEMENTATION BLOCKED`
Epic: #41.
Execution package: `docs/planning/M10_EXECUTION_PACKAGE.md`.
Granularity: 10 delivery slices.
Start: stable deterministic decisions, explainability/source lineage and human-review boundaries.

## M11 — Production UX / Operations
Status: `EXECUTION PACKAGE READY / IMPLEMENTATION BLOCKED`
Epic: #42.
Execution package: `docs/planning/M11_EXECUTION_PACKAGE.md`.
Granularity: 10 delivery slices.
Start: sufficient stable product/application contracts; enabling infrastructure may land earlier without claiming M11 exit.

## M12 — Hardening / Pilot / GA
Status: `EXECUTION PACKAGE READY / IMPLEMENTATION BLOCKED`
Epic: #43.
Execution package: `docs/planning/M12_EXECUTION_PACKAGE.md`.
Granularity: 10 delivery slices.
Start: intended v1 functional set + M11 operational readiness + defined pilot scope.
Exit: evidence-backed explicit GA decision.

## Total execution granularity
- M02: 30 planned implementation commits;
- M03-M08: 60 delivery slices;
- M09-M12: 40 delivery slices;
- total v1 execution units: `130`.

## Machine-readiness layers
- `tests/m02_planning_readiness_test.sh`;
- `tests/m02_batch_execution_readiness_test.sh`;
- `tests/program_execution_readiness_test.sh`;
- `tests/m03_m08_execution_readiness_test.sh`;
- `tests/m09_m12_execution_readiness_test.sh`;
- `tests/v1_execution_index_test.sh`.

## Current verified CI snapshot
On head `78b2082843288f561b9394d35b6341ebf3b8e54b`:
- CALPQ v1 Execution Index: SUCCESS;
- Foundation Guard: SUCCESS;
- Program Execution Readiness: SUCCESS;
- M02 Batch Readiness: SUCCESS;
- M03-M08 Execution Readiness: SUCCESS;
- M09-M12 Execution Readiness: SUCCESS;
- M00 internal readiness: SUCCESS;
- M00 Readiness overall: FAILURE only because repository-governance `Verify main protection` remains unresolved.

## Universal non-negotiable boundaries
- planning readiness is not implementation admission;
- mergeable PR is not completion evidence;
- document/extraction/verification/eligibility/authorization remain distinct;
- AI remains non-authoritative;
- projection/cache/telemetry are not authoritative domain state;
- role/delegation never transfers professional competence;
- historical truth is never silently rewritten;
- tenant/access/purpose scope remains explicit;
- GA requires production evidence and explicit release governance.

## Current critical path
1. activate required protection for default branch/main;
2. M00 repository governance PASS;
3. close M00-BLK-001;
4. explicit M00 release decision;
5. separately govern feature-development gate transition;
6. FV-00 formal admission;
7. execute M02 Batch A -> B -> C;
8. after M02 exit, admit M03/M04/M05 as evidence allows;
9. continue through M06 -> M07/M08 -> M09 -> M10 -> M11 -> M12;
10. explicit GA decision.

No step in this index itself authorizes implementation, merges, M00 release, feature-development opening or GA.
