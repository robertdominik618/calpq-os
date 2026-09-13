# CALPQ Application Policy Orchestration Boundary

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0019-D`

## Purpose
Separate orchestration policy from authoritative domain policy.

## Application may coordinate
- authentication/actor context acquisition;
- access decision request and enforcement;
- loading current aggregate/evidence/source snapshots;
- deterministic Core evaluation/transition;
- persistence transaction;
- post-commit scheduling/delivery;
- review/action creation where an approved domain/Application contract requires it.

## Application MUST NOT decide
- whether a requirement is legally satisfied;
- whether a credential grants an authorization;
- whether an issuer has authority outside approved trust rules;
- lifecycle transition legality;
- compliance status meaning;
- equivalence/recognition effect;
- retention/access/security semantics that belong to governed contracts.

## Policy references
Application may select the applicable versioned policy/rule set from approved context and pass it to Core. It must preserve exact version/source/provenance references used.

## Fail-safe
Missing or stale material policy inputs do not become permissive defaults. The use case returns the appropriate `INDETERMINATE`, `REVIEW_REQUIRED`, stable Application error, or denied access outcome according to the existing governing contract.

## AI boundary
AI may assist explanation, summarization or recommendation, but Application MUST NOT allow AI output to replace governed policy decisions or silently upgrade verification/authority/access states.