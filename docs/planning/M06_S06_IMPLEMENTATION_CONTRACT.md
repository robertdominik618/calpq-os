# M06 Slice 06 — Dependency Graph and Impact Traversal

Status: `AUTHORIZED / CONTRACT BEFORE SOURCE / PREDECESSOR POST-MERGE VALIDATION PENDING`
Tracking #150; epic #36.
Owner authorization: **SCHVALUJI MERGE PR #148 A POKRAČOVÁNÍ NA M06 SLICE 06.**
Predecessor PR #148 merged as `ca84ec7939471130c72a9a6463d94695d0637ddb` from reviewed S05 head `48e94a0018c056bdfce9c47d4b2fc131ad02b7e2`.
This contract may precede completion of merge-associated CI. Effective S06 activation and product source MUST NOT occur until actual successful post-merge verification is recorded.

## Ownership and canonical reuse
Original M06 execution package Slice 06 applies together with:
- `DEPENDENCY_GRAPH_REEVALUATION_MODEL.md`;
- `CHANGE_EVENT_IMPACT_MODEL.md`;
- `REEVALUATION_DECISION_EVIDENCE.md`;
- `CONTINUOUS_COMPLIANCE_STATUS_MODEL.md`;
- `M06_LIFECYCLE_CONTINUOUS_COMPLIANCE_BASELINE.md`;
- `M06_M08_INTEGRATION_SEQUENCE.md`.

Extend the existing `@calpq/application/lifecycle` package. Reuse existing Core identity/version/source/time/provenance concepts and current Application tenant/access boundaries. S06 may reference S01–S05 lifecycle object identities and versions, but it must not rewrite their source/runtime contracts.

**change event != legal conclusion; graph reachability != material impact; impact candidate != invalidation; traversal plan != reevaluation result; dependency history != mutable truth**

## Slice boundary versus S07
S06 owns the immutable dependency graph snapshot and deterministic impact traversal that identifies bounded downstream candidates and explainable dependency paths. It does **not** execute selective re-evaluations or create new eligibility, authorization, compliance, assignment, renewal or notification decisions. That execution belongs to later slices, principally S07.

A S06 impact result is therefore a governed planning/read artifact only. It may classify candidates as `MANDATORY`, `ADVISORY` or `REVIEW_ONLY`, but those modes describe required follow-up processing, not the legal state of the target object.

## Dependency node model
`LifecycleDependencyNode` is immutable and contains:
- unique bounded node reference;
- controlled node type;
- exact object/version identity where versioned;
- tenant, organization and subject scope where applicable;
- jurisdiction reference where applicable;
- provenance reference;
- recorded/known instant;
- safe metadata only.

Controlled node types cover the M01–M08 dependency spine without implementing later milestone authority:
`REGULATORY_SOURCE_VERSION`, `RULE_VERSION`, `REQUIREMENT_SET_VERSION`, `CREDENTIAL_DEFINITION_VERSION`, `QUALIFICATION_PATH_VERSION`, `RECOGNITION_ROUTE_VERSION`, `EVIDENCE_RECORD`, `ELIGIBILITY_ASSESSMENT`, `AUTHORIZATION_GRANT`, `PROFESSIONAL_PASSPORT`, `RENEWAL_POLICY`, `RECURRING_OBLIGATION`, `RENEWAL_CASE`, `NOTIFICATION_POLICY`, `ASSIGNMENT_PROFILE`, `ASSIGNMENT_DECISION`, `COMPLIANCE_PROJECTION`.

Presence of a node type does not prove that the referenced domain object is authentic, current, valid or legally authoritative. Production entrypoints remain responsible for genuine object loading and provenance.

## Typed directional edges
`LifecycleDependencyEdge` is immutable and directional. Controlled edge kinds are:
- `DERIVED_FROM`;
- `EVALUATED_AGAINST`;
- `SATISFIES`;
- `RECOGNIZED_BY`;
- `PROJECTS`;
- `DEPENDS_ON`;
- `SUPERSEDES`;
- `APPLIES_TO`.

Each edge binds exact source and target nodes, a controlled impact mode, provenance reference and knowledge instant. Self-edges are rejected. Duplicate edge identity is rejected. Unknown edge kinds or modes fail closed. Edge direction is never silently reversed.

`SUPERSEDES` is historical lineage and does not by itself authorize traversal into the superseded object's downstream dependants unless the supplied propagation contract makes that path material. S06 never interprets historical lineage as deletion or replacement.

## Graph snapshot
`LifecycleDependencyGraphSnapshot` contains one immutable graph ID/version, exact scope, bounded nodes and edges, captured/known instant and provenance. Construction validates:
- all edge endpoints exist in the same snapshot;
- node references are unique;
- edge identities are unique;
- scope compatibility is explicit;
- collections are dense, bounded and deterministically sorted;
- graph data is copied and recursively frozen;
- no ambient discovery/provider call occurs.

Disconnected components are valid. A graph may contain cycles because real dependency lineage can be malformed or mutually referential; cycles are handled during traversal rather than hidden by construction.

## Change event
`LifecycleChangeEvent` is an immutable supplied fact describing a possible change. Controlled change types:
- `REGULATORY_RULE_CHANGED`;
- `REQUIREMENT_SET_CHANGED`;
- `CREDENTIAL_STATUS_CHANGED`;
- `EVIDENCE_VERIFICATION_CHANGED`;
- `RECOGNITION_DECISION_CHANGED`;
- `ROLE_CHANGED`;
- `DELEGATION_CHANGED`;
- `ASSIGNMENT_SCOPE_CHANGED`;
- `ORGANIZATION_STATUS_CHANGED`;
- `CATALOG_MAPPING_CHANGED`;
- `CLOCK_BOUNDARY_REACHED`.

