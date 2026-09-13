# CALPQ Re-evaluation Decision Evidence

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0007-E`

## Purpose

Preserve an immutable audit snapshot for every completed re-evaluation.

## Required fields

A `ReevaluationDecision` retains:
- decision ID;
- triggering ChangeEvent ID;
- target object ID/type;
- previous decision reference and previous result when present;
- new result;
- evaluated_at and evaluation instant;
- dependency path explaining why the target was selected;
- rule/source/catalog versions used;
- evidence snapshot references;
- deterministic reason codes;
- review state;
- correlation/causation metadata.

## Outcomes

- UNCHANGED;
- STATUS_CHANGED;
- FUTURE_IMPACT_REGISTERED;
- ACTION_REQUIRED;
- REVIEW_REQUIRED;
- INDETERMINATE.

An `UNCHANGED` result is still auditable evidence that a change was evaluated.

## History rule

New evaluation never rewrites an older decision bundle. It creates a new linked snapshot and preserves the exact inputs used by both evaluations.

## Explainability

The bundle must answer: what changed, why this object was affected, which prior conclusion was reviewed, which rules/evidence were used, what the new conclusion is, and what action follows.

## Retry rule

Derived alerts and obligations require a deterministic deduplication key so replay cannot create duplicate actions.
