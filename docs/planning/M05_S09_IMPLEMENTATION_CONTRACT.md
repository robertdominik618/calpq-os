# M05 Slice 09 — Archive Retention, Linking Lifecycle & Evidence Snapshots

Status: `AUTHORIZED / ARCHITECTURE LOCKED / IMPLEMENTATION NOT YET CLAIMED`
Tracking issue: #125; parent epic: #34.
Owner authorization: `SCHVALUJI MERGE PR #124 A POKRAČOVÁNÍ NA M05 SLICE 09`.
Exact predecessor merge: `a65975f7d5bf277da8e0018f436d3c9745bdadbf`.
Architecture preparation may precede completion of predecessor post-merge CI; production implementation requires successful predecessor verification recorded in #125.

## Canonical contracts and ownership

Follow `M05_EXECUTION_PACKAGE.md` slice 9, `docs/contracts/CREDENTIAL_ARCHIVE_LINKING_MODEL.md`, `DOCUMENT_INTAKE_SECURITY_PRIVACY_MODEL.md`, and existing S01–S08 contracts. Reuse Core `EvidenceSnapshot`, S02 `OriginalArchiveEntry`/`OriginalArchiveRelationship`, S03 `DerivedExtractionProposalRecord`, S04 review histories, S05 security assessments, S07 verification results and S08 human-review histories. Do not alter Core, source originals, derived proposals, verification histories or concrete adapters.

**archive link != evidence verification; retention expiry != deletion permission; snapshot != authorization**

## Scoped records and trusted entrypoint

`ArchiveScope` binds exact S01 submission and S02 archive original/intake identity to an explicit tenant, organization and subject. Tenant assignment must come from the trusted repository/authenticated entrypoint, never document content. UUIDs/references are caller supplied; no ambient clock/randomness.

`ArchiveLifecycleGrant` binds a human or system actor to that exact scope, purpose, controlled operation permissions, access-decision/audit provenance, inclusive validity and optional revocation. Explicit command permissions are distinct from access-decision allowed fields. Every start, mutation, snapshot capture and disposal assessment validates the grant, actor, tenant, organization, subject, purpose, operation, access-decision reference and execution time. Replay checks authorization first. Factories validate consistency, not authentication or authentic grant issuance: trusted services must load current grants, full state and dependencies. Clients cannot manufacture grants through JSON.

## Retention policy

`ArchiveRetentionPolicy` retains the exact original retention-policy reference, version, authoritative decision/source reference, reviewed-at time, retain-through instant (null = indefinite) and mandatory next policy-review instant. No statutory durations are hardcoded or inferred. A policy remains usable only before its next review instant. Inclusive retention means disposal consideration is possible strictly AFTER retain-through.

Policy replacement is an explicit auditable transition, preserves original policy references/history, requires a different version and nonregressing reviewed-at time. Policy shortening is possible only as a separately authorized retention-policy operation; it is never inferred from credential expiry. Expired policies trigger review rather than automatic deletion.

## Links and document relationships

Seven controlled relations: EVIDENCES_CREDENTIAL, EVIDENCES_REQUIREMENT, SUPPORTS_RECOGNITION, SUPPORTS_RENEWAL, SUPPLEMENTS_DOCUMENT, SUPERSEDES_DOCUMENT, RELATED_TO_SUBJECT. Each immutable link carries source archive identity, target kind/reference and tenant/organization scope, relation, claim/scope reference, source/version/decision provenance, recorded/effective instants and original evidence status.

Document links require an exact S02 SUPPLEMENTS or REPLACES relationship and an explicit same-tenant/same-organization target ArchiveScope. Relationship creation does not alter either document, evidence state or credential validity. Subject links must match the archive-bound subject. Other targets are references resolved and ownership-checked by the trusted entrypoint, not legal decisions. Self-links and duplicate active or previously used link IDs are rejected.

UNLINK only removes a current logical association; prior link objects remain in append-only events and captured snapshots. All still-registered links (including future-effective or expired links) block disposal until explicitly detached. Link expiry alone is not proof that historical consumers no longer require the original.

## Holds, snapshots and lineage

