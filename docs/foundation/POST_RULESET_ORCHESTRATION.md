# CALPQ Post-Ruleset Governance Orchestration

Status: `ACTIVE READ-ONLY GOVERNANCE ROUTER`

## Purpose

This layer removes ambiguity after GitHub `main` protection becomes active. It does **not** approve, mutate, release, open, admit, merge, or implement anything. It resolves the single governance action that is allowed next from the currently persisted machine state plus live repository governance.

Authoritative resolver:

```bash
bash scripts/post_ruleset_orchestrator.sh
```

The resolver always prints `CALPQ_MUTATION=NONE` when it returns a normal next-action state.

## Canonical sequence

The only supported progression is:

1. `REPOSITORY_GOVERNANCE`
2. `CLOSE_M00_BLOCKER`
3. `M00_RELEASE`
4. `FEATURE_DEVELOPMENT_GATE`
5. `FV00_FORMAL_ADMISSION`
6. `M02_BATCH_A_FV01`

No item in this sequence authorizes the following item automatically.

## State mapping

| Persisted state | Additional live condition | Resolver output |
| --- | --- | --- |
| M00 `BLOCKED`, feature `FROZEN`, Feature Gate `LOCKED`, FV-00 blocked | repository governance fails | `REPOSITORY_GOVERNANCE` |
| same | repository governance passes, issue #2 open | `CLOSE_M00_BLOCKER` |
| same | repository governance passes, issue #2 closed | `M00_RELEASE` |
| M00 `RELEASED`, feature `FROZEN`, Feature Gate `LOCKED` | repository governance passes, issue #2 closed | `FEATURE_DEVELOPMENT_GATE` |
| M00 `RELEASED`, feature `AUTHORIZED`, Feature Gate `OPEN`, FV-00 blocked | repository governance passes, issue #2 closed, issue #7 open | `FV00_FORMAL_ADMISSION` |
| M00 `RELEASED`, feature `AUTHORIZED`, Feature Gate `OPEN`, FV-00 admitted | repository governance passes | `M02_BATCH_A_FV01` |

## Fail-closed conditions

The resolver must fail instead of guessing when any of the following occurs:

- an unsupported cross-gate state combination is observed;
- repository governance regresses after M00 has already advanced beyond `BLOCKED`;
- M00 is released while blocker #2 is open;
- Feature Development Gate is open while blocker #2 is open;
- FV-00 formal admission is pending while issue #7 is not open;
- an admitted FV-00 decision does not authorize exactly `M02_BATCH_A_FV01`;
- machine evidence files are missing or structurally inconsistent.

## Approval separation

The resolver intentionally never calls transition scripts. The three mutating governance transitions remain separate and retain their own explicit tokens:

- `scripts/m00_release_transition.sh` requires `APPROVE_CALPQ_M00_RELEASE`;
- `scripts/feature_development_gate_transition.sh` requires `APPROVE_CALPQ_FEATURE_DEVELOPMENT`;
- `scripts/fv00_admission_transition.sh` requires `APPROVE_CALPQ_FV00_ADMISSION`.

A repository ruleset becoming active therefore cannot, by itself, release M00, authorize feature development, admit FV-00, or create product code.

## Operational use

The manual workflow `.github/workflows/governance-next-action.yml` exposes this read-only resolver in GitHub Actions. It may be run after an administrator changes repository protection or after any governance transition to prove what the next legal action is.

## Safety invariant

`main protection -> blocker closure -> explicit M00 release -> explicit feature gate -> explicit FV-00 admission -> FV-01 implementation`

Every arrow is a separate governance boundary. No automatic chaining is permitted.
