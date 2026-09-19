# M05 Slice 02 — Exit Evidence

Status: `IMPLEMENTED / VERIFIED ON EVIDENCE HEAD / FINAL DOCUMENTATION HEAD PENDING CI`

Tracking issue: #110.  
Pull request: #112.  
Branch: `impl/m05-s02-original-archive-content-addressing`.

## Authorization and lineage

User authorization: `SCHVALUJI MERGE PR #108 A POKRAČOVÁNÍ NA M05 SLICE 02`.

M05 Slice 01 PR #108 was guarded-merged from exact verified head `c7e68093bc1c62dd5cb2c7119485d8e83c2aded1843c` as merge commit:

`4251030104521e6f9ae9d88af2b7eae87fa8e9c0`

S01 was post-merge verified before S02 was created. S02 descends exactly from that reviewed merge.

## Slice 02 implementation

S02 adds an immutable original-archive descriptor and SHA-256 content-addressing layer over the existing S01/FV09/Core evidence model. It does not create a parallel evidence authority and does not implement provider/storage I/O.

Delivered semantics:

1. `OriginalContentAddress` preserves the exact existing Core `ContentHash` and uses the canonical `sha256:<digest>` identity;
2. `ArchiveByteIntegrityObservation` has controlled states `NOT_CHECKED | MATCHED | MISMATCH` with explicit observed hash/time/method;
3. `OriginalArchiveEntry` preserves the exact S01 `MultiChannelIntakeSubmission`, original `EvidenceReference`, content hash, provenance, media, acquisition/receipt/archive times, security classification and explicit storage/encryption/access/retention references;
4. checked integrity fails closed when time/hash semantics contradict the original or archive snapshot;
5. `hasSameBytesAs` reports byte identity only and never changes verification/trust/legal state;
6. `OriginalArchiveRelationship` links distinct immutable originals through `REPLACES | SUPPLEMENTS | DUPLICATES | RELATED_TO` instead of overwriting history;
7. `DUPLICATES` requires exact hash equality;
8. public package surface `@calpq/application/archive` exposes the governed S02 archive contract.

## Authority boundaries preserved

S02 does not:

- replace or mutate original bytes, original evidence identity or provenance;
- infer authenticity, subject ownership, legal equivalence, credential validity or authorization from content-hash equality;
- create/promote VERIFIED evidence;
- implement OCR/extraction/derived lineage (S03);
- implement reviewer-correction expansion (S04);
- implement quarantine (S05), Trust Registry resolution (S06), provider verification (S07), human authority confirmation (S08) or retention/deletion mutation (S09);
- create/mutate `EligibilityAssessment`, `RecognitionDecision` or `AuthorizationGrant`;
- use ambient time/randomness;
- import provider/cloud-storage/framework SDKs into the archive model.

## Implementation commits

- `90abe525d4650901a4465f8c5fa233d9ec1b3fe7` — immutable archive production model + implementation contract;
- `b3389013bad7d86ef8262f6bd27406fd26798305` — 42-scenario executable evidence, compile proof, public archive package surface and dedicated workflow;
- `8060e70a04c1deda482f1099a364f5b61091f447` — validation-boundary evidence commit that triggered the dedicated S02 workflow after that workflow already existed in its parent.

## Mandatory S02 evidence

Exactly **42 mandatory runtime scenarios** are indexed in `docs/planning/M05_S02_TEST_INDEX.md` and executed by `packages/application/test/m05-s02-original-archive.test.ts`.

The runner additionally enforces:

- exact ancestry from reviewed S01 merge `4251030104521e6f9ae9d88af2b7eae87fa8e9c0`;
- valid M05 machine admission;
- zero `packages/core/src/**` changes;
- zero `packages/adapters/src/**` changes;
- no provider/framework SDK leakage;
- no ambient time/randomness;
- no S03 derived/extraction vocabulary;
- no eligibility/recognition/authorization authority or verification promotion;
- S01, FV09, FV10, M05 Admission and architecture-boundary regressions.

Strict TypeScript evidence proves readonly archive/input/relationship/content-address/integrity fields and rejects uncontrolled integrity or relationship vocabulary.

## Initial implementation-head evidence

Implementation/evidence head:

`b3389013bad7d86ef8262f6bd27406fd26798305`

