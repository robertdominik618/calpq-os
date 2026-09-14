# CALPQ FV-00 Command and Event Catalog

Status: `PLANNING / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M02-FV00-CMD-0001`

## Rule
Commands express business intent. Accepted mutations emit stable facts. Application orchestration may obtain external observations, but Core decides only from normalized, versioned inputs.

## Proposed mutation commands

### 1. RegisterEvidenceIntake
Target: evidence-intake aggregate.
Inputs: SubjectId, TenantContext, actor/access context, command ID, source channel metadata.
Preconditions: tenant/access checks passed; command ID not already accepted.
Outcomes: accepted, rejected, review required, conflict.
Event: `EvidenceIntakeRegistered`.

### 2. LinkOriginalArtifact
Target: evidence-intake aggregate.
Inputs: artifact ID, integrity/hash reference, storage reference, provenance metadata, expected revision.
Preconditions: immutable original exists through storage port; revision matches.
Event: `OriginalArtifactLinked`.

### 3. LinkCredentialArtifact
Target: credential-evidence aggregate.
Inputs: CredentialArtifactId, evidence refs, SubjectId, credential-definition reference when known, expected revision.
Preconditions: referenced original/evidence exists and scope is valid.
Event: `CredentialArtifactLinked`.

### 4. RecordVerificationObservation
Target: verification record stream.
Inputs: normalized observation, source/version/provenance, evaluation instant, claim scope, jurisdiction.
Preconditions: provider result translated to CALPQ contract; no provider-specific exception crosses Core boundary.
Event: `VerificationObservationRecorded`.

### 5. RecordVerificationDecision
Target: verification record stream.
Inputs: observation refs, authority-resolution input, verification outcome, reasons, evidence/source versions.
Preconditions: exact inputs preserved; technical verification is not treated as legal authority.
Event: `VerificationDecisionRecorded`.

### 6. AssessEligibility
Target: immutable eligibility decision stream.
Inputs: SubjectId, CredentialDefinition version, RequirementSet version, verified/admissible evidence refs, evaluation instant.
Outcomes: `SATISFIED`, `NOT_SATISFIED`, `INDETERMINATE`, `REVIEW_REQUIRED`.
Event: `EligibilityAssessed`.

## Projection reaction
`EligibilityAssessed` and relevant evidence/verification facts may update the Professional Passport read projection through Application/projection infrastructure. Projection rebuild is repeatable and cannot emit new legal/authorization state.

## Envelope requirements
Every accepted command/event carries stable identity, correlation/causation, actor/process context where applicable, aggregate/stream identity, revision where applicable, tenant scope for tenant-private work, and minimum-necessary payload.

## Idempotency and concurrency
Duplicate command identity cannot create a second accepted transition. Mutable aggregate commands require expected revision. Duplicate event delivery is tolerated by consumers using stable event identity/checkpoints.

## Excluded commands
No FV-00 command may issue, suspend, revoke, supersede or otherwise mutate AuthorizationGrant. Recognition/equivalence, B2B assignment, renewal and Regulatory Radar commands are outside this admission package.
