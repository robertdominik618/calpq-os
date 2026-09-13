# CALPQ Original Document Archive Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0009-B`

## Purpose

Preserve the original document as immutable evidence material while allowing derived text, metadata, thumbnails, normalized fields and later corrections to evolve independently.

## OriginalArtifact

The original artifact MUST retain:
- stable artifact ID;
- cryptographic content hash;
- original byte length and media type;
- ingestion timestamp and source provenance;
- storage object reference;
- encryption/access classification;
- retention/deletion policy reference;
- integrity-verification result.

## Immutability

The original bytes MUST NOT be overwritten by OCR output, normalization, redaction preview, user correction, transcoding or verification results.

If a new version is supplied, it becomes a new `OriginalArtifact` linked by an explicit relationship such as `REPLACES`, `SUPPLEMENTS`, `DUPLICATES`, or `RELATED_TO`.

## Derived material

Derived artifacts may include OCR text, page images, thumbnails, structured metadata, normalized values and redacted/shareable views. Each derived artifact MUST retain its parent artifact ID, derivation method/version and timestamp.

## Deduplication

Hash equality may indicate byte identity, but MUST NOT by itself prove legal equivalence, authenticity, subject ownership or current validity.
