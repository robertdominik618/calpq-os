# M05 Slice 08 — Mandatory Scenario Index

Status: `PLANNED / EXECUTABLE RESULTS NOT YET CLAIMED`
Tracking: #123. Contract: `M05_S08_IMPLEMENTATION_CONTRACT.md`.
Runtime target: `packages/application/test/m05-s08-human-review.test.ts`.
Compile target: `packages/application/test/m05-s08-types.compile.ts`.
Every ID below must be an executed, non-skipped mandatory runtime test. A passing count alone is not evidence unless identities match this index and the final commit is verified.

| ID | Required evidence |
|---|---|
| M05S08-01 | UUIDv7 case and command IDs reject malformed values |
| M05S08-02 | Case preserves exact request/route/security/intake bindings |
| M05S08-03 | Different original evidence is rejected |
| M05S08-04 | Different intake identity is rejected |
| M05S08-05 | Opening organization mismatch is rejected |
| M05S08-06 | Opening subject mismatch is rejected |
| M05S08-07 | Noncanonical request subject reference is rejected |
| M05S08-08 | Missing tenant or purpose is rejected |
| M05S08-09 | Automated route cannot become a human-review case |
| M05S08-10 | Unregistered route is rejected |
| M05S08-11 | Unacceptable method is rejected |
| M05S08-12 | Insufficient route assurance is rejected |
| M05S08-13 | Route jurisdiction mismatch is rejected |
| M05S08-14 | Inactive or ineffective route is rejected |
| M05S08-15 | Future-known route cannot enter historical review |
| M05S08-16 | Opening time cannot predate required snapshots |
| M05S08-17 | Foreign authority snapshot is rejected |
| M05S08-18 | Prior result from another request is rejected |
| M05S08-19 | Prior result outside the route registry is rejected |
| M05S08-20 | Duplicate authority resolution identities are rejected |
| M05S08-21 | Case collections are copied and frozen |
| M05S08-22 | Case serialization excludes raw document and storage data |
| M05S08-23 | Valid case-scoped reviewer mandate preserves provenance |
| M05S08-24 | Non-human reviewer and self-grant are rejected |
| M05S08-25 | Acquiring or submitting actor cannot self-review |
| M05S08-26 | Explicitly excluded owner actor is rejected |
| M05S08-27 | Access denial is not overridden by mandate |
| M05S08-28 | Access tenant and purpose mismatch are rejected |
| M05S08-29 | Mandate verification entity must match case route |
| M05S08-30 | Mandate claims and permissions are bounded |
| M05S08-31 | Invalid mandate validity or revocation interval is rejected |
| M05S08-32 | Expired mandate blocks a new invocation |
| M05S08-33 | Revoked mandate blocks invocation and replay |
| M05S08-34 | Different invocation reviewer is rejected |
| M05S08-35 | Wrong operation is rejected |
| M05S08-36 | Mismatched access-decision reference is rejected |
| M05S08-37 | Invocation organization and subject remain case-bound |
| M05S08-38 | Manual observation requires source/evidence/fingerprint |
| M05S08-39 | Manual observation claims remain in exact case |
| M05S08-40 | Observation and source-knowledge times are enforced |
| M05S08-41 | Authorized supported manual confirmation verifies only checked claim |
| M05S08-42 | Conditional authority remains REVIEW_REQUIRED |
| M05S08-43 | Missing or negative authority remains REVIEW_REQUIRED |
| M05S08-44 | Conflicting authority remains REVIEW_REQUIRED |
| M05S08-45 | Quarantine blocks positive confirmation |
| M05S08-46 | Incomplete security or unchecked integrity blocks confirmation |
| M05S08-47 | Source unavailability is INDETERMINATE, never FAILED |
| M05S08-48 | Prior contradictory or unresolved result cannot be silently overwritten |
| M05S08-49 | Provider outage permits independently supported manual fallback |
| M05S08-50 | Partial confirmation preserves unchecked claims |
| M05S08-51 | Generic review completion does not verify evidence |
| M05S08-52 | Review rejection does not assert negative legal truth |
| M05S08-53 | Evidence request and escalation remain nonterminal |
| M05S08-54 | Exact replay preserves history identity and revision |
| M05S08-55 | Reused idempotency key with changed content is rejected |
| M05S08-56 | Stale or invalid expected revision is rejected |
| M05S08-57 | Terminal history rejects new mutations |
| M05S08-58 | Submission and execution time remain monotonic |
| M05S08-59 | Uncontrolled actions and missing confirmation permission are rejected |
| M05S08-60 | Histories, records and upstream snapshots remain immutable |
| M05S08-61 | Canonical command serialization is deterministic |
| M05S08-62 | Separate valid confirmations close only after full case coverage |
| M05S08-63 | Duplicate command ID and re-confirming covered claims are rejected |
| M05S08-64 | Foreign case commands or observations cannot cross histories |

Additional mandatory evidence: readonly compile proof; exact S07 merge ancestry; no production Core/provider-adapter diff; no ambient clock, randomness or provider SDK; S07 transitive regressions and FV13 tenant regression; dedicated workflow and final-head revalidation.
