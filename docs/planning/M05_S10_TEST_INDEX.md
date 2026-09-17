# M05 Slice 10 — Mandatory Integration Scenario Index

Status: `PLANNED / NO EXECUTED SUCCESS CLAIMED`
Contract: `M05_S10_IMPLEMENTATION_CONTRACT.md`; issue #127 / epic #34.
Runtime: `packages/application/test/m05-s10-integration.test.ts`.
Every ID must execute exactly once as a non-skipped test. The runtime ledger separately retains all S01–S09 runtime suites; 48 integration scenarios are additional, not replacement coverage.

| ID | Required composed evidence |
|---|---|
| M05S10-01 | Camera to correction, provider verification and archive snapshot |
| M05S10-02 | Scan to correction, provider verification and archive snapshot |
| M05S10-03 | File upload to correction, provider verification and archive snapshot |
| M05S10-04 | Email attachment to correction, provider verification and archive snapshot |
| M05S10-05 | Share sheet to correction, provider verification and archive snapshot |
| M05S10-06 | Governed URL provenance to verification and archive snapshot |
| M05S10-07 | Provider intake to verification and archive snapshot without transport trust |
| M05S10-08 | Byte-identical mixed-channel submissions retain separate original identities |
| M05S10-09 | Same bytes across subjects cannot merge derived/snapshot lineage |
| M05S10-10 | Scan supplementation/supersession preserves earlier archive history |
| M05S10-11 | Email message and attachment provenance survives composed processing |
| M05S10-12 | Registry/provider intake is not sufficient verifier authority |
| M05S10-13 | Provider outage is executed through the port and snapshotted as uncertainty |
| M05S10-14 | Timeout permits authorized manual fallback for only checked claims |
| M05S10-15 | Unavailable manual source remains indeterminate in archived review history |
| M05S10-16 | Missing authority blocks provider promotion and manual confirmation |
| M05S10-17 | Conflicted authority blocks positive manual confirmation |
| M05S10-18 | Conditional authority remains review-required under manual fallback |
| M05S10-19 | Contradictory successful provider assertions require review and block override |
| M05S10-20 | Prior failed claim cannot be silently overridden by manual review |
| M05S10-21 | Agreeing authorized provider assertions retain individual provenance |
| M05S10-22 | Partial route coverage preserves uncovered request claims |
| M05S10-23 | Lower-assurance route cannot be used as silent fallback |
| M05S10-24 | Out-of-scope provider claim cannot enter normalized archived results |
| M05S10-25 | Generic human review completion does not verify an original |
| M05S10-26 | Expired/revoked mandate blocks appended confirmation and preserves history |
| M05S10-27 | Acquiring/submitting actor cannot self-review across channels |
| M05S10-28 | Foreign tenant invocation cannot capture another archive snapshot |
| M05S10-29 | Security assessment for another original cannot enter review or snapshot |
| M05S10-30 | Quarantine prevents positive manual fallback but preserves audit snapshot |
| M05S10-31 | Missing scanner observations fail closed across review and archive |
| M05S10-32 | Required hold protects snapshotted original from disposal |
| M05S10-33 | Complete exact derived-parent lineage is required in snapshot |
| M05S10-34 | Future-derived evidence cannot enter historical snapshot |
| M05S10-35 | Later extraction-review revision cannot rewrite a prior snapshot |
| M05S10-36 | Provider results after capture cutoff are rejected |
| M05S10-37 | Unregistered manual route cannot form a review case |
| M05S10-38 | Exact review replay preserves history identity and snapshot determinism |
| M05S10-39 | Stale lifecycle revision cannot pin historical snapshot as current |
| M05S10-40 | Unlink leaves prior snapshot and event history intact |
| M05S10-41 | Expired retention does not bypass an outstanding snapshot pin |
| M05S10-42 | Releasing a hold does not release independent snapshot preservation |
| M05S10-43 | Incomplete dependency inventory requires review, not disposal |
| M05S10-44 | Eligible logical tombstone never deletes bytes or prior evidence |
| M05S10-45 | Policy replacement preserves original version and prevents version reuse |
| M05S10-46 | Instruction-like extracted text remains inert nonauthoritative data |
| M05S10-47 | Mixed review/result snapshot summaries are deterministic and minimized |
| M05S10-48 | Mixed-channel batch isolates provider outage from another successful case |

Additional runner evidence: exact S01–S10 file manifest, no duplicate execution within the new runner, no cross-run cache, TAP pass/fail/skip/todo/cancelled totals, exact SHA/tree, visible progress, strict Application compile, architecture and unchanged existing production/gate files. Entire same-head PR matrix is a separate acceptance requirement.
