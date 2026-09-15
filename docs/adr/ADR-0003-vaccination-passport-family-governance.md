# ADR-0003 — Vaccination Passport and Equal-Parent Family Governance

**Status:** Accepted  
**Date:** 2026-09-15  
**Decision owners:** CALPQ architecture governance

## Context

CALPQ Family already establishes the product direction for parent/child lifecycle, evidence, future unlocks, account handover and capability-based access. A lifelong Vaccination Passport extends that model from infancy through adulthood and travel while introducing sensitive health data, multi-dose schedules, long-horizon boosters, rapidly changing travel requirements and a healthcare-provider verification boundary.

The architecture also requires an explicit rule for mother/father administration. A relation label must not become a hidden authorization hierarchy.

## Decision

### D1 — First-class Vaccination Passport domain

CALPQ adopts `CALPQ-HEALTH-0001 — Vaccination Passport, Immunization Lifecycle & Travel Health Baseline` as a first-class architecture domain.

The domain is modelled around:

**History → Schedule → Dose Series → Booster Lifecycle → Travel → Evidence**

and reuses shared CALPQ services for Family, Document Intake, Evidence Ladder, temporal rules, provenance, Regulatory Radar, Next Best Action, notification policy, selective disclosure and audit.

### D2 — Medical source-of-truth boundary

LLM output and OCR extraction are never the medical source of truth.

- OCR proposes data; it does not verify an immunization.
- AI explains; it does not prescribe or establish clinical fitness.
- Structured effective-dated authoritative rules drive standard lifecycle evaluation.
- Individual clinical decisions are delegated to an appropriate healthcare professional.
- Unsafe/insufficient cases fail to `UNKNOWN` or `REQUIRES_CLINICIAN_REVIEW` rather than becoming a positive conclusion.

### D3 — Mother/father equal full administration

When mother and father have equivalent verified unrestricted parental authority over a child, they both resolve to the same `FULL_PARENTAL_ADMIN` capability set.

There shall be no authorization rule that makes one stronger or weaker merely because the relationship type is `MOTHER` or `FATHER`.

Differences are permitted only when caused by explicit effective-dated provenance-backed authority facts such as legal restrictions, court/administrative decisions, revocation or scoped authority.

Family Account creator or billing-owner status does not create superior parental authority.

### D4 — Sensitive-health privacy boundary

Vaccination information is treated as sensitive health data. Access is deny-by-default outside an authorized authority/capability relationship. Selective disclosure is preferred over sharing the complete record.

Child health data shall not be used for behavioral advertising.

### D5 — Travel rules are temporal and freshness-sensitive

Travel-health evaluation explicitly separates:

1. entry/transit/exit requirements,
2. health recommendations,
3. routine vaccination lifecycle.

Travel rules require source provenance and freshness evaluation. Stale critical rules shall not produce a confident positive answer.

### D6 — History belongs to the child subject

Childhood vaccination history belongs to the child’s subject record. Account handover changes current access/governance but does not move history into or out of a parent’s personal health record and does not rewrite historical authority states.

## Consequences

### Positive

- CALPQ can support immunization from infancy through adult boosters and international travel without creating a parallel platform.
- Parent permissions remain symmetric and explainable.
- Historical decisions remain reproducible when rules change.
- Sensitive health data inherit CALPQ’s evidence, provenance, audit and selective-sharing model.
- Future FHIR/provider adapters can be added without allowing them to redefine Core.

### Costs / constraints

- The immunization model is richer than a simple reminder table.
- Travel rules need ongoing source governance and freshness checks.
- Provider verification and clinical review require strict trust boundaries.
- Family authorization requires verified authority and explicit restriction provenance.

## Rejected alternatives

### A. Vaccination as generic document tags

Rejected because documents do not model dose series, combined vaccines, schedule windows, booster rules, travel contexts or clinical-review states.

### B. Hard-coded vaccination reminders

Rejected because schedules are jurisdictional, age/context-dependent and effective-dated.

### C. LLM-generated vaccination plan

Rejected because an LLM is not an authoritative or clinical source of truth.

### D. Parent role hierarchy based on mother/father label

Rejected because authorization must be based on verified authority scope, not parent sex/gender/relation label.

### E. Full Family visibility by default

Rejected because vaccination records are sensitive health data and require least-privilege access.

## Related architecture

- `docs/architecture/CALPQ_HEALTH_0001_VACCINATION_PASSPORT.md`
- `docs/contracts/FAMILY_GUARDIAN_EQUAL_ADMIN_MODEL.md`
- `docs/contracts/DOCUMENT_INTAKE_MODEL.md`
- `docs/contracts/DOCUMENT_VERIFICATION_BOUNDARY.md`
- `docs/contracts/CORE_PROVENANCE_AND_EVIDENCE.md`
- `docs/contracts/REGULATORY_RADAR_MODEL.md`
- `docs/contracts/REGULATORY_CHANGE_IMPACT_MODEL.md`
- `docs/contracts/NEXT_BEST_ACTION_MODEL.md`
- `docs/contracts/SELECTIVE_DISCLOSURE_GOVERNANCE.md`
- `docs/contracts/CONSENT_LEGAL_BASIS_MODEL.md`
- `docs/contracts/AUDIT_LEDGER_MODEL.md`

## Acceptance evidence

This ADR is considered repository-level evidence that the architecture decision was accepted and persisted. Runtime implementation remains a separate delivery concern and must trace to the acceptance criteria in `CALPQ-HEALTH-0001` and `FAMILY_GUARDIAN_EQUAL_ADMIN_MODEL`.