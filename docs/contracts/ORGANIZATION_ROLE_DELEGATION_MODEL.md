# CALPQ Organization Role & Delegation Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0006-A`

## Purpose

Define how a person or organization participates in another organization, what organizational role is held, and what authority may be delegated without confusing organizational authority with professional qualification.

## Core objects

### OrganizationMembership
Represents a subject-to-organization relationship.

Required fields:
- membership_id;
- organization_subject_id;
- member_subject_id;
- relationship_kind;
- effective_from / effective_until;
- status;
- provenance.

A membership MUST NOT imply any professional authorization.

### OrganizationRoleAssignment
Binds a member to a role definition within one organization.

Required fields:
- role_assignment_id;
- organization_subject_id;
- subject_id;
- role_definition_id;
- scope;
- effective_from / effective_until;
- status;
- provenance;
- verification state.

Role categories may include statutory, operational, compliance, employment, contractor or custom organization-defined roles, but CALPQ Core MUST NOT hard-code business-specific role names as legal truth.

### DelegationGrant
Represents authority delegated from one authorized actor to another.

Required fields:
- delegation_id;
- delegator_subject_id;
- delegate_subject_id;
- organization_subject_id where applicable;
- authority_scope;
- jurisdiction/scope constraints;
- effective_from / effective_until;
- revocation state;
- provenance;
- maximum delegation depth where delegation chains are permitted.

## Non-transfer rules

1. A `DelegationGrant` transfers only the explicitly delegated organizational authority.
2. It MUST NOT transfer a professional credential, qualification, authorization grant, eligibility result or evidence owned by the delegator.
3. Employment, membership, ownership or statutory-office status MUST NOT make another person's credential usable by the organization unless an explicit rule allows organizational reliance on a qualified person.
4. Subdelegation is forbidden unless the source authority explicitly permits it.
5. Expired, revoked, suspended or out-of-scope delegation is unusable.

## Delegation evaluation

A delegation is usable only when all applicable conditions hold:
- delegator had delegable authority at the relevant time;
- delegate is the intended subject;
- requested action is inside authority_scope;
- jurisdiction and organization match;
- effective interval covers the action time;
- delegation is not revoked;
- delegation-chain depth is allowed;
- no source rule requires direct/non-delegable action.

Unknown or ambiguous authority MUST resolve to `REVIEW_REQUIRED` or `INDETERMINATE`, never implicit permission.

## Audit

Every decision relying on role or delegation must retain the exact membership/role/delegation revisions and source provenance used at decision time.
