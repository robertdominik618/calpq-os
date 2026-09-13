# Contributing to CALPQ OS

## Current phase

The repository is in `M00 FOUNDATION`. Product feature development is frozen until the gate is explicitly released.

## Required workflow

1. Read `foundation/manifest.json` and the Foundation documents.
2. Use `CALPQ-PRIPOJ` for new product ideas.
3. Perform impact analysis before material architecture or technology changes.
4. Add/update an ADR before implementing a material decision.
5. Make the smallest coherent change.
6. Run `bash scripts/foundation_guard.sh`.
7. Record verification and documentation impact in the pull request.

## Boundaries

Do not place business logic in UI. Do not make Core depend on UI or concrete adapters. Do not let plugins modify Core. Do not treat AI/OCR output as authoritative verification unless an approved contract explicitly establishes that role.

## Commit quality

Each commit must leave the repository in a better, understandable state. Prefer focused commits with clear intent over mixed changes.
