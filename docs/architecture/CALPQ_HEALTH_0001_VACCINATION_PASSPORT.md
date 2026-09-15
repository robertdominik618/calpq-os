# CALPQ-HEALTH-0001 — Vaccination Passport, Immunization Lifecycle & Travel Health Baseline

**Status:** APPROVED ARCHITECTURE BASELINE  
**Date:** 2026-09-15  
**Scope:** B2C + Family + future healthcare-provider interoperability  
**Parent product:** CALPQ OS — Credential, Competence & Lifecycle Operating System

## 1. Purpose

CALPQ Vaccination Passport is a first-class lifelong lifecycle domain, not a document folder and not an autonomous medical decision system. It extends the existing CALPQ principles of evidence, provenance, effective-dated rules, lifecycle, notifications, regulatory intelligence, selective sharing, audit, human review and fail-closed decision handling into immunization history and travel-health preparation.

The primary value chain is:

**History → Schedule → Dose Series → Booster Lifecycle → Travel → Evidence**

with horizontal services:

**Family Governance + Notifications + Regulatory Intelligence + Verification + Privacy + Audit + Human/Clinician Review.**

The module shall support a person from infancy through adulthood, including family-managed childhood records, multi-dose series, boosters, long-horizon reminders, account handover, travel-related requirements/recommendations and future healthcare-provider verification.

## 2. Architectural boundary

Vaccination is represented as a dedicated health lifecycle domain. It may reuse CALPQ platform services but SHALL NOT be reduced to generic `Document` or generic `Credential` fields.

The module SHALL reuse:

- Document Intake and original-document archive,
- OCR/extraction proposal workflow,
- Evidence Ladder and provenance,
- effective-dated rules and jurisdiction model,
- Notification Policy,
- Next Best Action,
- Regulatory Radar and change-impact evaluation,
- Family governance and capability-based access,
- selective disclosure,
- audit ledger,
- human-review boundary,
- provider adapters that do not modify Core.

The module SHALL NOT make an LLM, OCR engine, marketplace, travel portal or external provider the source of medical or regulatory truth.

## 3. Core domain entities

The minimum domain model includes:

| Entity | Responsibility |
|---|---|
| `VaccineConcept` | canonical immunization concept independent of commercial brand |
| `AntigenComponent` | disease/antigen coverage of a vaccine concept or product |
| `VaccineProduct` | concrete product/manufacturer representation when known |
| `ImmunizationEvent` | one administered or asserted immunization event |
| `DoseRecord` | dose number/role inside a series |
| `DoseSeries` | multi-dose schedule state |
| `ImmunizationRule` | effective-dated rule governing a schedule/recommendation/requirement |
| `BoosterRule` | effective-dated booster logic |
| `ImmunizationRecommendation` | recommendation derived from authoritative structured rules |
| `ImmunizationRequirement` | legal/program/travel requirement, explicitly typed |
| `ImmunizationPlan` | computed lifecycle plan, never an autonomous clinical prescription |
| `EvidenceRecord` | evidence/provenance binding for an event or fact |
| `ProviderReference` | clinician/provider/organization provenance |
| `BatchRecord` | optional lot/batch metadata when evidence supports it |
| `ImmunizationCertificate` | certificate/document reference, including international certificates |
| `TravelHealthContext` | trip-specific evaluation context |
| `TravelRequirement` | entry/transit/exit rule |
| `TravelRecommendation` | authoritative travel-health recommendation |
| `DataQualityIssue` | conflict, duplicate, impossible chronology or ambiguous extraction |
| `ClinicianReviewCase` | explicit handoff when automated evaluation is unsafe |

## 4. Five independent state dimensions

No UI or API may collapse all vaccination information into one green/red status. At minimum, the system SHALL preserve five independent dimensions.

### 4.1 Evidence state

- `ASSERTED_BY_USER`
- `EXTRACTED_UNCONFIRMED`
- `USER_CONFIRMED`
- `DOCUMENT_SUPPORTED`
- `PROVIDER_VERIFIED`
- `AUTHORITATIVE_SOURCE_VERIFIED`
- `CONFLICTING`
- `UNKNOWN`

