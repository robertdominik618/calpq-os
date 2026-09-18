# M06 S02 — Mandatory Test Index

Status: PLANNED BEFORE SOURCE; no passing execution claimed.
Issue #141; contract M06_S02_IMPLEMENTATION_CONTRACT.md.
Runtime: packages/application/test/m06-s02-expiry-renewal-policy.test.ts.

| ID | Required scenario |
|---|---|
| M06S02-01 | Policy preserves exact governed target/source and version |
| M06S02-02 | Invalid opaque policy references rejected |
| M06S02-03 | Structural policy version/definition fakes rejected |
| M06S02-04 | Governed source and approving actor required |
| M06S02-05 | Future source retrieval rejected |
| M06S02-06 | Approval after recorded knowledge rejected |
| M06S02-07 | Inverted policy effectivity rejected |
| M06S02-08 | Invalid duration quantities rejected |
| M06S02-09 | Uncontrolled or extra expiry fields rejected |
| M06S02-10 | Negative/reversed renewal windows rejected |
| M06S02-11 | Invalid grace or extra renewal fields rejected |
| M06S02-12 | Policy collections are copied, dense and frozen |
| M06S02-13 | Explicit date/instant/offset context matches |
| M06S02-14 | Mismatched calendar date rejected |
| M06S02-15 | Invalid or fractional offset rejected |
| M06S02-16 | Calendar values require governed date/time and range |
| M06S02-17 | Leap-day day arithmetic |
| M06S02-18 | Non-leap century arithmetic |
| M06S02-19 | Leap century arithmetic |
| M06S02-20 | Explicit month-end clamping |
| M06S02-21 | Explicit month-end rejection |
| M06S02-22 | Yearly leap-day adjustment |
| M06S02-23 | Calendar year boundary |
| M06S02-24 | Negative day and month shifts |
| M06S02-25 | Range overflow and underflow rejected |
| M06S02-26 | Invalid calendar arithmetic arguments rejected |
| M06S02-27 | Authorized scoped evaluation succeeds |
| M06S02-28 | DENY cannot be overridden |
| M06S02-29 | Cross-tenant evaluation denied |
| M06S02-30 | Cross-organization evaluation denied |
| M06S02-31 | Subject identity/kind mismatch denied |
| M06S02-32 | Purpose mismatch denied |
| M06S02-33 | Reader actor/kind mismatch denied |
| M06S02-34 | Correlation mismatch denied |
| M06S02-35 | Required field permission enforced |
| M06S02-36 | Operation/access-reference enforced |
| M06S02-37 | Unknown tenant denied |
| M06S02-38 | Requested jurisdiction bound to basis |
| M06S02-39 | Denial precedes malformed sensitive inputs |
| M06S02-40 | Evaluation cannot exceed invocation |
| M06S02-41 | Knowledge cannot exceed invocation |
| M06S02-42 | Future-known basis rejected |
| M06S02-43 | Missing policy remains indeterminate |
| M06S02-44 | Inclusive policy effective-date filtering |
| M06S02-45 | Exact credential-definition ID/version selection |
| M06S02-46 | Policy jurisdiction selection |
| M06S02-47 | Future-known policy creates no metadata leakage |
| M06S02-48 | Duplicate visible policy ID/version rejected |
| M06S02-49 | Overlapping applicable policies require review |
| M06S02-50 | Candidate-order-independent ambiguity output |
| M06S02-51 | Unverified/stale policy source requires review |
| M06S02-52 | Unverified/stale artifact requires review |
| M06S02-53 | Unresolved policy conditions require review |
| M06S02-54 | Source jurisdiction/effectivity boundaries enforced |
| M06S02-55 | Declared expiry before-date relation |
| M06S02-56 | Declared expiry exact-date relation |
| M06S02-57 | Declared expiry after-date relation without authority mutation |
| M06S02-58 | Missing declared expiry remains indeterminate |
| M06S02-59 | Duration from issuance evaluated |
| M06S02-60 | Duration from effectivity evaluated |
| M06S02-61 | Missing duration anchor remains indeterminate |
| M06S02-62 | Calculated/declared expiry conflict requires review |
| M06S02-63 | Explicit no-fixed-expiry differs from missing data |
| M06S02-64 | No-fixed-expiry conflicting with declared date requires review |
| M06S02-65 | Renewal opening boundary inclusive |
| M06S02-66 | Renewal due boundary inclusive |
| M06S02-67 | Grace deadline independent from expiry |
| M06S02-68 | Unknown renewal/no expiry does not imply no obligation |
| M06S02-69 | Explicit previous-day convention and rejected arithmetic |
| M06S02-70 | Outputs/upstream basis and S01 timeline remain immutable |
| M06S02-71 | Safe metadata and reproducible source-linked trace |
| M06S02-72 | Repeatability and historical/new policy isolation |

Governance target: tests/m06_s02_scope_test.mjs, exactly M06S02G-01–16: exact execution record; changed approval; changed predecessor; missing/unknown fields; expanded authorization; incorrect progress; missing evidence references; exact scope; unknown path; delete/rename/mode; duplicate path; exact dispatcher; modified legacy helper; additive config; altered predecessor config; malformed test index.
Additional exit requirements: readonly proof, activation/contract/index before source, unchanged historical S01/regression tests, complete current-head workflow matrix. Counts alone do not prove the right scenario identities executed.
