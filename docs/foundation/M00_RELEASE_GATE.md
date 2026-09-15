# CALPQ M00 Release Gate

Status: `M00 FOUNDATION / NORMATIVE`  
ID: `CALPQ-GATE-M00-0001`  
Date: `2026-09-14`

## Purpose

This gate defines the conditions that must be satisfied before CALPQ may release M00 and, separately, before product feature development may ever change from `FROZEN` to an implementation-enabled state.

M00 release and feature-development admission are intentionally separate governance transitions.

## Gate groups

### G1 — Foundation artifacts

The Constitution, Book, Architecture, Apple HIG Policy, Human Workflow Guidelines, Foundation Framework and Test Framework must exist and be internally consistent.

### G2 — Cross-cutting baselines

Security/privacy, accessibility and regulatory-source governance must have normative Foundation baselines with testable downstream obligations.

### G3 — Governance mechanics

ADR and contract templates must exist. Material decisions must have a defined approval and traceability path.

### G4 — Machine enforcement

Foundation Guard, M00 state checks, architecture boundary checks and their negative self-tests must pass in CI.

### G5 — Technology decision

The technology stack must have an accepted ADR and a reproducible bootstrap baseline. Technology approval alone does not release product feature development.

### G6 — Repository governance

The default branch `main` must be protected by repository rules. Direct bypass of required review/CI is incompatible with M00 release. The target policy is defined in `docs/foundation/REPOSITORY_GOVERNANCE.md`.

`M00-BLK-001` may be closed only after repository governance is externally observable and the repository-governance check passes.

### G7 — Explicit release decision

M00 is not released merely because documents exist or G1-G6 pass. An explicit project approval must deliberately change the machine-readable M00 release state.

The approved M00 release transition is:

`m00_release_status: BLOCKED -> RELEASED`

while:

`feature_development: FROZEN -> FROZEN`

Feature development therefore remains frozen after M00 release until a separate governed feature-development gate is approved.

## Release authorization

`scripts/m00_release_authorization_check.sh` must pass against real GitHub state before an explicit release decision is executed. It verifies at least:

1. M00 starts from `BLOCKED`;
2. feature development is still `FROZEN`;
3. the technology stack and ADR-0002 remain approved;
4. internal M00 readiness passes;
5. `CALPQ main protection` is active and valid;
6. `main` is protected;
7. `M00-BLK-001` is closed after repository-governance PASS.

## Guarded release transaction

`scripts/m00_release_transition.sh` is the canonical machine-assisted M00 release transaction. It requires:

- `CALPQ_M00_RELEASE_APPROVAL=APPROVE_CALPQ_M00_RELEASE`;
- a non-empty `CALPQ_M00_APPROVED_BY` identity;
- a resolvable audited revision;
- successful release authorization against repository governance and blocker state.

The transaction updates the manifest, explicit release-decision record and release preflight together. It validates the generated state before replacement and restores the previous files if the post-transition release gate fails.

The transaction must never authorize feature development. Its postcondition is M00 `RELEASED` with feature development still `FROZEN`, and the next governed boundary is `FEATURE_DEVELOPMENT_GATE`.

## Current state

`ADR-0002` is accepted and the technology bootstrap is authorized. This satisfies only the technology prerequisite. It does not release M00.

`foundation/manifest.json` is the machine-readable source of truth. While `m00_release_status` is `BLOCKED`, `feature_development` must remain `FROZEN` even when the technology stack is `APPROVED`.

## Release evidence

An M00 release must be represented in Git history, identify the reviewed revision, record the approving identity and timestamp, update the machine-readable release state deliberately, and pass the release-state consistency gate. Release may not occur as an incidental side effect of a technology or feature commit. Repository protection must be independently observable at the time of release.

Opening feature development requires a later, independent governance decision and may not be inferred from M00 release.
