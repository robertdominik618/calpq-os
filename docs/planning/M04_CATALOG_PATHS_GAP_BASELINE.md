# CALPQ M04 — Credential Catalog, Qualification Paths & Gap Intelligence Baseline

Status: `PLANNING ONLY / BLOCKED`
ID: `CALPQ-M04-PLAN-0001`
Depends on: M02 stable domain outputs; M01 catalog/path/equivalence contracts.

## Purpose
Provide the governed knowledge structure that answers what is required for a target activity/profession, which path is applicable, what the user already satisfies and what remains missing.

## Canonical knowledge spine
`Activity -> Profession -> CredentialDefinition -> QualificationPath -> RequirementSet(version) -> Evidence -> EligibilityAssessment`

## Catalog scope
M04 covers:
- Activity Catalog;
- Profession Catalog;
- Credential Catalog;
- Requirement Catalog;
- versioned RequirementSets;
- qualification paths;
- effective dating and jurisdiction scope;
- equivalence/recognition workflows;
- deterministic Gap Navigator;
- source/provenance linking;
- explanation of why a requirement/path applies.

## Catalog rules
- catalog objects have stable IDs/codes;
- legal/regulatory applicability is versioned and effective-dated;
- free-text labels are presentation, not executable rule identity;
- changes create new versions instead of rewriting historical meaning;
- every material requirement/path can point to source/rule provenance;
- ambiguity or missing authority yields review/indeterminate states rather than guessed truth.

## Qualification paths
A QualificationPath is a governed path from a defined starting context to a target credential/eligibility goal. It may express alternatives and prerequisites but must not embed ungoverned arbitrary executable logic.

Each path must preserve:
- target activity/profession/credential;
- jurisdiction;
- applicable version/effective period;
- ordered or grouped requirements;
- alternative branches where permitted;
- recognition/equivalence references;
- source/rule references;
- explanation/reason codes.

## Equivalence and recognition
Equivalence/recognition is distinct from evidence possession and authorization. A recognition decision may satisfy or transform requirement treatment only where governed rules permit it; it must never silently create AuthorizationGrant.

## Gap Navigator
Gap Navigator compares one subject's trusted evidence/assessments against one exact target path/version and returns governed gap states such as:
- satisfied;
- missing evidence;
- not satisfied;
- review required;
- indeterminate;
- alternative path available.

It must retain reason codes, source references and evidence links. It is deterministic unless a requirement explicitly calls for human/external authority review.

## Query/explainability
Users must be able to ask, in product terms, questions such as:
- what do I need for activity X?;
- why is requirement Y needed?;
- which evidence already counts?;
- which alternative path is available?;
- which jurisdiction/version applies?

Search/retrieval may help locate catalog objects but cannot invent requirements or override governed applicability.

## Non-goals
M04 does not implement:
- production document ingestion/verification adapters (M05);
- renewal automation (M06);
- automatic regulatory change impact propagation (M07);
- AI authority over path selection (M10).

## Exit criteria
M04 planning is ready when catalog entities, paths, version/effective dating, equivalence/recognition and Gap Navigator outputs are traceable to M01 contracts and can feed M03 explanations without duplicating or redefining domain truth.