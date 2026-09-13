# CALPQ Repository Governance

Status: `M00 FOUNDATION / NORMATIVE`  
ID: `CALPQ-GOV-REPO-0001`  
Date: `2026-09-13`

## Purpose

GitHub is the CALPQ source of truth. Repository controls must therefore make the reviewed and tested path the normal path to `main` rather than relying only on contributor discipline.

## Required `main` policy before M00 release

1. `main` is protected by a branch ruleset or equivalent branch protection.
2. Changes reach `main` through pull requests; direct pushes are not an accepted normal path.
3. The CALPQ Foundation/architecture CI check is required before merge.
4. Force pushes to `main` are disabled.
5. Branch deletion for `main` is disabled.
6. Required checks must run on the exact revision being merged.
7. Administrative bypass is limited to emergency recovery and must be auditable.

## Review policy

For the current single-owner Foundation stage, a separate human reviewer is recommended but not a hard M00 prerequisite. When additional maintainers are introduced, required approving reviews and CODEOWNERS must be activated before multi-maintainer production development.

## Status verification

Repository protection is external GitHub state, not repository file content. It must be re-verified immediately before an M00 release decision. A green workflow alone is insufficient if `main` can bypass that workflow.
