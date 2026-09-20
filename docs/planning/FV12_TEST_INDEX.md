# FV-12 Test Index

Status: `16 OF 16 EXECUTABLE / VERIFIED`

Mandatory count: 16.

1. authoritative-input
2. evidence-id
3. provenance-id
4. origin-class
5. verification-status
6. derivation-method
7. verifier-attribution
8. verified-at
9. source-version
10. no-assertion-promotion
11. no-derived-promotion
12. read-only-projection
13. stale-projection-no-authority
14. deterministic-rebuild
15. historical-rebuild
16. architecture-boundary

## Verified evidence

`packages/application/test/fv12-professional-passport.test.ts` maps one-to-one to FV12-01..FV12-16. `packages/application/test/fv12-types.compile.ts` proves projection/item immutability, non-authority, rejection of arbitrary assertion input and EvidenceId identity boundaries.

`tests/fv12_professional_passport_test.sh` enforces the admitted lifecycle, exactly 16 mandatory tests, TypeScript compilation, framework/provider/persistence independence, no ambient wall-clock/randomness, no AuthorizationGrant behavior, FV-11 regression evidence and the global architecture boundary.

Final verified evidence head: `d45cb7c2d925af18161d47427c6137f8b44abc4a`. Dedicated workflow `FV-12 Professional Passport #5` SUCCESS; Foundation Guard #919 and M02 Batch Readiness #207 SUCCESS. No mandatory test was waived or deferred.
