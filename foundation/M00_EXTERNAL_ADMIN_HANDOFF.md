# CALPQ M00 External Admin Handoff

Status: `WAITING_EXTERNAL_ADMIN_ACTION`

## Current verified state
- M01 architecture: `100%`
- M00 internal readiness: `PASS`
- M00 release: `BLOCKED`
- feature development: `FROZEN`
- feature-development gate: `LOCKED`
- G7 release preflight: `PASS / WAITING_FOR_G6`
- sole blocker: `M00-BLK-001`

## Required external GitHub action
Import and activate `foundation/github-main-ruleset.json` as an active branch ruleset named `CALPQ main protection` for the default branch.

Required contexts:
1. `Enforce M00 Foundation gate`
2. `M00 internal readiness`
3. `M00 repository governance`

The ruleset must also require pull-request based changes, resolved review threads, strict required checks, deletion protection, and non-fast-forward/force-push protection.

## Closure verification
After activation:
1. re-run `M00 Readiness`;
2. require `M00 repository governance = PASS`;
3. close `M00-BLK-001` only after that PASS;
4. run `scripts/m00_release_authorization_check.sh` against real repository state;
5. only then may G7 receive a separate explicit M00 release decision.

## Non-effects
Ruleset activation does not merge PR #1 or PR #3, does not release M00, and does not open feature development. Those remain separate governed transitions.
