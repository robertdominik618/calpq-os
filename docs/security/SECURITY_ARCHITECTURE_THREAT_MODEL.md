# CALPQ Security Architecture & Threat Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0016-A`

## Security objective
CALPQ must preserve confidentiality, integrity, availability, provenance and authorization semantics across identity, credential, evidence, organization, assignment, sharing and audit workflows.

## Protected assets
- canonical Subject identity and account bindings;
- CredentialArtifact, EligibilityAssessment and AuthorizationGrant data;
- original documents and evidence references;
- TrustEntity, AuthorityScope and verifier decisions;
- organization roles, delegations and assignment decisions;
- access decisions and selective-disclosure packages;
- audit ledger and historical decision replay inputs;
- secrets, signing keys, encryption keys and service credentials;
- administrative/content-governance capabilities.

## Threat actors
- unauthenticated external attacker;
- compromised end-user account;
- compromised organization administrator;
- malicious or careless insider;
- impersonated or compromised issuer/verifier;
- compromised external dependency or supply-chain component;
- malicious document/content source;
- abusive automated client.

## Trust boundaries
1. user/device <-> CALPQ edge/API;
2. API/application <-> deterministic Core;
3. application/workers <-> persistence/outbox;
4. CALPQ <-> external registries, issuers, verifiers and trust services;
5. CALPQ <-> AI/OCR providers;
6. CALPQ <-> object/document storage;
7. CALPQ <-> telemetry/monitoring systems;
8. administrative/content-governance surfaces <-> regulated domain data.

Every boundary requires explicit authentication, authorization, input validation, provenance and failure semantics appropriate to the data crossing it.

## Core security invariants
- authentication never substitutes for Subject identity proofing;
- organization role never substitutes for professional authorization;
- cryptographic validity never substitutes for issuer authority;
- AI/OCR content is untrusted derived input until explicitly verified;
- telemetry is never domain truth;
- secrets and provider credentials never enter Core domain state;
- security failures fail closed for privileged mutation and sensitive disclosure;
- security controls must not silently mutate Credential/Authorization semantics.

## Threat-model method
Each material capability records: asset, actor, trust boundary, abuse scenario, precondition, preventive control, detective control, response path, residual risk and audit evidence.

Threat review is required when adding a new provider, privileged role, document ingestion path, external callback, share mechanism or cryptographic capability.
