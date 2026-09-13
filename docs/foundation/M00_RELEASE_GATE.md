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

Security/privacy, accessibility and regulatory-source governance must have approved Foundation baselines.

### G3 — Governance mechanics

ADR and contract templates must exist. Material decisions must have a defined approval and traceability path.

### G4 — Machine enforcement

Foundation Guard and its negative self-tests must pass in CI.

### G5 — Technology decision

The technology stack must have its own approved ADR. Until then, production feature implementation remains blocked.

### G6 — Explicit release decision

M00 is not released merely because documents exist. An explicit project approval must change the machine-readable release state.

## State rule

While `foundation/m00-release-gate.json` is `BLOCKED`, `feature_development` must remain `FROZEN`. Any attempt to unfreeze feature development before the release gate is approved is a Foundation violation.

## Evidence

The release decision must be represented in Git history and identify the revision whose checks were reviewed. A later feature branch must be able to point to that approved Foundation state.
