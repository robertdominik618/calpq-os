# CALPQ Secrets & Cryptographic Boundary

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0016-C`

## Purpose
Keep cryptographic operations and secret material provider-neutral, auditable and outside deterministic Core state.

## Secret classes
- service credentials and API secrets;
- signing keys;
- encryption keys;
- key-encryption/wrapping keys;
- webhook/callback verification secrets;
- temporary tokens and credentials;
- device- or wallet-bound cryptographic material where applicable.

## Hard boundaries
- raw secrets and private keys MUST NOT be stored in Core aggregates, command/event payloads, telemetry or ordinary application logs;
- Core may express semantic requirements such as `SIGN`, `VERIFY`, `ENCRYPT`, `DECRYPT`, `DERIVE_REFERENCE` through approved ports, but provider SDKs/algorithms/keystores remain adapter concerns;
- cryptographic success proves only the defined cryptographic property, never legal authority or professional competence;
- key rotation MUST preserve key/version provenance needed to verify historical records;
- loss or compromise of a key MUST NOT silently rewrite historical domain truth.

## Key lifecycle
A governed key reference records purpose, scope, version, status, activation time, retirement time and provider-neutral provenance. Historical verification may reference retired keys where policy permits, while new signing/encryption uses only active authorized key versions.

## Algorithm agility
No domain contract depends on one algorithm, KMS/HSM vendor or certificate provider. Cryptographic profile/version is explicit at the security/application boundary.

## Export and logs
Compliance exports may include signatures, public verification metadata or key identifiers necessary for integrity verification, but MUST NOT include private material or unrestricted secrets.
