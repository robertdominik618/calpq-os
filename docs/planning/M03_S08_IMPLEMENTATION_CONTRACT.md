# CALPQ M03 Slice 08 Implementation Contract — Mobile/Web Responsive Read Flows

Status: `IMPLEMENTING / EXECUTABLE EVIDENCE ADDED`
ID: `CALPQ-M03-S08-0001`

Admission: `CALPQ-M03-ADMIT-0001`.
Predecessor merge: M03 Slice 07 commit `8ad7ad8cffc51b0f18cb29408436cec52438ada7`.
Tracking issue: #74.
Implementation branch: `impl/m03-s08-responsive-read-flows`.

## Scope
Slice 08 implements the eighth delivery slice from `M03_EXECUTION_PACKAGE.md`: mobile/web responsive read flows.

The implementation introduces a framework-neutral `ResponsiveReadFlowReadModel` that composes approved M03 presentation sources without moving business or legal truth into responsive layout logic.

## Responsive profile
`ResponsivePresentationProfile` requires explicit controlled values:
- surface: `MOBILE` or `WEB`;
- size class: `COMPACT`, `MEDIUM`, or `EXPANDED`.

No browser viewport, user-agent, device API or ambient environment is read by the application contract. The adapter/UI layer must supply the profile explicitly.

Layout mappings are deterministic:
- compact -> single-pane stack;
- medium -> single-pane with persistent section navigation;
- expanded -> two-pane master/detail.

Navigation is presentation-specific while semantic content remains unchanged.

## Approved sources
The responsive flow consumes only already-governed M03 read models:
- `DashboardReadModel`;
- `ProfessionalPassportSummaryReadModel`;
- `CredentialCardReadModel`;
- `CredentialExplanationReadModel`;
- `ActivityTimelineReadModel`;
- `MissingConditionNextActionReadModel`;
- optional `IntentSearchReadModel`.

Composition fails closed for wrong types, authority leakage, cross-subject data, cross-assessment detail surfaces, credential-definition/requirement-set version mismatch, outcome mismatch, provenance mismatch, or a Passport summary that does not contain the selected detail assessment exactly once.

## Semantic parity
Responsive behavior may change only layout metadata: profile, navigation mode and pane placement.

Each section carries a deeply frozen snapshot produced directly from the corresponding governed source `toJSON()` contract. Section content and ordering are invariant across mobile/web and size classes. Material sections use `ALWAYS_AVAILABLE`; compact presentation may route between sections but may not remove material state merely because less screen space is available.

## Section order
Stable non-causal read order:
1. Dashboard;
2. Passport Summary;
3. Credential Card;
4. Explanation;
5. Timeline;
6. Guidance;
7. optional Search Result.

Expanded layouts place Dashboard/Passport/Search in the master pane and credential detail surfaces in the detail pane. This placement does not imply domain hierarchy or causality.

## Authority boundaries
The responsive layer has:
- `layoutAuthority = false`;
- `decisionAuthority = false`;
- `authorizationAuthority = false`.

It does not recompute eligibility, promote verification, infer lifecycle state, issue or imply AuthorizationGrant, own Credential Catalog / QualificationPath semantics, alter search ranking, or manufacture new actions/reasons.

## Framework boundary
No React, Next, Vue, Svelte, Angular, React Native, Expo, Flutter, SwiftUI, DOM API, native-device API or provider-specific UI runtime is admitted into the read-model contract.

## Verification target
Dedicated evidence must prove exactly 32 runtime scenarios plus strict TypeScript proof, Slice 07 merge ancestry, compact/medium/expanded profile mapping, mobile/web semantic parity, no material-content loss, same-subject/assessment integrity, deeply immutable content snapshots, deterministic serialization and regressions through M03 Slice 01 plus relevant FV contracts.

No mandatory test is waived or deferred.
