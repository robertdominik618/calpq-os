# CALPQ Application Port Catalog

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0019-C`

## Purpose
Define provider-neutral ports Application may depend on after M00 release.

## Port families
### Core-support ports
- `ClockPort`
- `IdGeneratorPort`

### Persistence ports
- aggregate repository ports;
- read/query repository ports;
- `UnitOfWorkPort` / transaction boundary;
- idempotency/outcome lookup where required by the use case.

### Evidence and document ports
- document/original storage;
- evidence retrieval;
- document intake/extraction orchestration boundary.

### Trust and verification ports
- registry/trust-source lookup;
- authority/verification provider boundary;
- recognition/external-authority lookup where approved.

### Delivery/interaction ports
- notification delivery;
- external event publication;
- async operation scheduling.

### AI/OCR assistance ports
Provider-neutral assistance interfaces only. Their outputs remain derived proposals/evidence metadata and never become authoritative merely because the port returned success.

## Invariants
- Port names express CALPQ capability, not vendor product names.
- Core does not depend on Application ports.
- Application does not import provider SDKs.
- Adapter implementation details and provider error objects stay outside Application/Core contracts.
- A port returning data does not define its legal authority; trust/verification policy remains explicit.
- Replacing a provider changes an adapter, not the use-case semantics.