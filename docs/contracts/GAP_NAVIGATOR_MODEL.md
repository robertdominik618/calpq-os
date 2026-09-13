# CALPQ Gap Navigator Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0005-C`

## Purpose

Determine what remains between a subject's current verified state and a selected target activity, profession, credential or authorization.

## Inputs

Gap Navigator consumes only versioned projections/references:
- SubjectProfile snapshot;
- target Activity/Profession/Credential/Authorization definition;
- QualificationPath version;
- RequirementSet version;
- applicable EquivalenceRule/RecognitionDecision;
- jurisdiction and evaluation instant;
- evidence snapshot IDs.

## Gap item result

Each requirement/step resolves to one of:
- ALREADY_SATISFIED;
- ACTION_REQUIRED;
- RECOGNITION_POSSIBLE;
- INFORMATION_MISSING;
- REVIEW_REQUIRED;
- NOT_APPLICABLE.

Each gap item MUST carry `why`, source/provenance, applicable rule version, and any dependency on another unresolved step.

## Residual requirement rule

Partial equivalence or recognition may reduce requirements but MUST preserve every residual obligation explicitly. CALPQ must never turn partial recognition into a false complete-path result.

## Path comparison

Multiple admissible paths may be compared by:
- mandatory step count;
- estimated elapsed time;
- expected direct cost;
- external dependencies;
- uncertainty/review burden.

Optimization is advisory only. It MUST NOT remove legal or authoritative requirements.

## Re-evaluation

Gap results are derived snapshots. A new rule/catalog version, new evidence, recognition decision or changed target creates a new evaluation; historical results remain reproducible.
