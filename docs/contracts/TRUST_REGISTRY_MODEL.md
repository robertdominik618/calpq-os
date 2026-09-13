# CALPQ Trust Registry Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0010-A`

## Purpose

Define a provider-neutral registry of entities and trust anchors used to determine whether a person, organization, service, registry, authority or verifier may be trusted for a specific purpose, jurisdiction, scope and time.

## Core concepts

### TrustEntity
A `TrustEntity` identifies a legal or technical actor without implying that every claim by that actor is authoritative.

Required fields:
- stable CALPQ entity ID;
- legal/display names;
- entity kind;
- jurisdictions;
- identifiers and registry references;
- status and effective dates;
- provenance.

### AuthorityScope
`AuthorityScope` states exactly what an entity may authoritatively issue, attest, verify, supervise or resolve.

Required dimensions:
- role: ISSUER | VERIFIER | REGISTRY_OPERATOR | SUPERVISORY_BODY | TRUST_SERVICE_PROVIDER | ACCREDITATION_BODY | OTHER;
- claim/credential/activity scope;
- jurisdiction;
- subject class where applicable;
- valid-from / valid-to;
- source authority and source version;
- conditions and limitations.

Authority MUST NOT be inferred merely from an entity name, domain, document logo, cryptographic signature, employment relation or technical reachability.

### TrustAnchorRecord
A `TrustAnchorRecord` binds a TrustEntity/AuthorityScope to a verifiable trust source.

Possible anchors include:
- statutory or official registry entry;
- national/EU trusted list entry;
- supervisory decision;
- accreditation record;
- official public key / certificate metadata;
- configured organizational trust policy.

Every anchor retains source snapshot, retrieved-at time, effective dates, verification state and provenance.

## Verification states

`VERIFIED | UNVERIFIED | STALE | REVOKED | SUSPENDED | REVIEW_REQUIRED`

A stale, revoked or suspended anchor MUST NOT silently continue to authorize new decisions.

## Historical reproducibility

Past verification decisions retain the exact trust entity, scope, anchor snapshot and source version used at the time. Later registry changes create new records or superseding state; they do not rewrite prior evidence.
