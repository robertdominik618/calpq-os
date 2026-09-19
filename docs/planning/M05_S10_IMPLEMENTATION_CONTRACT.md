# M05 Slice 10 — Mixed-channel and Provider-outage Integration Evidence

Status: `AUTHORIZED / CONTRACT LOCKED / EXECUTABLE EVIDENCE PENDING`
Tracking: #127; parent epic #34.
Owner approval: `SCHVALUJI MERGE PR #126 A POKRAČOVÁNÍ NA M05 SLICE 10`.
Reviewed predecessor head: `0db0ba7798a01ac82c6b8c2c083cef8624713b40`.
Exact predecessor merge: `59a6f8df2a45f580f100aa6d8961187ca0af6c1e`.
Implementation branch: `impl/m05-s10-mixed-channel-integration-evidence`.

## Canonical scope

Implement slice 10 of `M05_EXECUTION_PACKAGE.md`: integration evidence across mixed channels and provider outage scenarios. S01–S09 remain the production source of truth. This slice adds executable integration tests, test-only fixtures, CI evidence and documentation; it introduces no competing production orchestration, trust, archive, authorization or persistence model.

**transport != trust; extraction != verification; review != authorization; retention expiry != deletion permission**

## Composed paths

Exercise each of CAMERA, SCAN, FILE_UPLOAD, EMAIL_ATTACHMENT, SHARE_SHEET, URL and PROVIDER_ADAPTER through the real S01 submission and S02 archive contracts, S03 parent-linked extraction, S04 correction, S05 safety assessment, S06 authority resolution, S07 selection/provider-result normalization, S08 human review and S09 archive snapshot/lifecycle contracts. Each scenario asserts concrete observable state, not merely successful construction.

Use synthetic document bytes with a computed content hash, fixed UUIDv7 identities and explicit times. No actual PDF parser, OCR engine, scanner, external registry, storage service or authenticated HTTP endpoint is exercised. These integration tests prove composition of Application/Core contracts, not external provider behavior or production readiness.

Provider fixtures implement the existing VerificationProviderPort and are invoked through its execute method. Deterministic unavailable/timeout responses exercise the canonical INDETERMINATE envelopes. A timeout response is not a claim that this slice implements transport deadlines, retries or SDK exception mapping. No live credentials/network calls are used.

## Required invariants

1. All channels preserve original identity/hash and never confer trust by transport type.
2. Byte-identical submissions remain separate evidence identities and subject scopes.
3. Correction appends history and never rewrites originals or promotes extracted confidence.
4. Positive claim results remain distinct from the original EvidenceReference verification state.
5. Outages/timeouts preserve uncertainty; fallback cannot reduce assurance.
6. Manual confirmation needs the exact authority, mandate, claim, source and safe archive bindings. Quarantine, missing/conditional/conflicting authority and prior conflicts cannot be bypassed.
7. Historical snapshots preserve exact known lineage, reviews and verification provenance. Later facts cannot silently rewrite earlier snapshots.
8. Tenant/organization/subject isolation, owner/self-review exclusion, replay and optimistic revisions hold across composed paths.
9. Links/holds/pins and uncertain dependency inventories block disposal. Logical tombstones never physically erase originals.
10. Snapshot summaries exclude original locations, filenames and raw extraction values; source-linked audit records remain reproducible.

## Runtime evidence runner

A dedicated S10 runner enumerates the S01–S10 runtime files explicitly and executes each file exactly once per invocation, with visible suite progress. It records checkout SHA/tree, tool versions, expected/actual TAP counts and per-suite elapsed time. No results are reused from disk or a previous checkout. Failed, missing, cancelled, skipped or todo scenarios fail the run. Mandatory S10 identities must match the committed test index exactly.

This bounded runner is additional evidence. Existing S01–S09 shell gates, historical ancestry guards and CI workflow definitions are not weakened, replaced or skipped; all remain required through the full current-head PR workflow matrix. The old nested-regression optimization is not implemented by claiming that the new runner replaces those gates. Global CI speedup is not claimed.

The gate verifies exact predecessor ancestry and contract/index-before-executable history, rejects production source or existing-gate modifications, runs strict Application TypeScript checks and architecture checks, and invokes the full once-per-runtime-file ledger. The dedicated workflow checks out the exact pull request head.

## Acceptance and completion boundaries

The new PR remains draft until its dedicated exact-head evidence and every returned current-head PR workflow succeed. Report individual suite success separately from full-matrix readiness. Record failed first runs and concrete corrections honestly. Do not create documentation-only head changes after final validation merely to state that validation passed; append SHA-specific evidence to PR/issue metadata.

S10 is the final M05 implementation slice, but neither S10 PR merge, M05 whole-milestone acceptance, M06 admission nor production deployment is authorized by this instruction. Each later governance decision must follow the existing sequence.

Trusted authentication, real mandate issuance, current dependency loading, cross-archive cycle checks, tenant-scoped persistence and atomic UnitOfWork writes remain documented integration responsibilities. No legal retention period, real-world credential validity, medical/legal advice or external certification is inferred from these synthetic tests.
