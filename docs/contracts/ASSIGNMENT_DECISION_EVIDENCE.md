# CALPQ Assignment Decision Evidence

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0006-D`

## Purpose

Define the immutable evidence bundle explaining why an assignment was allowed, conditionally allowed, blocked, sent to review or left indeterminate.

## AssignmentDecision

Required fields:
- decision_id;
- assignment_id and assignment revision;
- organization_subject_id;
- candidate subject IDs and relevant role IDs;
- decision status;
- evaluated_at;
- assignment interval;
- requirement results;
- conditions;
- blockers;
- review reasons;
- missing/indeterminate inputs;
- source/rule/catalog versions;
- authorization, credential, recognition, role and delegation revisions used;
- evidence snapshot references;
- evaluator/version metadata.

## RequirementDecision

Every mandatory assignment requirement produces its own result with:
- requirement identifier;
- applicability result;
- satisfaction result;
- evidence/reference IDs;
- authoritative source reference;
- explanation;
- residual condition if any.

## Immutability

Once persisted for audit, an AssignmentDecision MUST NOT be silently rewritten when:
- evidence is later verified or rejected;
- a credential expires;
- a delegation is revoked;
- a role changes;
- legislation or catalog mapping changes.

A new evaluation creates a new decision linked to the prior decision.

## Reproducibility

A historical decision must remain reproducible from the exact revisions and source versions recorded in the decision bundle.

## No concealment

A summary UI may simplify wording but MUST NOT hide blockers, conditions, stale inputs or review-required states present in the canonical AssignmentDecision.
