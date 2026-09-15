# CALPQ FV-09 Implementation Contract

Status: `IMPLEMENTED / VERIFIED`

FV-09 implements the minimum document-evidence intake path needed by the first vertical.

Each intake records intake identity, subject/organization context when known, source channel, received-at instant, immutable original artifact reference, media metadata, content hash, provenance/security classification and processing state.

The channel describes only how bytes entered CALPQ. Original artifact, extraction/derived data, reviewed facts, verified evidence, eligibility and authorization remain distinct concepts.

Processing state is operational only. Intake must not directly create verified evidence, EligibilityAssessment or AuthorizationGrant. The original artifact remains immutable; corrections and later extraction create linked records rather than overwriting the original.

## Implementation evidence

- B7 intake source boundary: `57689fb91a1f1a65ae034708d48f14d04ec28ab8`.
- B8 executable evidence: `d672e2b4710a615ec041a387371998e3c6299845`.
- FV-09 reuses Core `EvidenceReference`, `EvidenceId` and `ContentHash` rather than introducing a competing provenance model.
- An intake requires ORIGINAL evidence with a content hash and rejects an original presented as VERIFIED.
- Corrections are separate DERIVED evidence linked to the immutable original EvidenceId; they never overwrite or auto-promote the original.
- Source channel, security classification and processing state are controlled values; processing state contains no verification/eligibility/authorization semantics.

CI on evidence head `d672e2b4710a615ec041a387371998e3c6299845`: FV-09 Document Intake #2, FV-08 #8, FV-07 #12, FV-06 #20, Foundation #870, M00 #749, M02 Batch Readiness #158, Program #172, M03-M08 #129, M09-M12 #118 and v1 Index #109 all SUCCESS.
