# CALPQ FV-09 Implementation Contract

Status: `PLANNING ONLY / BLOCKED`

FV-09 prepares the minimum document-evidence intake path needed by the first vertical.

Each intake records intake identity, subject/organization context when known, source channel, received-at instant, immutable original artifact reference, media metadata, content hash, provenance/security classification and processing state.

The channel describes only how bytes entered CALPQ. Original artifact, extraction/derived data, reviewed facts, verified evidence, eligibility and authorization remain distinct concepts.

Processing state is operational only. Intake must not directly create verified evidence, EligibilityAssessment or AuthorizationGrant. The original artifact remains immutable; corrections and later extraction create linked records rather than overwriting the original.