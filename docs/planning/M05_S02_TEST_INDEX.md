# M05 Slice 02 — Mandatory Runtime Test Index

Status: `42 MANDATORY RUNTIME SCENARIOS`

Tracking issue: #110. Reviewed predecessor merge: `4251030104521e6f9ae9d88af2b7eae87fa8e9c0`.

| ID | Mandatory evidence |
|---|---|
| M05S02-01 | Controlled byte-integrity vocabulary. |
| M05S02-02 | Controlled archive-relationship vocabulary. |
| M05S02-03 | Canonical content address uses Core SHA-256 identity. |
| M05S02-04 | Content address preserves exact ContentHash object. |
| M05S02-05 | Archive preserves exact original EvidenceReference object. |
| M05S02-06 | Intake semantic ID preserved. |
| M05S02-07 | Exact S01 provenance object preserved. |
| M05S02-08 | Media type preserved. |
| M05S02-09 | Byte length preserved. |
| M05S02-10 | Original acquired-at preserved. |
| M05S02-11 | Intake received-at preserved. |
| M05S02-12 | Explicit archive snapshot instant preserved. |
| M05S02-13 | Security classification preserved. |
| M05S02-14 | Storage-object reference bounded/normalized. |
| M05S02-15 | Encryption-profile reference bounded/normalized. |
| M05S02-16 | Access-policy reference bounded/normalized. |
| M05S02-17 | Retention-policy reference bounded/normalized. |
| M05S02-18 | NOT_CHECKED byte integrity fabricates no observation. |
| M05S02-19 | MATCHED accepts exact original hash. |
| M05S02-20 | MISMATCH records differing hash without original mutation. |
| M05S02-21 | MATCHED with different hash fails closed. |
| M05S02-22 | MISMATCH with original hash fails closed. |
| M05S02-23 | Integrity check cannot predate receipt. |
| M05S02-24 | Integrity check cannot occur after archive snapshot. |
| M05S02-25 | Archive snapshot cannot predate receipt. |
| M05S02-26 | Archive snapshot cannot predate original acquisition. |
| M05S02-27 | Original/intake media mismatch fails closed. |
| M05S02-28 | Missing original media type fails closed. |
| M05S02-29 | Empty storage reference fails closed. |
| M05S02-30 | Oversized policy reference fails closed. |
| M05S02-31 | Control characters in archive references fail closed. |
| M05S02-32 | Archive entry frozen. |
| M05S02-33 | Content address and integrity observation frozen. |
| M05S02-34 | Canonical projection deterministic. |
| M05S02-35 | Exact hash equality reports byte identity. |
| M05S02-36 | Different hashes report different bytes. |
| M05S02-37 | Byte identity does not promote evidence verification. |
| M05S02-38 | REPLACES links distinct immutable originals without overwrite. |
| M05S02-39 | SUPPLEMENTS preserves both endpoints. |
| M05S02-40 | DUPLICATES requires byte-identical distinct originals. |
| M05S02-41 | Relationship self-link/hash/time inconsistencies fail closed. |
| M05S02-42 | No later-slice authority, provider SDK or ambient time/randomness leaks into S02. |

Strict TypeScript evidence additionally proves readonly archive/input/relationship/content-address/integrity fields and controlled vocabulary for byte-integrity and archive-relationship states.
