# FV-09 Test Index

Status: `20 OF 20 EXECUTABLE / VERIFIED`

Mandatory count: 20.

1. intake-id
2. source-channel
3. received-at
4. subject-context
5. organization-context
6. original-artifact-reference
7. media-metadata
8. content-hash
9. provenance
10. security-classification
11. processing-state
12. original-immutable
13. derived-separate
14. reviewed-fact-separate
15. verified-evidence-separate
16. intake-not-eligibility
17. intake-not-authorization
18. correction-linked-not-overwrite
19. channel-not-trust
20. architecture-boundary

## Verified evidence

`packages/application/test/fv09-document-intake.test.ts` maps one-to-one to FV09-01..FV09-20. `packages/application/test/fv09-types.compile.ts` proves durable intake/evidence identity separation, immutable intake snapshots and controlled channel typing. `tests/fv09_document_intake_test.sh` enforces the admitted lifecycle, exact test count, TypeScript compilation, no provider/framework imports, no ambient time/randomness, no eligibility/AuthorizationGrant capability and FV-08 regression evidence.

Evidence head `d672e2b4710a615ec041a387371998e3c6299845`; dedicated `FV-09 Document Intake #2` SUCCESS. No mandatory scenario was waived or deferred.
