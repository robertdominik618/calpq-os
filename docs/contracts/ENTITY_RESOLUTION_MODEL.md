# CALPQ Entity Resolution Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0011-B`

## Purpose

Resolve whether two or more identity records refer to the same real-world subject without relying on a single weak attribute.

## Resolution outcomes

`SAME_SUBJECT | DIFFERENT_SUBJECTS | POSSIBLE_MATCH | REVIEW_REQUIRED | INDETERMINATE`

## Evidence classes

Resolution may use independently sourced evidence such as:
- authoritative person-identification data;
- authoritative organization registry identifiers;
- verified registry links;
- verified account or wallet bindings;
- historical identity-change records;
- verified credential holder identifiers.

Weak signals such as names, email addresses, phone numbers, addresses or OCR similarity MAY contribute to candidate generation but MUST NOT independently produce `SAME_SUBJECT`.

## Determinism and explanation

Every resolution decision must record:
- compared subject/record IDs;
- rule/policy version;
- evidence snapshot IDs;
- positive and conflicting signals;
- decision time;
- result and reason codes;
- whether human review was required.

## Conflict rule

A strong conflict in authoritative identity evidence MUST prevent silent auto-merge and route to `REVIEW_REQUIRED` or `DIFFERENT_SUBJECTS` according to policy.

## Privacy

Matching must use the minimum attributes necessary for the declared purpose. Sensitive identity data must not be copied into unrelated projections merely to improve matching convenience.