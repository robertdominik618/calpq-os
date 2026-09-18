# CALPQ CountryCredentialPack Contract

ID: CALPQ-GLOBAL-0001-C02. Status: OWNER_APPROVED_TARGET_ARCHITECTURE / NO_PACK_PUBLISHED.
Parent: [GLOBAL](../architecture/CALPQ_GLOBAL_0001_ARCHITECTURE.md). Uses [applicability](GLOBAL_JURISDICTION_APPLICABILITY.md), [sources](GLOBAL_SOURCE_AUTHORITY_GOVERNANCE.md), existing [command/event envelope](COMMAND_EVENT_ENVELOPES.md) and [transaction ordering](APPLICATION_TRANSACTION_SIDE_EFFECT_ORDER.md).

## Versioned content manifest

Required semantic fields: pack_id, package_version, schema_version, compatible_core_contracts, jurisdiction_refs, sector_refs, supported_routes, covered_subject_kinds, effective_interval, owner_ref, authority_mandate_refs, source_snapshot_refs, catalog_definition_refs, rule_version_refs, recognition_refs, localization_coverage_refs, dependencies (ID + exact reviewed version + digest), content_manifest (path + size + digest), review_record_refs, publication_state, coverage_manifest, withdrawal_policy_ref and provenance.

Stable IDs do not derive solely from names or locale. Package release time, legal effective time, last fetched time and reviewed_at are different clocks. Omitted scope is unknown, not wildcard. No zero-dependency assumption for foreign recognition or Family/Health. An empty production pack must not pass by vacuous truth. A discovery-only pack cannot advertise evaluation support.

## Content classification

A payload comprises declarative data conforming to reviewed schemas, not arbitrary scripts, remote imports, expression eval or provider-specific Core patches. Rules use the existing constrained deterministic expression model only after its admission. Binaries (templates/evidence) are separate controlled objects; no user originals in a public content pack. Permitted paths are relative allowlisted members; reject traversal, symlinks, unsafe URLs, oversized decompression and duplicate IDs/members.

## Lifecycle

DRAFT → CANDIDATE → REVIEWED → PUBLISHED → WITHDRAWN or SUPERSEDED are proposed content lifecycle semantics, not new production enums. Publication requires qualified independent review of critical rules, appropriate language review, source-use authorization, schema/compatibility checks, resolved dependencies, coverage evidence and actual deployment authorization. Review cannot substitute for an individual public-authority decision.

GPK-01 Verify each content digest, total manifest and provenance; a checksum only establishes matching bytes, not legal correctness or trust.
GPK-02 A signing-key identity is mapped to reviewed publisher authority and its effective mandate. Unknown/revoked key or conflicting provenance requires review.
GPK-03 Pin evaluated versions and dependency closure; never silently use latest. Cycles, missing or incompatible dependencies fail closed for positive assurance.
GPK-04 Atomic activation updates the active pointer, audit and invalidation/outbox. Retried publication uses stable command ID and expected revision; no duplicate notifications.
GPK-05 Withdrawal disables future reliance, identifies current affected cases and preserves historical snapshots. Rollback is a controlled publication action, not automatic revival of revoked authority.
GPK-06 A fresh content release cannot retroactively rewrite historical decisions. Backdated legal effect is explicit reviewed data, not inferred from publish date.
GPK-07 Legal facts, translated explanations and market availability are separate payload scopes.
GPK-08 Content availability alone cannot activate a paid service or a missing runtime capability.

## Coverage manifest

Every coverage metric has metric_id, declared_scope_id/version, item identity rule, numerator_evidence_refs, denominator_definition/count or UNKNOWN, as_of and limitations. Separate inventory, sources, expert content, workflow, evaluation, external verification and languages. Do not count translations, document instances or designs as new legal types. No whole-country percentage without a justified denominator. Test missing domain groups, expired review, schema change and withdrawn dependencies before delivery.

## Future application actions

PreparePackCandidate, RequestPackReview, PublishPackVersion, WithdrawPackVersion and ReevaluateAffectedScopes use existing envelopes, application access checks, UnitOfWork/outbox and audit. External fetch/notification/registry effects happen through ports after commit. Nothing in this architecture intake implements these handlers, admits a runtime slice or publishes a country pack.
