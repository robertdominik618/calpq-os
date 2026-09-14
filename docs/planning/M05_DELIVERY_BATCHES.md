# CALPQ M05 Delivery Batches

Status: `PLANNING ONLY / IMPLEMENTATION BLOCKED`
ID: `CALPQ-M05-DELIVERY-0001`

## Purpose
Define implementation-sized batches for M05 Document Intake, Archive & Verification Fabric.

## Batch M05-A — Intake & Immutable Archive
Scope:
1. camera/scan/file/PDF channel contracts;
2. email/share-sheet/URL/provider import adapters;
3. immutable original artifact storage;
4. hash/media/security metadata;
5. quarantine and processing states;
6. archive lifecycle and retention hooks.

Definition of Done:
- original bytes/reference are immutable;
- intake channel never implies validity or trust;
- malware/untrusted-content controls run before unsafe processing;
- archive and retention metadata remain auditable.

## Batch M05-B — Extraction, Review & Structured Facts
Scope:
1. OCR/extraction proposals;
2. AI/classification proposals;
3. normalized field proposals;
4. user/reviewer correction workflow;
5. derivation lineage;
6. reviewed fact promotion rules.

Definition of Done:
- extraction is always derived evidence;
- confidence cannot promote a proposal to verified fact;
- original and derived records remain linked but separate;
- reviewer actions are attributable and auditable.

## Batch M05-C — Trust & Verification Fabric
Scope:
1. Trust Registry integration;
2. issuer/verifier identity resolution;
3. authority resolution;
4. registry/issuer/signature/manual routes;
5. normalized VerificationRecord;
6. fallback/review policy;
7. provider-neutral adapter contract.

Definition of Done:
- technical validity != legal authority;
- verification promotes only checked claims;
- provider outage yields indeterminate/retry/review semantics, not legal rejection;
- no verification route issues AuthorizationGrant.

## Exit
M05 exit requires multi-channel intake, immutable archive, derived/review pipeline and authority-aware verification fabric with provider-neutral Core/Application contracts.