All **28 observed pull-request workflow runs** on this head completed without failure, queued, in-progress or cancelled state. The dedicated workflow had been introduced on this same head but was not registered as a run for that commit. That fact was retained explicitly instead of being misreported as successful dedicated validation.

## Dedicated-workflow registration remediation

A documentation-only validation-boundary commit was created after `.github/workflows/m05-s02-original-archive.yml` already existed in its parent:

`8060e70a04c1deda482f1099a364f5b61091f447`

This provided a fresh matching PR/push head and GitHub then registered and executed the dedicated S02 workflow normally. No production semantics changed in this remediation.

## Verified evidence-head CI

Verified evidence head:

`8060e70a04c1deda482f1099a364f5b61091f447`

All **28 PR-triggered workflow runs** observed for this head completed `SUCCESS`, with no queued, in-progress, failed or cancelled PR-triggered run remaining.

Key evidence:

- M05 Slice 02 Original Archive — run `35202172284` — **SUCCESS**;
- dedicated job `M05 S02 immutable original archive evidence` — **SUCCESS**;
- dedicated runtime result: **42 tests / 42 pass / 0 fail**;
- final runner line: `M05 S02 ORIGINAL ARCHIVE: PASS / 42 TESTS / IMMUTABLE ORIGINAL / SHA-256 CONTENT ADDRESS / BYTE IDENTITY != TRUST / S01+FV09+FV10+ADMISSION GREEN / NO CORE OR ADAPTER DIFF`;
- M05 Slice 01 Multi-channel Intake Contracts — run `35202172345` — SUCCESS;
- FV-09 Document Intake — run `35202172229` — SUCCESS;
- FV-06 Application Layer — run `35202172334` — SUCCESS;
- FV-07 Persistence UnitOfWork — run `35202172236` — SUCCESS;
- FV-08 Migration Delivery — run `35202172212` — SUCCESS;
- FV-11 Eligibility Assessment — run `35202172372` — SUCCESS;
- FV-12 Professional Passport — run `35202172152` — SUCCESS;
- FV-13 Tenant Governance — run `35202172113` — SUCCESS;
- FV-15 Operational Resilience — run `35202172247` — SUCCESS;
- Foundation Guard — run `35202172336` — SUCCESS;
- M03-M08 Execution Readiness — run `35202172385` — SUCCESS;
- Program Execution Readiness — run `35202172119` — SUCCESS;
- M09-M12 Execution Readiness — run `35202172211` — SUCCESS;
- CALPQ v1 Execution Index — run `35202172367` — SUCCESS;
- M00 Readiness — run `35202172349` — SUCCESS;
- M02 Batch Readiness — run `35202172196` — SUCCESS;
- M02 Batch A Manifest — run `35202172121` — SUCCESS;
- M03 S01–S10 observed regressions — all SUCCESS, including the final long S06/S07 runs `35202172200` and `35202172183`.

The npm output contains a pre-existing warning about the project `strict-peer-dependencies` config; it did not fail TypeScript compilation or any S02/regression test and is not treated as S02 domain evidence.

## Diff evidence

Comparison from reviewed S01 merge `4251030104521e6f9ae9d88af2b7eae87fa8e9c0` through the implementation/evidence commits shows no production Core source change and no provider-adapter source change. S02 production semantics live only in the Application archive boundary; remaining changes are public package exposure, tests, compile evidence, documentation and CI.

## Slice 02 exit significance

The verified evidence head proves the admitted S02 archive/content-addressing semantics compose with S01/FV09/FV10 while preserving the evidence and trust boundaries. Byte identity remains distinct from trust, authenticity and legal validity, and later originals are linked rather than overwriting history.

It does **not** by itself:

- merge PR #112;
- count S02 as an official merged/post-merge-verified v1 execution unit;
- authorize S03 implementation before S02 merge/post-merge verification;
- implement extraction, quarantine, Trust Registry, verification-provider execution, human authority confirmation or retention mutation;
- grant eligibility, recognition or authorization.

## Final-head and merge boundary

This update creates a new documentation-only final PR head. That exact final head must independently pass CI before PR #112 may be marked `VERIFIED / READY FOR REVIEW / FINAL HEAD GREEN`.

PR #112 remains **OPEN and UNMERGED**. Merge and S03 require fresh explicit user approval after final-head verification.
