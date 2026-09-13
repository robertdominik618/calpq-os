# CALPQ M00 Release Gate

Status: `M00 FOUNDATION / NORMATIVE`  
ID: `CALPQ-GATE-M00-0001`  
Date: `2026-09-13`

## Purpose

This gate defines the conditions that must be satisfied before CALPQ may change product feature development from `FROZEN` to an implementation-enabled state.

## Gate groups

1. Foundation artifacts are present and internally consistent.
2. Security/privacy, accessibility and regulatory-source baselines exist.
3. ADR and contract governance is established.
4. Foundation Guard and its negative self-tests pass in CI.
5. Technology stack has an accepted ADR and bootstrap boundaries are tested.
6. An explicit project decision releases M00.

## Current state

`ADR-0002` is accepted and the technology bootstrap is authorized. This satisfies only the technology prerequisite. It does not release M00.

While `foundation/manifest.json` contains `m00_release_status = BLOCKED`, `feature_development` must remain `FROZEN` even though the technology stack is approved.

## Release evidence

A future M00 release must be represented in Git history, identify the reviewed revision and update the machine-readable state deliberately. Release may not occur as an incidental side effect of a technology or feature commit.
