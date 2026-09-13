# CALPQ Continuous Compliance Status Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0007-C`

## Purpose

Define the current compliance projection after a change has been evaluated without collapsing legal status, uncertainty, future risk, and workflow state into one badge.

## ComplianceStatus

At minimum:
- COMPLIANT;
- COMPLIANT_WITH_CONDITIONS;
- AT_RISK;
- NON_COMPLIANT;
- REVIEW_REQUIRED;
- INDETERMINATE;
- NOT_APPLICABLE.

## Meaning

`COMPLIANT` means all currently applicable deterministic conditions are satisfied for the evaluated scope and time.

`COMPLIANT_WITH_CONDITIONS` means use is currently allowed only while explicit conditions remain satisfied.

`AT_RISK` means currently valid/compliant but a known future change, deadline, expiry, rule effective date, or unresolved dependency can make it non-compliant.

`NON_COMPLIANT` means at least one currently applicable blocking condition is deterministically unsatisfied.

`REVIEW_REQUIRED` means authoritative human review is required before a safe conclusion can be made.

`INDETERMINATE` means required facts or verified rules are unavailable or contradictory.

## Scope

Every compliance projection must state the exact scope:
- subject or organization;
- activity/profession/assignment;
- jurisdiction;
- time/evaluation instant;
- rule/catalog versions;
- relevant credential/authorization scope.

A broad organization-level green state must never imply that every assignment is compliant.

## Future impact

Future effective changes must be represented separately from present compliance. A rule effective next month may create `AT_RISK` or an upcoming action, but must not retroactively make today's valid assignment non-compliant.

## Projection-only rule

Continuous compliance status is a read/evaluation projection. It does not itself revoke, suspend, grant, renew, or recognize a legal authorization.
