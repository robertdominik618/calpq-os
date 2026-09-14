# CALPQ M08 — Organization, B2B Compliance & Assignment Guard Baseline

Status: `PLANNING ONLY / BLOCKED`
ID: `CALPQ-M08-PLAN-0001`
Depends on: M02 subject/credential/eligibility spine, M04 governed requirements, M06 continuous status, M07 source/rule lineage where applicable.

## Purpose
Extend individual competence truth into organization, role and work-assignment decisions without treating employment, delegation or document possession as transferable professional authorization.

## Scope
M08 covers:
- Organization and membership context;
- roles and delegations;
- professional credential references;
- AssignmentRequirementProfile;
- B2B Assignment Guard;
- assignment decision evidence;
- organization compliance projections;
- compliance export;
- external reviewer/admin surfaces as later product consumers.

## Identity and role separation
`Subject != Account != Organization != Tenant` remains mandatory.
Membership, employment, role and delegation are distinct from a person's credential and from legal assignability.

Delegation may transfer organizational authority to perform an organizational action, but it does not transfer professional qualification or credential state.

## Assignment requirement profile
Each governed assignment profile must preserve:
- target activity/work type;
- organization/jurisdiction scope;
- applicable credential/requirement references;
- effective/version rules;
- required evidence freshness/assurance;
- role/delegation constraints;
- review/override policy where permitted;
- source/rule provenance.

## Assignment Guard outputs
The guard returns governed outcomes such as:
- `ASSIGNABLE`;
- `ASSIGNABLE_WITH_CONDITIONS`;
- `BLOCKED`;
- `REVIEW_REQUIRED`;
- `INDETERMINATE`.

Each result must carry reason codes, subject/organization context, exact requirement/profile version, evidence/assessment references, evaluation time and source/rule provenance.

## Non-transferability
The following implications are forbidden:
- organization membership -> professional competence;
- delegation -> credential transfer;
- active CredentialArtifact -> assignable;
- Passport display -> assignable;
- role title -> authorization;
- manager approval alone -> requirement satisfaction unless an approved rule explicitly permits it.

## Continuous organization compliance
Organization compliance projections summarize governed subject/assignment states and must remain projections, not independent truth stores. Expired/stale/review-required individual evidence must propagate to affected assignment/compliance views through versioned reevaluation.

## Compliance export
Exports disclose the minimum governed evidence/status needed for the intended purpose. They preserve generation time, scope, source/version references and audit/provenance, and must not imply broader legal assurances than the underlying decisions support.

## Override/review boundary
Any discretionary override must be explicitly permitted by the applicable rule/profile, attributed to an authorized actor/authority and preserved as decision evidence. `INDETERMINATE` or `REVIEW_REQUIRED` may not silently become `ASSIGNABLE`.

## Non-goals
M08 does not own selective external sharing protocols (M09), AI decision authority (M10), or platform runtime/operations (M11).

## Exit criteria
M08 planning is ready when organization/role/delegation, assignment requirements, guard outcomes and compliance projections are all traceable to M01/M02 authority boundaries and cannot transfer or fabricate professional authorization.