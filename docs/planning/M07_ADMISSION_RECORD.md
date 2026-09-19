# M07 (milník 07 – regulatorní inteligence a radar) — Formal Admission for S01 (Slice 01 – implementační část 01)

ID: `CALPQ-M07-ADM-0001`  
Transition: `CALPQ-M07-ADMIT-0001`  
Status: `FORMALLY APPROVED / EXECUTION EFFECTIVE ONLY AFTER APPROVED ADMISSION MERGE + POST-MERGE VERIFICATION`  
Tracking issue #162; parent epic #37; preparation #160 / PR #161.

Owner instruction: **SCHVALUJI MERGE PR #161 (Pull Request č. 161 – návrh na sloučení změn) A PO ÚSPĚŠNÉM POST-MERGE OVĚŘENÍ POKRAČOVÁNÍ NA FORMÁLNÍ ADMISSION M07 (milník 07 – regulatorní inteligence a radar).**

## Accepted prerequisites

Preparation reviewed head: `660b469ab3cdf1bd2ca0b4bff9a0712e119e08f4`.  
Preparation merge: `3d7ed9454f517f5f82b071929b554e4a5609075e`.  
Reviewed and merged preparation tree: `2bc94834214dbeb8f641a51bfe35a4d749da1648`.  
Preparation merge approval: PR #161 comment `5745674004`.  
Preparation post-merge evidence: PR #161 comment `5745766680`.

The actual preparation merge completed **62/62 observed workflow runs SUCCESS** with zero failure, cancellation or pending run. Direct reviewed-head-to-merge comparison contained zero changed files.

M06 (milník 06 – lifecycle a průběžná shoda) remains technically accepted at `f71bc084e6dc7778a13b0ad80b7637f6663005f8`; M04 (milník 04 – katalog, kvalifikační cesty a gap analýza) stable anchor remains `d2f04aa2bcc68edf1d20deb345faa8a8c239e23d`.

Normative source governance remains `CALPQ-REG-0001` in `docs/foundation/REGULATORY_SOURCE_GOVERNANCE.md`.

## Decision and exact entry

Machine decision: `m07-admission-decision.json` (`CALPQ-M07-ADM-DEC-0001`).

Only authorized execution entry after a separately approved admission merge and its successful post-merge verification:

`M07_SLICE_01_AUTHORITATIVE_SOURCE_REGISTRY`

Only authorized product slice: **S01 (Slice 01 – implementační část 01, registr autoritativních regulatorních zdrojů)**.

This admission transition does not authorize S02–S10, M08+, production release, legal interpretation authority or automatic activation of parser/AI/OCR-derived regulatory conclusions.

## Existing architecture and non-authority

S01 must reuse:
- `CALPQ-REG-0001` Regulatory Source Governance;
- Core provenance/source-reference, jurisdiction, version and time contracts;
- M04 versioned RequirementSet/catalog provenance semantics;
- M05 trust/human-review boundaries;
- M06 dependency, reevaluation, replay and continuous-compliance semantics.

No second legal-truth registry, parallel clock, duplicate provenance model or AI authority path is permitted.

S01 may model source authority, canonical locator/reference, jurisdiction/domain, source type/classification, source/version identities, publication/retrieval/effective-date metadata and verification/review state.

S01 may **not** fetch live production sources, infer final legal applicability, mark parser/AI output VERIFIED, rewrite M04 requirements, trigger M06 reevaluation, notify users, or create legal/authorization decisions.

**source material != interpreted rule != applicability; parser output != VERIFIED truth; recommendation != authorization; current law != historical rewrite**

## Effective-condition boundary

The owner instruction authorizes creation of this formal-admission transition after successful preparation post-merge evidence. It does not authorize merging this admission PR automatically.

Execution becomes effective only after:
1. exact admission head is fully green;
2. owner separately approves merge of the admission PR;
3. guarded merge uses that exact reviewed head;
4. actual admission merge is post-merge verified;
5. an immutable S01 activation record, implementation contract and scenario index are committed before product source.

## CI and successor compatibility

Historical M03–M06 decisions remain immutable. Earlier guards may become aware of the separately validated M07 admission only through exact successor dispatch; their original decisions and current runtime regressions remain intact. M08 remains blocked.

The preparation record remains PREPARATION_ONLY and immutable. Its validator may dispatch to the formal M07 admission validator when the exact decision file is present. Malformed or unknown successor states fail closed.

## Progress and exclusions

M06 accepted = 10/10. M07 delivered product slices = 0/10. Original version-1 plan allocation remains **70/130 = 53.85%**. Governance/admission work creates no product-delivery credit.

No production source acquisition, provider adapter, database deployment, production authentication/current grants, physical deletion, key destruction, legal opinion, production UI or M08+ implementation is delivered by this transition.
