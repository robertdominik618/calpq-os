# FV-06 Test Index

Status: `16 OF 16 EXECUTABLE / VERIFIED`

Mandatory count: 16.

1. context
2. actor
3. subject
4. organization
5. correlation
6. causation
7. requested-at
8. version
9. access
10. minimum-data
11. api-parity
12. worker-parity
13. scheduler-parity
14. orchestration-boundary
15. port-boundary
16. architecture-boundary

## Verified evidence

`packages/application/test/fv06-application-context.test.ts` maps one-to-one to FV06-01..FV06-16. `packages/application/test/fv06-types.compile.ts` proves nominal Actor/Subject and Tenant/Organization separation plus provider-neutral port compatibility. `tests/fv06_application_layer_test.sh` enforces the admitted lifecycle, exact mandatory test count, TypeScript compilation, provider/framework independence, no ambient time/randomness, no Application-to-Core inversion and the existing architecture boundary.

Verified evidence head: `61c80d8b1a4879c6cce68fcb1bfed1f70857be6d`; dedicated workflow `FV-06 Application Layer #4` SUCCESS. No mandatory test was waived or deferred.
