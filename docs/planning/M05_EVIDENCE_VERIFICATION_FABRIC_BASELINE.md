# CALPQ M05 — Document Intake, Archive & Verification Fabric Baseline

Status: `PLANNING ONLY / BLOCKED`
ID: `CALPQ-M05-PLAN-0001`
Depends on: M02 intake/verification vertical; M01 trust, document, privacy and security contracts.

## Purpose
Expand the minimal M02 intake/verification path into a production-grade provider-neutral evidence fabric while preserving the rule that extraction, signatures and provider responses are evidence inputs rather than automatic legal truth.

## Intake channels
M05 planning covers governed support for:
- camera capture;
- scan;
- file/PDF upload;
- email attachment;
- share sheet;
- URL import;
- registry/provider import;
- wallet/digital credential presentation;
- future adapter channels.

A channel describes transport only. It does not establish authenticity, authority, eligibility or authorization.

## Intake pipeline
`Intake -> Immutable Original -> Security Classification -> Extraction Proposal -> Review/Normalization -> Verification Route -> Evidence/Verified Fact -> Archive Link`

Each transition preserves provenance and must never silently overwrite the previous representation.

## Immutable original
Every accepted artifact must preserve:
- stable original reference;
- content hash/fingerprint;
- media type/size;
- received/captured time;
- source channel;
- uploader/provider provenance;
- storage reference;
- security/quarantine state.

Derived text, normalized metadata and AI/OCR output reference the original but never replace it.

## Extraction/review
Extraction produces proposals. Confidence scores remain metadata. Promotion to reviewed or verified structured fact requires the governed review/verification path appropriate to the claim.

User correction is attributable and versioned; it does not mutate the original artifact.

## Verification fabric
Verification orchestration remains provider-neutral and may select routes such as:
- official registry lookup;
- issuer API;
- certificate/trust-list validation;
- signed-document validation;
- wallet/credential validation;
- human/authority confirmation.

The normalized VerificationRecord must preserve method, verifier identity, authority resolution, claims checked, source snapshot/version, time, provenance and outcome.

## Trust and authority
M05 uses Trust Registry and authority-resolution contracts. Technical signature validity, possession of a credential or a successful provider response must not automatically prove that the issuer/verifier had legal authority for the specific claim, jurisdiction and time.

## Security/privacy
M05 must cover:
- malware/untrusted-content quarantine;
- content-type/size validation;
- least-privilege storage access;
- tenant-scoped object ownership/addressing;
- restricted telemetry;
- retention/preservation policy hooks;
- no secrets or raw evidence in ordinary logs;
- safe failure when provider/trust services are unavailable.

## Archive lifecycle
Archive links preserve original and derived lineage, verification records and governed retention states. Deletion/restriction must not silently destroy required historical decision references.

## Provider failure semantics
Provider outage or unavailable trust source yields uncertainty/retry/review semantics. It must not be converted into claim failure or successful verification merely to keep workflow moving.

## Non-goals
M05 does not implement:
- lifecycle/renewal automation (M06);
- regulatory change propagation (M07);
- B2B assignment decisions (M08);
- AI authority over verification or eligibility (M10).

## Exit criteria
M05 planning is ready when all supported channel classes map to the same governed evidence lifecycle, verification routes are provider-neutral, originals/derived/verified facts remain distinct and trust/authority/security/privacy boundaries are traceable to M01 contracts.