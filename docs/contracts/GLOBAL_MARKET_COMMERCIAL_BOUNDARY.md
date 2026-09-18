# CALPQ Global Market Availability & Commercial Boundary

ID: CALPQ-GLOBAL-0001-C05. Status: OWNER_APPROVED_TARGET_ARCHITECTURE / SALES_AND_BILLING_NOT_ACTIVATED.
Parent: [GLOBAL](../architecture/CALPQ_GLOBAL_0001_ARCHITECTURE.md). Reuse [MobilityCase](EXPAT_MOBILITY_CONTEXT.md), [Access Policy](ACCESS_POLICY_MODEL.md), [AssignmentGuard](B2B_ASSIGNMENT_GUARD.md) and [privacy](../security/GLOBAL_PRIVACY_OPERATIONS.md).

## Separate capability dimensions

MarketAvailability: operator/entity, product/service tier, served territory, customer category, delivery channel, relevant data region, payment/provider support, legal/consumer/tax/data-transfer review refs, effective interval, support coverage, runtime release ref and explicit activation decision. Missing critical review or capability means not activated; language availability is insufficient.

ProductEntitlement describes software functions, quotas and commercial plan. It is not a professional AuthorizationGrant, RecognitionDecision, residence/work status or guardian authority. Keep separate namespaces, APIs, permissions, event names and tests to prevent ambiguity around the word entitlement. A paid seat must not bypass a required source/review or grant another person's data.

## Products and first paid use case

Keep Free, Personal, Family, Professional, Employer/Institution and Specialist Workspace. First Workforce Passport pilot manages staff evidence, requested documents, confirmed dates, multilingual tasks, minimal sharing, audit and export. Any legal assignment/evaluation capability is advertised only for supported reviewed scopes. A blank country catalogue cannot be compensated by a disclaimer attached to a green result.

Pricing hypotheses retained: Personal 49 EUR/year; Family 89; Professional 99; Employer Starter 149 EUR/month with illustrative 25 active profiles; illustrative additional profile 3 EUR/month. Setup, specialist service and API have separate quotations. Approval of architecture is not authorization to charge, final consumer pricing, tax determination or consent to a subscription. Software fees, specialist fees and public-authority fees remain distinct line concepts. Local tax/payment/provider conditions are reviewed before offer activation.

## Economics and measurement

Original planning weights: problem/willingness 25, distribution 20, source/reviewer 20, reuse 15, economics/complexity 10, population 10; total 100. No fabricated country scores. Store versioned measurement/currency/time/provenance and distinguish unknown from zero. Population normalization is disclosed; area affects complexity assumptions, not user worth or legal decisions.

Illustrative monthly equivalent: 10*149+300*49/12=2715; 100*149+3000*49/12=27150 EUR, assuming hypothetical net tax-free model inputs. Not cashflow, profit or forecast. Content illustration: 500*0.5+50*3=400 hours; 400*60=24000 EUR, excluding engineering/translation/security/maintenance. Maintain cost of content review, cloud/OCR/storage, support, acquisition, payment fees/refunds, incident rework and retention. Do not report revenue as profitability.

## Distribution and consent

Organization→worker, issuer/training→graduate and person→relying party are opt-in/value-driven channels. CSV import or possession of an email address cannot create an account/consent. Keep invitation identity, purpose, expiry, limits and acceptance; retries must not spam. A relying party can access a permitted limited presentation without forced marketing signup, subject to appropriate authentication for sensitive content. Changing employer/payer does not transfer ownership or access. Never award credits for uploading other people's sensitive records.

## Acquisition content

Public index pages require meaningful local reviewed content, declared scope, sources and freshness. No mass country-name-swapped filler. Search/canonical/hreflang design is presentation; cannot manufacture legal truth. Community findings enter moderation and expert review. Sponsor/referral relationships are visible. Marketplace order may use user-selected commercial criteria only after requirements are independently determined.

## Billing reliability and invariants

Payment callbacks must be authenticated, idempotent and matched to the order/currency/amount; provider success is not authoritative credential verification. Use stable command IDs, expected revision, transaction/outbox and reconciliation before external effects. Refund/cancel/dispute does not rewrite historical credential evidence. Preserve lawful access/export to personal originals when a paid plan ends, with transparent retention policy. No card data in Core or logs. No billing code or provider account is activated here.

## Pilot gate

90-day programme remains conditional on a separate start decision and prerequisites; not a calendar promise. Initial deep targets CZ/DE, source SK/UA, PL/AT still first-wave inventory. At most two deep targets at once until measured reviewer/runtime capacity allows more. Gate real data and paid use on authentication/scoped loading, tested recovery/backups, audit, privacy/terms, actual workflow/provider support and named owners. Before then synthetic demonstrations only. Scale based on completed tasks, defect rate, active cohorts, support cost and contribution economics, not number of registrations.
