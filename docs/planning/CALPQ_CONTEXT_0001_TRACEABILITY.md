# CALPQ-CONTEXT-0001 — Adoption, impact and traceability

Status: OWNER-REQUESTED TARGET ARCHITECTURE
Date: 2026-09-23
Owner issue: https://github.com/robertdominik618/calpq-os/issues/168

## 1. Owner intent

The owner requested a CALPQ engine that detects relevant rule changes when moving between states by GPS and extends the concept to position/time-sensitive rules, including driving rules, side of road, BAC/BrAC, credential applicability, distance from coast and maritime time rules, plus all similar variants.

The requested implementation is interpreted as architecture incorporation. Runtime tracking, live legal rules and production notifications remain separately gated.

## 2. Impact analysis

| Existing area | Reuse / impact |
|---|---|
| Credential/Activity Graph | supplies affected credentials and activity scope |
| Eligibility Core | remains the sole deterministic condition evaluator |
| M06 Lifecycle | supplies explicit time semantics |
| M06 Notification Policy | consumes ContextAlertIntent in future admission |
| M06 Dependency Graph | maps rule/source/boundary changes to affected targets |
| M06 Selective Re-evaluation | re-evaluates only affected scope |
| M06 Continuous Compliance | optional current projection input/output reference |
| M06 Historical Replay | reproduces prior context/delta decisions |
| M07 Regulatory Intelligence | ingests/reviews source changes and impact |
| EXPATS/MobilityCase | travel/mobility use cases |
| GLOBAL PR #138 | intended global jurisdiction/applicability and country-pack dependency |
| Family/Age | age-sensitive context without automatic family location sharing |
| B2B Assignment | assignment relevance without workforce surveillance |
| Localization | localized explanation only; semantic IDs remain stable |
| Privacy/Audit | purpose, minimization, provenance and replay |

No new technology choice is made.

## 3. Dependency status

As of intake:
- M06 Slice 10 is merged/completed in the program line.
- M07 S01 implementation PR #165 is open.
- CALPQ-GLOBAL-0001 PR #138 is open/unmerged.
- EXPATS PR #135 is open/unmerged.
- AI-economy architecture PR #167 uses ADR-0006 and is unrelated.

Therefore this architecture can be stored now, but runtime admission requiring GLOBAL pack semantics must remain blocked until a compatible integration exists.

## 4. Domain coverage registry

Twenty architecture families are defined as CTX-D01..CTX-D20 in the baseline and scope registry. Coverage means “the engine model can represent the context”, not “all legal rules are implemented”.

## 5. Trigger registry

Eighteen trigger families are defined as CTX-T01..CTX-T18. Triggers request re-evaluation; they are not legal outcomes.

## 6. Representative authoritative research

The source URLs and limitations are recorded in DYNAMIC_OPERATIONAL_SOURCE_MODEL.md.

Important verified architectural observations:
- EU road rules vary nationally across alcohol, speed, equipment, lighting, winter tyres and driving side.
- Driving-licence recognition can depend on licence/document circumstances.
- urban vehicle access schemes can be zone- and vehicle-dependent.
- COLREG separates general steering/sailing rules from lights; Rule 20 applies lights from sunset to sunrise.
- UNCLOS allows territorial sea up to 12 nautical miles but does not replace local navigation rules.
- EASA geo-zones can restrict/exclude drone operations and require current national information.
- SERA rules demonstrate altitude/visibility/night/airspace-dependent conditions.
- IALA area notices demonstrate time-dependent geographic operational information.
- ADR and professional road rules demonstrate credential/activity plus operational context.
- customs/cash/excise/pet travel demonstrate non-credential border obligations that can reuse the same context engine.

These are discovery facts. No numeric legal threshold is imported into runtime by this architecture.

## 7. Forty-eight product acceptance scenarios

All scenarios below are SPECIFIED_NOT_EXECUTED.

