# CALPQ Core Provenance and Evidence Contract

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`  
ID: `CALPQ-CONTRACT-CORE-PROVENANCE-0001`

## Purpose

Define how CALPQ records where material information came from, what evidence existed, which version was used and who or what performed a material action.

## SourceReference

Every external source that can influence a material CALPQ decision must be representable by a stable source reference containing at minimum:

- source ID;
- issuing/owning authority;
- jurisdiction;
- source type;
- canonical locator or URI where applicable;
- source/version identifier;
- publication date when known;
- effective-from and effective-to dates when applicable;
- retrieved-at instant;
- verification state;
- optional content checksum/fingerprint.

Verification states are aligned with Foundation governance: `VERIFIED`, `UNVERIFIED`, `STALE/REVIEW_REQUIRED`.

## EvidenceReference

Evidence is a reference to material used to support or explain a domain state or decision. The evidence contract must preserve:

- evidence ID;
- evidence kind;
- original/derived classification;
- immutable storage/content reference;
- media type where applicable;
- cryptographic content hash where available;
- captured/received timestamp;
- actor/process responsible for acquisition;
- source reference where evidence originated externally;
- derivation parent when evidence was extracted/transformed;
- verification status.

## Original versus derived

Original evidence and derived information are distinct domain concepts.

Examples of derived information include OCR text, normalized fields, AI summaries, classifications and extracted metadata. Derived content may reference original evidence but must never replace or silently mutate it.

## Provenance envelope

Every material decision or state transition must be capable of carrying a provenance envelope with:

- decision/event ID;
- evaluated-at instant;
- actor/process ID;
- subject ID where applicable;
- rule-set/version references;
- source references;
- evidence references;
- prior aggregate revision;
- resulting aggregate revision.

## Authority boundary

AI/OCR output cannot become `VERIFIED` merely because a model or extraction pipeline produced it. Verification requires an approved deterministic or human/authoritative verification path.

Provider-specific confidence scores are adapter metadata. They may be preserved as evidence metadata but do not redefine Core truth states.

## Historical reproducibility

A historical decision must remain explainable using the exact source, rule and evidence versions recorded at the time. Later source updates must not rewrite historical provenance.

## Data minimization

Provenance must contain enough information for traceability without copying unnecessary personal or sensitive source content into audit metadata. References are preferred over redundant payload duplication.
