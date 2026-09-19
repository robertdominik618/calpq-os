# M05 Slice 01 — Mandatory Test Index

Status: `40 MANDATORY RUNTIME SCENARIOS`

Tracking issue: #107.  
Reviewed admission merge: `b7a5080394c3c285fdd90ce4a3bc458b0d8afd91`.

## A — Controlled channel and provenance model

| ID | Evidence |
|---|---|
| M05S01-01 | Exact seven-value S01 transport vocabulary is controlled. |
| M05S01-02 | Camera provenance preserves capture reference only. |
| M05S01-03 | Scan provenance preserves scan reference only. |
| M05S01-04 | File/PDF upload provenance preserves upload reference. |
| M05S01-05 | Email provenance requires message + attachment references. |
| M05S01-06 | Share-sheet provenance requires application + transfer references. |
| M05S01-07 | URL import uses opaque source/retrieval references. |
| M05S01-08 | Provider provenance is provider-neutral and bounded. |
| M05S01-09 | Registry source kind remains an external observation, not authority. |

## B — FV09 normalization mapping

| ID | Evidence |
|---|---|
| M05S01-10 | Camera maps to FV09 `CAMERA`. |
| M05S01-11 | Scan maps to FV09 `SCAN`. |
| M05S01-12 | File maps to FV09 `FILE_UPLOAD`. |
| M05S01-13 | Email maps to FV09 `EMAIL_ATTACHMENT`. |
| M05S01-14 | Share sheet maps to FV09 `SHARE_SHEET`. |
| M05S01-15 | URL maps to FV09 `URL`. |
| M05S01-16 | Provider adapter maps to generic FV09 `API`, keeping provider detail outside FV09 truth. |

## C — Exact governed context preservation

| ID | Evidence |
|---|---|
| M05S01-17 | Semantic intake ID is preserved. |
| M05S01-18 | Injected received-at instant is preserved. |
| M05S01-19 | Receiving actor is preserved. |
| M05S01-20 | Subject context is preserved. |
| M05S01-21 | Organization context is preserved. |
| M05S01-22 | Exact immutable original reference is preserved. |
| M05S01-23 | Media metadata is preserved. |
| M05S01-24 | Security classification is preserved. |
| M05S01-25 | Transport normalization always enters FV09 as `RECEIVED`. |
| M05S01-26 | Transport never verifies the original artifact. |
| M05S01-27 | Immutable content hash survives normalization. |

## D — Immutability and determinism

| ID | Evidence |
|---|---|
| M05S01-28 | Normalized submission is frozen. |
| M05S01-29 | Channel provenance is frozen. |
| M05S01-30 | Canonical projection is deterministic for identical governed inputs. |

## E — Fail-closed input controls

| ID | Evidence |
|---|---|
| M05S01-31 | Provenance references are trimmed/canonicalized. |
| M05S01-32 | Empty references fail closed. |
| M05S01-33 | Oversized references fail closed. |
| M05S01-34 | Control characters fail closed. |
| M05S01-35 | External source kind is controlled. |
| M05S01-36 | Email requires both provenance references. |
| M05S01-37 | URL import requires both governed references. |

## F — Provider-neutral and non-authoritative boundary

| ID | Evidence |
|---|---|
| M05S01-38 | Adapter normalization strips provider status/confidence/trust extras and retains only allowed provenance. |
| M05S01-39 | Runtime object/source surface contains no trust, verification, eligibility, authorization or provider-SDK authority leakage and uses no ambient time/randomness. |
| M05S01-40 | S01 returns the exact immutable FV09 `DocumentIntakeRecord` rather than replacing or recomputing it. |

## Compile proof

The dedicated TypeScript proof additionally enforces:

- readonly normalized submission record/provenance;
- readonly provenance fields;
- readonly submission input;
- controlled `IntakeTransportChannel`;
- controlled `ExternalIntakeSourceKind`;
- provider-neutral adapter-port shape.

No mandatory scenario may be waived or deferred for Slice 01 exit.
