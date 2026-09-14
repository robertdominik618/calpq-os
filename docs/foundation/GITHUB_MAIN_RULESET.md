# CALPQ GitHub Main Ruleset

Status: `M00 FOUNDATION / REQUIRED EXTERNAL ENFORCEMENT`  
ID: `CALPQ-GH-RULESET-0001`  
Date: `2026-09-14`

## Purpose

This document defines the repository-level protection that must exist before M00 may be released. The importable configuration is stored in `foundation/github-main-ruleset.json`.

## Ruleset identity

- Name: `CALPQ main protection`
- Target: branch
- Target ref: GitHub default branch (`main`)
- Enforcement: active
- Bypass actors: none by default

## Required rules

1. Prevent deletion of the target branch.
2. Block non-fast-forward / force pushes.
3. Require changes through a pull request.
4. Require all review conversations to be resolved.
5. Require the following status checks:
   - `Enforce M00 Foundation gate`
   - `M00 internal readiness`
   - `M00 repository governance`
6. Require the branch to be up to date before merging (strict required status checks).

## Review count

The initial ruleset requires zero approving reviews because CALPQ currently has a single maintainer. This does not bypass the pull-request requirement: changes still have to arrive through a PR and satisfy required CI. When another independent maintainer is available, the review count should be raised through a governed repository-policy change.

## External administration boundary

Creating or changing a repository ruleset requires a GitHub identity with repository `Administration` write permission. CALPQ automation that lacks that permission may verify the remote state but must not falsely claim that the ruleset was installed.

The repository contains two supported handoff paths. Both use the same normative `foundation/github-main-ruleset.json` blueprint and both must be followed by `M00 repository governance = PASS` before `M00-BLK-001` may be closed.

## Import procedure — GitHub UI

1. Open `Settings`.
2. Under `Code and automation`, open `Rules` -> `Rulesets`.
3. Open `New ruleset` -> `Import a ruleset`.
4. Select `foundation/github-main-ruleset.json` from a local checkout/download.
5. Review that the ruleset targets the default branch and is `Active`.
6. Create the ruleset.
7. Re-run the `M00 Readiness` workflow.

## Admin handoff — GitHub CLI

The canonical helper is `scripts/apply_github_main_ruleset.sh`.

Non-mutating validation:

```bash
bash scripts/apply_github_main_ruleset.sh --check
```

Explicit creation when the ruleset is absent:

```bash
bash scripts/apply_github_main_ruleset.sh --apply
```

The helper requires authenticated GitHub CLI access with repository Administration permission. It validates the local blueprint before any mutation, refuses to overwrite an existing non-compliant same-name ruleset, creates the ruleset only when absent, and verifies the resulting remote state through `scripts/repository_governance_check.sh`.

`--apply` is intentionally explicit. Running the helper without it does not create or modify repository governance.

## Idempotency and fail-safe behavior

- a valid existing `CALPQ main protection` ruleset is verified and left unchanged;
- an absent ruleset is reported by `--check` without mutation;
- `--apply` creates one ruleset only when none with the canonical name exists;
- an existing malformed/non-compliant same-name ruleset is never silently replaced;
- insufficient Administration permission is rejected before mutation;
- successful creation is not accepted until the repository governance checker observes the required protection and checks.

These behaviors are covered by `tests/github_main_ruleset_handoff_test.sh` using a mocked GitHub CLI; CI never mutates repository settings.

## Verification

`M00 repository governance` must pass after the ruleset is active. Closing `M00-BLK-001` requires this passing evidence; the existence of the blueprint or helper script alone does not satisfy the blocker.

After external activation, `M00 Readiness` may be run manually through its `workflow_dispatch` trigger or by the normal push/pull-request path. Only a passing repository-governance job is closure evidence.
