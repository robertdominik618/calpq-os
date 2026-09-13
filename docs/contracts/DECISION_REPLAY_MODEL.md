# CALPQ Decision Replay Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0014-C`

## Purpose
Reconstruct and explain why CALPQ reached a material historical decision without mutating current state.

## Replay modes
- `AS_WAS`: use the exact historical rule/source/evidence versions and evaluation instant recorded for the original decision.
- `AS_IS`: evaluate the same subject/context against currently applicable rules and current admissible evidence.

The two modes MUST NOT be conflated.

## Replay input
A replay request identifies:
- original decision/audit entry;
- subject/organization and target context;
- evaluation instant;
- exact rule/source/contract versions for AS_WAS;
- exact evidence snapshot;
- actor/process and decision metadata;
- requested replay mode.

## Replay outcome
`MATCH`, `EXPLAINED_DIVERGENCE`, `INPUT_MISSING`, `VERSION_UNAVAILABLE`, `REVIEW_REQUIRED`, `INDETERMINATE`.

`MATCH` means the deterministic replay reproduces the recorded semantic outcome from the same governed inputs. It does not independently prove that the original source material was truthful.

`EXPLAINED_DIVERGENCE` requires an explicit reason such as corrected evidence, changed implementation contract, unavailable historical dependency, or a detected prior defect.

## Safety boundaries
- replay is read-only;
- replay MUST NOT emit an AuthorizationGrant, mutate an aggregate or rewrite the original decision;
- current rules MUST NOT be substituted into AS_WAS replay;
- missing historical inputs fail closed to `INPUT_MISSING`, `VERSION_UNAVAILABLE`, `REVIEW_REQUIRED` or `INDETERMINATE`;
- AI may explain a replay result but cannot determine the replay truth state.

## Historical defect handling
If replay reveals a prior defect, CALPQ creates a new review/reevaluation/audit record. The original historical record remains preserved and linked to the corrective action.