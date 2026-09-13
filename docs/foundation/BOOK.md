# CALPQ Book — Foundation Map

Status: `M00 FOUNDATION / WORKING BASELINE`  
ID: `CALPQ-BOOK-0001`

## Purpose

The Book is the canonical map of CALPQ. It explains where binding rules live and prevents architecture from being reconstructed from chat history.

## Canonical sources

| Area | Canonical artifact |
|---|---|
| Project status | `foundation/manifest.json` |
| Non-negotiable rules | `docs/foundation/CONSTITUTION.md` |
| Layering and boundaries | `docs/foundation/ARCHITECTURE.md` |
| Apple UX policy | `docs/foundation/APPLE_HIG_POLICY.md` |
| Human workflow | `docs/foundation/HUMAN_WORKFLOW_GUIDELINES.md` |
| Foundation enforcement model | `docs/foundation/FOUNDATION_FRAMEWORK.md` |
| Test policy | `docs/foundation/TEST_FRAMEWORK.md` |
| Technology decision | `docs/adr/ADR-0001-technology-stack-gate.md` |
| Machine guard | `scripts/foundation_guard.sh` |

## Current milestone

`M00 FOUNDATION` establishes governance, architectural boundaries, testability, security/privacy/accessibility expectations and the mechanism that keeps product feature work frozen until the gate is explicitly released.

## Product concepts already known

Product concepts may be documented and queued, but are not implementation authorization. This includes Credential/Professional Passport concepts, Document Intake & Credential Archive, lifecycle/renewal intelligence, verification/evidence concepts, B2B compliance concepts and Civic & Election Competence (`CALPQ-MOD-ELC`).

## Change intake

New product ideas enter through `CALPQ-PRIPOJ`. Material architecture changes require impact analysis and an ADR before code.
