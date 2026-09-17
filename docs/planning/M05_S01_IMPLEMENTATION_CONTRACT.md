# M05 Slice 01 — Multi-channel Intake Contracts — Implementation Contract

Status: `IMPLEMENTATION AUTHORIZED / IN PROGRESS`

Tracking issue: #107.  
Reviewed M05 admission merge: `b7a5080394c3c285fdd90ce4a3bc458b0d8afd91`.  
User authorization: `SCHVALUJI MERGE PR #106 A ZAHÁJENÍ M05 SLICE 01`.

## Purpose

Slice 01 extends the existing FV09 document-intake model with a production-grade, provider-neutral transport-normalization contract for the admitted M05 channels:

1. camera capture;
2. scan;
3. file/PDF upload;
4. email attachment;
5. share sheet;
6. URL import;
7. provider/registry adapter input.

The slice does **not** replace FV09. `DocumentIntakeRecord` remains the governed application intake record and continues to enforce immutable-original, content-hash and non-verification semantics. S01 adds the channel-specific provenance needed to normalize transport into that existing record.

## Model

### `IntakeTransportChannel`

Controlled S01 transport vocabulary:

`CAMERA | SCAN | FILE_UPLOAD | EMAIL_ATTACHMENT | SHARE_SHEET | URL | PROVIDER_ADAPTER`

The transport value answers only **how the artifact entered CALPQ**. It is not a trust, verification, authority, eligibility or authorization statement.

### `IntakeChannelProvenance`

Immutable, channel-specific provenance. There is no free-form metadata map. Each factory admits only the bounded references required for its channel:

- camera → capture reference;
- scan → scan reference;
- file upload → upload reference;
- email → message + attachment references;
- share sheet → source-application + transfer references;
- URL → source-URL reference + retrieval reference;
- provider adapter → controlled external source kind + adapter reference + external record reference.

Provider provenance intentionally has no provider confidence, provider status, verification outcome or trust field.

### `MultiChannelIntakeSubmission`

Immutable normalized submission composed over an exact FV09 `DocumentIntakeRecord`. Creation:

- requires explicit semantic intake ID and injected `UtcInstant`;
- requires explicit actor/context, original artifact, media metadata and security classification;
- always enters FV09 as `RECEIVED`;
- preserves the immutable original and its content hash;
- delegates original/verification invariants to `DocumentIntakeRecord.create` rather than duplicating evidence authority;
- preserves the channel provenance alongside the FV09 record.

For the provider-adapter transport, the FV09 generic source channel is `API`; provider/registry detail remains in the separate S01 provenance object. This prevents provider identity/status vocabulary from becoming FV09/Core truth.

### `IntakeProviderAdapterPort`

Provider-neutral normalization boundary. The adapter may return only:

- controlled `PROVIDER | REGISTRY` source kind;
- opaque external record reference.

The application-held adapter reference is validated separately. `normalizeProviderIntakeProvenance` rebuilds a governed provenance object and discards any extra provider payload/status/confidence fields.

## Mandatory authority boundaries

S01 must never:

- grant trust because of a channel or provider;
- convert OCR/extraction/AI confidence to verification;
- create VERIFIED evidence;
- replace/mutate the immutable original;
- create or mutate `EligibilityAssessment`;
- create or mutate `RecognitionDecision`;
- create or mutate `AuthorizationGrant`;
- infer credential legal validity;
- use ambient time or ambient randomness;
- import provider SDKs/frameworks into the application contract;
- start S02 archive behavior or any later M05 slice.

External content and adapter output remain untrusted observations until later admitted M05 trust/verification paths.

## Determinism and immutability

All IDs, timestamps and provenance references are supplied explicitly. No S01 source may call ambient clocks or random generators. Submission and provenance objects are frozen. Canonical JSON projection is deterministic for the same governed inputs.

## Evidence requirement

Exit requires:

- dedicated mandatory runtime test matrix;
- strict TypeScript readonly/controlled-vocabulary compile proof;
- exact ancestry from the reviewed M05 admission merge;
- FV09 and FV10 regressions;
- M05 Admission regression;
- architecture-boundary regression;
- no provider/framework SDK leakage;
- no ambient time/randomness;
- dedicated GitHub Actions workflow;
- final-head green CI before review readiness.

## Merge boundary

Successful implementation/evidence does not authorize merge. The S01 PR must remain open and unmerged until a fresh explicit user approval is given after final-head verification.
