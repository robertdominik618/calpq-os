# CALPQ Dynamic Operational Source Model

ID: CALPQ-CONTEXT-0001-C04
Status: TARGET ARCHITECTURE / NOT IMPLEMENTED

## Purpose

Extend Regulatory Source Governance to information that is geographically and temporally dynamic without confusing it with normative law.

## Source classes

### NORMATIVE
Law, regulation, official rule, authority decision or reviewed binding condition.

### GEOSPATIAL_BOUNDARY
Official/reviewed boundary or zone dataset used to resolve where a rule can apply.

### OPERATIONAL_NOTICE
Time-bounded official safety/operational notice: temporary restricted area, maritime area notice, road closure, airspace restriction or comparable notice.

### ENVIRONMENTAL_OBSERVATION
Weather, visibility, tide/current or similar observation used only when the normative rule explicitly depends on it.

### ASTRONOMICAL_DERIVATION
Deterministic derived sunrise/sunset/twilight fact from reviewed computation semantics.

### DEVICE_OR_USER_OBSERVATION
GPS/GNSS, route, sensor or manually entered context. Never normative.

## Required source metadata

- stable source/authority identity;
- source class;
- jurisdiction/coverage;
- subject/activity domain;
- publisher mandate where relevant;
- retrieval/issued/effective/expiry/cancelled times as applicable;
- data version/digest;
- review/freshness state;
- usage/licence terms;
- provenance chain;
- limitations.

## Authority invariants

DOS-01 Provider availability is not authority.
DOS-02 A map tile is not a legal boundary unless mapped to reviewed boundary provenance.
DOS-03 A boundary is not a rule.
DOS-04 A notice is not permanent law.
DOS-05 A weather feed cannot create a legal threshold.
DOS-06 Astronomical calculation supplies an event time, not the rule that makes it relevant.
DOS-07 Device location supplies context, not legal entry proof.
DOS-08 Stale dynamic data may not be advertised as current.
DOS-09 Conflicting official sources route to review.
DOS-10 Source withdrawal/correction triggers dependency impact analysis and preserves history.

## Representative architecture-research sources

Checked 2026-09-23 as discovery inputs, not imported production rules:

1. Your Europe road rules and safety:
   https://europa.eu/youreurope/citizens/travel/driving-abroad/road-rules-and-safety/index_en.htm
2. Your Europe driving-licence recognition:
   https://europa.eu/youreurope/citizens/vehicles/driving-licence/driving-licence-exchange-recognition/index_en.htm
3. European Commission Urban Vehicle Access Regulations:
   https://transport.ec.europa.eu/transport-themes/urban-transport/urban-vehicle-access-regulations_en
4. IMO COLREG:
   https://www.imo.org/en/about/conventions/pages/colreg.aspx
5. UN Convention on the Law of the Sea, Part II:
   https://www.un.org/depts/los/convention_agreements/texts/unclos/part2.htm
6. EASA UAS geo-zones:
   https://www.easa.europa.eu/en/light/topics/geo-zones-know-where-fly-your-drone
7. EASA non-EU/cross-border drone FAQ:
   https://www.easa.europa.eu/en/faq/116519
8. EASA Standardised European Rules of the Air:
   https://www.easa.europa.eu/en/document-library/easy-access-rules/easy-access-rules-standardised-european-rules-air
9. IALA Area Notice:
   https://www.iala.int/asm/area-notice-2/
10. UNECE ADR 2025:
   https://unece.org/transport/publications/agreement-concerning-international-carriage-dangerous-goods-road-adr-2025
11. European Commission driving/rest times:
   https://transport.ec.europa.eu/transport-modes/road/mobility-package-i/driving-rest-times_en
12. Your Europe alcohol/tobacco/excise:
   https://europa.eu/youreurope/citizens/travel/carry/alcohol-tobacco-cash/index_en.htm
13. Your Europe carrying cash:
   https://europa.eu/youreurope/citizens/travel/carry/carrying-cash/index_en.htm
14. Your Europe pets:
   https://europa.eu/youreurope/citizens/travel/carry/pets-and-other-animals/index_en.htm

## Publication boundary

Architecture research does not certify any source as sufficient for a concrete production rule pack. Each domain/jurisdiction still requires source-rights review, authority mapping, effective-date normalization, expert review and tests.
