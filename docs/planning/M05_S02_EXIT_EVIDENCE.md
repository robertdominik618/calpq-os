# M05 Slice 02 — Exit Evidence

Status: `IMPLEMENTED / REGRESSION MATRIX GREEN / DEDICATED S02 VALIDATION PENDING`

Tracking issue: #110.  
Pull request: #112.  
Branch: `impl/m05-s02-original-archive-content-addressing`.

## Authorization and lineage

User authorization: `SCHVALUJI MERGE PR #108 A POKRAČOVÁNÍ NA M05 SLICE 02`.

M05 Slice 01 PR #108 was guarded-merged from exact verified head `c7e68093bc1c62dd5d2ba17d00d7451482a5f3b3` as merge commit:

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
- `b3389013bad7d86ef8262f6bd27406fd26798305` — 42-scenario executable evidence, compile proof, public archive package surface and dedicated workflow.

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

## Implementation-head regression evidence

Implementation/evidence head:

`b3389013bad7d86ef8262f6bd27406fd26798305`

All **28 observed pull-request workflow runs** on this head completed without failure, queued, in-progress or cancelled state. Existing regressions are therefore green.

The dedicated workflow `M05 Slice 02 Original Archive` was introduced on that same head and did not appear as an Actions run for that commit. This document intentionally does **not** misstate the dedicated S02 runner as executed. This documentation commit is created after the workflow already exists in its parent, providing a fresh path-matching push/PR head on which GitHub can execute the dedicated workflow.

## Diff evidence

Comparison from reviewed S01 merge `4251030104521e6f9ae9d88af2b7eae87fa8e9c0` to implementation/evidence head `b3389013bad7d86ef8262f6bd27406fd26798305` shows exactly two implementation commits and 10 changed files, with no production Core or provider-adapter source change.

## Completion boundary

S02 is implemented but is not yet declared final-head verified in this evidence revision. Final review readiness requires the dedicated S02 workflow and the resulting full head matrix to complete green on a head that includes this evidence.

Successful CI still does not authorize merge or S03. PR #112 remains OPEN and UNMERGED until fresh explicit user approval after final-head verification.
