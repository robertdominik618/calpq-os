# CALPQ Trust Source Adapter Boundary

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0010-D`

## Rule

External trust registries, issuer/verifier APIs, eIDAS/EUDI sources, certificate validation services and organizational directories are adapters, not Core truth.

Adapters normalize external observations into:
- source ID and source record ID;
- source snapshot/version;
- entity identity candidate;
- role/scope assertion;
- status and effective dates;
- retrieved-at timestamp;
- provenance and raw audit reference.

Only Application/Core rules may turn those observations into TrustEntity, AuthorityScope or TrustAnchorRecord state.

Core MUST NOT depend on provider SDKs, HTTP clients, registry-specific XML/JSON schemas, eIDAS/EUDI libraries, certificate-store implementations, cloud credentials or vendor result codes.

Network success is not verification. Source availability is not authority. A historical cached snapshot may reproduce a past decision but MUST NOT be silently treated as current when stale.

Changing provider or protocol changes an adapter, not Credential, Evidence, Eligibility or Authorization semantics.