Holds carry explicit reference, basis/evidence reference, start and optional end. Active and future holds block disposal; released holds remain in history. Release is a separate permissioned action, not ordinary editing.

`ArchiveEvidenceSnapshot` captures an exact lifecycle revision and Core EvidenceSnapshot, original plus explicitly supplied derived records with every parent included. Foreign roots, duplicated IDs, missing/interchanged parents and evidence acquired after capture are rejected. Supplied S04 review histories must bind exact included derived records. Supplied S07 results and S08 histories must bind captured evidence and matching subject/tenant where available and may not be newer than the snapshot cutoff. S05 security is preserved separately, never treated as verification.

Snapshots preserve source versions, link state, policy, review and verification provenance and claim-level results without promoting original or extraction verification state. Safe JSON summaries exclude raw bytes, extracted values, filenames and storage locations. Internal Core snapshots still retain content references needed by authorized replay; serialization is not authorization.

Capture is read-only; PIN_SNAPSHOT registers the snapshot in the lifecycle with an explicit preserve-through time. Persisting a snapshot and its pin must be atomic. A pin can be released only strictly after preserve-through; null means indefinite and cannot be silently released. Released snapshots remain in event history. Legal retention reconsideration of an indefinite snapshot is outside this bounded slice, not a bypass flag.

Historical snapshots are immutable evidence of what was known, not claims that evidence is still currently valid. After logical unlinking, historical snapshots retain original relationships and statuses. Actual physical purging, external dependency reconciliation and cross-archive supersession-cycle detection remain governed integration responsibilities; S09 emits no storage deletion operation.

## Dependency inventory and logical disposal

`ArchiveDependencyInventory` binds the exact lifecycle object/revision to a COMPLETE or INDETERMINATE external dependency observation, source/version/reference, observation time and freshness deadline. It must list required derived descendants, linked consumers in other stores, unresolved reviews, audit/legal dependencies and byte-level historical replay dependencies. An empty array alone does not prove completeness. The trusted dependency provider supplies the governed COMPLETE attestation; uncertain, stale or wrong-revision inventories cannot support disposal.

`ArchiveDisposalAssessment` deterministically returns RETAIN, REVIEW_REQUIRED or DISPOSAL_CANDIDATE with reason codes. A candidate requires current reviewed policy, elapsed finite retention, no registered links, relevant holds or pins, and a fresh complete empty dependency inventory. Every outcome explicitly has `physicalDeletionAuthorized=false`.

TOMBSTONE requires an assessment bound to the exact current lifecycle at the same explicit execution instant and a separate disposal command permission. It only marks logical status TOMBSTONED; original bytes/references/hashes and audit events remain unchanged. No file/object deletion, crypto-shredding, key removal or external action is implemented or invoked. Terminal histories reject new mutations; authorized exact replays remain idempotent.

## Commands, audit and concurrency

Commands carry stable CommandId, exact ArchiveScope, controlled discriminated change payload, reason reference, submitted-at time and idempotency key. Supported changes: LINK, UNLINK, PLACE_HOLD, RELEASE_HOLD, REPLACE_POLICY, PIN_SNAPSHOT, RELEASE_SNAPSHOT, TOMBSTONE.

Transitions copy/freeze collections and append a decision event with command, authenticated execution context and grant provenance. Same key plus identical canonical command AND same actor returns the same lifecycle without revision growth. Different payload/actor, reused command ID, stale/invalid revision, backdated submission or replay, foreign scope and invalid terminal mutations fail closed. Reused link/hold/snapshot IDs cannot rewrite historical identity.

These are logical optimistic revisions, not database locks. Trusted services must atomically persist state, command uniqueness, audit and outbox via the existing UnitOfWork, including current grant and dependency consistency. No competing repository writer is introduced.

## Evidence and exit

56 mandatory runtime scenarios with identity-matched index, strict readonly TypeScript compile proof, architecture/index-before-code ancestry, zero Core/provider-adapter diff, no ambient time/randomness/framework/provider SDK. Dedicated exact-head workflow checks S09 and S08 evidence; existing same-head S07 transitive and FV13/architecture regressions must also pass. GitHub execution logs, not counts or planned tests alone, are acceptance evidence. PR merge and S10 continuation require separate owner approval.
