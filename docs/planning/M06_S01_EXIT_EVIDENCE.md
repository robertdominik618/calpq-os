# M06 Slice 01 — Exit Evidence

Status: `IMPLEMENTED CANDIDATE / EXACT-HEAD VALIDATION REQUIRED / NOT MERGED`.
Tracking #139; parent epic #36.

## Admission and source ordering

Owner instruction: `SCHVALUJI MERGE PR #133 A ZAHÁJENÍ M06 SLICE 01 PO ÚSPĚŠNÉM OVĚŘENÍ MERGE`.
Actual approval: PR #133 comment `5729438587`.
Verified admission merge `0245ba339e019d2f297cb399679bbdee25e53483`, reviewed head `aa266f897f0301ce01f047c44f197c8fd1493c1b`, identical tree `f0b52b4d0531ba89d9572d45bb1a0a180673ffd4`.
Actual post-merge verification: PR #133 comment `5729475571`, independent 68 total / 68 successful merge-associated runs across event types. Original reviewed-head test counts were not relabeled as new merge-SHA runs.
S01 branch `impl/m06-s01-credential-lifecycle-timeline` was created after that verification.
Activation/implementation contract/scenario index commit `daed83cfd66a2d9657ec17998f66ea78be408adc` precedes source. The activation is committed once and retains actual approval/verification references.

## Delivered product behavior

Immutable Application read basis using exact Core artifact/evidence/definition/aggregate contracts and explicit scope/version/knowledge metadata. Recorded Core events are separately bound and filtered by occurrence and knowledge horizons. The public read model presents actual events separately from declared DateOnly issuance/effectivity/expiry facts, retaining precision rather than inventing midnight or legal-state transitions.

Current read authorization is checked on every compose; actor, correlation, tenant, organization, subject, purpose, field scope and jurisdiction remain bound. Duplicate event identities/revisions fail closed. Revision gaps, temporal contradictions, missing causes and cycles are explicit, without historical repair or event loss. Source/evidence/rule metadata and original verification states are preserved. Hidden future events do not contribute output counts or issues. Payloads, raw document data, external identifiers and locators are excluded; output is deeply frozen and deterministic.

History coverage remains PROVIDED_EVENTS_ONLY. Missing expiry never implies unlimited validity. S01 does not calculate renewal policy, recurrence, notification delivery, administrative validity or authorization.

## Required executed evidence

`bash tests/m06_s01_lifecycle_timeline_test.sh` must pass at the exact implementation head:
- immutable activation and approved admission ancestry;
- one-to-one index and execution for all 64 M06S01 scenario identities;
- 14 readonly/public-contract compile assertions with strict application TypeScript compilation;
- no Core/provider source changes or ambient clock/network/authority computation;
- unchanged formal admission and preparation gates, M04 integration, all ten M05 runtime suites, ledger validators, FV09/FV10 and architecture;
- existing M03 activity-timeline runtime regression.

Full same-head PR workflow results remain a separate mandatory gate. This authored document does not certify a future run or its own commit hash. Actual candidate SHA/tree, workflow IDs, decoded logs, pass/failure counts and any corrections are recorded in the implementation PR / issue #139 after execution. Documentation changes require validation of their new head.

## Preserved integration limits

Trusted authentication, current authorization, correct scoped artifact/definition/aggregate associations and known-at timestamps, complete repository loading and audit persistence remain entrypoint/infrastructure responsibilities. Factories validate consistency, not authenticity of client-provided objects. Existing Core event payloads are not interpreted or recursively frozen. There is no live provider, OCR/scanner validation, database implementation, notification transport, user interface, physical deletion or production deployment.

Only the twelve paths already authorized by M06_S01_SCOPE_CONTRACT.md change. Existing production modules, old runtime tests, admission decisions and original regression scripts remain untouched. New S01 PR merge and later-slice continuation are not authorized by this candidate.

**timeline projection != renewal; notification != authority; passage of time != authority event; replay != historical mutation**.
