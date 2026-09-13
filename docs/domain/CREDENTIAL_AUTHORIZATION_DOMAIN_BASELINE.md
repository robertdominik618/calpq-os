# CALPQ-M01-PREP-0003 — Credential / Authorization Core Domain Baseline

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`  
Date: `2026-09-13`  
Depends on: `CALPQ-M01-PREP-0001`, `CALPQ-M01-PREP-0002`

## Purpose

Define the first reusable CALPQ domain vertical without introducing product source code while M00 remains blocked.

The central invariant is:

**A document, credential artifact or cryptographically valid attestation is not the same thing as a legal/operational authorization.**

CALPQ therefore separates evidence, requirements, eligibility and the grant itself.

## Core domain objects

### CredentialDefinition

Describes a reusable catalog definition of a credential, qualification, licence, permit, certificate or authorization type.

Minimum fields:

- `credential_definition_id`;
- stable code and display name;
- jurisdiction and competent authority domain;
- subject kind;
- applicable activity/profession/resource scope;
- current `requirement_set_id` and version;
- lifecycle policy reference;
- renewal policy reference;
- external interoperability mappings, if any.

A `CredentialDefinition` is catalog metadata. It does not prove that a particular subject currently holds the right.

### CredentialArtifact

Represents a document, digital credential, certificate, card, registry extract, wallet attestation or other externally representable artifact.

Minimum fields:

- `credential_artifact_id`;
- artifact type/format;
- issuer/authority identity reference;
- subject reference when present;
- issuance/effective/expiry metadata when present;
- verification status;
- provenance/evidence references;
- external identifier/hash/reference.

An artifact may support an assessment or grant. It never becomes an `AuthorizationGrant` merely because it is present, signed or cryptographically valid.

### RequirementSet

Defines the exact conditions that must be evaluated for a credential/authorization decision at a specific ruleset version.

A requirement set is immutable after activation. Changes create a new version with independent effective dates.

### EligibilityAssessment

An immutable point-in-time assessment of a subject against one exact `RequirementSet` version using one exact evidence snapshot.

Minimum fields:

- `eligibility_assessment_id`;
- subject and credential definition references;
- requirement-set ID/version;
- assessment instant;
- evidence snapshot references;
- per-requirement results;
- aggregate result using the Core result model;
- evaluator/authority attribution;
- rule/source provenance.

A later assessment never rewrites the historical assessment.

### AuthorizationGrant

The authoritative domain record that a subject was granted a defined right/authorization for a defined scope.

Minimum fields:

- `authorization_grant_id`;
- subject reference;
- credential definition reference/version;
- granting authority reference;
- grant decision reference;
- eligibility assessment reference or explicit authority-decision basis;
- scope/jurisdiction;
- validity window;
- administrative lifecycle state;
- current revision;
- provenance/audit metadata.

## Non-equivalence rules

The following implications are forbidden:

- artifact exists -> authorization active;
- artifact signature valid -> legal eligibility satisfied;
- OCR extraction succeeded -> evidence verified;
- eligibility `SATISFIED` -> grant automatically exists;
- grant exists -> currently effective;
- expiry date elapsed -> stored aggregate must be mutated by a background cron merely to become expired.

## Authority boundary

An `AuthorizationGrant` may be created only through an explicit grant command/decision path and must cite the legal/rule/authority basis that permits the grant.

`INDETERMINATE` and `REVIEW_REQUIRED` assessments can never silently become grants.

A `NOT_SATISFIED` assessment may only be bypassed where an approved rule explicitly permits a discretionary override and an attributable authority decision is recorded as evidence.

## Relationship model

```text
CredentialDefinition
        |
        v
RequirementSet(version) ----> Evidence snapshot
        |                           |
        v                           v
EligibilityAssessment <------ CredentialArtifact(s)
        |
        | grant basis / decision input
        v
AuthorizationGrant
        |
        +--> validity
        +--> suspension/revocation/supersession
        +--> renewal lineage
        +--> audit/provenance
```

## Interoperability boundary

W3C Verifiable Credentials, OpenID4VCI/OpenID4VP, EUDI Wallet attestations, ISO mdoc and registry-specific formats are external representations or protocols. They map through contracts/adapters and do not define CALPQ Core semantics.

## Admission boundary

This document does not authorize implementation. The vertical remains `NOT_ADMITTED_FOR_IMPLEMENTATION` while M00 is blocked or until the vertical admission gate is explicitly satisfied.