### 4.2 Series state

- `NOT_STARTED`
- `IN_PROGRESS`
- `COMPLETE_FOR_RULE_VERSION`
- `NEEDS_ADDITIONAL_DOSE`
- `UNKNOWN`
- `REQUIRES_REVIEW`

### 4.3 Timing state

- `NOT_YET_RELEVANT`
- `APPROACHING_WINDOW`
- `IN_RECOMMENDED_WINDOW`
- `PAST_RECOMMENDED_WINDOW`
- `UNKNOWN`

### 4.4 Rule/category state

The rule SHALL explicitly distinguish at least:

- routine/regular,
- mandatory where applicable,
- recommended,
- recommended and conditionally reimbursed where applicable,
- voluntary,
- travel requirement,
- travel recommendation,
- extraordinary/public-health context,
- injury-related context where supported by authoritative rules.

### 4.5 Clinical-decision state

- `NOT_CLINICALLY_ASSESSED`
- `STANDARD_RULE_APPLICABLE`
- `REQUIRES_CLINICIAN_REVIEW`

CALPQ SHALL NOT infer clinical fitness for vaccination merely from administrative schedule data.

## 5. Dose Series Engine

The Dose Series Engine SHALL support 1-dose, 2-dose, 3-dose and other variable schedules, combined vaccines, boosters, catch-up/review states and historical schedules.

A dose rule SHALL be able to represent at least:

```text
earliest_valid_date
recommended_from
recommended_to
overdue_from
minimum_interval
preferred_interval
rule_version
valid_from
valid_to
jurisdiction
source_reference
```

The system SHALL distinguish a minimum valid interval from a recommended interval. It SHALL NOT store a universal single `next_date` as the only lifecycle truth.

Combined vaccines SHALL map one `ImmunizationEvent` to multiple `AntigenComponent` nodes. One administered product may therefore satisfy multiple requirement relationships without duplicating the event.

## 6. Long-horizon booster lifecycle

Booster reminders SHALL be derived from effective-dated `BoosterRule` objects and the person’s evidence-backed history. A long horizon such as tetanus SHALL NOT be implemented as a hard-coded `+10 years` rule.

The lifecycle MAY produce staged notification windows such as informational, preparation, recommended-window and overdue/review notifications, but the exact timing SHALL be rule-driven and reevaluated whenever the governing rule changes.

Any previously scheduled notification whose source rule is superseded SHALL be re-evaluated. Historical decisions SHALL remain replayable using their original rule version.

## 7. Family lifecycle and childhood records

The vaccination profile SHALL support creation and management from infancy under CALPQ Family. Childhood events, evidence, plans and reminders SHALL belong to the child subject, not to the parent’s personal record.

The system SHALL support:

- one or more authorized parents/guardians,
- independent identities for parent and child,
- capability-scoped access,
- full audit of reads and writes,
- explicit legal/authority provenance,
- safe handover to the child’s own account when governance changes,
- preservation of all historical vaccination events and evidence after handover.

### Parent equality invariant

Where mother and father possess equivalent verified full parental authority for the child, **both SHALL receive exactly the same `FULL_PARENTAL_ADMIN` capability set**. No capability, health-data permission, vaccination-management permission, notification-management permission, travel-health permission or document-management permission may differ solely because the actor is labelled `MOTHER` or `FATHER`.

A restriction may exist only when it is explicitly represented by an effective-dated, provenance-backed authority limitation, legal restriction, court/administrative decision, revoked grant or other valid governance fact. The system SHALL never infer a restriction from sex, gender or the mother/father relation label.

Other family members remain deny-by-default unless an explicit grant applies.

## 8. Document Intake and vaccination-card import

The user SHALL be able to photograph, scan or upload vaccination cards/certificates through the existing Document Intake pipeline.

The pipeline is:

**Original storage → OCR/extraction → structured proposal → entity resolution → user/human review → evidence binding → lifecycle reevaluation.**

OCR MAY propose:

- date,
- vaccine/product,
- antigen coverage,
- dose number,
- provider,
- batch/lot,
- certificate metadata.

OCR SHALL NOT create a provider-verified medical fact by itself. Extraction is evidence proposal only.

