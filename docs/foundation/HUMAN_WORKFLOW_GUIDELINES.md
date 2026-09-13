# Human Workflow Guidelines

Status: `M00 FOUNDATION / NORMATIVE`  
ID: `CALPQ-HWG-0001`

## Standard change flow

1. **Intake** — new concept enters via `CALPQ-PRIPOJ` or an approved requirement source.
2. **Classification** — identify product, architecture, legal, security, privacy, data and UX impact.
3. **Impact analysis** — identify affected Core contracts, adapters, evidence, lifecycle and migrations.
4. **Decision** — create/update ADR and contracts for material changes.
5. **Approval** — obtain explicit approval where governance requires it.
6. **Implementation** — implement the smallest coherent change.
7. **Verification** — run unit/contract/integration/architecture/security/accessibility tests as applicable.
8. **Review** — inspect behavior, evidence, UX and regression risk.
9. **Record** — commit with traceable intent and update canonical documentation.
10. **Release gate** — release only when required checks pass.

## Human authority boundaries

- Human review must remain available wherever extracted, inferred or AI-generated data can materially affect rights, eligibility, obligations or regulated outcomes.
- Corrections must preserve provenance rather than silently destroying the original evidence trail.
- The interface must distinguish verified facts, imported facts, user assertions and AI/OCR proposals.

## Commit discipline

Commits should be small, coherent, reversible and independently improve the project. Unrelated refactors and features are not mixed into one change.
