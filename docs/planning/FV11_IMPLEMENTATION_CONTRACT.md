# CALPQ FV-11 Implementation Contract

Status: `IMPLEMENTED / VERIFIED`

FV-11 implements deterministic `EligibilityAssessment`.

Assessment binds subject, exact CredentialDefinition version, exact RequirementSet version, evaluation instant, exact evidence snapshot, atomic requirement results, aggregate result, evaluator attribution and source/rule provenance.

Supported aggregate outcomes remain `SATISFIED`, `NOT_SATISFIED`, `INDETERMINATE`, `REVIEW_REQUIRED`. Requirement groups use governed ALL, ANY and AT_LEAST(n) semantics. A new fact or rule version creates a new immutable assessment; historical assessments are never rewritten.

Eligibility is not AuthorizationGrant. No grant creation is part of FV-11.

## Implementation evidence

- Reviewed Batch B base: `3321aa6773ef9e23c11be83aec34f3ac22af1249`.
- C1 source boundary: `1d0e95dc586718b9cb07dba45e596afe03338008` — nominal CredentialDefinition/RequirementSet/EligibilityAssessment IDs, versioned RequirementSet, controlled groups and immutable EligibilityAssessment.
- Executable evidence: `72afc09da5a6f0931876f00d943cf07956d68453` — exact 24-point runtime suite, compile-time type boundaries and dedicated CI.
- Strict-null narrowing correction: `81b0085acd180739cdd52237cd8830b9bad250ef`.
- Historical FV-05 non-equivalence guard forward-fix: `689de613e91d4454debcb3d5bdc9e53e492a7358` — verified CredentialArtifact still does not imply eligibility while later Core is allowed to contain EligibilityAssessment.

Verified on `689de613e91d4454debcb3d5bdc9e53e492a7358`:
- FV-11 Eligibility Assessment #6 — SUCCESS, 24/24 mandatory scenarios plus TypeScript boundaries;
- FV-05 Credential Evidence #19 — SUCCESS;
- Foundation Guard #907 — SUCCESS;
- M00 Readiness #786 — SUCCESS;
- M02 Batch Readiness #195 — SUCCESS;
- Program Execution Readiness #209 — SUCCESS;
- M03-M08 #166, M09-M12 #155 and CALPQ v1 Execution Index #146 — SUCCESS.

No mandatory FV-11 test was waived or deferred. No `AuthorizationGrant`, persistence adapter, transport, UI or provider SDK behavior entered the FV-11 eligibility model.