## 9. Evidence Ladder for immunization

The system SHALL preserve confidence and provenance rather than silently promoting user-entered data.

A typical ladder is:

1. user assertion,
2. OCR/extraction proposal,
3. user-confirmed extraction,
4. document-supported event,
5. provider-verified event,
6. authoritative-source-verified event where supported.

The exact labels can be mapped to the platform Evidence Ladder, but the distinction SHALL remain observable and auditable.

## 10. Conflicts and data quality

Conflicting evidence SHALL never be silently overwritten. Examples include:

- different dates for a likely identical dose,
- dose 2 dated before dose 1,
- impossible date relative to birth,
- duplicate entries from multiple documents,
- unreadable or partial product/batch data,
- uncertain identity resolution.

The system SHALL create `DataQualityIssue` and preserve both source records until resolved. Resolution SHALL be audited.

Date precision SHALL be first-class:

- `DAY`
- `MONTH`
- `YEAR`
- `UNKNOWN`

The system SHALL never fabricate a day/month when only a year is known.

## 11. Historical schedules and temporal correctness

A person vaccinated in an earlier decade may have been governed by a different schedule. Evaluation SHALL therefore be effective-dated and capable of answering both:

- what rule applied at the time of the historical event,
- what rule applies today for future lifecycle actions.

Each material evaluation SHALL retain:

- `rule_id`,
- `rule_version`,
- effective period,
- source/provenance,
- evaluation timestamp,
- relevant input facts/evidence snapshot,
- result/reason codes,
- engine version when applicable.

No new rule may retroactively rewrite the meaning of an archived historical evaluation.

## 12. Regulatory Radar integration

The Vaccination Passport SHALL subscribe to regulatory/guideline change events relevant to:

- routine schedules,
- booster schedules,
- age conditions,
- reimbursement/program categories where represented,
- travel entry/transit/exit requirements,
- travel recommendations,
- certificate validity rules.

A change-impact evaluation SHALL identify affected persons/plans and recalculate only future/current projections. Historical snapshots remain immutable/replayable.

## 13. Next Best Action integration

Vaccination uses the shared Next Best Action Engine. It SHALL prioritize actions by at least:

- deadline/window,
- lead time needed to complete a series,
- severity/importance of the governing requirement,
- dependency on clinician review,
- travel departure date,
- evidence uncertainty,
- family context.

The system SHALL prefer a concise ordered action set over notification spam.

## 14. Travel Vaccination / Travel Health context

Travel evaluation SHALL be trip-specific and person-specific. `TravelHealthContext` SHALL support:

- destination countries/regions,
- transit countries/regions,
- departure and return dates,
- trip duration,
- purpose/context where relevant,
- urban/rural/outdoor context where relevant,
- individual age,
- evidence-backed vaccination history.

Progressive questioning SHALL collect only facts material to the evaluation.

### 14.1 Mandatory separation of travel outputs

CALPQ SHALL display separately:

1. **Entry/transit/exit requirement** — an administrative/legal travel requirement.
2. **Health recommendation** — authoritative risk-based recommendation.
3. **Routine vaccination status** — ordinary lifecycle independent of the trip.

These categories SHALL never be collapsed into a single “required vaccine” list.

### 14.2 Transit-aware evaluation

Rules may depend on prior presence/transit. Therefore the trip model SHALL support an ordered itinerary, not merely one `destination_country`.

### 14.3 Freshness Gate

Travel rules are time-sensitive. Each travel rule SHALL carry freshness metadata (`last_verified_at`, source, effective period). A critical rule outside the accepted freshness threshold SHALL return `REQUIRES_FRESH_VERIFICATION` rather than a confident green result.

### 14.4 Last-Minute Traveller mode

When departure is near, CALPQ SHALL distinguish:

- actions still feasible,
- schedules that cannot be completed in the ordinary window,
- items requiring clinician/travel-health review,
- documentation checks,
- non-pharmacological/general preparation where an authoritative source supports it.

The system SHALL NOT invent an alternative medical regimen.

### 14.5 Travel What-If simulation

