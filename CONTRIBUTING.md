# Contributing to CALPQ OS

## Current phase

The repository is in `M00 FOUNDATION`. Product feature development is frozen until the M00 release gate is explicitly approved.

## Required workflow

1. Read `foundation/manifest.json` and the canonical Foundation documents.
2. Use `CALPQ-PRIPOJ` for new product ideas.
3. Perform impact analysis before material architecture or technology changes.
4. Add or update an ADR before implementing a material decision.
5. Define or update contracts for stable boundaries.
6. Make the smallest coherent change.
7. Run `bash scripts/foundation_guard.sh`.
8. Run `bash scripts/m00_release_gate.sh` during M00.
9. Run the applicable self-tests and record verification in the pull request.
10. Update canonical documentation and provenance where the change affects them.

## Boundaries

Do not place business logic in UI. Do not make Core depend on UI or concrete adapters. Do not let plugins modify Core. Do not treat AI/OCR output as authoritative verification unless an approved contract explicitly establishes that role.

## Cross-cutting review

Every material change must consider security/privacy, accessibility, regulatory-source provenance, evidence/audit behavior and migration/compatibility implications where relevant.

## Commit quality

Each commit must leave the repository in a better, understandable state. Prefer focused commits with clear intent over mixed changes.
