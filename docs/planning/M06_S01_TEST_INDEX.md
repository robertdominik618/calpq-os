# M06 Slice 01 — Mandatory Runtime Scenario Index

Status: `PLANNED BEFORE SOURCE / EXECUTED RESULTS NOT YET CLAIMED`.
Tracking #139; contract `M06_S01_IMPLEMENTATION_CONTRACT.md`.
Runtime `packages/application/test/m06-s01-lifecycle-timeline.test.ts`; readonly proof `packages/application/test/m06-s01-types.compile.ts`.
Exactly these 64 identities must execute; a numeric total without the matching identities or with skip/todo/cancellation is insufficient.

| ID | Mandatory evidence |
|---|---|
| M06S01-01 | Governed artifact basis and exact snapshot identity |
| M06S01-02 | Subjectless or structural fake artifacts rejected |
| M06S01-03 | Tenant organization and purpose require governed references |
| M06S01-04 | Credential-definition and artifact versions preserved and typed |
| M06S01-05 | Source retrieval cannot exceed basis recorded time |
| M06S01-06 | Evidence capture cannot exceed basis recorded time |
| M06S01-07 | Duplicate source/version identities rejected |
| M06S01-08 | Duplicate rule-version references rejected |
| M06S01-09 | Basis collections copied and frozen |
| M06S01-10 | Invalid or raw-content basis reference rejected |
| M06S01-11 | Only an existing governed EventEnvelope may be bound |
| M06S01-12 | Event aggregate identity mismatch rejected |
| M06S01-13 | Event aggregate type mismatch rejected |
| M06S01-14 | Foreign or duplicate event evidence references rejected |
| M06S01-15 | Event known-at cannot predate occurrence |
| M06S01-16 | Self-causation and duplicate event provenance/version refs rejected |
| M06S01-17 | Effective-at remains distinct from occurrence and knowledge |
| M06S01-18 | Event cannot cross exact basis snapshots |
| M06S01-19 | Properly authorized scoped read succeeds |
| M06S01-20 | Missing invocation tenant or subject rejected |
| M06S01-21 | Unknown tenant rejected |
| M06S01-22 | Organization mismatch rejected |
| M06S01-23 | Subject identity or kind mismatch rejected |
| M06S01-24 | Purpose mismatch rejected |
| M06S01-25 | Explicit DENY cannot be overridden |
| M06S01-26 | Access-decision reference and tenant remain bound |
| M06S01-27 | Missing minimum field permission rejected |
| M06S01-28 | Authorized reader actor must match invocation actor |
| M06S01-29 | Authorized reader correlation must match invocation |
| M06S01-30 | Only the exact lifecycle read operation is allowed |
| M06S01-31 | Requested jurisdiction must match basis |
| M06S01-32 | Denial occurs before invalid or sensitive basis processing |
| M06S01-33 | Evaluation cannot exceed invocation time |
| M06S01-34 | Knowledge cutoff cannot exceed invocation time |
| M06S01-35 | Future-known basis cannot enter historical query |
| M06S01-36 | Inclusive knowledge and occurrence equality boundaries |
| M06S01-37 | Future-known event creates no output ID count or issue leak |
| M06S01-38 | Future-occurred event excluded from historical occurrence lane |
| M06S01-39 | Evaluation and knowledge axes remain independently explicit |
| M06S01-40 | DateOnly values never become fabricated midnight events |
| M06S01-41 | Leap-day and same-day calendar facts retain exact precision |
| M06S01-42 | Missing expiry is explicit uncertainty not unlimited validity |
| M06S01-43 | Missing dates issuer and events receive stable explanations |
| M06S01-44 | Source ID version retrieval and verification metadata retained |
| M06S01-45 | Missing source/rule provenance explicitly reported |
| M06S01-46 | Unverified input remains unverified after projection |
| M06S01-47 | Passage of time never creates expiry renewal or authority event |
| M06S01-48 | Future effective-at is preserved without fabricating state |
| M06S01-49 | Event and calendar ordering independent of input order |
| M06S01-50 | Equal occurrence times have explicit non-causal ordering |
| M06S01-51 | Duplicate visible event IDs rejected |
| M06S01-52 | Duplicate visible aggregate revisions rejected |
| M06S01-53 | Contradictory revision chronology flagged without lost events |
| M06S01-54 | Revision gaps reported without inventing events |
| M06S01-55 | Missing and forward-pointing causes remain explicit |
| M06S01-56 | Causation cycles detected without rewriting history |
| M06S01-57 | Old and new basis views remain isolated and immutable |
| M06S01-58 | Serialization excludes locators identifiers and nested payloads |
| M06S01-59 | Output deeply frozen including nested arrays |
| M06S01-60 | Upstream objects and nested payloads not mutated or frozen |
| M06S01-61 | Evidence classes hashes verification and source versions preserved |
| M06S01-62 | Existing M03 presentation references and ordering reused |
| M06S01-63 | Sparse or over-budget collections rejected without truncation |
| M06S01-64 | Repeated serialization deterministic; authority and completeness not fabricated |

Additional gates: readonly compile proof; exact admission/activation ancestry; permitted-path checks; no Core/provider/UI or prior runtime-test edits; current-head admission/preparation/M04/M05 regressions; whole PR workflow matrix. Final results belong to the exact tested SHA and are recorded after execution.
