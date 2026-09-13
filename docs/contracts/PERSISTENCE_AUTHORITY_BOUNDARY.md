# CALPQ Persistence Authority Boundary

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0017-A`

## Rules
- CALPQ typed domain IDs remain canonical; database sequences and storage keys are never domain identity.
- Authoritative aggregate/domain state is distinct from read projections, search indexes, delivery metadata and checkpoints.
- Explicit versioned SQL migrations are schema authority. ORM auto-sync is not allowed to define production schema.
- Database constraints protect stable structural integrity: required values, uniqueness, references and valid storage shape.
- Time-varying legal, jurisdictional, credential and regulatory rules remain versioned Core/domain rules, not static database truth.
- Original binary evidence is stored behind the object-storage port; persistence keeps stable artifact reference, hash and provenance metadata.
- A schema migration may change representation but MUST NOT silently change the historical meaning of prior decisions, grants, evidence or audit records.
