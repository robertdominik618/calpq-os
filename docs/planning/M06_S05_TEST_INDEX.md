# M06 Slice 05 — Mandatory Test Index

Status: `PLANNED / NO EXECUTED RESULTS CLAIMED`. Tracking #147; epic #36.
All IDs must execute in documented order with zero skipped/todo tests. Contract: M06_S05_IMPLEMENTATION_CONTRACT.md.

| ID | Required scenario |
|---|---|
| M06S05-01 | Exact immutable policy preserves identity, version, credential definition and jurisdiction |
| M06S05-02 | Ungoverned policy identity or version rejected |
| M06S05-03 | Policy source and approving actor must be governed |
| M06S05-04 | Source retrieval cannot postdate policy knowledge |
| M06S05-05 | Approval cannot postdate policy knowledge |
| M06S05-06 | Policy effectivity range cannot be inverted |
| M06S05-07 | Policy credential definition and jurisdiction are explicit |
| M06S05-08 | Stage collection must be bounded and dense |
| M06S05-09 | Empty stage collection rejected |
| M06S05-10 | Stage IDs must be unique |
| M06S05-11 | Stage levels must be unique and strictly ordered |
| M06S05-12 | Unknown stage fields rejected |
| M06S05-13 | Controlled trigger anchors only |
| M06S05-14 | Controlled intent kinds only |
| M06S05-15 | Audience purpose requires bounded opaque reference |
| M06S05-16 | Stage offset quantity is explicitly bounded |
| M06S05-17 | Dedup window quantity is explicitly bounded |
| M06S05-18 | Policy stage collection copied and frozen |
| M06S05-19 | Policy serialization excludes provider/contact data |
| M06S05-20 | Separate policy version preserves prior policy |
| M06S05-21 | Observation preserves exact basis policy and stage identity |
| M06S05-22 | Ungoverned observation basis or policy rejected |
| M06S05-23 | Observation policy version mismatch rejected |
| M06S05-24 | Observation foreign stage rejected |
| M06S05-25 | Controlled observation kind required |
| M06S05-26 | Observation occurrence and recorded chronology validated |
| M06S05-27 | Future-recorded observation rejected by projection horizon |
| M06S05-28 | Observation dedup key must match deterministic identity |
| M06S05-29 | Observation audience purpose mismatch rejected |
| M06S05-30 | Observation trigger identity mismatch rejected |
| M06S05-31 | Duplicate observation identity rejected |
| M06S05-32 | Observation collection bounded and dense |
| M06S05-33 | Observation metadata immutable and provider-neutral |
| M06S05-34 | Explicit scoped invocation is required |
| M06S05-35 | Access denial occurs before projection |
| M06S05-36 | Cross-tenant projection denied |
| M06S05-37 | Cross-organization projection denied |
| M06S05-38 | Subject identity mismatch denied |
| M06S05-39 | Subject kind mismatch denied |
| M06S05-40 | Actor identity mismatch denied |
| M06S05-41 | Actor kind mismatch denied |
| M06S05-42 | Purpose mismatch denied |
| M06S05-43 | Correlation mismatch denied |
| M06S05-44 | Operation and field permission required |
| M06S05-45 | Access decision reference mismatch denied |
| M06S05-46 | Calendar must match invocation instant |
| M06S05-47 | Basis knowledge cannot exceed evaluation horizon |
| M06S05-48 | S02 evaluation must bind exact lifecycle basis |
| M06S05-49 | Foreign S02 evaluation rejected |
| M06S05-50 | Unresolved S02 evaluation yields review required |
| M06S05-51 | Ambiguous S02 policy yields review required |
| M06S05-52 | Missing renewal window trigger yields review required when required |
| M06S05-53 | Window-open trigger selects due stage on threshold |
| M06S05-54 | Renewal-due trigger selects due stage on threshold |
| M06S05-55 | Grace-end trigger selects due stage on threshold |
| M06S05-56 | Threshold before applicability remains suppressed |
| M06S05-57 | Highest crossed stage deterministically wins |
| M06S05-58 | Lower crossed stages recorded as superseded reasons |
| M06S05-59 | Single applicable base stage yields DUE not ESCALATED |
| M06S05-60 | Higher applicable level yields ESCALATED |
| M06S05-61 | Escalation cannot be inferred from failed delivery alone |
| M06S05-62 | Escalation cannot be inferred from silence or missing acknowledgement |
| M06S05-63 | Equivalent recorded observation inside dedup window suppresses |
| M06S05-64 | Equivalent delivered observation inside dedup window suppresses |
| M06S05-65 | Equivalent acknowledged observation inside dedup window suppresses |
| M06S05-66 | Observation outside dedup window does not suppress current intent |
| M06S05-67 | Foreign dedup key never suppresses current intent |
| M06S05-68 | Different stage identity never deduplicates current stage |
| M06S05-69 | Different audience purpose never deduplicates current audience |
| M06S05-70 | Failed observation does not fabricate successful delivery |
| M06S05-71 | Suppressed observation remains historical and does not delete evidence |
| M06S05-72 | Stable dedup key is deterministic across equivalent evaluation |
| M06S05-73 | Changed policy version changes dedup identity |
| M06S05-74 | Changed trigger identity changes dedup identity |
| M06S05-75 | Optional S04 history must bind exact basis |
| M06S05-76 | Foreign renewal case history rejected |
| M06S05-77 | Terminal renewal recorded state suppresses obsolete renewal reminder |
| M06S05-78 | Terminal rejection recorded state suppresses obsolete renewal reminder |
| M06S05-79 | Internal cancelled state suppresses case reminder without credential mutation |
| M06S05-80 | Submitted state does not fabricate renewal completion |
| M06S05-81 | Awaiting information state does not fabricate legal urgency |
| M06S05-82 | Missing case history does not fabricate workflow state |
| M06S05-83 | Recurring-obligation trigger requires exact supplied projection |
| M06S05-84 | Foreign obligation projection rejected |
| M06S05-85 | Missing required occurrence trigger yields review required |
| M06S05-86 | Exact occurrence date can drive configured stage |
| M06S05-87 | Observation earlier than policy effectivity cannot suppress current intent |
| M06S05-88 | Future-known case or observation data fails closed |
| M06S05-89 | Projection reason codes are unique and deterministic |
| M06S05-90 | Projection output is deeply readonly |
| M06S05-91 | Projection exposes no raw evidence or storage locators |
| M06S05-92 | Projection exposes no email phone provider token or message body |
| M06S05-93 | Projection preserves explicit negative authority flags |
| M06S05-94 | Replay with identical governed inputs is byte-stable |
| M06S05-95 | Input policy observations and case history remain unchanged |
| M06S05-96 | Maximum bounded observation ledger accepted and overflow rejected |