| ID | Scenario / expected architecture behavior |
|---|---|
| CTX-AC-001 | Cross-country road route → show only reviewed material rule deltas |
| CTX-AC-002 | Enter left-driving jurisdiction → driving-side delta can be surfaced |
| CTX-AC-003 | BAC/BrAC differs → exact applicable driver-class rule, never global default |
| CTX-AC-004 | Speed regime differs → bind road/vehicle class and source version |
| CTX-AC-005 | Winter-equipment seasonal rule starts → time + jurisdiction trigger |
| CTX-AC-006 | Daytime-light rule differs → delta without duplicating unrelated rules |
| CTX-AC-007 | Provisional/temporary licence recognition unknown → REVIEW_REQUIRED |
| CTX-AC-008 | Licence category restriction differs → affected credential/activity shown |
| CTX-AC-009 | Enter UVAR/LEZ zone → vehicle-specific access delta |
| CTX-AC-010 | Route leaves UVAR zone → restriction removal does not imply general permission |
| CTX-AC-011 | Professional driver context → no hidden tachograph implementation |
| CTX-AC-012 | Temporary driving/rest exception changes → exact reviewed source/effectivity |
| CTX-AC-013 | ADR route/tunnel condition → cargo/vehicle/credential context required |
| CTX-AC-014 | Missing cargo fact → unknown, not inferred from profile |
| CTX-AC-015 | Enter territorial waters → jurisdiction context changes |
| CTX-AC-016 | Enter port/harbour zone → local overlay composes explicitly |
| CTX-AC-017 | Sunset occurs → only rule-defined sunset effects activate |
| CTX-AC-018 | Twilight differs from sunset → no silent equivalence |
| CTX-AC-019 | Restricted visibility → observation-driven re-evaluation where rule uses it |
| CTX-AC-020 | Distance-from-coast rule → threshold comes from exact pack, not Core constant |
| CTX-AC-021 | Inland-waterway transition → separate local navigation scope |
| CTX-AC-022 | Maritime operational notice starts → time/geometry notice trigger |
| CTX-AC-023 | Maritime notice cancelled → cancellation distinct from natural expiry |
| CTX-AC-024 | Drone approaches excluded geo-zone → pre-entry alert intent |
| CTX-AC-025 | Drone crosses state border → credential/operation scope re-evaluated |
| CTX-AC-026 | Specific-category local mitigation required → no reuse of generic open result |
| CTX-AC-027 | Geo-zone feed stale → no current safe-zone assurance |
| CTX-AC-028 | Manned VFR night transition → explicit night/airspace context |
| CTX-AC-029 | Airspace boundary changes → exact class/authority source |
| CTX-AC-030 | Temporary airspace restriction → operational source distinct from law |
| CTX-AC-031 | Radio band/power context changes → local spectrum pack can trigger delta |
| CTX-AC-032 | Protected-area seasonal closure → zone + date trigger |
| CTX-AC-033 | Fishing/hunting permit territory changes → local permit scope re-evaluated |
| CTX-AC-034 | Cash declaration boundary → supported border rule can alert |
| CTX-AC-035 | Excise/age/quantity rule → preserve quantity/unit/legal meaning |
| CTX-AC-036 | Pet destination treatment window → destination + time document rule |
| CTX-AC-037 | Regulated-substance rule differs → no universal age/quantity/impairment constant |
| CTX-AC-038 | Mobile professional credential not recognized → do not infer equivalence |
| CTX-AC-039 | Temporary emergency zone → high-priority reviewed operational alert |
| CTX-AC-040 | GPS accuracy circle overlaps two jurisdictions → boundary uncertain |
| CTX-AC-041 | Spoofed/simulated location → observation marked untrusted |
| CTX-AC-042 | User denies GPS → manual plan/context mode remains available |
| CTX-AC-043 | Offline corridor pack → freshness visible; dynamic claims suppressed if stale |
| CTX-AC-044 | Route deviation → re-resolve corridor; do not persist unwanted travel diary |
| CTX-AC-045 | DST/timezone border → legal local time resolved from jurisdiction context |
| CTX-AC-046 | Repeated samples → dedup prevents alert spam |
| CTX-AC-047 | Employer asks for raw worker route → access denied absent separate authorization |
| CTX-AC-048 | Historical replay → exact observation/boundary/rule/evaluator reproduces prior delta |

## 8. Required negative cases

Future runtime test design must explicitly include:
- no location;
- stale location;
- low accuracy;
- wrong timezone;
- boundary overlap;
- conflicting rule packs;
- missing pack;
- stale dynamic source;
- withdrawn source;
- provider outage;
- GPS spoof/simulation;
- route-plan/live mismatch;
- unsupported credential;
- unsupported domain;
- background permission revoked;
- source effective in future;
- retroactive correction;
- notification duplicate;
- organization access mismatch;
- family access mismatch;
- commercial provider attempting authority escalation;
- AI explanation diverging from structured delta.

## 9. Progress semantics

This architecture addition earns no runtime delivery unit.

The most recent completed v1 program unit before this intake is M06 S10, following 69/130 accepted predecessor units. Therefore repository program execution is 70/130 = 53.85% of the original v1 execution-unit denominator. This percentage does not include expanded EXPATS/GLOBAL/CONTEXT scope and is not production readiness.

## 10. Future admission

Runtime must be separately sliced and owner-authorized. The first pilot should deliberately be narrow, e.g. reviewed road-transition deltas for two adjacent jurisdictions plus one maritime or UAS scenario, rather than pretending global legal coverage.

## 11. Architectural proof target

The architecture checker must prove:
- 20/20 domain families present;
- 18/18 trigger families present;
- 48/48 product scenarios remain SPECIFIED_NOT_EXECUTED;
- all local links resolve;
- canonical Foundation files are append-only relative to base commit;
- no production source/runtime file is changed;
- architecture exists before validator/tooling commits;
- dependency on #138 is explicit and not treated as merged.
