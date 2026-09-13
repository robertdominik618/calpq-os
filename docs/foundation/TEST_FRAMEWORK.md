# CALPQ Test Framework

Status: `M00 FOUNDATION / NORMATIVE`  
ID: `CALPQ-TEST-0001`

## Goal

Every production behavior must be testable before implementation and every material boundary must have an explicit verification strategy.

## Required test classes

1. **Invariant tests** — Core rules and impossible states.
2. **Use-case tests** — application orchestration and expected outcomes.
3. **Contract tests** — ports/adapters and external schemas.
4. **Integration tests** — cooperation of approved components.
5. **Architecture tests** — dependency direction, UI/Core separation, plugin boundaries.
6. **Migration tests** — backward/forward compatibility where persistent data changes.
7. **Security/privacy tests** — authorization, data minimization, unsafe disclosure and audit behavior.
8. **Accessibility tests** — semantics, navigation and non-color-only meaning where applicable.
9. **Regulatory/source tests** — source identity, effective dates, versioning and stale-rule detection where applicable.
10. **Regression tests** — every fixed defect gets a durable reproducer when technically feasible.

## Test evidence

A release-relevant test result must identify the tested revision and be reproducible in CI or by a documented deterministic procedure.

## Stack neutrality

M00 defines test categories and gates only. Test runners, assertion libraries, coverage tools and framework-specific architecture tests are selected only after the technology stack ADR is approved.
