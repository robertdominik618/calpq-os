# CALPQ M03 Execution Package — Professional Passport Product Surface

Status: `PLANNING COMPLETE / IMPLEMENTATION BLOCKED`

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