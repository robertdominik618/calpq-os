# M05 Slice 02 — Immutable Original Archive & Content-Hash Addressing — Implementation Contract

Status: `IMPLEMENTATION AUTHORIZED / IN PROGRESS`

Tracking issue: #110.  
Reviewed Slice 01 merge: `4251030104521e6f9ae9d88af2b7eae87fa8e9c0`.  
User authorization: `SCHVALUJI MERGE PR #108 A POKRAČOVÁNÍ NA M05 SLICE 02`.

## Purpose

Slice 02 adds the immutable archive descriptor and content-addressing layer required by the admitted M05 execution package. It composes over the exact S01 `MultiChannelIntakeSubmission` and FV09/Core `EvidenceReference`; it does not create a second evidence authority and it does not implement storage-provider I/O.

The archive answers **which immutable original was retained, where it is addressed/stored, under which access/retention controls, and what byte-integrity observation existed at the archive snapshot time**. It does not answer whether the document is authentic, legally valid, owned by the subject, sufficient for eligibility, or authorized.

## Existing authority reused

S02 reuses without replacement:

- Core `EvidenceReference` as the original-evidence identity/provenance authority;
- Core `ContentHash` as the canonical SHA-256 digest type;
- FV09 `DocumentIntakeRecord` original/media/security invariants;
- S01 `MultiChannelIntakeSubmission` and exact channel provenance.

No file under `packages/core/src/**` is changed by S02.

## Model

### `OriginalContentAddress`

Immutable deterministic address derived from the exact existing `ContentHash`. Its canonical text is the same `sha256:<digest>` identity already defined by Core. S02 never recomputes, substitutes or upgrades the supplied hash.

A content address establishes byte-address identity only. It is not trust, authenticity, ownership, legal equivalence, credential validity or authorization truth.

### `ArchiveByteIntegrityObservation`

Controlled byte-integrity observation:

`NOT_CHECKED | MATCHED | MISMATCH`

- `NOT_CHECKED` contains no observed hash, check time or method.
- `MATCHED` requires an explicit observed `ContentHash`, explicit `UtcInstant` and bounded method reference, and the observed hash must equal the exact original hash.
- `MISMATCH` requires the same explicit observation data, but its hash must differ from the original.

A MATCHED observation proves only that the observed archived bytes match the stored digest. It must not promote evidence verification state or issuer/legal authority.

### `OriginalArchiveEntry`

Immutable archive snapshot over one exact S01 submission. It preserves:

- exact `DocumentIntakeId`;
- exact original `EvidenceReference` object and evidence ID;
- exact original SHA-256 `ContentHash`;
- exact S01 channel provenance;
- original media type and intake byte length;
- acquired, received and archived instants;
- security classification;
- opaque storage-object reference;
- encryption-profile reference;
- access-policy reference;
- retention-policy reference;
- byte-integrity observation.

Creation fails closed when:

- the supplied artifact is not exact ORIGINAL evidence;
- content hash or media type is missing;
- original media type conflicts with intake media metadata;
- archive time predates receipt/acquisition;
- checked integrity predates receipt or occurs after the archive snapshot;
- MATCHED/MISMATCH semantics contradict the observed hash;
- storage/policy references are empty, oversized or contain control characters.

`hasSameBytesAs` compares only exact content hashes. No downstream trust/legal conclusion may be inferred from its result.

### `OriginalArchiveRelationship`

A later supplied original is always a distinct archive entry/evidence identity. History is connected only through an explicit immutable relationship:

`REPLACES | SUPPLEMENTS | DUPLICATES | RELATED_TO`

Relationship endpoints must have distinct original evidence IDs and an explicit actor/time. `DUPLICATES` additionally requires exact hash equality. Relationship existence never changes or overwrites either entry.

## Mandatory authority boundaries

S02 must never:

- overwrite or mutate original bytes/evidence/provenance;
- create a new EvidenceReference in place of the S01/FV09 original;
- convert hash equality or byte-integrity MATCHED into authenticity, trust, ownership, legal equivalence or current validity;
- create or promote VERIFIED evidence;
- implement OCR/extraction/derived lineage (S03);
- implement reviewer correction expansion (S04);
- implement quarantine/untrusted-content processing (S05);
- resolve Trust Registry identity (S06);
- execute verification providers/routes (S07);
- create human authority confirmation (S08);
- implement archive deletion/retention lifecycle mutation (S09);
- create/mutate `EligibilityAssessment`, `RecognitionDecision` or `AuthorizationGrant`;
- use ambient time/randomness;
- import cloud-storage/provider/framework SDKs into the Application archive model.

## Determinism and immutability

All archive times, actors, hashes, storage references and policy references are explicit inputs. No S02 source may use an ambient clock or random generator. Archive entries, addresses, integrity observations and relationships are frozen and serialize deterministically for the same governed inputs.

## Evidence requirement

Exit requires:

- exactly 42 mandatory runtime scenarios;
- strict TypeScript readonly/controlled-vocabulary compile proof;
- exact ancestry from reviewed S01 merge `4251030104521e6f9ae9d88af2b7eae87fa8e9c0`;
- zero `packages/core/src/**` and zero `packages/adapters/src/**` changes;
- direct S01, FV09, FV10 and M05 Admission regressions;
- architecture-boundary regression;
- no provider/framework SDK leakage;
- no ambient time/randomness;
- dedicated GitHub Actions workflow;
- final-head green CI before review readiness.

## Merge boundary

Successful implementation/evidence does not authorize merge or S03. The S02 PR must remain open and unmerged until a fresh explicit user approval is given after final-head verification.
