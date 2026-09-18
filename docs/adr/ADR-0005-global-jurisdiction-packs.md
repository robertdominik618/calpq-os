# ADR-0005 — Global jurisdiction packs over one CALPQ Core

Date: 2026-09-18. Decision: OWNER_APPROVED_TARGET_ARCHITECTURE. Scope: ARCHITECTURE_ONLY.
Owner record: [#137](https://github.com/robertdominik618/calpq-os/issues/137).

## Context

The owner approved all of CALPQ-GLOBAL-0001 and its 93-market/94-seed/35-language planning inventory. The existing EXPATS branch defines MobilityCase and shared localization but is not merged. Existing Core/Catalog/Recognition/Family/Lifecycle contracts must remain singular. A market list, translated name, public template or valid signature is not proof of activity permission.

## Decision

Adopt the complete [GLOBAL baseline](../architecture/CALPQ_GLOBAL_0001_ARCHITECTURE.md), all 28 subordinate chapters, all source registries and all 40 specified product scenarios. Use source-preserving adoption metadata and explicit errata; do not overwrite prior proposal states or silently repair unsupported external facts.

Add semantic jurisdiction/applicability and CountryCredentialPack contracts; specialize existing Recognition and shared Localization by append-only cross-links. Separate legal rules, evidence, translations, market availability and paid software access. Reuse approved stack and deterministic Core; new countries primarily add reviewed data, not executable plugins or per-country services.

Support national/subnational/overlapping scopes and temporal mandates without automatic inheritance or most-restrictive-wins. Recognition is directional, non-symmetric and not implicitly transitive. Match exact subject/target/interval; do not transfer premises/organization permission to individuals.

Use three service strata: document administration; reviewed catalogue/paths; scoped evaluation/verification. First commercial hypothesis is Workforce Passport plus personal/family products, not unverified universal legal advice. Preserve all market/language waves, pilot constraints, prices as experiments, economic illustrations and no-lock-in/minimum-disclosure boundaries.

## Alternatives and consequences

Reject copying 1500 Czech labels across countries, one Core per country, a nationality-only router, a global automatic equivalence closure and a single misleading country coverage percentage. Reject treating a source inventory or product test specification as released functionality.

Costs: qualified local/sector/language review, source-use governance, provider permissions, maintenance, security and release evidence. Benefits: portable individual history, reusable platform, granular useful pilots and independent legal/commercial truth. No new runtime enums, DB migrations, endpoints or dependency upgrades are admitted now; future implementation requires precise bindings and regression/rollback tests.

## Integration and acceptance

ADR-0005 follows existing ADR-0004; ADR-0003 belongs to the separate health proposal. Branch based on exact EXPATS commit 5b8b655b4b0102c4513c79ca996068c99b949e0e, retaining open #135 and blocker #136 rather than copying or merging them. #133 admission and all old guards remain untouched. New content/validator tests prove structural integrity and provenance only; full CI and reviewed merge are separate. A green dedicated check cannot waive a failed existing gate.

Supersession requires a new documented decision, source mapping and provenance. No silent deletion of approved countries, languages, sectors, scenarios or safety rules. Approval of this architecture does not activate any market, price, provider, public legal rule or production product.
