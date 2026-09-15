# CALPQ FV-03 Implementation Contract

Status: `IMPLEMENTED / VERIFIED`

FV-03 implements the minimum Core provenance, evidence and result model required by the first vertical.

## Required concepts
- SourceReference with source/version, jurisdiction, effective dates, retrieval instant and verification state.
- EvidenceReference with evidence identity, original/derived class, immutable content/storage reference, hash where available, acquisition metadata, source link and derivation parent.
- Provenance envelope with decision/event identity, evaluation instant, actor/process, subject, rule/source/evidence references and revisions where applicable.
- explicit distinction between original evidence and derived OCR/AI/extracted information.
- four domain outcomes: `SATISFIED`, `NOT_SATISFIED`, `INDETERMINATE`, `REVIEW_REQUIRED`.
- stable machine-readable reason codes.
- stable Core error families distinct from legitimate domain outcomes.

## Invariants
Derived information never replaces original evidence. AI/OCR output is not verified merely because it was produced. Historical decisions retain exact source, rule and evidence versions. Provider/database/HTTP errors do not cross into Core as raw error objects. Human explanation is never the sole reason representation.

No credential aggregate, grant logic, persistence adapter or transport behavior is introduced by FV-03.

## Verified implementation evidence
- A4 implementation: `1f0c88054fcc5b230e1a997309dc8f59b70b33fd` — immutable source/evidence/provenance model, controlled outcomes, stable reason codes and sanitized Core errors.
- Draft Batch A PR: #56.
- `FV-03 Core Provenance #2` — SUCCESS; all 20 mandatory tests passed.
- FV-02 Core Ports #5 and FV-01 Core Primitives #9 — SUCCESS regression evidence.
- Foundation Guard #819 — SUCCESS.
- M00 Readiness #698 — SUCCESS.
- M02 Batch A Manifest #50 and M02 Batch Readiness #107 — SUCCESS.
- Program Execution Readiness #121, M03-M08 #78, M09-M12 #67 and CALPQ v1 Execution Index #58 — SUCCESS.
- 0 mandatory tests waived; 0 scope exceptions.

Result: FV-03 Definition-of-Done is satisfied. Historical provenance remains immutable, original evidence is preserved, derived OCR/AI evidence cannot self-promote to VERIFIED, and legitimate domain outcomes remain separate from technical Core errors.
