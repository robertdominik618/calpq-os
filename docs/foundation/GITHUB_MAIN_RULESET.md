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
4. Select `foundation/github-main-ruleset.json` from a current checkout/download of the approved CALPQ handoff branch.
5. Review that the ruleset targets the default branch and is `Active`.
6. Create the ruleset.
7. Re-run the `M00 Readiness` workflow.

The UI route is intentionally explicit because GitHub settings are an external administration boundary. Do not use an older downloaded JSON file: use the current canonical file from `planning/program-execution-m09-m12` until this governance package is promoted through the normal repository process.

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

The helper requires authenticated GitHub CLI access with repository Administration permission. Before any remote mutation it also proves that:

- it is running inside a git checkout;
- the ruleset blueprint and governance helper files are tracked canonical repository files;
- those handoff files have no staged or unstaged local modifications;
- the local `HEAD` exactly matches the current remote `planning/program-execution-m09-m12` handoff branch head;
- the local blueprint satisfies the CALPQ M00 ruleset policy;
- the authenticated identity has repository Administration permission.

Only after these checks does `--apply` inspect the remote ruleset state. It refuses to overwrite an existing non-compliant same-name ruleset, creates the ruleset only when absent, and verifies the resulting remote state through `scripts/repository_governance_check.sh`.

`--apply` is intentionally explicit. Running the helper without it does not create or modify repository governance.

## Freshness / stale-checkout protection

Repository governance must never be created from an old local clone by accident. The helper therefore resolves the current remote commit for the canonical handoff branch and compares it with the local checkout SHA. A mismatch is a hard failure before the POST request is reachable.

This means the safe operational sequence is:

```bash
git fetch origin
git switch planning/program-execution-m09-m12
git pull --ff-only
bash scripts/apply_github_main_ruleset.sh --check
bash scripts/apply_github_main_ruleset.sh --apply
```

If the branch advances between checkout and execution, the helper stops and requires a fresh fast-forward. It does not silently use a stale payload.

## Idempotency and fail-safe behavior

- a valid existing `CALPQ main protection` ruleset is verified and left unchanged;
- an absent ruleset is reported by `--check` without mutation;
- `--apply` creates one ruleset only when none with the canonical name exists;
- an existing malformed/non-compliant same-name ruleset is never silently replaced;
- insufficient Administration permission is rejected before mutation;
- stale local checkout or locally modified handoff files are rejected before mutation;
- successful creation is not accepted until the repository governance checker observes the required protection and checks.

These behaviors are covered by `tests/github_main_ruleset_handoff_test.sh` using a mocked GitHub CLI; CI never mutates repository settings.

## Current GitHub API compatibility

The helper targets GitHub REST API version `2026-03-10`. The canonical payload uses the documented repository-ruleset endpoint and currently supported branch-ruleset fields, including `~DEFAULT_BRANCH`, pull-request parameters, and strict required status checks. Any future incompatible GitHub API change must be handled as a governed foundation change rather than by weakening the verification path.

## Verification

`M00 repository governance` must pass after the ruleset is active. Closing `M00-BLK-001` requires this passing evidence; the existence of the blueprint or helper script alone does not satisfy the blocker.

After external activation, `M00 Readiness` may be run manually through its `workflow_dispatch` trigger or by the normal push/pull-request path. Only a passing repository-governance job is closure evidence.

After closure evidence exists, run the read-only next-action resolver before any further governance transition:

```bash
bash scripts/post_ruleset_orchestrator.sh
```

It must resolve the next step as `CLOSE_M00_BLOCKER` or, after the blocker has been closed, `M00_RELEASE`. Ruleset activation itself never authorizes M00 release or feature development.