Users MAY simulate a possible future trip without creating a real lifecycle plan. A What-If result SHALL be labelled hypothetical and SHALL become an actionable plan only when the trip is confirmed.

## 15. International certificates

The archive SHALL support evidence for international vaccination/prophylaxis certificates and equivalent official documents where applicable.

CALPQ MAY store and selectively present the document and structured metadata. It SHALL NOT claim to replace an original government/international certificate unless an authoritative digital-verification mechanism explicitly supports that status.

## 16. Selective sharing

Vaccination data are sensitive health data. Sharing SHALL follow minimum-necessary disclosure.

A relying party MAY receive, where legally permitted and explicitly authorized, a scoped result such as:

- evidence that a specified vaccination is documented,
- event date,
- verification level,
- relevant certificate reference,
- validity statement for a specific administrative requirement.

A school, employer, travel provider or other relying party SHALL NOT receive the entire vaccination history by default.

All disclosures SHALL be auditable and revocable where applicable.

## 17. Privacy and security class

Vaccination data SHALL be classified as sensitive health data and receive a stricter protection profile than ordinary credentials.

The architecture SHALL require:

- encryption in transit and at rest,
- capability-based access,
- purpose limitation,
- explicit legal-basis/consent handling where applicable,
- immutable/auditable access history,
- selective disclosure,
- retention/export/deletion governance aligned with applicable law,
- deny-by-default family and third-party access,
- no use of child health data for behavioral advertising,
- no sale of health data.

## 18. Clinician/provider boundary

CALPQ may provide a future healthcare-provider workflow to:

- view a consented relevant history,
- verify an event/document,
- record a newly administered event,
- resolve uncertain series/history,
- establish an individualized follow-up plan,
- sign or provenance-bind professional statements.

Individual clinical decisions remain within the healthcare-provider domain. The CALPQ rule engine SHALL return `REQUIRES_CLINICIAN_REVIEW` whenever safe automated evaluation is not justified.

## 19. Catch-up and incomplete history

If history is incomplete, CALPQ SHALL NOT automatically instruct a person to restart a vaccination series unless an authoritative structured rule explicitly supports that conclusion for the exact context.

The default safe outcome is:

**history incomplete → evidence summary → clinician review/catch-up assessment.**

CALPQ SHALL be able to generate a clinician-facing summary containing documented events, ambiguous/conflicting events, missing evidence and questions requiring professional resolution.

## 20. AI boundary

AI MAY:

- explain terminology,
- summarize a person’s evidence-backed history,
- explain why a lifecycle item exists,
- help search records,
- summarize authoritative rule changes,
- prepare questions for a clinician,
- translate complex rule output into plain language.

AI SHALL NOT:

- be the source of an immunization schedule,
- diagnose conditions,
- determine contraindications without an authoritative rule/professional input,
- declare a person clinically fit for vaccination,
- prescribe an individualized vaccination regimen,
- promote OCR output to verified medical truth.

Mandatory flow:

**Authoritative source / clinician statement → structured fact/rule → deterministic Core → result → AI explanation.**

## 21. Source governance

Vaccination rules SHALL use the platform Regulatory Source Governance model with explicit source authority and provenance. Candidate source classes include national health authorities, official legislation where applicable, recognized national professional guidance and international authorities such as WHO for relevant travel/public-health contexts.

Commercial vaccine providers, marketplaces and generic web content SHALL NOT be first-class authoritative rule sources.

## 22. FHIR interoperability direction

Future interoperability SHOULD map cleanly to relevant HL7 FHIR concepts, including at minimum:

- `Patient`,
- `Immunization`,
- `ImmunizationRecommendation`,
- `Practitioner`,
- `Organization`,
- `DocumentReference`.

CALPQ Core does not need to be implemented internally as FHIR. FHIR belongs at the interoperability/adapter boundary so that provider standards do not redefine Core.

## 23. UX surfaces

The minimum product projections are:

- **My Vaccination Passport** — chronological history and evidence,
- **What’s Next** — upcoming lifecycle actions,
- **Family Vaccination** — authorized multi-person overview,
- **Travel** — destination/transit-specific preparation,
- **Evidence detail** — source, verification level, conflicts,
- **Why?** — rule/source explanation.