It binds a graph node, occurred/observed/effective instants where applicable, verification state, provenance, jurisdiction/scope and correlation/causation references. `CLOCK_BOUNDARY_REACHED` is a derived temporal trigger only and never an authority event.

Only a `VERIFIED` change may produce `MANDATORY` or `ADVISORY` impact candidates. `UNVERIFIED` or `REVIEW_REQUIRED` input may only produce bounded `REVIEW_ONLY` candidates. S06 does not upgrade verification.

## Selective impact traversal
`LifecycleDependencyImpactTraversal.evaluate` receives:
- exact graph snapshot;
- exact change event rooted in that graph;
- explicit evaluation/as-known time;
- bounded allowed target-node types;
- bounded maximum depth and candidate/path budgets;
- fresh scoped Application invocation and ALLOW access decision.

Traversal is downstream only and follows exact directed edges. It does not globally rebuild or select unrelated nodes. The same event + graph snapshot + traversal options must produce the same candidates, path ordering, dedup identity and reason codes.

Every candidate contains:
- target node reference/type/version;
- impact mode;
- one or more deterministic dependency paths explaining inclusion;
- triggering event identity;
- exact graph identity/version;
- required object/source versions visible in the path;
- deterministic candidate dedup key;
- reason codes;
- review boundary metadata.

Targets whose type is not explicitly allowed are not emitted, though they may appear as intermediate path nodes where permitted by traversal semantics.

## Materiality and propagation
Reachability alone is insufficient. Each traversed edge contributes its configured impact mode:
- `MANDATORY`: verified change materially requires later reevaluation;
- `ADVISORY`: verified change may affect later projection and should be considered;
- `REVIEW_ONLY`: human/governed review is required before any later reevaluation conclusion.

A path's effective mode is the safest/highest-review mode required by its edges and event verification. An unverified event forces `REVIEW_ONLY` regardless of edge mode.

S06 does not infer materiality from LLM text, delivery failure, notification acknowledgement, missing optional links or mere timestamps.

## Cycle handling
Traversal tracks exact path identity. Re-entering a node already present in the active path forms a cycle. The engine MUST:
- stop that branch at the cycle boundary;
- emit deterministic cycle metadata;
- produce `REVIEW_REQUIRED` / `REVIEW_ONLY` treatment for affected cycle-bound candidates;
- never resolve the cycle by arbitrary edge iteration order;
- never recurse indefinitely.

Equivalent graphs with different input array ordering must produce identical normalized cycle evidence.

## Temporal and historical integrity
Evaluation uses explicit `UtcInstant` values only. No `Date.now`, local timezone or implicit current time.

Future-observed events relative to the evaluation horizon fail closed. A future-effective but already verified event may be represented as future impact metadata; it must not imply that current legal/compliance state already changed.

Historical nodes, edges, prior decisions and source/evidence versions are never mutated or deleted. S06 output points to prior identities and versioned paths only.

## Authorization, tenant boundary and privacy
Every traversal/read requires exact current:
- tenant;
- organization;
- subject where scoped;
- actor identity and kind;
- purpose;
- correlation;
- operation/field authorization;
- matching ALLOW access decision.

Cross-tenant, cross-organization or foreign subject leakage is rejected before graph content is exposed. Multi-subject/organization graphs are not silently permitted by a single-subject invocation; any broader graph requires its own explicitly authorized scope contract in a later milestone.

Output contains only bounded IDs, versions, node/edge types, dependency paths, reason codes, timestamps and provenance-safe references. No raw evidence, document contents, storage locators, contact data, provider payloads or secrets.

## Determinism, deduplication and bounds
Node/edge/candidate/path ordering is canonical and independent of caller array order. Candidate dedup keys are deterministic over exact event, graph/version, target and path-relevant governed identities.

Collections, depth, paths and candidate counts have explicit hard bounds. Budget exhaustion fails closed with a distinguishable review-required result; it does not silently truncate to a false complete impact set.

Identical governed input replay is byte-stable. Input graph/event objects remain unchanged.

## Required negative authority flags
Every traversal projection serializes:
- `authorizationAuthority=false`
- `credentialStateMutated=false`
- `historicalDecisionMutated=false`
- `reevaluationPerformed=false`
- `complianceStateChanged=false`
- `notificationScheduled=false`
- `providerInvoked=false`
- `eventsEmitted=0`
- `physicalDeletionAuthorized=false`

## Mandatory evidence
104 ordered S06 product scenarios, 16 scope/governance scenarios and strict readonly/public-contract compilation assertions are mandatory.

Architecture/test index MUST precede activation and source. An immutable S06 execution record may be created only after successful S05 post-merge verification and must bind:
- this owner authorization;
- exact reviewed S05 head and merge SHA;
- actual post-merge evidence reference;
- contract and test-index commit SHAs;
- accepted predecessor progress only.

Dedicated exact-head GitHub Actions must run S06 evidence and unchanged S05/S04/S03/S02/S01 plus transitive predecessor gates on the current candidate checkout. Only the original closed S05 scope validator may run in a temporary historical worktree; historical evidence is not current runtime evidence.

## Non-goals and release boundary
No actual selective reevaluation engine (S07), continuous-compliance mutation, regulatory interpretation (M07), assignment decision execution (M08), provider, scheduler, queue, DB writer, UI, notification send, credential mutation, authorization grant/revocation, physical deletion or production release.

S06 PR merge, S07+, deployment and release require separate explicit owner approval.

Accepted predecessor coverage after a successfully verified S05 merge will be M06 5/10 and original v1 allocation 65/130. Until actual post-merge verification is complete, this contract does not itself increase accepted progress.
