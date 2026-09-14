# CALPQ FV-03 Implementation Contract

Status: `PLANNING ONLY / BLOCKED`

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