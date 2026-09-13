# CALPQ Catalog Query & Explainability Contract

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`  
ID: `CALPQ-M01-PREP-0004-D`

## Purpose

Define deterministic, source-backed answers for intent-oriented questions over the Activity / Profession / Credential graph.

## Supported query intents

- `WHAT_DO_I_NEED_FOR_ACTIVITY`
- `WHAT_DO_I_NEED_FOR_PROFESSION`
- `WHAT_DOES_CREDENTIAL_ENABLE`
- `WHICH_PATHS_LEAD_TO_TARGET`
- `WHAT_CAN_BE_RECOGNIZED`
- `WHAT_REMAINS_AFTER_RECOGNITION`
- `WHY_IS_REQUIREMENT_NEEDED`
- `WHY_IS_PATH_BLOCKED`

## Query context

Every authoritative query must carry or resolve:

- jurisdiction;
- effective date/time;
- target concept/version;
- optional subject profile/evidence snapshot;
- requested language/localization;
- source-verification policy.

Missing material context produces `INDETERMINATE` or `REVIEW_REQUIRED`, not a guessed answer.

## Explainability output

Every result exposes an explanation graph with:

- target concept;
- traversed typed edges;
- requirement/path versions;
- equivalence/recognition effects;
- source references and verification status;
- unresolved facts;
- final outcome/recommendation classification.

## Ranking

Search/ranking may use text relevance, aliases, graph proximity, jurisdiction applicability and source freshness. Ranking is not authority. A highly ranked result may still be inapplicable.

## AI boundary

AI may translate intent, expand synonyms and explain verified results in natural language. It may not invent catalog edges, equivalence rules, recognition decisions or requirement satisfaction.

## Invariants

1. Every material answer is reproducible from versioned graph/rule inputs.
2. Explanations identify why a requirement/path exists, not merely the result.
3. Search relevance never overrides jurisdiction/effective-date rules.
4. Personalized answers distinguish verified facts, user assertions and unverified/AI-derived proposals.
5. A shortest/cheapest path is never presented as legally sufficient unless every mandatory rule edge is satisfied.
