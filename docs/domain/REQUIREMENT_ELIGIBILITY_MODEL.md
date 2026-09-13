# Requirement & Eligibility Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`  
ID: `CALPQ-DOM-REQ-0001`

## Purpose

Define deterministic evaluation of credential/authorization requirements without coupling CALPQ Core to UI, a specific law, a specific registry or AI/OCR output.

## RequirementDefinition

Each atomic requirement must record:

- stable `requirement_id` and code;
- requirement kind;
- human-readable purpose;
- source/rule provenance;
- jurisdiction;
- effective-from/effective-to;
- evaluation mode;
- expected evidence classes;
- whether an authorized override is legally permitted;
- review policy.

Suggested requirement kinds include `DOCUMENT`, `QUALIFICATION`, `EXPERIENCE`, `AGE`, `EXAM`, `FITNESS`, `FEE`, `BACKGROUND`, `CONTINUING_EDUCATION`, `JURISDICTION`, `REGISTRATION` and `OTHER`.

Requirement kinds are taxonomy, not executable logic by themselves.

## Evaluation modes

- `DETERMINISTIC` — Core can decide from verified structured inputs.
- `HUMAN_REVIEW` — an accountable human decision is required.
- `EXTERNAL_AUTHORITY` — authoritative external state/decision is required.

AI/OCR may assist acquisition or explanation but cannot change the evaluation mode.

## Requirement groups

A requirement set is a versioned tree of atomic requirements and groups.

Supported group operators:

- `ALL`;
- `ANY`;
- `AT_LEAST(n)`.

Arbitrary executable expressions are not embedded in stored configuration unless separately governed and sandboxed.

## Atomic result

Every evaluated requirement returns exactly one Core outcome:

- `SATISFIED`;
- `NOT_SATISFIED`;
- `INDETERMINATE`;
- `REVIEW_REQUIRED`.

It also carries evidence references, rule/source version and explanatory reason codes.

## Deterministic aggregation

### ALL

1. any `NOT_SATISFIED` -> `NOT_SATISFIED`;
2. otherwise any `REVIEW_REQUIRED` -> `REVIEW_REQUIRED`;
3. otherwise any `INDETERMINATE` -> `INDETERMINATE`;
4. otherwise -> `SATISFIED`.

### ANY

1. any `SATISFIED` -> `SATISFIED`;
2. otherwise any `REVIEW_REQUIRED` -> `REVIEW_REQUIRED`;
3. otherwise any `INDETERMINATE` -> `INDETERMINATE`;
4. otherwise -> `NOT_SATISFIED`.

### AT_LEAST(n)

- if confirmed satisfied count >= n -> `SATISFIED`;
- if even all unresolved/review-required members could not reach n -> `NOT_SATISFIED`;
- if a mandatory human review could change the threshold result -> `REVIEW_REQUIRED`;
- otherwise unresolved evidence -> `INDETERMINATE`.

## EligibilityAssessment

An assessment is immutable and must bind:

- subject;
- credential definition version;
- exact requirement-set version;
- assessment time from the approved Clock boundary;
- exact evidence snapshot IDs/revisions;
- atomic results;
- aggregate result;
- evaluator/authority attribution;
- source/rule provenance.

A new fact creates a new assessment. Historical assessments are never rewritten to reflect today's rules or evidence.

## Grant boundary

`SATISFIED` means the configured requirements were satisfied at the assessment instant. It does not itself create an authorization.

`REVIEW_REQUIRED` and `INDETERMINATE` are blocking outcomes for automatic grant.

`NOT_SATISFIED` cannot become a grant unless a separately governed discretionary override is permitted by the applicable rule and an attributable authority decision is recorded.
