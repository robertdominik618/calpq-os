# CALPQ Document Intake Security & Privacy Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0009-F`

Document intake is a high-trust boundary because uploaded files may contain identity, qualification, employment, health, signature or other sensitive data.

Required controls:
- content/type validation before processing;
- quarantine for suspicious or unsupported inputs;
- malware/content-safety scanning through replaceable adapters;
- least-privilege access to originals;
- encryption in transit and at rest;
- no document bodies or extracted secrets in ordinary logs;
- retention/deletion policy before durable storage;
- explicit provenance for external URLs/email/provider imports;
- minimum-necessary data exposure to OCR/AI providers;
- provider-neutral processing boundary;
- auditable access to originals and derived artifacts.

Processing providers MUST NOT become authoritative verifiers merely because they processed the file.

Redacted/shareable derivatives MUST remain linked to, but distinct from, the immutable original.
