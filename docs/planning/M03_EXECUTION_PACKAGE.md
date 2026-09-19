# CALPQ M03 Execution Package — Professional Passport Product Surface

Status: `ADMITTED / IMPLEMENTATION AUTHORIZED`

## Objective
Turn stable M02 read models into the first coherent CALPQ user experience without moving domain truth into UI code.

## Delivery slices
1. Dashboard shell and navigation over governed read models.
2. Professional Passport summary and credential grouping.
3. Credential Card state presentation: document, verification, eligibility and lifecycle shown separately.
4. Evidence and source explanation views with explicit `Why?` affordance.
5. Activity timeline and decision provenance presentation.
6. Missing-condition and next-action presentation from governed outputs.
7. Intent-oriented search over approved query models.
8. Mobile/web responsive read flows.
9. Accessibility and localization foundations.
10. M03 integration evidence and UX boundary tests.

## Ownership
M03 owns presentation, interaction, read-model composition and user-facing explanation rendering. It does not own eligibility, verification, evidence promotion, authorization, catalog rules or lifecycle truth.

## Definition of Done
- no business/legal truth computed in UI;
- Credential Card never collapses document, verification, eligibility and authorization states;
- all material explanations trace to stable reason/source/evidence references;
- accessible keyboard/screen-reader/mobile flows defined and tested;
- localization does not alter machine-readable reason semantics;
- representative user journeys pass against stable M02 read contracts.

## Stop conditions
Stop implementation if UI introduces hidden eligibility rules, infers legal validity from visual state, bypasses access/purpose controls, or depends directly on provider-specific payloads.

## Formal admission
- Transition: `CALPQ-M03-ADMIT-0001`.
- Admission basis: reviewed/merged/post-merge-verified M02 commit `387dbfa0246d36e576ff15a6e5bb1016e051093c`.
- Approved by: `robertdominik618`.
- Approval text: `Schváleno další krok povolen` in the immediately preceding M03 admission context.
- Approved at: `2026-09-15T10:57:00Z`.
- Authorized execution entry: `M03_SLICE_01_DASHBOARD_READ_MODELS`.
- Scope is limited to this M03 execution package. M04–M08 remain separately blocked and no AuthorizationGrant authority is introduced.

The machine-readable companion is `docs/planning/m03-admission-decision.json`; the durable governance record is `docs/planning/M03_ADMISSION_RECORD.md`.
