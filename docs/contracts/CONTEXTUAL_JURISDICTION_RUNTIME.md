# CALPQ Contextual Jurisdiction Runtime Contract

ID: CALPQ-CONTEXT-0001-C01
Status: OWNER-REQUESTED TARGET ARCHITECTURE / RUNTIME NOT IMPLEMENTED
Parent: ../architecture/CALPQ_CONTEXT_0001_SPATIOTEMPORAL_COMPLIANCE.md

## Purpose

Define semantic inputs and outputs for contextual re-evaluation without creating a second eligibility or legal engine.

## Semantic objects

### ContextObservation
- observation_ref;
- subject_ref and authorized purpose;
- position with accuracy/uncertainty when present;
- observed_at and known_at;
- source_kind and integrity state;
- optional motion/altitude/depth/route/environment references;
- provenance.

### ActivityContext
- activity_ref/version;
- relevant credential refs;
- governed subject-kind refs such as vehicle/vessel/UAS/equipment;
- intended/current operating interval;
- purpose and optional assignment/mobility refs.

### ResolvedContext
- stable context_ref/version;
- land/maritime/airspace jurisdiction candidates;
- zone refs and geometry versions;
- local time-zone ref;
- confidence/uncertainty;
- explicit unresolved overlaps;
- effective observation interval.

### ContextualApplicabilityRequest
- exact ActivityContext;
- exact ResolvedContext;
- rule-pack/source versions;
- evaluation horizon;
- previous snapshot ref where delta is requested.

### ContextualApplicabilitySnapshot
A projection of existing CALPQ deterministic outputs:
- exact scope;
- applicable rule/requirement refs and versions;
- credential/activity result refs;
- unknown/review-required reasons;
- evaluated_at / as_known_at;
- evaluator version;
- context hash.

It is not AuthorizationGrant and does not mutate credential state.

### ContextualDelta
- before snapshot;
- after snapshot;
- canonically ordered material changes;
- severity/presentation class;
- exact reason/source refs;
- uncertainty/freshness metadata.

### ContextAlertIntent
- deterministic intent_ref;
- delta_ref;
- audience purpose;
- notification class;
- earliest/recommended display instant;
- dedup identity;
- safe summary fields;
- source/provenance refs.

It is not notification delivery.

## Invariants

CJR-01 GPS/location does not prove legal presence, entry, customs clearance or lawful activity.
CJR-02 Language/UI locale/IP address cannot substitute for jurisdiction facts.
CJR-03 A planned route is a simulation input only.
CJR-04 Material location uncertainty fails closed for positive assurance.
CJR-05 Overlapping rules require reviewed composition; no universal strictest-wins.
CJR-06 Missing dynamic data cannot be interpreted as no restriction.
CJR-07 Device observation and legal source are different provenance classes.
CJR-08 Same governed inputs produce byte-stable semantic ordering.
CJR-09 Current context cannot rewrite historical evaluation.
CJR-10 An alert acknowledgement never mutates credential/compliance state.
CJR-11 Commercial provider data cannot change normative authority class.
CJR-12 Employer/family access does not inherit raw location access.
CJR-13 Only purpose-scoped facts are loaded.
CJR-14 A domain plug-in may add reviewed data/mappings but cannot fork Core semantics.
CJR-15 Unsupported domain/jurisdiction returns UNKNOWN/REVIEW_REQUIRED, never synthetic green.

## Resolution flow

1. authorize purpose and minimum fields;
2. validate observation freshness/integrity;
3. resolve candidate spatial/temporal scopes;
4. preserve uncertainty/overlap;
5. resolve reviewed jurisdiction-pack/rule versions;
6. invoke existing deterministic evaluation;
7. pin snapshot;
8. if prior snapshot exists, compute material delta;
9. derive notification intent;
10. persist only via existing governed Application transaction/audit rules if a future admitted use case requires it.

## Negative authority flags

Every architecture-level output must preserve equivalents of:
- authorizationAuthority=false;
- credentialStateMutated=false;
- legalEntryProved=false;
- borderCrossingProved=false;
- notificationSent=false;
- providerInvoked=false unless the admitted adapter call explicitly says otherwise;
- locationHistoryRetentionAuthorized=false by default.
