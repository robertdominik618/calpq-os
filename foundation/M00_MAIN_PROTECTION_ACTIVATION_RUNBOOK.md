# CALPQ M00 Main Protection Activation Runbook

Status: `M00 GOVERNANCE RUNBOOK / NO RELEASE AUTHORIZATION`

## Objective
Activate the prepared `CALPQ main protection` ruleset for the default branch and then verify the repository-governance gate.

## Source of truth
Use `foundation/github-main-ruleset.json` as the canonical configuration.

Required controls:
- target the default branch (`main`);
- require pull-request based changes;
- block branch deletion;
- block non-fast-forward / force-push updates;
- require review-thread resolution;
- require strict status checks before merge.

Required status contexts:
1. `Enforce M00 Foundation gate`
2. `M00 internal readiness`
3. `M00 repository governance`

## Manual GitHub activation
Repository → Settings → Rules → Rulesets → New ruleset → New branch ruleset.

Create `CALPQ main protection`, set Enforcement to Active, target the default branch, and reproduce the controls from `foundation/github-main-ruleset.json` exactly.

## Verification after activation
Do not change M00 release state yet.

1. Confirm the repository rulesets endpoint returns an active ruleset for the default branch.
2. Re-run M00 Readiness.
3. Require `M00 internal readiness` = PASS.
4. Require `M00 repository governance` = PASS.
5. Confirm the three required CI contexts are enforced.
6. Only then may blocker `M00-BLK-001` be closed.
7. M00 release decision remains a separate explicit step.
8. PR #1 and PR #3 remain separate merge decisions.

## Current boundary
Until verification succeeds:
- `m00_release_status` remains `BLOCKED`;
- `feature_development` remains `FROZEN`;
- no product implementation is authorized;
- architecture readiness does not override repository governance.
