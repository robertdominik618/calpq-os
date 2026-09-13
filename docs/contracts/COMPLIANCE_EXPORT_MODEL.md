# CALPQ Compliance Export Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0014-D`

## Purpose
Produce a purpose-scoped evidence package for an auditor, regulator, employer, client or internal reviewer without turning export into a second source of truth or exposing unrelated data.

## Export package
A `ComplianceExportPackage` should contain:
- export_id and created_at;
- declared purpose and authorized audience;
- subject/organization scope;
- included decision/audit entry references;
- rule/source/evidence version references;
- replay summary where requested;
- integrity/checkpoint metadata;
- redaction/minimization manifest;
- export schema/version;
- package checksum/signature metadata where supported;
- expiry/revocation or access constraints where applicable.

## Rules
1. Export is an immutable snapshot of selected governed records; it does not create new credential, eligibility or authorization truth.
2. Minimum-necessary disclosure applies. Original evidence, unrelated credentials and internal notes are excluded unless explicitly required and authorized.
3. Redaction must be explicit in the manifest so absence of a field is distinguishable from unavailable source data.
4. A package may reference source artifacts instead of embedding them when reference-based verification is sufficient.
5. Export generation must respect AccessDecision, purpose, legal basis, retention and preservation-hold rules.
6. Re-export after material changes creates a new package/version; previous exports remain historically identifiable.

## Verification
A recipient must be able to verify package integrity and trace included claims back to the exact CALPQ audit/decision references that existed at package creation time.

## Privacy
The package must not become a bulk data dump. Exportability is constrained by the same access, privacy lifecycle and selective-disclosure contracts as interactive access.