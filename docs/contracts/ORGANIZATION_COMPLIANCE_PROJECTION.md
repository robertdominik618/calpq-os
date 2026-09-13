# CALPQ Organization Compliance Projection

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0006-E`

## Purpose

Define a B2B read model showing whether an organization can safely staff planned work without turning the dashboard itself into a source of legal truth.

## OrganizationComplianceProjection

The projection may summarize:
- organization-level authorizations and registrations;
- assigned statutory/operational/compliance roles;
- delegations and their validity windows;
- workforce credential coverage by ActivityDefinition and assignment type;
- upcoming expirations and renewal risk;
- planned assignments with current guard status;
- uncovered mandatory roles or activities;
- evidence gaps;
- review-required items;
- historical assignment decisions.

## Status separation

The projection MUST distinguish at least:
- organization authorization state;
- person authorization state;
- role/delegation state;
- assignment decision state;
- evidence verification state;
- temporal validity;
- renewal/lifecycle risk.

A global green organization status MUST NOT conceal a blocked assignment or an expired person-level grant.

## Planning views

Permitted planning questions include:
- which planned assignments are currently assignable;
- which assignments will become at risk before their end date;
- which credentials or delegations expire first;
- which activities have no currently qualified coverage;
- which role vacancies block operations;
- which people could become assignable after a specific verified step.

Planning output is advisory unless backed by a canonical AssignmentDecision.

## No authority inheritance

The organization projection MUST NOT treat one subject's credential as an organization-owned credential unless the underlying legal model explicitly defines an organization-level authorization.

## Privacy boundary

B2B compliance views expose only information necessary for organizational compliance decisions. Full source documents, unrelated credentials, medical details or other sensitive evidence remain outside the projection unless explicitly required and authorized.
