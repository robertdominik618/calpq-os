# M06 Slice 07 — Exit Evidence

Status: `ARCHITECTURE + TEST INDEX PINNED / ACTIVATION NEXT / PRODUCT SOURCE NOT YET WRITTEN`
Tracking #152; epic #36. Branch `impl/m06-s07-selective-reevaluation`.
Owner authorization: **SCHVALUJI MERGE PR #151 A POKRAČOVÁNÍ NA M06 SLICE 07.**

## Verified prerequisite
PR #151 reviewed head `21c4a48df955852a8e316106f2a8fa9966a9e76c` merged to `planning/program-execution-m09-m12` as **471ba0042d4ce44dec4a123ad2ebe4746f57c1ba**.
Reviewed-head-to-merge comparison has zero changed files. Actual post-merge evidence is PR #151 comment **5741732658**, confirming **51/51 completed SUCCESS** merge-associated workflows.

Accepted predecessor progress is **M06 6/10 = 60%** and original v1 allocation **66/130 = 50.77%**.

## Architecture-first anchors
- implementation contract: **b1da2b7eca36f78a6c54b883fc0c98e06cff3427**;
- mandatory 112-scenario test index: **c6ea7845484922da355a510e9d9297c12d85765a**.

Both anchors precede the S07 activation record, executable test specifications and product source.

## Planned governed scope
S07 will remain inside the existing Application lifecycle package and add:
- immutable reevaluation facts bound to exact S06 candidates;
- deterministic selective evaluation ordering;
- immutable reevaluation decision evidence;
- explicit unchanged/status-changed/future/action/review/indeterminate outcomes;
- exact previous-decision linkage without overwrite;
- deterministic logical decision/dedup identity;
- current tenant/access enforcement and safe metadata-only serialization.

Expected governed bundle is 17 paths: 11 additions and six constrained modifications. The six modifications are lifecycle barrel export, Application package test registration, Application TypeScript include, and exact successor-compatibility patches to S06/S05/S04 scope helpers. No Core/provider/UI/database/scheduler file is in scope.

## Required execution evidence
Dedicated exact-head GitHub Actions must establish:
- **112/112** S07 product scenarios;
- **16/16** S07 scope/governance scenarios;
- **22** readonly/public-contract assertions and strict Application compilation;
- unchanged S06 **104/104**, S05 **96/96**, S04 **88/88**, S03 **80/80**, S02 **72/72**, S01 **64/64**, plus transitive predecessor gates on the current candidate checkout;
- full same-head pull-request workflow matrix independently complete.

Only the original closed S06 scope validator may run in a temporary detached worktree at the actual S06 merge. Historical scope evidence is not current runtime evidence.

## Semantic boundary
**impact candidate != reevaluation decision; reevaluation decision != authorization mutation; unchanged result != absent audit evidence; future impact != current non-compliance; review required != inferred failure; historical decision != mutable truth**

No S08 continuous-compliance mutation, regulatory interpretation, assignment decision, provider, scheduler, queue, database writer, UI, notification send, credential/authorization mutation, physical deletion or production release is included.

Actual activation commit, executable-spec commits, first source commit, exact candidate head/tree, workflow run/job IDs, failures/corrections and final workflow matrix must be recorded after they exist. This authored file does not certify future execution success.

S07 pull-request merge, S08+ and production deployment remain separately gated.
