# CALPQ FV-03 Test Index

Status: `20 OF 20 EXECUTABLE / VERIFIED`

Mandatory count: 20.

1. source-version
2. source-jurisdiction
3. source-effective-date
4. original-derived-separation
5. derivation-parent
6. original-preservation
7. evidence-integrity
8. actor-provenance
9. subject-provenance
10. evidence-provenance
11. historical-provenance
12. satisfied-outcome
13. not-satisfied-outcome
14. indeterminate-outcome
15. review-required-outcome
16. outcome-error-separation
17. stable-reason-code
18. technical-error-boundary
19. derived-verification-boundary
20. architecture-boundary

Authoritative semantics: `CORE_PROVENANCE_AND_EVIDENCE.md` and `CORE_RESULT_AND_ERROR_MODEL.md`.

## Verified executable evidence
- `packages/core/test/fv03-provenance.test.ts` maps one-to-one to FV03-01..FV03-20.
- `packages/core/test/fv03-types.compile.ts` proves immutable provenance collection and type-level separation between legitimate domain outcomes and technical error families.
- `tests/fv03_core_provenance_test.sh` enforces exactly 20 tests, TypeScript compilation, no dependencies/provider imports/global nondeterminism/later-phase capability leakage, FV-02 regression and architecture boundaries.
- `.github/workflows/fv03-core.yml` executes evidence on pinned Node 24 and pinned GitHub Actions.
- `FV-03 Core Provenance #2` — SUCCESS on `1f0c88054fcc5b230e1a997309dc8f59b70b33fd`.
- Foundation Guard #819 and all active project readiness workflows are SUCCESS on the same implementation head.

Mandatory result: **20/20 PASS, 0 waived, 0 deferred, 0 scope exceptions.**
