# CALPQ M04 Slice 07 — Gap Navigator Evaluation

Status: `IMPLEMENTATION IN PROGRESS / AUTHORIZED`  
ID: `CALPQ-M04-S07-IMPL-0001`  
Tracking issue: #96

## Reviewed lineage
- M04 admission merge: `d1251424127904a8a1ac0b8ad28cee91558408a5`.
- Slice 06 reviewed/merged/post-merge-verified commit: `3ccc09f8421faa6482506b00320e3c6fd43cd910`.
- User authorization: `SCHVALUJI MERGE PR #95 A POKRAČOVÁNÍ NA M04 SLICE 07`.
- Initial S07 Core commit: `61234fe3b363a72e8c196dfe0831e0df2fc74e74`.

## Objective
Implement Gap Navigator as a deterministic, immutable derived projection over exact governed path/catalog versions and already-computed authoritative inputs. S07 explains what remains; it does not become another evidence-verification, eligibility, recognition, authorization or recommendation authority.

## Owned capability
### GapNavigatorEvaluation
- semantic `GapEvaluationId`;
- exact subject, QualificationPath identity/version, jurisdiction, effective date and evaluation instant;
- exact path `CatalogProvenanceBinding`;
- exact FV11 `EligibilityAssessment` selection by RequirementSet id/version;
- controlled six-state gap vocabulary: `ALREADY_SATISFIED`, `ACTION_REQUIRED`, `RECOGNITION_POSSIBLE`, `INFORMATION_MISSING`, `REVIEW_REQUIRED`, `NOT_APPLICABLE`;
- immutable step and requirement items carrying why/reason codes, source IDs, evidence IDs, rule/version references and unresolved-prerequisite dependencies;
- residual-requirement preservation from S06 partial equivalence/recognition;
- deterministic derived metrics and completion state;
- historical evaluations remain independent snapshots.

### Authority separation
For a `SATISFY_REQUIREMENT_SET` step, S07 consumes the existing FV11 overall `EligibilityAssessment.outcome`. Requirement-level S06 effects may explain a changed derived requirement state, but S07 does not silently recompute or overwrite the FV11 step outcome. When such inputs indicate that a fresh eligibility calculation is needed, S07 records `GAP.ELIGIBILITY_REEVALUATION_REQUIRED` instead.

### Recognition/equivalence consumption
- only explicit governed S06 rules/routes/decisions supplied to the evaluation are considered;
- recognition route by itself produces only `RECOGNITION_POSSIBLE`;
- authoritative recognition decision may satisfy an appropriate path step only within exact subject/jurisdiction/date/target scope;
- full governed substitution/exemption can mark a requirement item satisfied;
- partial substitution/credit always keeps explicit residual requirements and therefore cannot create a false complete path;
- ambiguous multiple applicable rules/decisions fail closed to review.

### Dependencies and alternatives
- unresolved prerequisites are explicit on each dependent gap item;
- an already-satisfied prerequisite is not returned as a required action;
- when one member of a governed alternative group is already satisfied, unsatisfied siblings may become `NOT_APPLICABLE`;
- no mandatory prerequisite is removed for convenience.

### Path comparison
`GapPathComparison` exposes normalized deterministic metrics only. It is explicitly `advisoryOnly`, has `selectedPathId = null`, and does not choose a lowest-cost, shortest or otherwise preferred path. Downstream recommendation logic remains outside S07.

## Mandatory invariants
1. Exact RequirementSet version binding is required.
2. Wrong subject, path version, jurisdiction/date or S06 scope fails closed.
3. Missing eligibility information means `INFORMATION_MISSING`, not false failure.
4. FV11 `REVIEW_REQUIRED` remains review required.
5. Recognition route alone never satisfies a requirement/path.
6. Partial recognition/equivalence preserves all residual obligations.
7. Gap evaluation never invokes `EligibilityAssessment.evaluate`.
8. Gap evaluation never creates or verifies evidence/source state.
9. Gap evaluation never creates AuthorizationGrant or provider/UI truth.
10. New evidence/rules/catalog versions create new snapshots instead of mutating historical evaluations.
11. AI cannot change deterministic gap inputs or outputs.
12. Path comparison is advisory and never removes legal/mandatory obligations.

## Explicit non-goals
- no FV11 eligibility recomputation;
- no evidence verification or verification-state promotion;
- no new recognition decision authority;
- no Next Best Action ranking/selection;
- no lifecycle/renewal scheduling;
- no AuthorizationGrant;
- no provider synchronization;
- no UI truth ownership;
- no ambient time or randomness.

## Verification requirement
Completion requires the dedicated 48-scenario runtime matrix, strict compile proof, reviewed-S06 ancestry proof, S01-S06/FV03/FV11 regressions, M04 admission/readiness/architecture guards, dedicated CI and a fully green final PR head.

Any S07 PR remains OPEN and UNMERGED until a fresh explicit merge approval is supplied.
