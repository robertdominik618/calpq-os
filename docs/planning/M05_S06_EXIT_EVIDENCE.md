# M05 Slice 06 — Trust Registry & Issuer/Verifier Identity Resolution — Exit Evidence

Status: `IMPLEMENTED / VERIFIED / REVIEW READY`
Tracking issue: #119
Pull request: #120
Reviewed predecessor merge: `154bb21d9146daa71757340f20e90064a242923c`

## Delivered boundary

S06 delivers a provider-neutral Application-layer Trust Registry that keeps identity resolution, authority resolution and later verification-route orchestration separate.

Delivered:

- immutable `TrustEntity`, `AuthorityScope`, `TrustAnchorRecord` and `TrustRegistrySnapshot` models;
- controlled issuer/verifier/registry/supervisory/trust-service/accreditation roles;
- explicit trust-anchor states `VERIFIED | UNVERIFIED | STALE | REVOKED | SUSPENDED | REVIEW_REQUIRED`;
- exact role + claim scope + jurisdiction + effective-time authority matching;
- separate valid-time `evaluationInstant` and knowledge-time `asKnownAt` semantics;
- deterministic identity resolution with weak-vs-strong evidence separation;
- deterministic authority resolution with exact matched scope/anchor provenance;
- immutable historical snapshots/results that cannot be rewritten by later trust changes;
- public `@calpq/application/trust` surface;
- zero production Core/provider-adapter changes.

Hard boundary:

**identity != authority != verification route != evidence verification != eligibility != authorization**

S07 remains the owner of route selection/orchestration and concrete provider-adapter routing.

## Mandatory runtime evidence

Exactly **52 mandatory runtime scenarios** are indexed in `M05_S06_TEST_INDEX.md` and implemented in `packages/application/test/m05-s06-trust-registry.test.ts`.

Verified implementation-head run:

- workflow: `M05 Slice 06 Trust Registry`;
- run ID: `35242502010`;
- implementation head: `34c4e66cd9d6ba2ca864c588c179b241f43dad5b`;
- result: **SUCCESS**;
- runtime tests: **52 / 52 PASS / 0 FAIL**;
- TypeScript compile proof: PASS;
- predecessor regression bundle: PASS;
- final runner line:
  `M05 S06 TRUST REGISTRY: PASS / 52 TESTS / IDENTITY != AUTHORITY / ROLE+SCOPE+JURISDICTION+TIME / HISTORICAL SNAPSHOTS / S01-S05+FV09+FV10+ADMISSION GREEN / NO CORE OR ADAPTER DIFF`.

The complete PR-triggered workflow matrix on the same implementation head completed **32/32 SUCCESS**, including the dedicated S06 workflow, S01–S05, Foundation Guard, FV09 and the M03 regression matrix.

## Validation/remediation history

The first evidence head `5b80b5b80fda9b265a0e2a0b168e690baf65133e` was correctly stopped by dedicated workflow run `35242273001` before runtime execution because the executable contract guard searched for the explicit sentence `S07 owns route selection/orchestration`, while the contract expressed the same ownership only through the non-goal wording.

This was a documentary/guard wording mismatch, not a domain-model failure. No production semantics, Core boundary or authority rule was weakened.

Remediation commit:

- `34c4e66cd9d6ba2ca864c588c179b241f43dad5b` — adds the explicit S07 ownership sentence to the implementation contract.

The remediated head then completed the full mandatory evidence successfully.

## Fail-closed authority evidence

The evidence proves, among other cases:

- weak identity similarity cannot independently establish `SAME_SUBJECT`;
- one strong source remains only `POSSIBLE_MATCH`;
- independent strong sources may establish `SAME_SUBJECT`;
- strong/weak conflicts route to governed review or explicit different-subject semantics;
- verified identity alone cannot produce authority;
- wrong role, claim scope or jurisdiction yields `NOT_AUTHORIZED`;
- verified exact authority scope + trust anchor may yield `AUTHORIZED`;
- explicit conditions/limitations yield `AUTHORIZED_WITH_CONDITIONS`;
- `UNVERIFIED` and `STALE` anchors require review;
- `REVOKED` anchor is not authorized;
- conflicting verified/adverse anchors require review;
- an anchor not yet known at `asKnownAt` is invisible to the historical decision;
- later revocation does not rewrite a previously stored historical resolution.

## Diff and architecture evidence

Relative to reviewed S05 merge `154bb21d9146daa71757340f20e90064a242923c`:

- S06 is Application-layer only plus planning/tests/workflow configuration;
- no `packages/core/src/**` production change;
- no `packages/adapters/src/**` production change;
- no provider/framework SDK dependency in S06 production source;
- no ambient time or randomness;
- no `VerificationProviderPort`, `VerificationRoute`, orchestration result, evidence verification promotion, eligibility, recognition or authorization issuance inside the S06 Trust Registry implementation.

## Review boundary

Successful implementation and CI establish review readiness only. PR #120 remains OPEN and UNMERGED until fresh explicit merge authorization. S07 is not authorized by this exit evidence.
