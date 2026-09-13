# CALPQ M00 Release Gate

Status: `M00 FOUNDATION / NORMATIVE`  
ID: `CALPQ-GATE-M00-0001`  
Date: `2026-09-13`

## Purpose

This gate defines the conditions that must be satisfied before CALPQ may change product feature development from `FROZEN` to an implementation-enabled state.

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

### G7 — Explicit release decision

M00 is not released merely because documents exist. An explicit project approval must change the machine-readable release state.

## Current state

`ADR-0002` is accepted and the technology bootstrap is authorized. This satisfies only the technology prerequisite. It does not release M00.

`foundation/manifest.json` is the machine-readable source of truth. While `m00_release_status` is `BLOCKED`, `feature_development` must remain `FROZEN` even when the technology stack is `APPROVED`.

## Release evidence

A future M00 release must be represented in Git history, identify the reviewed revision and update the machine-readable state deliberately. Release may not occur as an incidental side effect of a technology or feature commit. Repository protection must be independently observable at the time of release.
