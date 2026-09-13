# CALPQ Next Best Action Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0005-D`

## Purpose

Rank the next useful actions after gap analysis without converting recommendations into authoritative decisions.

## Action classes

Possible actions include:
- PROVIDE_MISSING_INFORMATION;
- UPLOAD_EVIDENCE;
- REQUEST_VERIFICATION;
- REQUEST_RECOGNITION;
- COMPLETE_TRAINING;
- COMPLETE_EXAM;
- COMPLETE_PRACTICE_PERIOD;
- OBTAIN_MEDICAL_OR_OTHER_CLEARANCE;
- APPLY_FOR_CREDENTIAL;
- APPLY_FOR_AUTHORIZATION;
- RENEW_OR_REVALIDATE;
- HUMAN_REVIEW;
- WAIT_UNTIL_ELIGIBLE_DATE.

## Ranking dimensions

Ranking may consider:
- prerequisite order;
- blocking impact;
- deadline/expiry proximity;
- path criticality;
- user effort;
- time/cost estimates;
- confidence/uncertainty;
- whether the action unlocks multiple targets.

## Hard constraints

A recommendation MUST NOT:
- bypass a mandatory prerequisite;
- claim legal sufficiency where the underlying assessment is indeterminate;
- replace an authority decision;
- optimize away a required human review;
- hide a less convenient but mandatory action.

## Explainability

Every ranked action must be explainable with:
- what it unlocks;
- what requirement it addresses;
- why it is ranked now;
- what source/rule supports it;
- what remains after completion.

AI may help phrase or summarize recommendations but may not alter deterministic ranking inputs or authoritative applicability.
