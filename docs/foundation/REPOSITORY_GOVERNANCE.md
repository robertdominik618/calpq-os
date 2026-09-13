# CALPQ Repository Governance

Status: `M00 FOUNDATION / NORMATIVE`  
ID: `CALPQ-GOV-REPO-0001`  
Date: `2026-09-13`

## Purpose

GitHub is the CALPQ source of truth. Repository controls must therefore make the reviewed and tested path the normal path to `main` rather than relying only on contributor discipline.

## Required `main` policy before M00 release

1. `main` is protected by the active repository ruleset named `CALPQ main protection` or an explicitly approved equivalent.
2. Changes reach `main` through pull requests; direct pushes are not an accepted normal path.
3. The following status checks are required before merge:
   - `Enforce M00 Foundation gate`
   - `M00 internal readiness`
   - `M00 repository governance`
4. Required status checks use strict/up-to-date mode.
5. Force pushes to `main` are disabled.
6. Branch deletion for `main` is disabled.
7. Pull-request review conversations must be resolved before merge.
8. Administrative bypass is disabled by default; any future bypass mechanism requires a governed change and auditable emergency-recovery justification.

## Canonical implementation blueprint

The importable GitHub ruleset is `foundation/github-main-ruleset.json`. Human instructions and verification expectations are in `docs/foundation/GITHUB_MAIN_RULESET.md`.

The blueprint initially requires zero approving reviews because the repository has one maintainer. This is not a direct-push bypass: the PR requirement and all required CI checks still apply. The approval count must be revisited when independent maintainers join.

## Status verification

Repository protection is external GitHub state, not repository file content. `scripts/repository_governance_check.sh` verifies both branch protection and the active ruleset structure/status checks through GitHub APIs. It must pass immediately before an M00 release decision.

A green internal Foundation workflow alone is insufficient if `main` can bypass that workflow.
