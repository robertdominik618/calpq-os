# CALPQ Global Recognition Extension

ID: CALPQ-GLOBAL-0001-C03. Status: OWNER_APPROVED_TARGET_ARCHITECTURE / NO_RECOGNITION_RULE_PUBLISHED.
This specializes the existing [Equivalence and Recognition Model](EQUIVALENCE_RECOGNITION_MODEL.md); it does not copy its entities or create a new decision engine. See [GLOBAL](../architecture/CALPQ_GLOBAL_0001_ARCHITECTURE.md), [applicability](GLOBAL_JURISDICTION_APPLICABILITY.md), [MobilityCase](EXPAT_MOBILITY_CONTEXT.md) and [AssignmentGuard](B2B_ASSIGNMENT_GUARD.md).

## Required directional context

A relationship references exact source definition/qualification and version, source jurisdiction/authority, target requirement/activity and version, target jurisdiction, affected subject kind, effective interval, applicability conditions, effect type, reviewed sources and provenance. Use existing EquivalenceRule effect types and RecognitionRoute classifications without inventing incompatible result enums.

A RecognitionDecision remains immutable evidence about the individual subject and exact target/scope/authority/interval. Do not generalize one person's decision into a rule for everybody. RecognitionRoute existence is procedural information, not positive recognition. Partial substitution must list remaining requirements and any further review, exam, practice, language, registration or supervision that is actually sourced.

## Invariants

GR-01 A→B never implies B→A without its own applicable reviewed relationship.
GR-02 A→B and B→C do not imply A→C. Path search can propose a chain for review, not infer a legal equivalence closure.
GR-03 Similar names, translations, framework levels, credit counts or AI confidence do not establish legal recognition.
GR-04 Academic recognition, regulated-profession recognition, labour-market access, residence, insurance, tax questions and a concrete work assignment remain distinct.
GR-05 Company/premises/project permissions do not flow into employee qualification. Team or supervision coverage follows only the existing explicit rules.
GR-06 Issuer mandate at original issuance and verifier/relying authority at current use are separate checks.
GR-07 Digitally signed evidence still requires subject binding, trust, validity/revocation, scope and freshness before relevance can be assessed.
GR-08 A course/job recommendation or commercial payment cannot create RecognitionDecision, VerificationDecision or AuthorizationGrant.
GR-09 Unknown, stale, unavailable-source and conflicting-source cases retain their respective explanation and human-review route.
GR-10 Reuse of a document rechecks recipient/target-purpose requirements; prior acceptance for another purpose is not automatically portable.

## User views and execution

Forward view: Where may my evidence contribute? Reverse view: What of my evidence can contribute to this target activity? Both consume the same versioned graph, preserve unsupported jurisdictions and expose remaining gaps. Hypothetical moves use side-effect-free simulation. Applying a change requires separately authorized commands and fresh evidence/rules. Source changes invalidate affected current projections and translations, preserve historical replay and do not send duplicate notifications.

The UI must distinguish opportunity, recognition route, decision and legal entitlement. Positive-sounding aggregate labels cannot conceal an unknown mandatory component. Existing AssignmentGuard statuses and Conditions semantics remain authoritative; this specification does not alter their runtime code.
