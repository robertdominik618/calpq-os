# CALPQ-TRANSPORT-0001 — Traceability & Acceptance Specification

Status: `SPECIFIED_NOT_EXECUTED`  
Date: 2026-10-01  
Issue: [#171](https://github.com/robertdominik618/calpq-os/issues/171)

## 1. Requirement traceability

| ID | Requirement |
|---|---|
| TR-REQ-001 | Distinguish vehicle technical category from registered category. |
| TR-REQ-002 | Distinguish physical camping fit-out from authority-approved conversion and registered state. |
| TR-REQ-003 | Store vehicle maximum mass separately from combination maximum mass. |
| TR-REQ-004 | Include trailer/semitrailer where the applicable rule requires combination mass. |
| TR-REQ-005 | Distinguish GOODS/PASSENGERS/OTHER/MIXED/UNKNOWN. |
| TR-REQ-006 | Distinguish for-hire/reward, own-account professional and private non-commercial operation. |
| TR-REQ-007 | Distinguish domestic, international, cabotage and transit. |
| TR-REQ-008 | Resolve effective-dated EU/regime and national rule packs. |
| TR-REQ-009 | Separate driving/rest applicability from tachograph installation. |
| TR-REQ-010 | Separate tachograph installation from tachograph use. |
| TR-REQ-011 | Support manual/alternative recordkeeping as an independent obligation. |
| TR-REQ-012 | Keep break/daily-rest/weekly-rest rule sets versioned, not UI constants. |
| TR-REQ-013 | Support national supplemental rules without leaking them into other jurisdictions. |
| TR-REQ-014 | Support direct exclusions/exemptions with evidence requirements. |
| TR-REQ-015 | Never convert missing evidence into compliance. |
| TR-REQ-016 | Preserve exact source/version/reason for each decision dimension. |
| TR-REQ-017 | Preserve historical replay after legal or registration change. |
| TR-REQ-018 | Regulatory proposals remain non-effective until final effective law is verified. |
| TR-REQ-019 | Explain what fact would change the result. |
| TR-REQ-020 | Integrate with Regulatory Radar and dependency re-evaluation. |

## 2. Acceptance scenarios

All scenarios remain `SPECIFIED_NOT_EXECUTED` until runtime admission.

### TR-AC-001 — CZ domestic LCV in 2.5–3.5 t band
Given a domestic Czech goods operation in the 2.5–3.5 t band after 2026-07-01, the engine must not apply the new EU international-LCV tachograph rule merely because the date and mass threshold match.

### TR-AC-002 — CZ->DE commercial international LCV >2.5 t
Given an international goods operation for hire/reward above 2.5 t after 2026-07-01, the engine must evaluate EU 561/2006 and 165/2014 scope and the smart-tachograph rule; it must not classify the trip as Czech domestic.

### TR-AC-003 — Same LCV before 2026-07-01
Same facts as TR-AC-002 but dated before 2026-07-01 must not use the future threshold.

### TR-AC-004 — Germany domestic 3.2 t goods vehicle without tachograph
If German national supplemental scope applies and no exemption applies, the engine must be able to return driver-hours/recordkeeping obligations without automatically asserting a tachograph-installation obligation.

### TR-AC-005 — Germany domestic 3.2 t with installed tachograph
If the German national rule requires use of an installed device, the engine must distinguish this from a duty to install one.

### TR-AC-006 — DE 2.7 t domestic
The German >2.8 t supplemental band must not match.

### TR-AC-007 — CZ 3.2 t domestic
The German 2.8–3.5 t national rule must not leak into Czech applicability.

### TR-AC-008 — Private non-commercial goods <=7.5 t
Where Article 3(h) is verified applicable, the system must represent the exemption and suppress dependent positive obligations from that base scope.

### TR-AC-009 — Private non-commercial 7.6 t mixed living/goods vehicle
The system must not grant the <=7.5 t exemption and must not infer exemption from camper/living-space status.

### TR-AC-010 — Pickup N1 + removable camping body, no formal conversion
The presence of the body must not automatically change registered category.

### TR-AC-011 — Approved and registered conversion
A later effective registration snapshot may change category/body facts from its effective date; historical journeys remain evaluated against the prior snapshot.

### TR-AC-012 — Physical conversion completed, registration pending
If the category is material, result is UNKNOWN/REQUIRES_REVIEW rather than assuming the future registered state.

### TR-AC-013 — Trailer pushes combination over threshold
When a rule uses combination maximum permissible mass, the attached trailer must be included.

### TR-AC-014 — Actual load below threshold but permissible combination above
A rule based on maximum permissible mass must not be evaluated from actual current load.

### TR-AC-015 — Same vehicle, private holiday vs paid delivery
Changing commerciality/purpose must create separate applicability results.

### TR-AC-016 — Same vehicle, domestic DE vs cross-border CZ-DE
The engine must show a jurisdiction/operation delta and applicable rule-pack versions.

### TR-AC-017 — Unknown commerciality
No definitive green compliance answer may be returned where commerciality is material and unknown.

### TR-AC-018 — Proposed EU motorhome exemption
A proposal-only source must not change a current legal result.

### TR-AC-019 — Source amendment
An effective new rule re-evaluates current/future cases while preserving the old historical snapshot.

### TR-AC-020 — Conflicting registration evidence
Two materially conflicting registration documents force review; CALPQ must not silently choose the more convenient one.

### TR-AC-021 — Driver-main-activity exemption condition missing
Where an exemption requires driver-main-activity facts and they are missing, exemption status is UNKNOWN/REQUIRES_REVIEW.

### TR-AC-022 — Route includes multiple jurisdictions
Per-segment obligations are preserved and an overall journey view may warn about any mandatory segment; the engine must not average conflicting obligations.

### TR-AC-023 — AI explanation mismatch
If an AI-generated explanation contradicts structured Core output, structured Core remains authoritative and the mismatch is logged/rejected.

### TR-AC-024 — Paid tier
Changing tariff must not alter transport applicability, exemptions, threshold or source selection.

## 3. Source traceability

| SRC | Role | URL | Status |
|---|---|---|---|
| TR-SRC-01 | EU driving/rest scope and exemptions | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex:02006R0561-20240522 | RESEARCH_CANDIDATE |
| TR-SRC-02 | EU tachograph scope | https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX:32014R0165 | RESEARCH_CANDIDATE |
| TR-SRC-03 | Germany FPersV §1 | https://www.gesetze-im-internet.de/fpersv/__1.html | RESEARCH_CANDIDATE |
| TR-SRC-04 | BALM driving personnel FAQ | https://www.balm.bund.de/EN/Service/FAQs/FaqsAboutDrivingPersonnelLegislation/faqsaboutdrivingpersonnellegislation_node.html | RESEARCH_CANDIDATE |
| TR-SRC-05 | Czech Ministry — 2026 LCV tachograph change | https://md.gov.cz/Media/Media-a-tiskove-zpravy/Dodavky-v-mezinarodni-doprave-nad-2%2C5-t-nove-s-tac | RESEARCH_CANDIDATE |
| TR-SRC-06 | Czech Ministry — vehicle conversion | https://md.gov.cz/Zivotni-situace/Vyroba-a-prestavba-vozidla/Prestavba-silnicniho-vozidla | RESEARCH_CANDIDATE |
| TR-SRC-07 | EU vehicle categories/motor caravan | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32018R0858 | RESEARCH_CANDIDATE |
| TR-SRC-08 | CJEU C-666/21 | https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX:62021CJ0666 | RESEARCH_CANDIDATE |

No source in this table is executable merely because it is listed. Publication into a live rule pack requires source-governance review, effective-date verification, legal-content tests and separate runtime admission.

## 4. Project progress effect

Architecture intake contributes no runtime completion units. The last preserved original-v1 metric remains 60/130 = 46.15%; the expanded project still has no approved global denominator or weighting that would justify silently increasing the whole-project percentage.
