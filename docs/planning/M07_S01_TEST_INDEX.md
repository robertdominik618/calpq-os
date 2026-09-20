# M07 S01 (Slice 01 – implementační část 01) — Test Index

Contract: `CALPQ-M07-S01-IMP-0001`  
Entry: `M07_SLICE_01_AUTHORITATIVE_SOURCE_REGISTRY`

| ID | Mandatory scenario |
|---|---|
| M07S01-01 | Accept a minimal valid UNVERIFIED authoritative-source record |
| M07S01-02 | Accept a fully populated VERIFIED authoritative-source record |
| M07S01-03 | Accept STALE_REVIEW_REQUIRED with explicit review reason |
| M07S01-04 | Reject unknown verification state |
| M07S01-05 | Reject empty stable source identity |
| M07S01-06 | Reject empty issuer identity |
| M07S01-07 | Reject empty canonical reference |
| M07S01-08 | Reject empty jurisdiction |
| M07S01-09 | Reject empty affected domain |
| M07S01-10 | Reject empty source classification |
| M07S01-11 | Preserve source version identity separately from source identity |
| M07S01-12 | Preserve publication date without treating it as effective date |
| M07S01-13 | Preserve retrieval instant without treating it as verification instant |
| M07S01-14 | Preserve effective-from independently |
| M07S01-15 | Preserve effective-to independently |
| M07S01-16 | Reject effective-to earlier than effective-from |
| M07S01-17 | Allow unknown publication date |
| M07S01-18 | Allow unknown retrieval instant |
| M07S01-19 | Allow unknown effective bounds |
| M07S01-20 | Require review reason for STALE_REVIEW_REQUIRED |
| M07S01-21 | Do not require review reason for VERIFIED |
| M07S01-22 | Do not require review reason for UNVERIFIED |
| M07S01-23 | Preserve provenance reference |
| M07S01-24 | Reject duplicate source identities when building a registry |
| M07S01-25 | Resolve an existing source deterministically by source identity |
| M07S01-26 | Return explicit absence for an unknown source identity |
| M07S01-27 | Registry iteration preserves deterministic input order |
| M07S01-28 | Registry does not mutate caller-provided source records |
| M07S01-29 | Registry result exposes readonly records at type level |
| M07S01-30 | Parser/OCR/AI confidence is not part of verification-upgrade API |
| M07S01-31 | No legal applicability field or decision API is exposed |
| M07S01-32 | No network/provider/persistence dependency is imported by S01 Core |
| M07S01-33 | Regulatory barrel exports only approved S01 symbols |
| M07S01-34 | S01 activation record validates against M07 admission identities |
| M07S01-35 | S01 changed-path gate rejects Application, adapters, UI and arbitrary files |
| M07S01-36 | M07 admission regression remains PASS in S01 mode |
| M07S01-37 | M08 remains implementation-blocked |
| M07S01-38 | Architecture boundaries remain PASS |
| M07S01-39 | Production release authority remains false |
| M07S01-40 | Legal-interpretation authority remains false |

## Completion rule

All 40 scenarios are mandatory. No `skip`, `todo`, selective test execution or reduced path gate is accepted as S01 completion evidence.
