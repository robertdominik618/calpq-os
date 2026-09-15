# CALPQ FV-12 Implementation Contract

Status: `IMPLEMENTED / VERIFIED`

FV-12 implements the Professional Passport read projection.

Projection is rebuilt from authoritative evidence, verification and eligibility outputs. Each projected item preserves evidence/provenance identity, origin, verification status, derivation method where relevant, verifier/reviewer attribution, verified-at instant and source version/hash where applicable.

Projection classes remain explicit and no projection may promote a user assertion or derived extraction into higher authority by display alone. Passport is read-only projection data, never mutation authority, and stale projection data cannot authorize a regulated action.

Rebuild is deterministic and preserves historical/versioned inputs.

## Implementation evidence

- FV-11 durable predecessor evidence: `ed434589fb84e77fc884bc2d2ac3b36db49a5ea1`.
- C4 source boundary: `b409d9388b4be1d336e63c3301f5db6a1710ef88` — rebuild-only Professional Passport projection with immutable evidence/provenance/version/hash metadata and `authorizationAuthority=false`.
- Executable proof: `360d6bd3d4bbe9aa86578d1e18f95b000342774e` — exact 16-point runtime/type evidence and dedicated workflow.
- Evidence fixture correction: `59d27d35768b55c00c1722c0ecf5996cded31cd3` — provenance uses original immutable EvidenceReference objects rather than attempting reconstruction from intentionally reduced snapshot entries.
- Historical FV-06 guard correction: `d45cb7c2d925af18161d47427c6137f8b44abc4a` — FV-06 policy guard remains strict on FV-06-owned files while later admitted Application read-model code may consume EligibilityAssessment; AuthorizationGrant remains globally forbidden in admitted M02 Application source.

Verified on `d45cb7c2d925af18161d47427c6137f8b44abc4a`:
- FV-12 Professional Passport #5 — SUCCESS, 16/16 mandatory scenarios plus TypeScript read-only boundaries;
- FV-11 Eligibility Assessment #15 — SUCCESS;
- FV-06 Application Layer #57 — SUCCESS;
- Foundation Guard #919 — SUCCESS;
- M00 Readiness #798 — SUCCESS;
- M02 Batch Readiness #207 — SUCCESS;
- Program Execution Readiness #221 — SUCCESS;
- M03-M08 #178, M09-M12 #167 and CALPQ v1 Execution Index #158 — SUCCESS.

Passport remains a rebuildable read model only. It cannot mutate authoritative evidence, verification or eligibility state, and it cannot issue or imply AuthorizationGrant. No mandatory FV-12 test was waived or deferred.
