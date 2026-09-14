# CALPQ M07 — Regulatory Intelligence & Radar Baseline

Status: `PLANNING ONLY / BLOCKED`
ID: `CALPQ-M07-PLAN-0001`
Depends on: M04 versioned catalog/RequirementSet planning, M06 reevaluation/lifecycle planning, M01 Regulatory Radar contracts.

## Purpose
Connect authoritative regulatory/source changes to affected requirements, credentials, qualification paths, subjects and organizations with explainable impact and explicit review boundaries.

## Scope
M07 covers:
- authoritative source registry/governance;
- source/version/effective-date lineage;
- regulatory change events;
- impact analysis;
- affected RequirementSet/catalog/path discovery;
- affected subject/organization discovery;
- Regulatory Radar presentation inputs;
- review/resolution workflow;
- explainable notifications and action recommendations.

## Source boundary
A source item must preserve authority/issuer, jurisdiction, source type, version/publication/effective dates, canonical locator/reference, retrieval time and verification/review state.

A fetched text, AI summary or parser output is not itself a legal rule. CALPQ must preserve the distinction between source material, interpreted rule/version and downstream applicability.

## Regulatory change event
A change event records at minimum:
- source/version references;
- jurisdiction;
- effective window;
- changed/added/removed rule references;
- confidence/review state of the interpretation;
- provenance and responsible reviewer/process;
- affected dependency roots when known.

## Impact graph
The intended impact spine is:
`Source Change -> Rule/Requirement Version -> Credential/QualificationPath -> Subject/Organization Dependency -> Reevaluation/Review -> Recommended Action`

Impact analysis must be selective and version-aware. It must not globally rewrite catalog or historical decisions.

## Review boundary
Regulatory interpretation requiring legal/human judgment remains REVIEW_REQUIRED until explicitly resolved. AI may identify candidate changes, summarize text and propose mappings, but cannot finalize legal applicability by itself.

## Effective dating
Future-effective changes may create planned future actions without immediately changing current eligibility/compliance. Retroactive corrections require explicit governed treatment and must preserve prior decision provenance.

## Radar outputs
Regulatory Radar may show:
- new/changed source;
- affected credential/path/requirement;
- effective date;
- estimated affected population;
- current review state;
- recommended next action;
- source/explanation links.

Radar state is not itself a legal decision.

## Notification boundary
Change notifications must explain what changed, why the user/organization may be affected, the source and effective date, and whether action is confirmed or still under review.

## Non-goals
M07 does not own assignment decisions (M08), selective disclosure/interoperability (M09) or AI legal authority (M10).

## Exit criteria
M07 planning is ready when every regulatory-change path is source-backed, effective-dated, review-aware, connected to dependency reevaluation and incapable of silently rewriting historical truth.