# M05 Slice 07 — Mandatory Test Index

Status: `54 MANDATORY SCENARIOS`

| ID | Scenario |
|---|---|
| M05S07-01 | Verification methods are controlled and exact. |
| M05S07-02 | Assurance levels are controlled and exact. |
| M05S07-03 | Route states are controlled and exact. |
| M05S07-04 | Route outcomes are controlled and exact. |
| M05S07-05 | VerificationRouteId requires UUIDv7. |
| M05S07-06 | Registry snapshot ID requires UUIDv7. |
| M05S07-07 | Verification request ID requires UUIDv7. |
| M05S07-08 | Verification attempt ID requires UUIDv7. |
| M05S07-09 | Route requires exact TrustEntity verifier. |
| M05S07-10 | Route claims are canonical and immutable. |
| M05S07-11 | Duplicate route jurisdictions fail closed. |
| M05S07-12 | Uncontrolled route assurance fails closed. |
| M05S07-13 | Invalid route priority fails closed. |
| M05S07-14 | Invalid route effective period fails closed. |
| M05S07-15 | Route preserves source and retrieval provenance. |
| M05S07-16 | Registry binds exact Trust Registry snapshot. |
| M05S07-17 | Duplicate route IDs are rejected. |
| M05S07-18 | Route verifier must exist in exact Trust Registry snapshot. |
| M05S07-19 | Future-retrieved route is rejected from historical registry. |
| M05S07-20 | Registry order is explicit priority then route ID. |
| M05S07-21 | Request requires EvidenceReference. |
| M05S07-22 | Request claims are canonical and immutable. |
| M05S07-23 | Acceptable methods must be controlled and unique. |
| M05S07-24 | Request preserves explicit evaluation and knowledge time. |
| M05S07-25 | Request knowledge time cannot predate evaluation time. |
| M05S07-26 | Selection requires authority from exact Trust Registry snapshot. |
| M05S07-27 | Exact authorized route is selected. |
| M05S07-28 | Authorized-with-conditions remains eligible for route selection. |
| M05S07-29 | Wrong authority role is not selected. |
| M05S07-30 | Wrong claim authority is not selected. |
| M05S07-31 | Wrong jurisdiction authority is not selected. |
| M05S07-32 | Insufficient route assurance is not selected. |
| M05S07-33 | Unacceptable method is not selected. |
| M05S07-34 | Inactive route is not selected. |
| M05S07-35 | Route review state fails closed to REVIEW_REQUIRED. |
| M05S07-36 | Partial claim coverage is explicit. |
| M05S07-37 | No applicable route is NOT_SUPPORTED. |
| M05S07-38 | Explicit priority determines route order. |
| M05S07-39 | Provider port cannot execute manual authority confirmation. |
| M05S07-40 | Provider port cannot execute human review route. |
| M05S07-41 | Provider request claims must be request and route subset. |
| M05S07-42 | Provider result outcome must be controlled. |
| M05S07-43 | VERIFIED provider result requires assertion fingerprints. |
| M05S07-44 | Provider outage cannot be represented as FAILED claim truth. |
| M05S07-45 | Provider outage may be INDETERMINATE. |
| M05S07-46 | Provider checked claims cannot escape provider request. |
| M05S07-47 | Provider VERIFIED plus sufficient authority remains VERIFIED. |
| M05S07-48 | Provider VERIFIED without sufficient authority becomes REVIEW_REQUIRED. |
| M05S07-49 | Route result preserves provider and authority provenance. |
| M05S07-50 | Matching successful assertion fingerprints resolve VERIFIED. |
| M05S07-51 | Conflicting successful assertion fingerprints require review. |
| M05S07-52 | Indeterminate route result does not become FAILED claim truth. |
| M05S07-53 | Unchecked claim remains NOT_SUPPORTED. |
| M05S07-54 | Serialization is deterministic and exposes no legal authorization truth; idempotency is explicit. |
