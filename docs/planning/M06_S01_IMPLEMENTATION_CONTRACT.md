# M06 Slice 01 — Credential Lifecycle Timeline Projection

Status: `ACTIVATED AFTER VERIFIED ADMISSION / CONTRACT BEFORE SOURCE / IMPLEMENTATION PENDING`.
Tracking #139; parent epic #36; admission #132 / PR #133.
Owner: `SCHVALUJI MERGE PR #133 A ZAHÁJENÍ M06 SLICE 01 PO ÚSPĚŠNÉM OVĚŘENÍ MERGE`.
Admission merge `0245ba339e019d2f297cb399679bbdee25e53483`, reviewed head `aa266f897f0301ce01f047c44f197c8fd1493c1b`, tree `f0b52b4d0531ba89d9572d45bb1a0a180673ffd4`.
Actual owner and completed 68/68 merge-associated run verification: PR #133 comments `5729438587` and `5729475571`. Counts span event types, not distinct suites.

## Ownership and reuse

Implement only the first slice of the unchanged M06 execution plan and `M06_S01_SCOPE_CONTRACT.md`. Reuse Core CredentialArtifact, CredentialDefinitionReference, EvidenceSnapshot, SourceReference, EventEnvelope, AggregateId/Type, Revision, DateOnly, UtcInstant and VersionId; ApplicationExecutionContext, tenant/access contracts; and M03 ActivityTimelineOrdering/ActivityTimelineReference presentation contracts. No new evidence store, authority registry, domain clock, scheduler or duplicate domain event type.

**timeline projection != renewal; notification != authority; passage of time != authority event; replay != historical mutation**.

## Exact immutable read basis

`CredentialLifecycleBasis` binds one exact governed artifact/evidence snapshot to an explicit artifact version, credential-definition version, aggregate identity/type, tenant, organization, purpose, jurisdiction, snapshot reference and recorded-at knowledge time. It is a scoped Application join, not a replacement for Core EvidenceSnapshot. Source versions and rule-version references are retained, never guessed. Missing source/rule metadata is an explicit issue, not implied authority. Duplicate exact source/version identities or duplicate rule versions are rejected. Evidence capture and source retrieval cannot postdate the basis record.

No automatic latest-version selection occurs. A trusted loader selects the intended basis; one query cannot mix nominally similar objects from different snapshots. Subjectless artifacts cannot be safely projected and are rejected. The basis/definition/aggregate association and recorded-at timestamp must originate from trusted scoped storage; a constructor does not authenticate arbitrary JSON or prove the association.

## Recorded events versus calendar facts

`CredentialLifecycleEventBinding` accepts an existing Core EventEnvelope, never creates a domain event. It binds that envelope to the exact basis, matching aggregate identity/type and evidence IDs contained in its snapshot. Known-at is independently supplied and cannot predate occurrence. Optional effective-at is preserved separately and can legitimately precede or follow occurrence; it is not inferred from the payload. Duplicate evidence/version/provenance references and self-causation are rejected. Payload bytes and arbitrary nested values are never read by the projection.

The read model has two explicit precision lanes:
- `events`: actually supplied recorded events, ordered occurred-at descending with a lexical event-ID tie-break explicitly marked non-causal, matching the existing M03 ordering contract;
- `calendarFacts`: exact issuedOn/effectiveFrom/expiresOn DateOnly values declared by the artifact, ordered calendar date then kind. These facts do not create issuance/expiry/renewal/revocation events. DateOnly is never converted to midnight, UTC, an interval or a computed due state.

No CURRENT/LAPSED/UPCOMING_RENEWAL/legal validity decision is calculated in S01. Calendar timezone interpretation, inclusive/exclusive expiry, recurring dates and renewal-policy evaluation belong to later separately approved work. Missing expiry is not unlimited validity; missing issuance/effectivity/issuer/source/rule information receives explicit reason codes.

## Query and knowledge boundaries

`CredentialLifecycleTimelineReadModel.compose` takes ApplicationExecutionContext, independently supplied authorized TenantContext, TenantBoundary, TenantAccessDecision, exact basis, event bindings, requested jurisdiction, evaluatedAt and asKnownAt. Operation is exactly `credential.lifecycle.timeline.read`; minimum necessary field permission is exactly `credential:lifecycle-timeline`. Actor/kind, correlation, tenant, organization and purpose must match between authorized reader and invocation; access reference/tenant/purpose/disposition must match and subject/jurisdiction must match the basis. Access-denied errors are generic and precede data-dependent processing. `decidedBy` remains the policy decision-maker, not the granted reader.

Both evaluatedAt and asKnownAt must not exceed invocation time. Basis recordedAt must not exceed asKnownAt. These are separate axes: historical evaluation using later-known information is allowed when explicitly requested. Visible events require knownAt <= asKnownAt AND occurredAt <= evaluatedAt. Events outside these horizons contribute neither IDs, counts nor issue messages to the output. Same-scope binding validity is still required for all input envelopes. Hidden event data is not consulted to explain visible causation.

Read permission is checked on every compose invocation. No cache or permission-bypassing fast path exists. Trusted entrypoints remain responsible for authentication, current authorization, genuinely scoped loading, correct artifact/aggregate associations and audit persistence. Serialization itself is not an authorization gate. This module performs no database read/write or network I/O and claims no persistence/production-authentication proof.

## Ambiguity and chronology

After horizon filtering, duplicate event IDs or aggregate revisions are rejected even when other fields agree. Reordering is never a conflict-resolution policy. Out-of-order occurrence versus increasing revisions, revision gaps, missing event causes, causation pointing forward and causation cycles are surfaced as stable issues without silently repairing or deleting events. Equal timestamps use a non-causal stable ordering and explicit informational issue. References to causes not in the provided visible set stay unresolved, regardless of whether the caller omitted them or they are outside the historical horizon.

History coverage is always `PROVIDED_EVENTS_ONLY`. Passing a partial set or a sequence with no gaps does not prove the whole lifecycle is complete. Missing event evidence and rule references are explicit issues; unknown rule versions are not silently borrowed from the basis.

## Privacy, output and determinism

Only typed identifiers, versions, controlled event types, actor identifiers/kinds, timestamps, DateOnly facts, safe source/evidence metadata, hashes, verification-state codes and existing M03 navigation references are emitted. No source URL, storage/content locator, external artifact identifier, raw document or event payload is emitted. All output records and arrays are newly composed and deeply frozen; upstream domain objects are not mutated, recursively frozen or promoted. Verification states are copied, not recalculated. Canonical arrays use explicit binary lexical comparison rather than host-locale sorting.

Input collections are dense, typed and bounded at 10,000 entries each; over-budget input is rejected, never silently truncated. Query inputs use governed values, not unvalidated timestamp strings. Repeat composition with equivalent valid input ordering yields identical output. No ambient clock/randomness, external provider or side effect.

## Exit gate and scope

64 mandatory scenario identities and readonly compile assertions; exact immutable activation and contract/index-before-source; original admission, preparation, M04/M05 runtime/type/architecture regressions; dedicated exact-head workflow; complete same-head PR matrix. Failed/skipped/cancelled/todo scenarios are not acceptable. Only the twelve paths admitted in `M06_S01_SCOPE_CONTRACT.md` may change; predecessor source/tests/admission remain frozen. Exit evidence must distinguish authored requirements from actual executed results and identify the exact commit.

No S01 merge, S02+ implementation or production release is authorized by this contract. Product progress is reported from accepted slice evidence, not by editing the historical admission decision's counters. M05 remains accepted 100%; no delivered M06 product slice is credited at contract creation.
