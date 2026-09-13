# CALPQ GitHub Main Ruleset

Status: `M00 FOUNDATION / REQUIRED EXTERNAL ENFORCEMENT`  
ID: `CALPQ-GH-RULESET-0001`  
Date: `2026-09-13`

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

## Import procedure

GitHub supports importing repository rulesets from JSON. In the repository UI:

1. Open `Settings`.
2. Under `Code and automation`, open `Rules` -> `Rulesets`.
3. Open `New ruleset` -> `Import a ruleset`.
4. Select `foundation/github-main-ruleset.json` from a local checkout/download.
5. Review that the ruleset targets the default branch and is `Active`.
6. Create the ruleset.
7. Re-run the `M00 Readiness` workflow.

## Verification

`M00 repository governance` must pass after the ruleset is active. Closing `M00-BLK-001` requires this passing evidence; the existence of this blueprint file alone does not satisfy the blocker.
