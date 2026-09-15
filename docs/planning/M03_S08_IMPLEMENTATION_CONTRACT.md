# CALPQ M03 Slice 08 Implementation Contract — Mobile/Web Responsive Read Flows

Status: `COMPLETED / VERIFIED`
ID: `CALPQ-M03-S08-0001`

Admission: `CALPQ-M03-ADMIT-0001`.
Reviewed predecessor: M03 Slice 07 merge commit `8ad7ad8cffc51b0f18cb29408436cec52438ada7`.
Tracking issue: #74.
Pull request: #76.
Implementation branch: `impl/m03-s08-responsive-read-flows`.
Verified implementation head: `1423c26cf8044b2214a05091d81cb4df08442f94`.

## Scope
Slice 08 implements mobile/web responsive read flows as a framework-neutral presentation contract. Responsive behavior changes layout and navigation only; governed semantic content remains unchanged.

## Responsive profile
`ResponsivePresentationProfile` accepts only explicit controlled values:
- surface: `MOBILE` or `WEB`;
- size class: `COMPACT`, `MEDIUM`, or `EXPANDED`.

The application layer never reads browser viewport, user agent, DOM, native-device state or ambient environment. An outer adapter supplies the profile explicitly.

Deterministic mappings:
- COMPACT -> single-pane stack;
- MEDIUM -> single-pane with persistent section navigation;
- EXPANDED -> two-pane master/detail.

Navigation differs by profile while semantic content does not.

## Approved sources
Only governed M03 read models are accepted: Dashboard, Professional Passport Summary, Credential Card, Explanation, Activity Timeline, Missing Condition/Next Action and optional Intent Search Result.

Composition fails closed for wrong types, authority leakage, cross-subject input, cross-assessment detail state, CredentialDefinition/RequirementSet mismatch, outcome mismatch, provenance mismatch, or an ambiguous/missing detail assessment in Passport Summary.

## Semantic parity and material-content preservation
Each section contains a deeply frozen snapshot taken directly from its governed source `toJSON()` contract. The ordered material section set is invariant across mobile/web and all size classes. Compact layouts route between sections but do not drop material state.

Stable non-causal read order:
1. Dashboard;
2. Passport Summary;
3. Credential Card;
4. Explanation;
5. Timeline;
6. Guidance;
7. optional Search Result.

Expanded layout assigns overview/search surfaces to master and credential-detail surfaces to detail. Pane assignment implies no domain hierarchy or causality.

## Authority boundaries
- `layoutAuthority = false`;
- `decisionAuthority = false`;
- `authorizationAuthority = false`.

No eligibility recomputation, verification promotion, lifecycle inference, AuthorizationGrant implication, M04/M06 authority, search re-ranking authority, generated action/reason logic or other domain truth is introduced.

## Framework/runtime boundaries
No React, Next, Vue, Svelte, Angular, React Native, Expo, Flutter, SwiftUI, DOM/browser API, user-agent inference, provider-specific UI runtime, ambient wall-clock or randomness is admitted into this contract.

## Verified evidence
On `1423c26cf8044b2214a05091d81cb4df08442f94`:
- dedicated S08 workflow #6 — SUCCESS;
- 32/32 mandatory runtime scenarios — PASS;
- strict TypeScript proof — PASS;
- semantic parity and material-section preservation — PASS;
- direct S07→S01/FV-12/FV-11 runtime regressions — PASS;
- all 24/24 observed PR-triggered workflows — SUCCESS.

The S08 regression runner was de-duplicated to execute predecessor runtime tests once instead of recursively multiplying predecessor shell gates. Independent predecessor workflows still run their full gates, so test coverage was preserved while eliminating redundant execution.

No mandatory test was waived or deferred. Hard blockers: 0.
