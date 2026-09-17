# M05 Slice 03 — Exit Evidence

Status: `IMPLEMENTED / VERIFIED / READY FOR FINAL-HEAD REVIEW`

Tracking issue: #113.  
Pull request: #114.  
Branch: `impl/m05-s03-derived-extraction-parent-lineage`.

## Authorization and reviewed lineage

User authorization:

`SCHVALUJI MERGE PR #112 A POKRAČOVÁNÍ NA M05 SLICE 03`

M05 Slice 02 was guarded-merged from exact reviewed head `d84d8741966c22e4876f332bed7a9b0ccb15d692` as:

`ba68cdb04faa7a4cfcbfbea2e247d0271c532f05`

The complete post-merge workflow matrix on that merge completed SUCCESS before the S03 branch was created. S03 descends exactly from that reviewed S02 merge.

## Implementation commits

- `3ca0c84c6dfddda63a4f632f6219418027a02a8b` — S03 implementation contract, production proposal/lineage model and public extraction surface;
- `25c079cbdd7e6397b1cb7994ad600a6eabd1b1e4` — 46-scenario executable evidence, readonly compile proof and dedicated S03 CI.

## Delivered semantics

S03 implements an Application-layer proposal/lineage envelope over the existing authoritative evidence primitives instead of creating a parallel evidence model.

1. Core `EvidenceReference.derived()` remains the canonical identity and authority container for derived evidence.
2. S02 `OriginalArchiveEntry` is the exact immutable lineage root.
3. Every S03 record binds its exact direct parent and requires Core `derivationParent` to equal that direct parent evidence ID.
4. Both original → derived and derived → derived chains are supported.
5. Every chain preserves one exact immutable S02 root and an ordered root-to-current evidence-ID lineage.
6. Repeated evidence IDs in ancestry are rejected, preventing lineage cycles/reuse.
7. Derived evidence chronology cannot predate its direct parent lineage state.
8. `ExtractionProcessorReference` records controlled provider-neutral processor kind, exact processor reference/version and optional configuration reference.
9. `ExtractionConfidence` is finite `[0,1]` metadata only; it has no verification or legal authority meaning.
10. `ExtractionFieldProposal` is an immutable bounded field-level proposal over JSON-safe scalar values with optional locator/confidence.
11. Proposal ordering and canonical serialization are deterministic.
12. A new derivation never mutates or overwrites the immutable original or any previous derived record.
13. No second derived-evidence identifier was introduced; the existing Core `EvidenceId` remains the single evidence identity.

## Authority boundaries preserved

**Proposal ≠ correction ≠ verified fact ≠ eligibility ≠ authorization.**

S03 does not:

- accept, reject or correct proposals on behalf of a reviewer — S04 owns correction workflow;
- quarantine content — S05 owns quarantine controls;
- resolve issuer/verifier trust — S06 owns Trust Registry;
- choose or execute provider verification — S07 owns verification routing/provider boundary;
- perform human authority confirmation — S08 owns that path;
- mutate retention/deletion state — S09 owns archive lifecycle;
- create or recompute legal eligibility;
- issue authorization;
- promote extraction/OCR/AI output to `VERIFIED`;
- treat confidence, model output, OCR output or parser output as source of truth;
- import or execute provider/AI/OCR/cloud SDKs in the S03 production model.

All IDs, timestamps and processor metadata are supplied explicitly. No ambient time or randomness is used in S03 production code.

## Mandatory executable evidence

Exactly **46 mandatory runtime scenarios** are indexed in `docs/planning/M05_S03_TEST_INDEX.md` and executed by `packages/application/test/m05-s03-derived-extraction.test.ts`.

Dedicated workflow:

`M05 Slice 03 Derived Extraction`

Implementation/evidence-head run:

`35212096355` — **SUCCESS**

The job log proves:

- tests: 46;
- pass: 46;
- fail: 0;
- cancelled: 0;
- skipped: 0;
- todo: 0.

Final executable guard output:

`M05 S03 DERIVED EXTRACTION: PASS / 46 TESTS / EXACT PARENT LINEAGE / IMMUTABLE ROOT / CONFIDENCE != VERIFICATION / S01+S02+FV09+FV10+ADMISSION GREEN / NO CORE OR ADAPTER DIFF`

The evidence runner additionally proves:

- exact ancestry from reviewed S02 merge `ba68cdb04faa7a4cfcbfbea2e247d0271c532f05`;
- valid M05 machine admission;
- TypeScript 7.0.2 readonly/controlled-vocabulary compile proof;
- zero `packages/core/src/**` production changes;
- zero `packages/adapters/src/**` production changes;
- no framework/provider/cloud SDK leakage;
- no ambient time/randomness;
- no S04+ reviewer/trust/provider/authorization authority leakage;
- S01, S02, FV09, FV10, M05 Admission and architecture-boundary regressions.

## Implementation-head matrix

On implementation/evidence head:

`25c079cbdd7e6397b1cb7994ad600a6eabd1b1e4`

all **29 PR-triggered workflows** completed `SUCCESS`, including the new dedicated S03 workflow, S02, S01, Foundation Guard, FV09 and the M03 regression suite. No failure, queued, in-progress or cancelled PR-triggered run remained.

## Diff evidence

Comparison from reviewed S02 merge `ba68cdb04faa7a4cfcbfbea2e247d0271c532f05` to implementation/evidence head `25c079cbdd7e6397b1cb7994ad600a6eabd1b1e4` shows exactly:

- 2 implementation/evidence commits;
- 10 changed files;
- zero production Core changes;
- zero provider-adapter changes.

## Final review boundary

This exit-evidence document is intentionally committed only after the implementation/evidence head completed its full 29/29 green matrix. The documentation commit that contains this file becomes the final review candidate and must itself complete the applicable final-head CI matrix before PR #114 may be described as `FINAL HEAD GREEN`.

Successful CI proves review readiness only. PR #114 remains **OPEN and UNMERGED**. Merge and M05 Slice 04 require a fresh explicit user authorization.