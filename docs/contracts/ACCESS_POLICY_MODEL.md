# CALPQ Access Policy Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-CONTRACT-ACCESS-POLICY-0001`

## Purpose
Define deterministic authorization for reading, presenting, exporting or sharing CALPQ subject data.

## AccessRequest
Each request must identify:
- requester / relying party;
- requester role and delegated authority if any;
- subject;
- declared purpose;
- requested claims or resources;
- legal basis and/or consent reference;
- jurisdiction;
- evaluation instant;
- policy version;
- onward-transfer and retention intent where relevant.

## Decision
`AccessDecision` is one of:
- `ALLOW`
- `ALLOW_WITH_CONDITIONS`
- `DENY`
- `REVIEW_REQUIRED`
- `INDETERMINATE`

A role alone MUST NOT imply access. Delegation MUST NOT widen access beyond the delegator's valid scope.

## Conditions
Conditions may constrain claim scope, purpose, expiry, audience, retention, onward transfer, presentation method or human review.

## Fail-safe
Missing, stale, conflicting or unverifiable policy inputs MUST NOT degrade to broad access. They resolve to `DENY`, `REVIEW_REQUIRED` or `INDETERMINATE` according to policy.
