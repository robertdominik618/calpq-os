# M06 Slice 10 — Mandatory Integration Test Index

Status: `PLANNED / NO EXECUTED RESULTS CLAIMED`
Tracking issue #158; epic issue #36.
Owner authorization: **SCHVALUJI MERGE PR #157 A POKRAČOVÁNÍ NA M06 SLICE 10.**

All 136 scenario IDs must exist exactly once, execute in this order, and finish with zero skipped/todo/only cases before S10 can be called validated.

## Integration boundary

**integration evidence != authorization; expiry planning != renewal authority; notification intent != domain truth; impact candidate != reevaluation result; compliance projection != authorization; AS_WAS != AS_IS; replay divergence != mutation**

## Mandatory scenarios

| ID | Family | Required scenario |
|---|---|---|
| M06S10-001 | EXPIRY_RENEWAL | lifecycle basis identity reaches expiry policy unchanged |
| M06S10-002 | EXPIRY_RENEWAL | explicit expiry date drives renewal window |
| M06S10-003 | EXPIRY_RENEWAL | expiry without renewal rule remains non-authoritative |
| M06S10-004 | EXPIRY_RENEWAL | renewal readiness never extends credential validity |
| M06S10-005 | EXPIRY_RENEWAL | recurring obligation due date remains version-bound |
| M06S10-006 | EXPIRY_RENEWAL | missed recurring obligation does not fabricate revocation |
| M06S10-007 | EXPIRY_RENEWAL | renewal workflow opens without credential mutation |
| M06S10-008 | EXPIRY_RENEWAL | renewal workflow ready state is not renewed state |
| M06S10-009 | EXPIRY_RENEWAL | submitted renewal case remains workflow evidence only |
| M06S10-010 | EXPIRY_RENEWAL | recorded renewal outcome remains separate from authorization |
| M06S10-011 | EXPIRY_RENEWAL | notification intent derives from governed lifecycle trigger |
| M06S10-012 | EXPIRY_RENEWAL | notification deduplication preserves underlying obligation |
| M06S10-013 | EXPIRY_RENEWAL | notification acknowledgement does not complete renewal |
| M06S10-014 | EXPIRY_RENEWAL | notification escalation does not fabricate legal urgency |
| M06S10-015 | EXPIRY_RENEWAL | future expiry may create at-risk projection |
| M06S10-016 | EXPIRY_RENEWAL | future expiry does not create current non-compliance |
| M06S10-017 | EXPIRY_RENEWAL | expired verified blocking condition may support non-compliance projection |
| M06S10-018 | EXPIRY_RENEWAL | stale expiry evidence yields indeterminate projection |
| M06S10-019 | EXPIRY_RENEWAL | review-required expiry evidence yields review-required projection |
| M06S10-020 | EXPIRY_RENEWAL | expiry projection preserves exact jurisdiction |
| M06S10-021 | EXPIRY_RENEWAL | expiry projection preserves exact tenant scope |
| M06S10-022 | EXPIRY_RENEWAL | expiry projection preserves exact subject scope |
| M06S10-023 | EXPIRY_RENEWAL | expiry projection preserves source version references |
| M06S10-024 | EXPIRY_RENEWAL | expiry projection preserves rule version references |
| M06S10-025 | EXPIRY_RENEWAL | expiry chain excludes raw document payloads |
| M06S10-026 | EXPIRY_RENEWAL | expiry chain excludes provider invocation |
| M06S10-027 | EXPIRY_RENEWAL | expiry chain emits no authorization mutation |
| M06S10-028 | EXPIRY_RENEWAL | expiry chain emits no historical mutation |
| M06S10-029 | EXPIRY_RENEWAL | expiry chain retains deterministic reason ordering |
| M06S10-030 | EXPIRY_RENEWAL | expiry chain replay is byte-stable |
| M06S10-031 | EXPIRY_RENEWAL | AS_WAS replay uses original expiry inputs |
| M06S10-032 | EXPIRY_RENEWAL | AS_IS replay may use current expiry inputs |
| M06S10-033 | EXPIRY_RENEWAL | AS_WAS never substitutes current renewal policy |
| M06S10-034 | EXPIRY_RENEWAL | AS_WAS missing historical expiry input fails closed |
| M06S10-035 | EXPIRY_RENEWAL | AS_IS changed expiry can produce explained divergence |
| M06S10-036 | EXPIRY_RENEWAL | replay match does not prove source truth |
| M06S10-037 | EXPIRY_RENEWAL | replay divergence does not rewrite historical decision |
| M06S10-038 | EXPIRY_RENEWAL | renewal notification remains non-authoritative in replay |
| M06S10-039 | EXPIRY_RENEWAL | recurring obligation history remains immutable |
| M06S10-040 | EXPIRY_RENEWAL | renewal case history remains immutable |
| M06S10-041 | EXPIRY_RENEWAL | current compliance remains separate from historical outcome |
| M06S10-042 | EXPIRY_RENEWAL | expiry family preserves negative provider flag |
| M06S10-043 | EXPIRY_RENEWAL | expiry family preserves negative event-emission flag |
| M06S10-044 | EXPIRY_RENEWAL | expiry family preserves negative physical-deletion flag |
| M06S10-045 | EXPIRY_RENEWAL | expiry family preserves negative production-release flag |
| M06S10-046 | EXPIRY_RENEWAL | expiry family deterministic evidence identity stable |
| M06S10-047 | EXPIRY_RENEWAL | expiry family current and historical outputs remain separately addressable |
| M06S10-048 | EXPIRY_RENEWAL | expiry family integration evidence is metadata-only |
| M06S10-049 | CHANGED_EVIDENCE | verified evidence change roots dependency traversal |
| M06S10-050 | CHANGED_EVIDENCE | unverified evidence change forces review-only impact |
| M06S10-051 | CHANGED_EVIDENCE | review-required evidence change remains review-only |
| M06S10-052 | CHANGED_EVIDENCE | changed evidence selects only linked target |
| M06S10-053 | CHANGED_EVIDENCE | unrelated target excluded from traversal |
| M06S10-054 | CHANGED_EVIDENCE | multiple dependency paths deduplicate one target |
| M06S10-055 | CHANGED_EVIDENCE | cycle-bound evidence path fails closed to review |
| M06S10-056 | CHANGED_EVIDENCE | path budget exhaustion prevents false-complete reevaluation |
| M06S10-057 | CHANGED_EVIDENCE | candidate budget exhaustion prevents false-complete reevaluation |
| M06S10-058 | CHANGED_EVIDENCE | depth budget exhaustion prevents false-complete reevaluation |
| M06S10-059 | CHANGED_EVIDENCE | selective reevaluation consumes exact candidate identity |
| M06S10-060 | CHANGED_EVIDENCE | foreign reevaluation fact rejected |
| M06S10-061 | CHANGED_EVIDENCE | changed evidence version binding must match candidate |
| M06S10-062 | CHANGED_EVIDENCE | missing reevaluation result yields indeterminate evidence |
| M06S10-063 | CHANGED_EVIDENCE | unchanged reevaluation still creates audit evidence |
| M06S10-064 | CHANGED_EVIDENCE | changed reevaluation creates status-changed evidence |
| M06S10-065 | CHANGED_EVIDENCE | explicit action-required remains distinct outcome |
| M06S10-066 | CHANGED_EVIDENCE | review evaluator result remains review-required |
| M06S10-067 | CHANGED_EVIDENCE | indeterminate evaluator result remains indeterminate |
| M06S10-068 | CHANGED_EVIDENCE | reevaluation does not mutate prior decision |
| M06S10-069 | CHANGED_EVIDENCE | reevaluation decision identity is deterministic |
| M06S10-070 | CHANGED_EVIDENCE | reevaluation deduplication identity is deterministic |
| M06S10-071 | CHANGED_EVIDENCE | continuous compliance may consume exact reevaluation reference |
| M06S10-072 | CHANGED_EVIDENCE | generic reevaluation result text is not compliance truth |
| M06S10-073 | CHANGED_EVIDENCE | verified current blocking evidence may support non-compliant |
| M06S10-074 | CHANGED_EVIDENCE | unverified evidence cannot establish compliant |
| M06S10-075 | CHANGED_EVIDENCE | unverified evidence cannot establish non-compliant |
| M06S10-076 | CHANGED_EVIDENCE | future evidence impact remains future risk |
| M06S10-077 | CHANGED_EVIDENCE | stale evidence fact becomes indeterminate |
| M06S10-078 | CHANGED_EVIDENCE | organization summary does not infer assignment authority |
| M06S10-079 | CHANGED_EVIDENCE | continuous projection remains read-only |
| M06S10-080 | CHANGED_EVIDENCE | historical anchor retains pre-change evidence set |
| M06S10-081 | CHANGED_EVIDENCE | AS_WAS uses original evidence references |
| M06S10-082 | CHANGED_EVIDENCE | AS_IS may use changed evidence references |
| M06S10-083 | CHANGED_EVIDENCE | evidence difference appears explicitly in replay comparison |
| M06S10-084 | CHANGED_EVIDENCE | missing historical evidence fails closed |
| M06S10-085 | CHANGED_EVIDENCE | changed evidence divergence requires governed reason |
| M06S10-086 | CHANGED_EVIDENCE | historical defect creates corrective review reference not mutation |
| M06S10-087 | CHANGED_EVIDENCE | changed evidence chain preserves tenant scope |
| M06S10-088 | CHANGED_EVIDENCE | changed evidence chain preserves purpose scope |
| M06S10-089 | CHANGED_EVIDENCE | changed evidence chain excludes raw evidence body |
| M06S10-090 | CHANGED_EVIDENCE | changed evidence chain invokes no provider |
| M06S10-091 | CHANGED_EVIDENCE | changed evidence chain emits no domain event |
| M06S10-092 | CHANGED_EVIDENCE | changed evidence chain remains byte-stable on identical replay |
| M06S10-093 | CHANGED_REQUIREMENT | verified rule change roots dependency traversal |
| M06S10-094 | CHANGED_REQUIREMENT | verified requirement-set change roots dependency traversal |
| M06S10-095 | CHANGED_REQUIREMENT | unverified rule change forces review-only impact |
| M06S10-096 | CHANGED_REQUIREMENT | rule change excludes disconnected targets |
| M06S10-097 | CHANGED_REQUIREMENT | requirement change preserves exact graph version |
| M06S10-098 | CHANGED_REQUIREMENT | requirement change preserves provenance reference |
| M06S10-099 | CHANGED_REQUIREMENT | requirement change preserves jurisdiction scope |
| M06S10-100 | CHANGED_REQUIREMENT | supersedes lineage alone does not invalidate target |
| M06S10-101 | CHANGED_REQUIREMENT | mandatory edge yields mandatory reevaluation candidate |
| M06S10-102 | CHANGED_REQUIREMENT | advisory edge yields advisory reevaluation candidate |
| M06S10-103 | CHANGED_REQUIREMENT | review-only edge yields review-only candidate |
| M06S10-104 | CHANGED_REQUIREMENT | mixed propagation resolves to safest review mode |
| M06S10-105 | CHANGED_REQUIREMENT | deterministic traversal order independent of input ordering |
| M06S10-106 | CHANGED_REQUIREMENT | selective reevaluation uses only discovered targets |
| M06S10-107 | CHANGED_REQUIREMENT | reevaluation version bindings equal candidate required versions |
| M06S10-108 | CHANGED_REQUIREMENT | changed rule may create changed reevaluation outcome |
| M06S10-109 | CHANGED_REQUIREMENT | unchanged result remains explicit audit evidence |
| M06S10-110 | CHANGED_REQUIREMENT | future-effective rule produces future impact evidence |
| M06S10-111 | CHANGED_REQUIREMENT | future-effective rule does not change current compliance |
| M06S10-112 | CHANGED_REQUIREMENT | current verified blocking requirement may support non-compliant |
| M06S10-113 | CHANGED_REQUIREMENT | future rule may support at-risk projection |
| M06S10-114 | CHANGED_REQUIREMENT | missing rule facts yield indeterminate projection |
| M06S10-115 | CHANGED_REQUIREMENT | ambiguous rule facts yield review-required projection |
| M06S10-116 | CHANGED_REQUIREMENT | continuous compliance preserves source version metadata |
| M06S10-117 | CHANGED_REQUIREMENT | continuous compliance preserves rule version metadata |
| M06S10-118 | CHANGED_REQUIREMENT | AS_WAS uses original rule versions |
| M06S10-119 | CHANGED_REQUIREMENT | AS_WAS uses original requirement versions |
| M06S10-120 | CHANGED_REQUIREMENT | AS_IS may use changed rule versions |
| M06S10-121 | CHANGED_REQUIREMENT | AS_IS may use changed requirement versions |
| M06S10-122 | CHANGED_REQUIREMENT | rule-version difference appears in replay metadata |
| M06S10-123 | CHANGED_REQUIREMENT | requirement-version difference appears in replay metadata |
| M06S10-124 | CHANGED_REQUIREMENT | current rules never backfill AS_WAS |
| M06S10-125 | CHANGED_REQUIREMENT | version unavailable historical input fails closed |
| M06S10-126 | CHANGED_REQUIREMENT | changed requirement replay may yield changed outcome |
| M06S10-127 | CHANGED_REQUIREMENT | explained divergence requires governed reason evidence |
| M06S10-128 | CHANGED_REQUIREMENT | replay comparison keeps original outcome separate |
| M06S10-129 | CHANGED_REQUIREMENT | replay comparison keeps AS_WAS outcome separate |
| M06S10-130 | CHANGED_REQUIREMENT | replay comparison keeps AS_IS outcome separate |
| M06S10-131 | CHANGED_REQUIREMENT | changed requirement chain never grants authorization |
| M06S10-132 | CHANGED_REQUIREMENT | changed requirement chain never mutates credential |
| M06S10-133 | CHANGED_REQUIREMENT | changed requirement chain never mutates history |
| M06S10-134 | CHANGED_REQUIREMENT | changed requirement chain never infers assignment authority |
| M06S10-135 | CHANGED_REQUIREMENT | changed requirement chain invokes no provider |
| M06S10-136 | CHANGED_REQUIREMENT | changed requirement chain remains deterministic and metadata-only |

## Additional mandatory gates
- 16 ordered S10 scope/governance tests.
- 28 readonly/public-contract compile assertions across existing S01-S09 output types.
- Exact architecture-first ancestry: contract -> test index -> verified-predecessor activation -> executable integration specifications.
- No new Application business source file and no lifecycle barrel export.
- Exact governed file delta only.
- Unchanged S09 128/128, S08 120/120, S07 112/112, S06 104/104, S05 96/96, S04 88/88, S03 80/80, S02 72/72, S01 64/64 plus all transitive predecessor gates on the current checkout.
- Full same-head pull-request workflow matrix independently complete.
- No production release claim.

This index defines required evidence only and claims no executed result.
