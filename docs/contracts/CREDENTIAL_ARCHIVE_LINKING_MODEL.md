# CALPQ Credential Archive Linking Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0009-E`

Archived documents and evidence may link to credentials, requirements, recognition, renewal and subjects without becoming authorization themselves.

Typical relations:
`EVIDENCES_CREDENTIAL | EVIDENCES_REQUIREMENT | SUPPORTS_RECOGNITION | SUPPORTS_RENEWAL | SUPPLEMENTS_DOCUMENT | SUPERSEDES_DOCUMENT | RELATED_TO_SUBJECT`

Each link retains source ID, target ID, relation type, scope, provenance, effective dates when relevant and evidence/verification state.

The archive is not the legal source of truth for `AuthorizationGrant`. Passport, Gap and Lifecycle projections MUST preserve the linked evidence status.

If evidence later expires or becomes invalid, historical decisions remain reproducible while current projections may be re-evaluated through PREP-0007.
