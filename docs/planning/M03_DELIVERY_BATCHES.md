# CALPQ M03 Delivery Batches

Status: `PLANNING ONLY / IMPLEMENTATION BLOCKED`
ID: `CALPQ-M03-DELIVERY-0001`

## Purpose
Define implementation-sized batches for M03 Professional Passport Product Surface after M02 exits and M03 is explicitly admitted.

## Batch M03-A — Read Models & Status Semantics
Scope:
1. Passport read-model contract binding;
2. Credential Card presentation model;
3. evidence/status explanation DTOs;
4. timeline/read-history model;
5. reason/source link presentation contract.

Definition of Done:
- UI consumes authoritative projections only;
- no hidden eligibility or verification logic exists in UI;
- status labels preserve document / evidence / eligibility / authorization distinctions;
- all material displayed conclusions have traceable reason/source references.

## Batch M03-B — Dashboard & Passport Flows
Scope:
1. action-oriented dashboard shell;
2. Professional Passport overview;
3. Credential Card list/detail flows;
4. evidence/status detail flows;
5. timeline integration;
6. empty/error/loading states.

Definition of Done:
- dashboard answers what I hold / what is verified / what is missing / why;
- navigation does not invent domain state;
- mobile and web consume the same Application/read contracts.

## Batch M03-C — Search, Accessibility & Localization
Scope:
1. intent-oriented read/search baseline;
2. accessibility semantics and keyboard/screen-reader coverage;
3. localization keys and locale-safe formatting;
4. UX consistency checks across mobile/web;
5. product-surface regression suite.

Definition of Done:
- intent search remains read-oriented and non-authoritative;
- WCAG/accessibility baseline passes;
- no domain reason code is replaced by free-form UI text;
- localization does not change domain meaning.

## Exit
M03 exit requires A+B+C evidence, stable product read contracts and explicit proof that UI remains free of authoritative domain logic.
