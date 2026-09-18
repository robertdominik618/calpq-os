# M06 Slice 03 — Mandatory Test Index

Status: `SPECIFICATION BEFORE SOURCE / NO EXECUTION SUCCESS CLAIMED`
Tracking #143; contract `M06_S03_IMPLEMENTATION_CONTRACT.md`.
Runtime `packages/application/test/m06-s03-recurring-obligation.test.ts`; exact non-skipped identities below. Scope tests M06S03G-01–16 and 16 readonly assertions are additional.

| ID | Required scenario |
|---|---|
| M06S03-01 | Four controlled kinds preserve exact rule and target version |
| M06S03-02 | Unknown obligation kind is rejected |
| M06S03-03 | Structural target or version is rejected |
| M06S03-04 | Zero negative fractional and excessive intervals are rejected |
| M06S03-05 | Unsupported unit convention or extra interval fields are rejected |
| M06S03-06 | Negative fractional and excessive lead/grace counts are rejected |
| M06S03-07 | Conditions are bounded dense unique and immutable |
| M06S03-08 | Rule source and approval cannot exceed knowledge instant |
| M06S03-09 | Inverted or ungoverned rule dates are rejected |
| M06S03-10 | Evidence claims are nonempty dense unique and controlled |
| M06S03-11 | Rule source and approval metadata are copied without locator |
| M06S03-12 | Missing declared anchor remains explicit |
| M06S03-13 | Issuance anchor comes from exact existing artifact |
| M06S03-14 | Effective-date anchor is distinct from issuance |
| M06S03-15 | Explicit anchor requires date and provenance |
| M06S03-16 | Obligation knowledge cannot predate basis or rule |
| M06S03-17 | Rule target ID and version mismatch is rejected |
| M06S03-18 | Rule and obligation jurisdiction mismatch is rejected |
| M06S03-19 | Unknown cadence or anchor fields are rejected |
| M06S03-20 | Obligation snapshot is immutable and separately versioned |
| M06S03-21 | Exact authorized scoped projection succeeds |
| M06S03-22 | Explicit denial precedes sensitive data processing |
| M06S03-23 | Cross-tenant projection is rejected |
| M06S03-24 | Organization mismatch is rejected |
| M06S03-25 | Subject identity and kind mismatch is rejected |
| M06S03-26 | Purpose mismatch is rejected |
| M06S03-27 | Reader actor and kind mismatch are rejected |
| M06S03-28 | Correlation mismatch is rejected |
| M06S03-29 | Exact operation field and access-decision reference required |
| M06S03-30 | Unknown tenant and ungoverned authorization inputs rejected |
| M06S03-31 | Future evaluation or knowledge exceeds invocation |
| M06S03-32 | Future-known obligation cannot enter historical projection |
| M06S03-33 | Horizon cannot predate the explicit evaluation day |
| M06S03-34 | Generation budget must be an integer from 1 to 1000 |
| M06S03-35 | Dense bounded records and exact obligation association required |
| M06S03-36 | Completion IDs and sequence are controlled |
| M06S03-37 | Governed evidence and capture-before-recording required |
| M06S03-38 | Completion source retrieval cannot postdate recording |
| M06S03-39 | Accepted disposition requires a completion date |
| M06S03-40 | Completion cannot be later than its recorded calendar date |
| M06S03-41 | Uncontrolled disposition and false-like values rejected |
| M06S03-42 | Completion metadata is immutable and excludes source/storage locators |
| M06S03-43 | Fixed calendar-day cadence generates independent occurrences |
| M06S03-44 | Monthly cadence uses original anchor without clamping drift |
| M06S03-45 | Rejected month adjustment is review-required without skipping |
| M06S03-46 | Leap-year cadence recovers original anniversary |
| M06S03-47 | Upcoming window due and overdue calendar states are independent |
| M06S03-48 | Projection horizon includes an exact due date |
| M06S03-49 | Rule end limits generation without an authority event |
| M06S03-50 | Anchor outside rule effectivity requires review |
| M06S03-51 | Unverified rule source requires review |
| M06S03-52 | Rule source jurisdiction mismatch requires review |
| M06S03-53 | Rule source effectivity must cover the original anchor |
| M06S03-54 | Unresolved rule conditions remain explicit |
| M06S03-55 | Unverified artifact facts do not become trusted scheduling facts |
| M06S03-56 | Unknown anchor produces no invented occurrences |
| M06S03-57 | Budget overflow exposes no falsely complete partial schedule |
| M06S03-58 | Calendar range overflow requires review without partial output |
| M06S03-59 | Occurrence keys distinguish cycles obligation and rule versions |
| M06S03-60 | New rule snapshot never rewrites previous projection |
| M06S03-61 | Missing completion is not satisfied or failed legal truth |
| M06S03-62 | Exact accepted record retains claim/evidence/source provenance |
| M06S03-63 | Missing required evidence-claim coverage requires review |
| M06S03-64 | Empty or unverified completion evidence cannot qualify |
| M06S03-65 | Evidence-source identity and jurisdiction/effectivity are checked |
| M06S03-66 | Multiple records for a cycle require review not last-writer-wins |
| M06S03-67 | Duplicate visible completion IDs are rejected |
| M06S03-68 | Late fixed-cycle completion does not move later deadlines |
| M06S03-69 | Rolling cadence anchors next cycle to accepted completion |
| M06S03-70 | Rolling cadence stops at first missing completion |
| M06S03-71 | Rolling cadence stops at unresolved or contradictory completion |
| M06S03-72 | Early or nonprogressing completion cannot advance a rolling cycle |
| M06S03-73 | Future-known records add no historical metadata or reason |
| M06S03-74 | Unassignable visible records require review without reassignment |
| M06S03-75 | Grace and late completion never extend credential validity |
| M06S03-76 | Credential expiry alone never cancels recurring obligations |
| M06S03-77 | Repeated and reordered input yields deterministic output |
| M06S03-78 | Existing Core/S01/S02 snapshots remain unchanged |
| M06S03-79 | Output is deeply frozen and metadata-only |
| M06S03-80 | No notification authority event history mutation or legal compliance assertion |
