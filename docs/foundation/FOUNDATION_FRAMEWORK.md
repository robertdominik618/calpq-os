# CALPQ Foundation Framework

Status: `M00 FOUNDATION / NORMATIVE`  
ID: `CALPQ-FND-0001`  
Date: `2026-09-13`

## Purpose

The Foundation Framework turns CALPQ governance into an executable project boundary. It defines how canonical artifacts, decision records, cross-cutting baselines, quality gates and automated guards cooperate before product feature development is allowed.

## Foundation components

The M00 baseline consists of seven primary components:

1. Constitution
2. Book
3. Architecture
4. Apple HIG Policy
5. Human Workflow Guidelines
6. Foundation Framework
7. Test Framework

M00 also requires cross-cutting baselines for security/privacy, accessibility and regulatory-source governance, plus ADR/contract governance and an explicit release gate.

## Canonical state

`foundation/manifest.json` is the machine-readable state record for the current milestone, feature-development gate, technology-stack state, M00 release state, required artifacts and quality-gate expectations.

Human-readable documents explain why the state exists and what each rule means. The manifest must not silently contradict the normative documents.

## State model

During the current M00 phase:

- `foundation_development = AUTHORIZED`
- `feature_development = FROZEN`
- `m00_release_status = BLOCKED`
- `technology_stack.status = NOT_YET_APPROVED`

A transition that relaxes these states is a governed project decision. It must not happen as an incidental code change.

## Enforcement model

The Foundation Framework uses four complementary controls:

- **Documentation control** — normative rules and architecture boundaries are versioned in Git.
- **Manifest control** — required Foundation artifacts and current gate states have one machine-readable source of truth.
- **Review control** — pull requests carry governance and verification checklists.
- **Machine control** — Foundation and M00 state guards reject known violations.

## Decision records and contracts

Material technology, architecture, security/privacy, authoritative-source or regulated-behavior changes require an ADR or explicit amendment of an existing ADR before implementation. Stable boundaries are described by explicit contracts using the project contract template.

## Feature admission rule

A product feature may move from concept to implementation only after M00 is explicitly released and the feature itself has identifiable requirements, architecture impact, contracts, verification strategy and approval where required.

## CALPQ-PRIPOJ

`CALPQ-PRIPOJ` is the intake path for new product ideas. Intake records a concept; it does not bypass governance or automatically authorize code.

## M00 release

M00 is not complete merely because files exist. `M00_RELEASE_GATE.md` defines the release groups and `scripts/m00_release_gate.sh` verifies that the current machine-readable state remains consistent. Until the technology decision, CI evidence and explicit release approval are complete, feature development remains frozen.

## Completion evidence

`CALPQ-FND-0001` is reviewable when all manifest-required artifacts exist, the Foundation Guard and its negative tests pass, the M00 consistency checks pass, the pull request is internally consistent and no unapproved product stack or feature implementation has entered the repository.
