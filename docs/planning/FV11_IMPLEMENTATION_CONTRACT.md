# CALPQ FV-11 Implementation Contract

Status: `PLANNING ONLY / BLOCKED`

FV-11 prepares deterministic EligibilityAssessment.

Assessment binds subject, exact CredentialDefinition version, exact RequirementSet version, evaluation instant, exact evidence snapshot, atomic requirement results, aggregate result, evaluator attribution and source/rule provenance.

Supported aggregate outcomes remain `SATISFIED`, `NOT_SATISFIED`, `INDETERMINATE`, `REVIEW_REQUIRED`. Requirement groups use governed ALL, ANY and AT_LEAST(n) semantics. A new fact or rule version creates a new immutable assessment; historical assessments are never rewritten.

Eligibility is not AuthorizationGrant. No grant creation is part of FV-11.