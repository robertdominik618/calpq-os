# CALPQ Untrusted Content & AI Security Boundary

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0016-E`

## Purpose
Treat user documents, extracted text, external web/registry content and AI/OCR outputs as untrusted inputs until they pass the required verification and authorization boundaries.

## Invariants
- uploaded or externally retrieved content never controls system policy, permissions or tool authority;
- OCR/AI output remains derived evidence/proposal and cannot promote itself to verified truth;
- instructions embedded inside documents are data, not executable CALPQ instructions;
- AI cannot widen AccessDecision, role/delegation scope, TrustEntity authority or AuthorizationGrant state;
- provider prompts/context use minimum necessary data and must not contain secrets unless an explicitly approved integration requires a governed secret-handling path;
- provider responses are validated/normalized before they can influence Application workflows;
- external content failures or suspicious content yield quarantine/review semantics rather than unsafe fallback.

## Processing boundary
Document parsing, malware scanning, OCR, classification and model inference live outside Core. Core receives only normalized, provenance-linked observations.

## Tool boundary
Any future AI tool/action execution must be separately authorized by Application policy and scoped to the current actor/purpose. Model text alone never grants permission to call a privileged tool.

## Audit
Material AI/OCR transformations record provider/model/version when available, input evidence references, output reference, actor/process, time and verification state without duplicating unnecessary sensitive content.
