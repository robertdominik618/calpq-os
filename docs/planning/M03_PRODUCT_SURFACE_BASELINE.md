# CALPQ M03 — Professional Passport Product Surface Baseline

Status: `PLANNING ONLY / BLOCKED`
ID: `CALPQ-M03-PLAN-0001`
Depends on: M02 first vertical stabilized and admitted for implementation under project governance.

## Purpose
Turn authoritative M02 outputs into a coherent user-facing product without allowing UI or read models to become legal/domain truth.

## Product surfaces
M03 covers:
- action-oriented dashboard;
- CALPQ Professional Passport;
- Credential Cards;
- evidence and verification detail;
- status explanation (`why` / source / evidence / effective date);
- activity and decision timeline;
- intent-oriented read/search baseline;
- mobile and web read flows;
- accessibility and localization foundations.

## Required state separation
Every user-facing credential/status surface must preserve separate concepts for:
- document or CredentialArtifact presence;
- evidence verification state;
- eligibility state;
- authorization/grant state where such a grant exists in later milestones;
- lifecycle/expiry state;
- review or uncertainty state.

A UI badge, label, card or color must never collapse these states into one generic `valid` flag.

## Passport boundary
Professional Passport is a projection/read model. It may summarize and explain authoritative records, but it does not issue, mutate or replace CredentialArtifact, EligibilityAssessment, AuthorizationGrant, verification evidence or source provenance.

## Dashboard principles
The dashboard should prioritize action and uncertainty rather than raw document counts. It should surface, when applicable:
- current trusted/known state;
- what changed;
- what requires review;
- what is missing;
- what action is next;
- why CALPQ recommends or displays that action;
- which source/evidence supports the display.

## Credential Card minimum contract
A Credential Card must be able to display:
- credential/qualification name and type;
- subject;
- jurisdiction/scope;
- evidence/verification status;
- eligibility status where available;
- validity/effective dates where meaningful;
- source/provenance indicator;
- reason/explanation entrypoint;
- lifecycle warning state without implying automatic legal revocation unless authoritative state says so.

## Explainability
Material statuses require a user-accessible explanation path. Human-readable wording is presentation data; stable reason/source/evidence references remain authoritative.

## Search boundary
M03 introduces user-facing intent-oriented retrieval over approved projections/catalog metadata. Search ranking cannot create facts, change eligibility, verify evidence or issue authorization.

## Accessibility/localization
M03 must support:
- keyboard/screen-reader compatible web interaction;
- accessible semantic labels for status, not color-only meaning;
- localization-ready strings and reason-code mapping;
- date/time presentation that does not change Core UTC/effective-date semantics.

## Non-goals
M03 does not implement:
- full Credential Catalog/qualification-path intelligence (M04);
- universal production intake/verification fabric (M05);
- lifecycle automation (M06);
- regulatory change automation (M07);
- AI decision authority (M10).

## Exit criteria
M03 planning is ready when dashboard, Passport, Credential Card, explanation, timeline, search and accessibility contracts are traceable to M01/M02 authoritative models and no user-facing surface can silently upgrade evidence or legal state.