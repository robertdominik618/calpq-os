# CALPQ-M00-RC-0001 — Foundation Release Candidate & Readiness Audit

Status: `RELEASE CANDIDATE AUDIT / BLOCKED`  
Audit date: `2026-09-13`  
Audited branch: `foundation/calpq-fnd-0001`

## Executive conclusion

The CALPQ Foundation is **internally ready for the M00 release decision**, but M00 must **not** be released yet. One critical external repository-governance blocker remains: GitHub reports `main` as unprotected and the repository currently has no rulesets. Until the reviewed CI path is enforced at repository level, Foundation controls can be bypassed by a direct push.

Recommendation: `REJECT M00 RELEASE UNTIL M00-BLK-001 IS CLEARED`.

## Gate matrix

| Gate | Result | Evidence / condition |
|---|---|---|
| G1 Foundation artifacts | PASS | Manifest-driven required artifacts; Constitution, Book, Architecture, HIG, Human Workflow, Foundation Framework and Test Framework present. |
| G2 Cross-cutting baselines | PASS | Security/Privacy, Accessibility and Regulatory Source Governance strengthened to testable normative requirements. |
| G3 Governance mechanics | PASS | ADR governance, contract template, CALPQ-PRIPOJ path and explicit release gate exist. |
| G4 Machine enforcement | PASS | Foundation Guard, M00 state tests, architecture tests and readiness self-tests passed in CI. |
| G5 Technology decision | PASS | ADR-0002 accepted; TypeScript-first bootstrap approved; product feature development remains frozen. |
| G6 Repository governance | BLOCKED | GitHub branch metadata reports `main protected=false`; ruleset collection is empty. |
| G7 Explicit release decision | PENDING | Must happen only after every release blocker is cleared and reviewed. |

## CI evidence

On the audited release-candidate line, Foundation Guard completed successfully and `M00 internal readiness` completed successfully. The separate `M00 repository governance` job failed specifically on `Verify main protection`, matching blocker M00-BLK-001 rather than indicating an internal Foundation defect.

The final audit revision must reproduce the same pattern: Foundation/internal checks green; repository governance blocked until GitHub protection is configured.

## Remediations completed during audit

1. Strengthened Security/Privacy baseline with explicit data minimization, least privilege, secret handling, audit, retention, threat-review and provider-boundary requirements.
2. Strengthened Accessibility baseline with WCAG 2.2 AA target for web and explicit keyboard, assistive-technology, scaling, error and motion criteria.
3. Strengthened Regulatory Source Governance with provenance fields, effective dates and explicit `VERIFIED`, `UNVERIFIED` and `STALE/REVIEW_REQUIRED` states.
4. Added Repository Governance baseline and made protected `main` an M00 release requirement.
5. Pinned Node LTS bootstrap to `24.21.0` and pnpm to `12.3.4`.
6. Added `.npmrc` enforcement and `.gitignore` protection for dependency/build/local-environment artifacts.
7. SHA-pinned `actions/checkout` and disabled persisted checkout credentials.
8. Extended architecture tests to detect toolchain drift and require a pnpm lockfile once dependency declarations are introduced.
9. Added executable internal readiness and repository-governance checks with negative self-tests.
10. Opened GitHub Issue #2 (`M00-BLK-001`) to track the external release blocker.

## Critical blocker

### M00-BLK-001 — Protect `main` and enforce the CI path

Observed state:

- `main`: `protected=false`;
- repository rulesets: none.

Required state before M00 release:

- protect `main` with GitHub branch rules/ruleset;
- require pull-request based changes to `main`;
- require the CALPQ Foundation/architecture CI check before merge;
- disable force pushes to `main`;
- disable deletion of `main`;
- limit administrative bypass to exceptional auditable recovery.

This blocker is external GitHub configuration. It cannot be satisfied by adding another file inside the repository.

## Non-blocking follow-ups

- The first change that introduces package dependencies must generate and commit `pnpm-lock.yaml`; architecture tests already enforce this once dependency sections appear.
- Concrete identity, hosting/deployment, object-storage and AI/OCR providers require later contracts/ADRs before production use.
- When the project becomes multi-maintainer, required approving reviews and CODEOWNERS should become mandatory repository policy.
- Production release will require deeper security, privacy, recovery and operational verification beyond the M00 coding-authorization gate.

## Release decision rule

Do not change `m00_release_status` or `feature_development` while any critical blocker remains. After M00-BLK-001 is resolved, re-run `CALPQ-M00-RC-0001`, verify both internal CI and repository governance, then prepare a separate explicit `M00 FOUNDATION RELEASE — APPROVE / REJECT` decision.
