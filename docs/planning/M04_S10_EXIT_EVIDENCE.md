# M04 Slice 10 — Exit Evidence

Status: `IMPLEMENTED / VERIFIED ON IMPLEMENTATION HEAD / FINAL DOCUMENTATION HEAD PENDING CI`

Tracking issue: #104.  
Pull request: #105.  
Branch: `impl/m04-s10-integration-evidence`.

## Authorization and lineage

User authorization: `SCHVALUJI MERGE PR #103 A POKRAČOVÁNÍ NA M04 SLICE 10`.

M04 Slice 09 PR #103 was guarded-merged from exact verified head `818656d377c49c8fac0c813a14d3107a4ce97007` as merge commit:

`160ed37e6e1e7264d1dd9843906c098758dbc7bb`

Post-merge verification was green for M04 S01–S09, M04 Admission, FV03/FV11, Foundation Guard and the relevant execution/readiness gates before the S10 branch was created. S10 descends from that exact reviewed merge.

## Nature of Slice 10

S10 is the final M04 integration/evidence slice. It introduces no new production domain authority and does not change any `packages/core/src/**` file. The dedicated runner enforces this by diffing from the reviewed S09 merge and failing if production Core changes appear.

All target-profession/legal-looking data in the S10 matrix are synthetic fixtures. They are evidence that the admitted architecture composes correctly, not statements of current Czech or EU legal requirements.

## Representative scenario families

1. **Domestic direct qualification** — Activity, Profession, Credential, Requirement, governed RequirementSet and QualificationPath identities/versions/provenance remain exact; mixed FV11 results remain mixed through S07 and S08 instead of becoming falsely ready.
2. **Cross-border recognition procedure** — RecognitionRoute availability remains procedural; it never silently becomes RecognitionDecision or satisfaction. Unknown routes propagate REVIEW_REQUIRED and prerequisite blocking remains explicit.
3. **Historical version transition** — valid time (`effectiveOn`) remains separate from knowledge time (`asKnownAt`); retroactively effective but not-yet-known versions are excluded; S09 returns exact stored S07/S08 snapshots without recomputation.
4. **Fail-closed integration boundaries** — overlaps, duplicate candidates/assessments, tied latest snapshots, unverified sources and missing material explanation sources remain ambiguous/review/indeterminate rather than being guessed or ranked into readiness.

## Mandatory evidence

- exactly **48 mandatory S10 runtime scenarios**;
- strict TypeScript readonly/immutability compile proof;
- exact ancestry from reviewed S09 merge `160ed37e6e1e7264d1dd9843906c098758dbc7bb`;
- no-production-Core-diff guard for S10;
- direct runtime regressions for M04 S01–S09, FV03 and FV11;
- M04 admission, M03–M08 execution readiness and architecture-boundary checks inside the dedicated runner;
- dedicated workflow `M04 Slice 10 Integration Evidence`.

The Core global typecheck includes `m04-s10-types.compile.ts` alongside the S01–S09 compile proofs.

## Implementation commits

- `6ebdd31998bb0d5523a89d4e465e1c0ce003a606` — representative profession runtime integration matrix;
- `bc64b5384061297e9f439df25a9f90b8f967c260` — S10 immutability compile proof;
- `4266e35032815cf3888156aa912604054842a49f` — S10 test command;
- `8215607045342bec4828d467afa4bee34ff8d1c3` — global Core typecheck inclusion;
- `8585780ba70ae8e86f2e41ead9fbd40cdbc79f39` — S10 implementation contract;
- `d78aaa9959c9e7d19746946a2200152576a90566` — 48-scenario test index;
- `e6e3886520c4f33926c85076109ceecc04bb9071` — executable S10 runner;
- `328d6e666999d6ddd88c1b29f20fcd7438661ba2` — dedicated GitHub Actions workflow;
- `0fce48c0788edc4714d4c8caa6bd1480baaf0892` — corrected documentary guard wording;
- `d063fda0bbbabdf8c1056bce61a523a61671b213` — corrected mismatch fixture to use controlled `CZ-10` jurisdiction.

## Validation defects found and corrected

### 1. Synthetic-fixture documentation guard mismatch

The first S10 CI attempt failed before runtime execution because the shell guard searched for the phrase `synthetic integration data`, while the approved contract used `synthetic test fixtures`. The contract was correct; the brittle guard was aligned to the contract in `0fce48c0788edc4714d4c8caa6bd1480baaf0892`. No domain semantics changed.

### 2. Unsupported mismatch fixture jurisdiction

The next S10 run failed at fixture initialization because a negative jurisdiction test used `SK`, which is not part of the Core controlled Jurisdiction set. Production Core was not weakened or extended to accommodate a test. The mismatch fixture was corrected to the already-governed subnational code `CZ-10` in `d063fda0bbbabdf8c1056bce61a523a61671b213`, preserving the intended wrong-jurisdiction proof.

These failures are retained as audit evidence rather than hidden: CI correctly stopped on both invalid evidence assumptions.

## Verified implementation-head CI

Verified implementation head:

`d063fda0bbbabdf8c1056bce61a523a61671b213`

All **29 PR-triggered workflow runs** associated with this head completed successfully. Key run IDs:

- M04 Slice 10 Integration Evidence — `35087031138` — SUCCESS;
- M04 S01 — `35087031023` — SUCCESS;
- M04 S02 — `35087031282` — SUCCESS;
- M04 S03 — `35087031148` — SUCCESS;
- M04 S04 — `35087031256` — SUCCESS;
- M04 S05 — `35087031100` — SUCCESS;
- M04 S06 — `35087031111` — SUCCESS;
- M04 S07 — `35087031131` — SUCCESS;
- M04 S08 — `35087031037` — SUCCESS;
- M04 S09 — `35087031142` — SUCCESS;
- FV03 Core Provenance — `35087031109` — SUCCESS;
- FV11 Eligibility Assessment — `35087031180` — SUCCESS;
- Foundation Guard — `35087031224` — SUCCESS;
- Program Execution Readiness — `35087031147` — SUCCESS;
- M03–M08 Execution Readiness — `35087031195` — SUCCESS;
- M09–M12 Execution Readiness — `35087031155` — SUCCESS;
- CALPQ v1 Execution Index — `35087031022` — SUCCESS;
- M00 Readiness — `35087031083` — SUCCESS.

No queued, in-progress or failed PR-triggered workflow remained on the implementation head.

## M04 closure significance

With S10 evidence green, the admitted M04 implementation chain S01–S10 is integration-verified on representative synthetic profession scenarios. This establishes M04 review readiness against its execution package and Definition of Done.

It does **not** by itself:
- merge PR #105;
- admit or start M05;
- populate production legal content;
- grant authorization;
- verify evidence outside the already-owned evidence authority;
- permit free-form AI to become catalog/path truth.

## Merge boundary

This exit-evidence commit intentionally creates a new final PR head and therefore must itself pass CI. PR #105 remains **OPEN and UNMERGED**. Merge requires fresh explicit user approval after the final-head matrix is green.
