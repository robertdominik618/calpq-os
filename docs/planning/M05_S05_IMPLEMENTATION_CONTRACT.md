# M05 Slice 05 Implementation Contract — Security Quarantine & Untrusted Content

Status: `AUTHORIZED / ARCHITECTURE LOCKED / IMPLEMENTATION IN PROGRESS`

Tracking issue: #117  
Parent epic: #34  
Reviewed Slice 04 merge: `70b67617d0fad3d19c4cb9fc6b34f9daa8988dd7`  
User authorization: `SCHVALUJI MERGE PR #116 A POKRAČOVÁNÍ NA M05 SLICE 05`

## 1. Source contracts

S05 implements the security boundary already defined by:

- `docs/contracts/DOCUMENT_INTAKE_SECURITY_PRIVACY_MODEL.md`;
- `docs/contracts/UNTRUSTED_CONTENT_AI_SECURITY_BOUNDARY.md`;
- `docs/contracts/SECURITY_MISUSE_CONTROLS.md`;
- S01 multi-channel intake;
- S02 immutable original archive.

## 2. Ownership

S05 owns deterministic Application-layer security observations and quarantine/review decisions for untrusted intake content.

It does not own:

- Trust Registry / issuer authority (S06);
- verification route selection or provider routing (S07);
- manual authority confirmation (S08);
- archive retention/deletion lifecycle (S09);
- legal eligibility, recognition or authorization;
- malware scanner, parser, OCR, AI or provider SDK implementation.

## 3. Hard authority boundary

`technical processing safety != evidence verification != issuer trust != eligibility != authorization`

A scanner may establish only a technical observation about whether content can safely proceed through a processing pipeline. Even an all-PASS assessment:

- MUST NOT mutate `EvidenceReference.verificationState`;
- MUST NOT create VERIFIED evidence;
- MUST NOT establish issuer identity or authority;
- MUST NOT establish legal validity;
- MUST NOT widen actor, tool, role or delegation authority;
- MUST NOT execute instructions embedded in uploaded/retrieved content.

## 4. Deterministic control model

A `SecurityControlPolicy` declares a non-empty, unique set of required security controls.

Supported controls are bounded Application vocabulary:

- `CONTENT_TYPE_VALIDATION`;
- `MALWARE_SCAN`;
- `CONTENT_SAFETY_SCAN`;
- `ACTIVE_CONTENT_SCAN`;
- `CONTAINER_STRUCTURE_SCAN`;
- `EXTERNAL_CONTENT_SAFETY`;
- `EMBEDDED_INSTRUCTION_CONTENT`.

Each `IntakeSecurityObservation` is bound to the exact immutable S02 `OriginalArchiveEntry`, one control, one provider-neutral scanner identity/version/configuration reference, an explicit time and one bounded outcome.

Observation outcomes:

- `PASS` — technical control passed;
- `SUSPICIOUS` — suspicious content signal;
- `UNSUPPORTED` — unsupported content/type/container;
- `MALICIOUS` — malicious content detected;
- `INDETERMINATE` — control cannot establish a result;
- `FAILED` — scanner/retrieval/control execution failed.

## 5. Quarantine decision

`IntakeSecurityAssessment` deterministically derives one disposition:

- `QUARANTINED` if any observation is `MALICIOUS`, `SUSPICIOUS` or `UNSUPPORTED`;
- `HUMAN_REVIEW_REQUIRED` if any observation is `FAILED` or `INDETERMINATE`, or any policy-required control is missing;
- `PROCESSING_ALLOWED` only when every required control has exactly one `PASS` observation and there are no adverse additional observations.

Priority is fail-closed:

`QUARANTINED > HUMAN_REVIEW_REQUIRED > PROCESSING_ALLOWED`.

No empty assessment can become `PROCESSING_ALLOWED`.

## 6. Processing projection

S05 may project its decision to existing intake workflow state:

- `PROCESSING_ALLOWED -> DERIVATION_PENDING`;
- `QUARANTINED -> REVIEW_REQUIRED`;
- `HUMAN_REVIEW_REQUIRED -> REVIEW_REQUIRED`.

This projection is workflow routing only. It is not evidence verification or a legal/domain rejection.

## 7. Provider-neutral scanner boundary

S05 defines a replaceable scanner port and normalized scanner observation. The Application request exposes references/metadata required to identify the immutable original and requested control; it does not make provider output authoritative.

Concrete scanners, malware engines, OCR/AI systems and cloud provider SDKs remain outside Application/Core.

## 8. Privacy and audit

Ordinary security records contain no document body and no extracted secret payload. They preserve:

- intake ID;
- original evidence ID and content hash;
- storage/content references already governed by S02;
- policy reference;
- control;
- normalized outcome/reason;
- scanner reference/version/configuration;
- observation/evaluation time;
- optional bounded opaque signal reference.

The immutable original archive entry is never replaced or mutated by quarantine.

## 9. Stop conditions

Stop S05 implementation if any change would:

- make scan PASS equivalent to VERIFIED evidence;
- mutate Core evidence verification state;
- execute or obey document-embedded instructions;
- discard or overwrite the S02 original;
- log raw document body or extracted secrets as security metadata;
- put a concrete scanner/provider SDK into Core/Application;
- implement Trust Registry, verification routing or authorization authority ahead of its slice.
