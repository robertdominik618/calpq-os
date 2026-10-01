# CALPQ-TRANSPORT-0001 — Tachograph, Driver Hours & Pickup/Camper Applicability

Status: `OWNER_REQUESTED_ARCHITECTURE_INTAKE / RUNTIME_NOT_IMPLEMENTED / LEGAL_RULES_NOT_PUBLISHED`  
Date: 2026-10-01  
Decision intake: [Issue #171](https://github.com/robertdominik618/calpq-os/issues/171)  
Parent architecture: [CALPQ-GLOBAL-0001](CALPQ_GLOBAL_0001_ARCHITECTURE.md)

## 1. Purpose

CALPQ shall support a governed, explainable answer to questions such as:

- Musí mít toto vozidlo na této jízdě tachograf?
- Musí být tachograf pouze nainstalovaný, nebo také použitý?
- Pokud tachograf není povinný, musí řidič vést jiné záznamy?
- Jaké doby řízení, přestávky a odpočinky se použijí?
- Mění se odpověď mezi Českem a Německem?
- Co se změní po připojení přívěsu?
- Co se změní při přeshraniční jízdě nebo kabotáži?
- Co se změní, pokud je pickup přestavěn nebo registrován jako obytné vozidlo?
- Je fyzicky nasazená campingová nástavba totéž jako právně schválená změna kategorie nebo účelu vozidla?
- Je výjimka soukromé/neobchodní přepravy použitelná na konkrétní cestu?

The capability is not a standalone legal chatbot and not a parallel Core. It is a road-transport domain composition over the existing deterministic Core, GLOBAL jurisdiction/applicability model, temporal rules, evidence, replay, Regulatory Radar and selective disclosure.

## 2. Why a single vehicle label is insufficient

A result must never be derived only from labels such as `pickup`, `truck`, `camper`, `Wohnmobil`, `N1` or `M1`.

The decision may depend on a combination of:

1. registered vehicle category and body/special-purpose code;
2. technical and registered maximum permissible mass;
3. maximum permissible mass of the full combination, including trailer/semitrailer where the rule requires it;
4. actual purpose of the journey;
5. carriage of goods, passengers or another use;
6. commercial carriage for hire/reward, own-account professional use or private non-commercial use;
7. whether driving is the driver's main activity where an exemption depends on it;
8. domestic, international or cabotage operation;
9. every jurisdiction traversed or legally relevant to the operation;
10. effective date of the rule;
11. evidence for any claimed exemption;
12. approved conversion and its effective registration state.

A removable camping body, a bed in a pickup or a marketing name must never directly flip a legal result.

## 3. Current research baseline — not executable law

The following statements are preserved as source-backed research candidates as of 2026-10-01. They require content-governance review before becoming executable rule-pack content.

### 3.1 EU scope

Regulation (EC) No 561/2006 currently covers road carriage of goods where the maximum permissible mass of the vehicle/combination exceeds 3.5 t. From 1 July 2026 it also covers international transport operations and cabotage above 2.5 t.

Article 3(h) excludes vehicles/combinations not exceeding 7.5 t used for non-commercial carriage of goods. Other exemptions and conditions remain separate rules; no generic “private vehicle” boolean replaces them.

Candidate source:
https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex:02006R0561-20240522

### 3.2 EU tachograph relationship

Regulation (EU) No 165/2014 ties tachograph installation/use to vehicles used for road carriage of passengers or goods to which Regulation 561/2006 applies, subject to its exemptions.

Candidate source:
https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX:32014R0165

### 3.3 EU driving, break and rest candidate rules

Where the Regulation 561/2006 regime applies, the current source baseline includes:

- daily driving: normally max 9 h;
- extension to max 10 h no more than twice in a week;
- weekly driving: max 56 h;
- two consecutive weeks: max 90 h;
- after 4.5 h driving: at least 45 min break, with the standard split option 15 min followed by 30 min;
- regular daily rest: at least 11 h, with the defined reduced/split variants;
- regular weekly rest: at least 45 h, with the defined reduced-rest conditions and compensation.

These values are content-pack candidates, not constants in UI or generic application code.

### 3.4 Germany: national 2.8–3.5 t layer

German §1 FPersV applies driving/break/rest rules to drivers of vehicles used for goods carriage with maximum permissible mass including trailer/semitrailer above 2.8 t and not above 3.5 t, subject to listed exemptions.

BALM guidance distinguishes:
- the obligation to comply with/record driving and rest times;
- the obligation to have a tachograph installed.

For the German national 2.8–3.5 t band, if no tachograph is installed, manual daily records may be used; if a tachograph is installed, it must be used.

Therefore CALPQ must never encode:
`DE > 2.8 t => tachograph installation required`.

Candidate sources:
https://www.gesetze-im-internet.de/fpersv/__1.html
https://www.balm.bund.de/EN/Service/FAQs/FaqsAboutDrivingPersonnelLegislation/faqsaboutdrivingpersonnellegislation_node.html

### 3.5 Czech Republic: July 2026 LCV change

The Czech Ministry of Transport states that from July 2026 vans/LCVs 2.5–3.5 t used for international carriage of goods for hire/reward or cabotage are brought into the tachograph and associated social-rules regime; ordinary users and domestic carriage in that weight band are not newly affected by that EU change.

This must be represented as an EU international/cabotage rule with Czech explanatory provenance, not as a Czech-only 2.5 t domestic threshold.

Candidate source:
https://md.gov.cz/Media/Media-a-tiskove-zpravy/Dodavky-v-mezinarodni-doprave-nad-2%2C5-t-nove-s-tac

### 3.6 Pickup, vehicle category and motor caravan

Regulation (EU) 2018/858 distinguishes category M (primarily passengers) from category N (primarily goods). It identifies a pick-up truck as body type BE under N vehicles and defines a motor caravan, code SA, as a category-M special-purpose vehicle with living accommodation containing seats/table, sleeping, cooking and storage equipment, with the required equipment rigidly fixed to the living compartment except the table.

This is a classification input. It is not by itself a tachograph result.

Candidate source:
https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32018R0858

### 3.7 Czech conversion governance

The Czech Ministry of Transport treats a change of body/superstructure that changes purpose/use, or a change of vehicle category, as a regulated vehicle conversion. Approval for a registered vehicle is handled by the competent municipality with extended powers (ORP) based on the required technical documentation.

Therefore:
- physical installation of a camping body;
- approved vehicle conversion;
- changed registry category/body/purpose

are three different facts.

Candidate source:
https://md.gov.cz/Zivotni-situace/Vyroba-a-prestavba-vozidla/Prestavba-silnicniho-vozidla

### 3.8 CJEU C-666/21: no automatic camper escape

In C-666/21, the Court of Justice held that the concept of road carriage of goods covers a vehicle above 7.5 t that is fitted out both as temporary private living space and for non-commercial loading of goods. For that interpretation, load capacity and the category in the national register did not remove the Regulation 561/2006 obligations.

Architecture consequence:
`camper fitted = exempt` is prohibited.

Candidate source:
https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX:62021CJ0666

### 3.9 Proposal-state motorhome changes

2026 EU policy discussions include possible additional exemptions for large motorhomes. Proposal/discussion material must be stored as `PROPOSED / NOT_EFFECTIVE` unless and until a final legal act with an effective date is verified.

No proposal may change a current eligibility result.

## 4. Domain model

### 4.1 RoadTransportCase

A case represents one concrete legal/use question and references:

- subject/driver;
- vehicle;
- optional trailer/semitrailer;
- journey/operation;
- time interval;
- route/jurisdiction context;
- evidence snapshot;
- requested decision dimensions.

It coordinates existing services and does not own a duplicate person, credential or evidence database.

### 4.2 VehicleTechnicalSnapshot

Minimum fields:

- vehicle_ref;
- manufacturer/model identifiers where evidenced;
- category: M1/M2/M3/N1/N2/N3/Ox/unknown;
- body_code/special_purpose_code where evidenced;
- technical_max_mass;
- registered_max_mass;
- seating capacity where relevant;
- trailer coupling facts;
- intended/original construction purpose;
- source/effective date.

### 4.3 VehicleRegistrationSnapshot

Separate from technical facts:

- registration jurisdiction;
- current registered category;
- current body/special-purpose code;
- registered maximum permissible mass;
- approved use/purpose descriptors;
- valid_from/valid_to;
- source document/evidence level.

### 4.4 ConversionRecord

A conversion record can express:

- proposed;
- physically performed;
- technically inspected;
- approved by competent authority;
- registered;
- effective;
- rejected/revoked/superseded.

It shall reference affected fields and evidence. Physical conversion alone cannot mutate registration state.

### 4.5 OperationProfile

Required distinctions:

- GOODS;
- PASSENGERS;
- MIXED/OTHER;
- UNKNOWN.

Commerciality/purpose:
- FOR_HIRE_OR_REWARD;
- OWN_ACCOUNT_PROFESSIONAL;
- PRIVATE_NON_COMMERCIAL;
- UNKNOWN.

Operation type:
- DOMESTIC;
- INTERNATIONAL;
- CABOTAGE;
- TRANSIT;
- MIXED;
- UNKNOWN.

Additional facts may include driver_main_activity, base_of_undertaking, radius, material/equipment purpose and other exemption-specific facts.

### 4.6 CombinationMassSnapshot

Store both vehicle-only and combination values. Never overwrite one with the other.

Required:
- motor_vehicle_max_mass;
- trailer_max_mass;
- combination_max_permissible_mass according to the applicable legal definition/source;
- actual measured mass only as a separate fact when relevant to another rule.

A legal rule that says “maximum permissible mass including trailer” must not be evaluated from current actual load.

### 4.7 RouteSegment

A journey may contain multiple effective contexts:
- country/jurisdiction;
- start/end or ordered segment;
- domestic/international/cabotage semantics;
- border-crossing event if relevant;
- rule-pack version applicable at the decision time.

Commercial market grouping has no legal effect.

## 5. Independent decision dimensions

A single green/red `tachograph_required` field is prohibited.

The evaluation returns at least:

1. `DRIVING_REST_REGIME_APPLIES`
2. `TACHOGRAPH_INSTALLATION_REQUIRED`
3. `TACHOGRAPH_USE_REQUIRED`
4. `MANUAL_OR_ALTERNATIVE_RECORD_REQUIRED`
5. `DRIVER_CARD_REQUIRED`
6. `BREAK_RULE_SET`
7. `DAILY_REST_RULE_SET`
8. `WEEKLY_REST_RULE_SET`
9. `CONTROL_DOCUMENTS_REQUIRED`
10. `EXEMPTION_STATUS`

Each dimension uses:
- TRUE / FALSE / UNKNOWN / REQUIRES_REVIEW;
- exact rule/source versions;
- reason;
- effective interval;
- evidence dependencies;
- unresolved conflicts.

## 6. Composition of EU and national rules

CALPQ must support layered applicability without “most restrictive always wins”.

Conceptual process:

1. resolve EU/regime scope;
2. resolve direct exclusions/exemptions;
3. resolve national supplemental scope where legally permitted;
4. resolve national exemptions/recording rules;
5. compose only through reviewed precedence/supplement semantics;
6. keep installation/use/recording/driver-hours dimensions separate.

Germany’s 2.8–3.5 t national extension is a canonical test case for this architecture.

## 7. Camper/pickup evaluation

The user-facing question “Mám pickup s campingovou nástavbou” triggers a targeted evidence path.

CALPQ should ask only unresolved material facts, for example:

1. What category/body code is currently in the registration?
2. Is the camping body removable or part of an approved conversion?
3. Was a change of vehicle category/purpose formally approved and registered?
4. What is the maximum permissible mass of the vehicle and full combination?
5. Is a trailer attached?
6. Is the journey private/non-commercial or connected to business/professional activity?
7. Are goods being carried and for what purpose?
8. Is the route domestic only, cross-border or cabotage?
9. Which countries are involved?
10. What is the journey date?

The answer must then explicitly distinguish:
- “vehicle classification”;
- “scope of driver-hours rules”;
- “tachograph installation”;
- “tachograph use”;
- “recordkeeping”;
- “break/rest requirements”.

## 8. User experience

Example result card:

### Tachograf pro tuto cestu

**Instalace tachografu:** není doložena povinnost / povinná / nelze určit  
**Použití tachografu:** ...  
**Doby řízení a přestávky:** ...  
**Jiná evidence:** ...  
**Výjimka:** ...  
**Rozhodné okolnosti:** hmotnost soupravy, účel přepravy, CZ/DE, datum...  
**Proč:** source/version-backed explanation  
**Co doložit:** registration/conversion/operation facts  
**Změní se při jízdě do Německa:** explicit delta view

No result is based on color alone.

## 9. Integration with existing CALPQ

| Existing capability | Transport use |
|---|---|
| GLOBAL Jurisdiction | EU + CZ + DE + future country packs and route segmentation |
| Temporal rules | 1 July 2026 and future amendments |
| Credential/Document Intake | vehicle registration, driver card, tachograph evidence, conversion documents |
| Evidence Ladder | distinguish user claim, scanned registration, authority-confirmed data |
| Regulatory Radar | changes to thresholds, exemptions, smart tachograph versions |
| Dependency re-evaluation | recalculate journeys/vehicle obligations after legal or registration change |
| Decision Replay | reproduce why a result was shown on a past date |
| B2B Assignment Guard | fleet/driver assignment compliance |
| EXPATS | foreign driver/vehicle and cross-border context |
| Notifications | upcoming inspection/card/recording/lifecycle duties only where applicable |

## 10. Regulatory Radar requirements

Tracked change types include:

- mass thresholds;
- international/cabotage scope;
- national supplemental rules;
- exemption wording;
- tachograph generation/version requirements;
- driver-card/control-document requirements;
- record retention/carrying periods;
- vehicle classification/conversion rules;
- new CJEU or national higher-court interpretations;
- proposal -> adopted -> effective lifecycle.

A proposal enters the catalog as a future change candidate. It does not affect current decisions until the effective legal rule is approved and published through source governance.

## 11. Safety and legal-quality invariants

TR-INV-01: Vehicle marketing name never determines legal scope.  
TR-INV-02: Physical camping fit-out never automatically changes registered category.  
TR-INV-03: Registered category never automatically proves the actual transport purpose.  
TR-INV-04: “Camper” never means automatic tachograph exemption.  
TR-INV-05: Vehicle mass and full-combination mass remain distinct.  
TR-INV-06: Maximum permissible mass is not replaced by actual loaded mass unless the specific rule requires actual mass.  
TR-INV-07: Trailer/semitrailer is included only according to the applicable rule definition.  
TR-INV-08: Domestic, international, cabotage and transit are distinct.  
TR-INV-09: Germany’s 2.8 t national layer cannot leak into CZ/EU generic logic.  
TR-INV-10: EU’s 2.5 t international rule effective from 2026-07-01 cannot be applied to earlier dates.  
TR-INV-11: Private/non-commercial, own-account professional and for-hire/reward are not synonyms.  
TR-INV-12: Installation, use and recording duties are separate outputs.  
TR-INV-13: Missing evidence produces UNKNOWN/REQUIRES_REVIEW, not invented compliance.  
TR-INV-14: Proposed law is never executable law.  
TR-INV-15: Historical decisions remain replayable after rules change.  
TR-INV-16: UI and AI cannot create or override legal applicability.

## 12. Delivery boundary

This architecture intake:
- records the owner request;
- defines the target model;
- preserves current official-source research;
- creates deterministic acceptance expectations;
- does not publish legal rule packs;
- does not implement runtime vehicle/tachograph evaluation;
- does not claim a public legal advisory service;
- does not merge parent GLOBAL/EXPATS branches.

Runtime implementation requires separate admission, content review, rule-pack tests, negative tests, source freshness controls and review of any jurisdiction-specific legal content.
