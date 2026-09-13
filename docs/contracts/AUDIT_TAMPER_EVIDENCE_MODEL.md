# CALPQ Audit Tamper-Evidence Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0014-B`

## Purpose
Make unauthorized alteration of audit history detectable without confusing cryptographic integrity with legal or semantic truth.

## Integrity record
An audit entry may carry:
- canonical serialization/version;
- previous-entry hash within its stream/partition;
- current entry hash;
- hash algorithm/version;
- signing/checkpoint metadata where used;
- integrity verification status.

## Invariants
1. Integrity protection proves that recorded bytes/structure have not changed relative to the trusted checkpoint; it does not prove that the original statement was legally correct.
2. A valid signature/hash MUST NOT promote an unverified fact into a verified credential or authorization.
3. Hash/key algorithms must be versioned so cryptographic agility and key rotation do not rewrite history.
4. Missing or broken integrity evidence yields `REVIEW_REQUIRED` or `INDETERMINATE` for the audit proof; it does not silently rewrite the underlying domain decision.
5. Correction is represented by a new linked entry, never mutation of the original entry.
6. Checkpoints may be anchored externally or internally by an approved implementation, but the Core contract must not depend on a specific blockchain, vendor or storage engine.

## Partitioning
Hash chains/checkpoints may be maintained per subject, organization, aggregate, tenant or other governed stream. Partition strategy is an implementation concern so long as ordering and verification semantics remain stable.

## Privacy
Integrity metadata must not duplicate sensitive payload content. Hashes and signatures are evidence of integrity, not permission to disclose protected data.