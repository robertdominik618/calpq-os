# M05 Slice 03 — Implementation Contract

Status: `AUTHORIZED / ARCHITECTURE LOCKED / IMPLEMENTATION IN PROGRESS`

Tracking: M05 Slice 03 — Derived Extraction/Proposal Records & Parent Lineage.  
Parent epic: #34.  
Reviewed Slice 02 merge: `ba68cdb04faa7a4cfcbfbea2e247d0271c532f05`.  
User authorization: `SCHVALUJI MERGE PR #112 A POKRAČOVÁNÍ NA M05 SLICE 03`.

## Canonical objective

Implement M05 execution-package Slice 03 exactly as:

> Derived extraction/proposal records with parent lineage.

S03 turns non-authoritative machine extraction outputs into immutable, provenance-preserving proposal records. It does not create a second evidence model and it does not decide whether an extracted value is true.

## Reused authority

S03 MUST reuse, not replace:

- Core `EvidenceReference.derived()` and controlled derived `EvidenceKind` values;
- Core `EvidenceClass.DERIVED`, `EvidenceId`, `UtcInstant` and `VerificationState`;
- S02 `OriginalArchiveEntry` as the immutable original/root of extraction lineage.

The exact Core rule that derived OCR/AI/extracted evidence cannot be created directly as `VERIFIED` remains authoritative.

## S03-owned application semantics

S03 owns only the proposal/lineage envelope:

1. `ExtractionProcessorReference` — provider-neutral processor kind, stable processor reference, exact processor version and optional configuration reference.
2. `ExtractionConfidence` — optional finite metadata in the closed interval `[0,1]`; confidence is never verification or authority.
3. `ExtractionFieldProposal` — immutable field path, JSON-safe scalar proposed value, optional source locator and optional confidence.
4. `DerivedExtractionProposalRecord` — exact derived `EvidenceReference`, exact direct parent, exact immutable S02 root, processor metadata, canonical immutable proposal items and full root-to-current evidence lineage.

Direct parents may be:
- the exact `OriginalArchiveEntry`; or
- a prior immutable `DerivedExtractionProposalRecord`.

For every record:
- Core `derivationParent` MUST equal the exact direct-parent evidence ID;
- every lineage MUST resolve to one exact S02 original archive entry;
- the current evidence ID MUST NOT already occur in its ancestry;
- derived evidence MUST NOT predate its direct parent lineage state;
- a new derivation MUST NOT mutate or overwrite the original or any earlier derived record.

## Proposal semantics

A proposal is an observation produced by an extraction process, not an accepted fact.

`ExtractionFieldProposal.proposedValue` is deliberately limited to JSON-safe scalar values (`string | number | boolean | null`). Larger OCR text, summaries or structured payloads remain in the immutable derived evidence artifact referenced by Core `EvidenceReference`; proposal items are only an optional field-level projection.

Proposal-item ordering is canonicalized so the same governed inputs serialize deterministically.

## Explicit authority separation

S03 does **not**:

- accept/reject/correct a proposal on behalf of a user or reviewer — S04 owns correction workflow;
- quarantine or classify content as safe/unsafe — S05 owns quarantine controls;
- resolve issuer/verifier trust — S06 owns Trust Registry;
- choose or execute a verification provider/route — S07 owns provider-neutral verification routing;
- perform human authority confirmation — S08 owns that path;
- mutate archive retention/deletion state — S09 owns archive lifecycle;
- recompute legal eligibility;
- issue authorization;
- promote derived evidence to `VERIFIED`;
- treat confidence, model output, OCR output, parser output or AI output as source of truth.

**Proposal ≠ correction ≠ verified fact ≠ eligibility ≠ authorization.**

## Determinism and security boundaries

All identifiers, evidence, timestamps and processor metadata are supplied explicitly. S03 production code MUST NOT use ambient time or randomness.

S03 production code MUST NOT import AI/OCR/provider/cloud SDKs. Provider-specific execution belongs behind later adapter boundaries. A processor reference is provenance metadata only.

No production change under `packages/core/src/**` or `packages/adapters/src/**` is permitted for S03.

## Exit evidence

S03 requires:
- exactly 46 indexed mandatory runtime scenarios;
- TypeScript readonly/controlled-vocabulary compile proof;
- exact ancestry from reviewed S02 merge `ba68cdb04faa7a4cfcbfbea2e247d0271c532f05`;
- S01/S02, FV09/FV10, M05 Admission and architecture-boundary regressions;
- dedicated `M05 Slice 03 Derived Extraction` CI;
- final-head green review evidence.

Successful CI proves review readiness only. It does not authorize merge or M05 Slice 04.