Current, future and historical information SHALL be visually and semantically separated. Color SHALL never be the sole carrier of meaning.

## 24. Emergency/injury contexts

Where official rules support an injury-related immunization context, CALPQ MAY surface the date and verification level of the last relevant event to aid communication with healthcare providers. CALPQ SHALL NOT independently determine treatment after injury.

## 25. Prohibited shortcuts

The architecture explicitly forbids:

- hard-coded universal `tetanus = +10 years`,
- `one vaccination = one disease` modelling,
- OCR-as-verification,
- one green/red vaccination status,
- inferred exact dates from partial evidence,
- silent overwrite of conflicting evidence,
- LLM-generated medical schedules as truth,
- automatic claims of “protected until” without a rule supporting that exact statement,
- mixing travel entry requirements with health recommendations,
- advertising/marketplace influence over medical or regulatory truth,
- behavioral advertising based on child health data,
- automatic full-family visibility of sensitive health data,
- loss of childhood history during account handover.

## 26. Acceptance criteria

The first architecture-complete implementation plan SHALL trace at least these criteria:

- `VAX-AC-001` multi-person Family support,
- `VAX-AC-002` chronological immunization history,
- `VAX-AC-003` combined-vaccine/antigen support,
- `VAX-AC-004` multi-dose series,
- `VAX-AC-005` booster lifecycle,
- `VAX-AC-006` effective-dated rule versions,
- `VAX-AC-007` mandatory/recommended/travel distinction,
- `VAX-AC-008` Evidence Ladder integration,
- `VAX-AC-009` Document Intake integration,
- `VAX-AC-010` OCR + human confirmation boundary,
- `VAX-AC-011` provenance,
- `VAX-AC-012` conflict detection,
- `VAX-AC-013` `UNKNOWN` state,
- `VAX-AC-014` `REQUIRES_CLINICIAN_REVIEW`,
- `VAX-AC-015` lifecycle notifications,
- `VAX-AC-016` Regulatory Radar integration,
- `VAX-AC-017` Family capability permissions,
- `VAX-AC-018` child-to-adult Account Handover,
- `VAX-AC-019` selective sharing,
- `VAX-AC-020` audit,
- `VAX-AC-021` destination-based travel context,
- `VAX-AC-022` transit support,
- `VAX-AC-023` travel requirement vs recommendation separation,
- `VAX-AC-024` travel-rule freshness gate,
- `VAX-AC-025` pre-travel timeline,
- `VAX-AC-026` multi-traveller family assessment,
- `VAX-AC-027` international-certificate evidence,
- `VAX-AC-028` professional/provider verification workflow boundary,
- `VAX-AC-029` historical evaluation reproducibility,
- `VAX-AC-030` AI never becomes medical source of truth,
- `VAX-AC-031` mother/father equal full administration under equivalent verified parental authority,
- `VAX-AC-032` any parental restriction must be explicit, effective-dated and provenance-backed.

## 27. Delivery sequence

The planned implementation sequence is:

| Phase | Scope |
|---|---|
| `VAX-P0` | domain model, family authority invariants, privacy classification, temporal rules |
| `VAX-P1` | history and manual entry |
| `VAX-P2` | Document Intake + OCR proposal flow |
| `VAX-P3` | Dose Series Engine |
| `VAX-P4` | booster lifecycle + notifications |
| `VAX-P5` | Family vaccination dashboard |
| `VAX-P6` | Regulatory Radar + reevaluation |
| `VAX-P7` | Travel Vaccination/Travel Health engine |
| `VAX-P8` | multi-person family travel |
| `VAX-P9` | provider verification/clinician workflow |
| `VAX-P10` | FHIR/external healthcare interoperability |

## 28. Definition of architecture completion

`CALPQ-HEALTH-0001` is architecture-complete only when the domain contracts, family-authority invariant, privacy classification, temporal-rule boundary, evidence boundary, travel-rule separation, AI boundary and acceptance criteria are all traceable in repository source of truth.

This document is a binding architecture baseline. It does **not** assert that the runtime feature, clinical integrations or all acceptance criteria are already implemented in production code.