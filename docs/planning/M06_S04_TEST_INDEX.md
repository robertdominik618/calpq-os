# M06 Slice 04 — Mandatory Test Index

Status: `PLANNED / NO EXECUTED RESULTS CLAIMED`. Tracking #145; epic #36.
All IDs must execute, in documented order, with zero skipped/todo tests. Contract: M06_S04_IMPLEMENTATION_CONTRACT.md.

| ID | Required scenario |
|---|---|
| M06S04-01 | Exact immutable definition preserves S01 basis and approved plan |
| M06S04-02 | Invalid case and plan references rejected |
| M06S04-03 | Ungoverned definition and party inputs rejected |
| M06S04-04 | Creation cannot predate basis knowledge |
| M06S04-05 | Required document claims dense bounded unique |
| M06S04-06 | Exact required S03 occurrence association |
| M06S04-07 | Foreign occurrence basis rejected |
| M06S04-08 | Duplicate or invalid occurrence sequences rejected |
| M06S04-09 | Definition collections copied and frozen |
| M06S04-10 | Separate definition version preserves prior definition |
| M06S04-11 | Valid evidence package preserves provenance |
| M06S04-12 | Foreign S02 basis rejected |
| M06S04-13 | Ungoverned package evidence and evaluation rejected |
| M06S04-14 | Package recording and validity ordered |
| M06S04-15 | Future-known evaluation or evidence rejected |
| M06S04-16 | Covered claims dense bounded unique |
| M06S04-17 | Matching S03 projection retained |
| M06S04-18 | Foreign S03 projection rejected |
| M06S04-19 | Duplicate projection identity rejected |
| M06S04-20 | Package metadata immutable and excludes locators |
| M06S04-21 | Valid independently granted actor scope |
| M06S04-22 | Nonhuman grantee rejected |
| M06S04-23 | Self grant rejected |
| M06S04-24 | Invalid and duplicate permissions rejected |
| M06S04-25 | Invalid grant validity and revocation rejected |
| M06S04-26 | Exact authorized opening starts draft revision0 |
| M06S04-27 | Denial before sensitive processing |
| M06S04-28 | Cross tenant denied |
| M06S04-29 | Cross organization denied |
| M06S04-30 | Subject identity and kind mismatch denied |
| M06S04-31 | Actor identity and kind mismatch denied |
| M06S04-32 | Purpose mismatch denied |
| M06S04-33 | Correlation mismatch denied |
| M06S04-34 | Operation and field permission required |
| M06S04-35 | Access reference mismatch denied |
| M06S04-36 | Unknown tenant and foreign grant denied |
| M06S04-37 | Expired and revoked grants denied |
| M06S04-38 | Wrong action permission denied |
| M06S04-39 | Calendar must match invocation instant |
| M06S04-40 | Guarded read rechecks current authorization |
| M06S04-41 | Core command identity and immutable revision required |
| M06S04-42 | Unknown actions and extra payload fields rejected |
| M06S04-43 | Foreign package or observation rejected |
| M06S04-44 | Submission time cannot predate definition |
| M06S04-45 | Canonical command and nested inputs immutable |
| M06S04-46 | Prepare appends one immutable record |
| M06S04-47 | Cannot mark draft ready or skip preparation |
| M06S04-48 | Attach current package preserves history |
| M06S04-49 | Missing package produces explicit blocker |
| M06S04-50 | Qualified package marks ready |
| M06S04-51 | Missing required claim blocks readiness |
| M06S04-52 | Unverified package evidence blocks readiness |
| M06S04-53 | Wrong or unverified package source blocks readiness |
| M06S04-54 | Expired package blocks readiness |
| M06S04-55 | Renewal not open blocks readiness |
| M06S04-56 | Due date is inclusive but grace not readiness permission |
| M06S04-57 | Unknown or ambiguous expiry evaluation blocks readiness |
| M06S04-58 | Missing mandatory obligation projection blocks readiness |
| M06S04-59 | Unaccepted required occurrence blocks readiness |
| M06S04-60 | Accepted required occurrence permits scoped readiness |
| M06S04-61 | Package replacement invalidates readiness |
| M06S04-62 | Reused package reference cannot overwrite history |
| M06S04-63 | Receipt required to record external submission |
| M06S04-64 | Verified exact receipt creates submitted state without transport |
| M06S04-65 | Foreign recipient or unverified receipt rejected |
| M06S04-66 | Actual late receipt retained without extending validity |
| M06S04-67 | Future or pre-readiness external occurrence rejected |
| M06S04-68 | Repeated receipt cannot create a second submission |
| M06S04-69 | Information request binds active submission and adds claims |
| M06S04-70 | Supplemental package must cover requested claims |
| M06S04-71 | Supplemental submission increments round and preserves previous receipt |
| M06S04-72 | Outcome must bind current submission and package |
| M06S04-73 | Independently recorded renewal closes workflow only |
| M06S04-74 | Externally recorded rejection does not revoke credential |
| M06S04-75 | Applicant or submitting actor cannot record outcome |
| M06S04-76 | Unverified outcome never becomes renewal or legal rejection |
| M06S04-77 | Cancellation is internal and leaves external history intact |
| M06S04-78 | Terminal histories reject new commands |
| M06S04-79 | Exact same-actor replay leaves identity and revision unchanged |
| M06S04-80 | Key collision changed command rejected |
| M06S04-81 | Command identity collision with new key rejected |
| M06S04-82 | Stale revision produces distinct concurrency error |
| M06S04-83 | Invocation and submission chronology monotonic |
| M06S04-84 | Replay rechecks revoked access and actor identity |
| M06S04-85 | Foreign command cannot cross histories |
| M06S04-86 | Output immutable and metadata-only |
| M06S04-87 | Deterministic replay and original S01–S03 objects unchanged |
| M06S04-88 | No automatic authority event, transport or physical mutation |

Additional evidence:16 scope/governance scenarios,16 readonly assertions, exact prior scope/activation provenance, S03/S02/S01 runtime and transitive admission/preparation/M04/M05/FV09/FV10/timeline regressions on current checkout, full same-head workflow matrix. Test identities and counts are checked independently; results are not assumed from this index.
