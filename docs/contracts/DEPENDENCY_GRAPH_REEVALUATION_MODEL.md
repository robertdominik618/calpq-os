# CALPQ Dependency Graph & Re-evaluation Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0007-B`

## Purpose

Define the dependency graph that allows CALPQ to re-evaluate only objects actually affected by a change.

## Dependency graph

Nodes may include:
- regulatory source version;
- rule version;
- RequirementSet version;
- CredentialDefinition version;
- QualificationPath version;
- EquivalenceRule / RecognitionRoute;
- evidence record;
- EligibilityAssessment;
- AuthorizationGrant;
- ProfessionalPassport projection;
- OrganizationRoleAssignment / DelegationGrant;
- AssignmentProfile;
- AssignmentDecision;
- OrganizationComplianceProjection.

Edges must be typed and directional. At minimum:
- DERIVED_FROM;
- EVALUATED_AGAINST;
- SATISFIES;
- RECOGNIZED_BY;
- PROJECTS;
- DEPENDS_ON;
- SUPERSEDES;
- APPLIES_TO.

## Selective invalidation

A change MUST NOT trigger a global rebuild by default.

Re-evaluation scope is discovered by traversing only dependency edges that can materially affect the target result.

Example:

`RuleVersion → RequirementSet → EligibilityAssessment → Authorization/Passport/AssignmentDecision`

A changed rule that does not participate in a subject's evaluated requirement path must not invalidate that subject's unrelated passport cards.

## Re-evaluation plan

Each impact traversal produces a `ReevaluationPlan` containing:
- triggering ChangeEvent;
- affected object IDs;
- dependency paths explaining inclusion;
- evaluation order;
- deduplication key;
- required rule/source versions;
- expected prior revisions where mutation is allowed;
- review boundaries.

## Determinism and idempotency

The same ChangeEvent plus the same dependency graph snapshot must produce the same target set and evaluation order.

Repeated processing must not duplicate alerts, new decisions, or state changes.

## Cycle rule

Dependency cycles must be detected explicitly. A cycle may not be resolved by arbitrary traversal order; it must produce a bounded deterministic handling rule or `REVIEW_REQUIRED`.
