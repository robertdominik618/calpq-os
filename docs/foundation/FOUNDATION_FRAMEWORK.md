# CALPQ Foundation Framework

Status: `M00 FOUNDATION / NORMATIVE`  
ID: `CALPQ-FND-0001`  
Date: `2026-09-13`

## Purpose

The Foundation Framework turns CALPQ governance into an executable project boundary. It defines how canonical artifacts, decision records, quality gates and automated guards cooperate before product feature development is allowed.

## Foundation components

The M00 baseline consists of seven primary components:

1. Constitution
2. Book
3. Architecture
4. Apple HIG Policy
5. Human Workflow Guidelines
6. Foundation Framework
7. Test Framework

Supporting governance artifacts include ADRs, the machine-readable Foundation manifest, pull-request controls and automated Foundation Guard checks.

## Canonical state

`foundation/manifest.json` is the machine-readable state record for the current milestone, feature-development gate, technology-stack state, required artifacts and quality-gate expectations.

Human-readable documents explain why the state exists and what each rule means. The manifest must not silently contradict the normative documents.

## State model

During M00:

- `foundation_development = AUTHORIZED`
- `feature_development = FROZEN`
- `technology_stack.status = NOT_YET_APPROVED`

A transition that relaxes these states is a governed project decision. It must not happen as an incidental code change.

## Enforcement model

The Foundation Framework uses three complementary controls:

- **Documentation control** — normative rules and architecture boundaries are versioned in Git.
- **Review control** — pull requests carry governance and verification checklists.
- **Machine control** — `scripts/foundation_guard.sh` rejects known violations while M00 freeze is active.

## Decision records

Material technology, architecture, security/privacy, authoritative-source or regulated-behavior changes require an ADR or explicit amendment of an existing ADR before implementation.

## Feature admission rule

A product feature may move from concept to implementation only after the applicable Foundation gates are released and the feature itself has identifiable requirements, architecture impact, contracts, verification strategy and approval where required.

## CALPQ-PRIPOJ

`CALPQ-PRIPOJ` is the intake path for new product ideas. Intake records a concept; it does not bypass governance or automatically authorize code.

## Completion evidence

`CALPQ-FND-0001` is considered reviewable when all required artifacts exist, the Foundation Guard passes, its negative self-tests prove enforcement, the pull request is internally consistent and no unapproved product stack or feature implementation has entered the repository.
