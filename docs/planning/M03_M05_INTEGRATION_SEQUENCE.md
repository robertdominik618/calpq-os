# CALPQ M03-M05 Integration Sequence

Status: `PLANNING ONLY / BLOCKED`
ID: `CALPQ-M03-M05-PLAN-0001`

## Purpose
Define how Product Surface (M03), Catalog/Paths/Gap (M04) and Evidence/Verification Fabric (M05) can progress after M02 without duplicating domain truth or creating circular dependencies.

## Shared authoritative spine
M03-M05 must reuse M01/M02 concepts rather than create replacements:
- Subject and organization identity;
- CredentialDefinition and RequirementSet versions;
- CredentialArtifact and evidence/provenance;
- VerificationRecord/verification state;
- EligibilityAssessment;
- Professional Passport projection;
- Tenant/access/privacy/audit boundaries.

## Recommended execution order
### Wave A — contracts and read models
1. freeze M02 authoritative interfaces used by later milestones;
2. M03 define dashboard/Passport/Credential Card view contracts;
3. M04 define catalog/path/gap query contracts;
4. M05 define universal intake and verification adapter contracts.

### Wave B — parallel capability build
M03, M04 and M05 may partially overlap when their dependency contracts are stable:
- M03 consumes read/projection/query outputs only;
- M04 owns governed catalog/path/gap knowledge;
- M05 owns evidence acquisition, extraction-review and verification orchestration.

### Wave C — integration
- M05 verified facts/evidence become eligible inputs to M02/M04 evaluation flows;
- M04 path/gap outputs become explainable read inputs to M03;
- M03 displays M02/M04/M05 outputs without promoting them to higher authority;
- all cross-milestone interactions preserve tenant, purpose, provenance and historical version references.

## Dependency rules
- M03 must not implement hidden eligibility logic in UI;
- M04 must not directly ingest raw provider payloads or store originals;
- M05 must not decide catalog applicability or qualification paths;
- M05 verification does not create EligibilityAssessment or AuthorizationGrant;
- M04 gap status does not become authorization state;
- M03 projection/view state does not become source of truth.

## Shared event/query boundary
Cross-milestone communication should use approved Application/contracts rather than direct package internals. Stable query/result contracts may expose:
- passport projection;
- credential/evidence detail;
- catalog/path detail;
- gap result;
- verification result;
- explanation/source references.

## Failure semantics
- projection unavailable -> technical/read failure, not domain state change;
- catalog source ambiguous -> INDETERMINATE or REVIEW_REQUIRED as governed;
- verification provider unavailable -> uncertainty/retry/review, not automatic failure or success;
- stale projections are never allowed to overwrite authoritative state.

## Admission boundary
This document prepares planning only. No M03, M04 or M05 product implementation is admitted while current M00/M02 governance prerequisites remain unsatisfied.

## Exit criteria
The M03-M05 planning block is integration-ready when ownership of every shared concept is unambiguous, no milestone recreates Core truth, and planned data flows can be traced from evidence/source through eligibility/path to user presentation.