# M05 Slice 08 — Exit Evidence

Status: `IMPLEMENTED / INITIAL EVIDENCE PASSED / HARDENED FINAL HEAD REQUIRES REVALIDATION`

Tracking issue: #123. Pull request: #124. Parent epic: #34.
Implementation branch: `impl/m05-s08-human-review-manual-authority`.
Owner authorization: `SCHVALUJI MERGE PR #122 A POKRAČOVÁNÍ NA M05 SLICE 08`.
Reviewed predecessor: PR #122, head `62cfeaa798f675e6e92f8f4813d9557355573e78`.
Exact predecessor merge: `1c379ba6a488d7a2dea5eb13ed987ebfb5e51b8b`.

## Predecessor admission

PR #122 was merged using the exact expected reviewed SHA. All 83 observed workflow runs for the merge completed SUCCESS before the S08 branch was created. S07 completion is recorded in PR #122 and closed issue #121. This was an integration-branch merge, not a production deployment.

## Architecture before implementation

Contract commit: `4dbcd0b09669de21a92b77ff2ec3729ae771f4d0`.
Mandatory scenario index: `052eb2dc12e72f86ba848fc0218200239d125c07`.
First production implementation: `0da2eef2116229d43153467d43f4caf17b836644`.
The executable S08 gate verifies their ancestry and that the index precedes production implementation.

## Delivered scope

- Immutable review cases bound to exact S01 submission, S02 original, S05 security, S06 authority snapshot and S07 request/registry/route.
- Tenant-, organization-, subject-, purpose-, actor-, case- and claim-scoped reviewer mandates with explicit permissions, validity, revocation and source/access/audit provenance.
- Self-review/self-grant exclusions, explicit owner exclusions and current access checks before all invocations and replays.
- Manual observations with explicit source snapshot, evidence references, assertion commitment and times.
- Authority- and security-gated claim-level outcomes; conditional/unknown/conflicting authority and quarantine remain REVIEW_REQUIRED. Unavailable sources remain INDETERMINATE.
- Generic completion and rejection close only review workflow, not evidence or legal truth. Completion requires the full case claim set and matching reviewer scope.
- Immutable command/decision histories, explicit idempotency keys, same-actor replay, monotonic time, logical optimistic revision checks and complete decision provenance.
- Public `@calpq/application/human-review` entrypoint.

**human review != manual authority confirmation != evidence verification beyond checked claims != eligibility != authorization**

## Executed initial proof

Exact implementation head `70bccc79b40b93278432816f86202d2db318aec4`:
- workflow `M05 Slice 08 Human Review`, run `35263730920`, job `105345560790`: SUCCESS;
- checkout log confirms that exact head;
- strict TypeScript compile including readonly proof: PASS;
- runtime log: tests 64, pass 64, fail 0, cancelled 0, skipped 0, todo 0;
- mandatory scenario identities matched the index;
- exact ancestry and no-Core/no-adapter/no-ambient-time guards: PASS;
- FV13 Tenant Governance run `35263730930`: SUCCESS.

This initial proof is not a claim that the complete initial PR regression matrix had finished. Other same-head workflows were still pending at that observation.

## Review hardening after initial green

Additional review identified and corrected three gaps rather than treating a green initial suite as sufficient:
1. prior results are bounded by request knowledge time, not merely later case-opening time;
2. replay invocation time is checked against existing history before returning an idempotent result;
3. generic completion requires all case claims and corresponding reviewer scope.

Scenarios 18, 51, 54 and 58 add explicit assertions for these boundaries and same-actor replay. The count remains 64; no scenario is skipped or removed.

## Final-head rule

The commit containing this file also hardens production behavior and tests. It changes the PR head. The PR may become FINAL HEAD GREEN / READY FOR REVIEW only after the dedicated exact-head S08 workflow and the entire same-head PR-triggered matrix complete successfully, including S07 transitive regressions, FV13 tenant governance and Foundation Guard. Final SHA and run references are recorded in PR #124 / issue #123 after those executions; this document cannot certify its own future run.

## Scope and deployment limitations

No production Core or provider-adapter files are changed. No provider SDK/network call, original mutation, automatic eligibility/authorization, UI, concrete repository writer, retention lifecycle or production deployment is included.

Factories validate consistency of trusted Application inputs; they do not authenticate arbitrary client JSON. Production entrypoints must authenticate principals and load current grants/access decisions, ownership exclusions and complete prior results from tenant-scoped storage. Logical history revisions are not database locks. Durable accepted history, idempotency uniqueness, audit and outbox persistence must use the existing UnitOfWork contract.

PR #124 remains unmerged. Its merge and M05 Slice 09 require fresh explicit owner authorization.
