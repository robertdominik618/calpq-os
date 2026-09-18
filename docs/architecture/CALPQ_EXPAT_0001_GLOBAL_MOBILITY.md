# CALPQ-EXPAT-0001 — Expat & Global Mobility

Status: `OWNER_APPROVED_ARCHITECTURE / RUNTIME_NOT_IMPLEMENTED_BY_THIS_CHANGE`
Date: `2026-09-18`
Decision record: [Issue #134](https://github.com/robertdominik618/calpq-os/issues/134)
Public names: **Život a práce v Česku / Living & Working in Czechia**.

## Scope and authority

This is the complete architectural incorporation of the owner-approved EXPATS proposal, not a new reduced MVP proposal. All 24 functional areas, all persona groups, language layers, differentiators, product variants and phases below remain in the target scope. Phasing does not revoke or silently defer a requirement out of the architecture. No production feature, live legal rule, external integration, professional recognition or public release is delivered by this document.

The source is the immediately preceding 12-chapter CALPQ-EXPAT-0001 proposal and its explicit complete approval on 18 September 2026, recorded in #134. CALPQ-PROD-0001, including the supplied Family/Employment revision, remains the product foundation: **Passport → Eligibility → Path → Lifecycle → Evidence**, extended by **Family → Age Unlock → Opportunity → Employment**. This extension does not replace the original baseline or its terminology. Prior market statistics and legal web examples are contextual research, not executable rules or evidence of current legal validation.

## Position and value

EXPATS is a Czech jurisdictional entry domain for international mobility, not a translated static portal, a separate credential database or a parallel legal decision engine. The user-facing purpose is: **Co mohu v ČR dělat, co musím doložit, jaké mám možnosti, co potřebuji vyřídit a co se změní se životní situací?**

The three outcomes are administrative orientation, effective use of existing education/qualifications and long-term maintenance of individual/family evidence and obligations. The product informs and enables human decisions. It neither scores a person's worth nor guarantees residence, employment, recognition or a public authority's decision.

## Personas

These 18 groups are composable lenses, never mutually exclusive legal statuses. Routing uses evidenced nationality/citizenship facts, residence circumstances, purpose, actual activity, relationships, qualification jurisdiction and effective time. Preferred language is independent.

| ID | Group | Required coverage |
|---|---|---|
| PER-01 | Před přestěhováním | Routes, foreign documents, preparation windows, budget and dependencies. |
| PER-02 | Nově příchozí | Arrival, local offices, registration tasks, housing, insurance, work/study onboarding. |
| PER-03 | EU/EHP/Švýcarsko | Distinct applicable regimes; no assumption that every rule is identical. |
| PER-04 | Rodinný příslušník občana EU | Own evidenced status and documents, including mixed-nationality households. |
| PER-05 | Občan třetí země | Residence, labour-market access and actual activity evaluated separately. |
| PER-06 | Britský občan | Circumstance- and time-specific route, not nationality-only classification. |
| PER-07 | Student/absolvent | Admission, study changes, employment and graduation transitions. |
| PER-08 | Výzkumník/akademik/stážista | Institution, hosting, funding, qualification and mobility evidence. |
| PER-09 | Zahraniční odborník | Academic/professional recognition, profession conditions, language and gap paths. |
| PER-10 | Zaměstnanec/agenturní/sezonní pracovník | Concrete assignment, employer changes, documents and safeguarding. |
| PER-11 | Podnikatel/OSVČ/zakladatel | Residence, actual work, professional and business permissions kept separate. |
| PER-12 | Remote worker/digitální nomád | Actual work location, employer/clients, insurance and cross-border specialist questions. |
| PER-13 | Vyslaný/vnitropodnikově převedený/pendler | Multiple jurisdictions, time-limited facts and competent institutions. |
| PER-14 | Rodina s dětmi/smíšená rodina | Separate persons, shared planning, schools, health evidence and representation. |
| PER-15 | Ochranné režimy/probíhající řízení | Separate temporary/international/procedural routes, confidentiality and specialist review. |
| PER-16 | Dlouhodobě usazený/senior | Settlement, citizenship goals, pension records and family/health administration. |
| PER-17 | Český občan vracející se | Foreign qualifications, children's records, insurance and retained career history. |
| PER-18 | Specifické skupiny | Sport, art, volunteering, au-pair, religious and special service situations via reviewed packs. |

## Languages

The explicit language catalogue contains **cs, en, uk, sk, vi, ru, de, pl, ro, bg, es, fr, it, pt, tr, ar, zh, mn, ko, ja**. Initial intended content cohort: cs/en/uk. Prepared next cohort: sk/vi. Expansion cohort: the remaining named languages; ordering follows validated demand and qualified review capacity. Further selected South/Southeast Asian languages remain a governed catalogue extension, not invented locale coverage.

Five independently versioned layers: interface; rule explanations; preserved original official terminology; document/submission languages; communication/learning. Four provenance labels: official text; professionally reviewed translation; working translation; AI explanation. A coverage registry must distinguish interface availability from an expertly reviewed specific route. No language is declared translated or legally reviewed by listing it here.

Original identity script, name order, multiple surnames, transliterations, calendars and ambiguous dates are retained with provenance. RTL, screen readers, easy Czech, audio, mobile accessibility and user-selected language are required. Critical ambiguity is confirmed before deadline use. See [shared localization contract](../contracts/LOCALIZATION_SEMANTIC_PARITY.md).

## Functional areas

### EXP-01 — Osobní mapa situace a oprávnění
Intent-led progressive onboarding collects only necessary facts. Project known, missing, conflicting and not-yet-decidable information against a concrete goal. Residence, labour access, professional recognition, qualification and permission to perform an activity remain separate. A passport is evidence projection, not a state-issued status. Output: contextual mobility profile and reasoned goals. Reuses Subject Identity, Evidence, Eligibility and Passport.

### EXP-02 — Příprava před příjezdem a příjezdový plán
Model abroad/after-arrival actions, offices, documents, translations, appointments, costs, buffers and dependency ordering. Coordinate shared family tasks without combining proceedings. A reservation is not a filing; prepared form is not fulfilled obligation; estimated processing time is not guaranteed decision time. Output: dependency-aware arrival journey. Reuses Paths, Preparation Windows and Action Queue.

### EXP-03 — Pobyt, prodlužování a změna pobytové situace
Record residence documents, applications, requests for supplementation, receipt, decisions and collection. Separate document validity, proceeding stage and entitlement assessment. Any continuing effect during proceedings needs its own authoritative rule/facts; expiry alone cannot determine residence legality. Support distinct study, employment, blue-card, business, family and research route packs without publishing those packs here. Reuses temporal rules, Lifecycle and Evidence.

### EXP-04 — Uznávání zahraničního vzdělání a kvalifikací
Keep academic recognition, professional recognition, institutional admission and activity permission distinct. Build document → authority → requirements → supplementation → decision → professional projection paths. Use existing EquivalenceRule, RecognitionRoute and RecognitionDecision, with exact jurisdiction/scope/effective dates. Similar translated titles never imply equivalence; a route is not a positive decision. Reuses Catalog, Recognition, Paths and Evidence.

### EXP-05 — Profesní přechod a doplnění podmínek
Compare evidenced education, practice and credentials with a chosen activity. Identify reviewed relevant courses, exams, language, practice and administrative steps. Separate conditions demonstrated now, gaps and cases needing assessment. Any suggested adjacent job requires its own eligibility check; no workaround through invented supervision. Reuses Gap Navigator, Activity/Profession Catalog and Opportunities.

### EXP-06 — Zaměstnání a změna zaměstnavatele
Evaluate employer, assignment, place, actual activity, interval, evidence and applicable route. Cover employer/position changes, additional employment and termination. Employer preference, hiring intent and legal conditions remain distinct. Changes trigger reassessment instead of copying a previous positive result. Reuses B2B Assignment Guard and lifecycle dependencies.

### EXP-07 — Firemní kontrola podmínek výkonu práce
Provide HR only purpose-scoped assignment results, conditions, verification date and missing inputs. Do not expose complete residence, family or health dossiers. Preserve existing ASSIGNABLE / ASSIGNABLE_WITH_CONDITIONS / BLOCKED / REVIEW_REQUIRED / INDETERMINATE semantics. Missing evidence is not proof of unlawful work and cannot cause a hidden automated adverse decision. Reuses existing guard and selective sharing.

### EXP-08 — Čeština, zkoušky a praktická připravenost
Support authority visits, interviews, professional communication, children's school and preparation for relevant exams through diagnostic/adaptive practice and scenarios. Internal training results are never official certificates. Reading a translated safety instruction does not alone prove completion of all training obligations. Reuse existing training/test capabilities; do not create a parallel certification authority.

### EXP-09 — Zahraniční dokumenty, překlady a ověřování
Connect originals, translations, certified copies, any required higher authentication and recipient-specific acceptance requirements. Do not require apostille universally or confuse authenticity with recognition of legal effect. Preserve content hashes, language, issuer, translator and review provenance. Reuse a document only if the new purpose permits; no automatic carry-over of prior legal conclusions. Reuses Document Intake and Evidence Ladder.

### EXP-10 — Úřady, formuláře a doručování
Identify competent institutions and reviewed form versions, prepare attachments and track filings/receipts. Incoming letters create proposed tasks only after critical dates and meaning are checked. Identity, data-box and authority adapters require actual supported contracts/permissions. Authentication, message access, filing and receipt remain distinct events. No automatic submission from AI text or merely generated form.

### EXP-11 — Rodina, děti a smíšené domácnosti
Connect births, partner arrival, schools, representation changes, age transitions and household separation. Each person retains identity, evidence and assessments. Shared planning does not convey equal residence rights or blanket access. Mother and father with equivalent verified authority receive equal capabilities; creator/payer gains no superior authority. Handover preserves history and re-evaluates access. Reuses Family, Access Governance and Age Unlock.

### EXP-12 — Studium, školy a univerzity
Cover nursery/primary/secondary/higher education, admission, transfers, language support, scholarships and exchanges. Institutional workspaces coordinate, not own, student evidence. Study changes trigger relevant residence, work and insurance reassessments. Preserve the student → graduate → worker/entrepreneur → continuing development journey. Reuses Path, Family, Evidence and Opportunities.

### EXP-13 — Zdravotní pojištění, péče a očkovací historie
Organize insurance evidence, stated coverage, contacts and transitions caused by employment/study/relocation, without inferring cover solely from nationality. Link foreign vaccination history, doses and source documents to CALPQ-HEALTH-0001. Clinical equivalence or individual recommendations require the clinical boundary and human review. PR #84 remains an explicit unmerged dependency at this baseline. No vaccination scheduling or diagnosis is implemented here.

### EXP-14 — Bydlení, adresa a komunikace v domě
Address/housing evidence, handover, utilities, notifications and recipient requirements. SVJ OS integration can provide multilingual outages, statements, payments, house rules and defects guidance. It uses narrow purpose-scoped messages, not residence dossiers or duplicated SVJ accounting. External systems remain adapters; no access is granted by this architecture.

### EXP-15 — Řidičská a další praktická oprávnění
Use issuing jurisdiction, category, validity, residence facts and intended use to build driving/recognition/exchange/professional paths. Extend the same catalogue pattern to reviewed boating, sport or technical credentials. A translated foreign card title is not a Czech entitlement and does not authorize a whole profession.

### EXP-16 — Podnikání a práce na dálku
Distinguish company ownership, office-holder role, entrepreneurial permission and actual work. Coordinate residence, professional and business conditions. AI Accounting Company OS may receive an explicitly scoped evidence package for accounting/tax administration; CALPQ keeps credentials/evidence and does not duplicate a tax calculation engine. Remote work is not assumed exempt from local conditions.

### EXP-17 — Přeshraniční daně, sociální zabezpečení a důchodové podklady
Organize work/residence countries, income, employment, confirmations and insured periods for competent specialists. Immigration status and tax residence remain separate; a day counter is not complete tax advice. No unreviewed treaty inference, liability calculation or pension entitlement is produced. Reuses cross-border evidence and specialist handoff.

### EXP-18 — Dlouhodobé usazení, občanství a občanská orientace
Long-term paths retain relevant periods, evidence, exam/language preparation and applicable conditions. Civic Election Passport provides neutral institutional education. An internal test is neither an official exam nor a condition for voting rights; no political preference inference or targeted persuasion. Personal history survives citizenship changes. Civic linkage is an architecture dependency, not a delivered electoral service.

### EXP-19 — Dočasná ochrana a jiné ochranné režimy
Maintain separate reviewed route packs, not a nationality bucket. Handle missing identity/education evidence, protected contact details and specialist handoff. Never automatically recommend home-state embassy contact in a protection-sensitive case. Do not mix temporary protection, international protection or a pending procedure. Higher review and safe disclosure requirements apply.

### EXP-20 — Cestování, nepřítomnosti a návrat
Check documentary/travel/return questions against pending proceedings and relevant intervals. Residence in ČR, crossing a border and re-entry are separate assessments. Make absence history editable; no continuous location tracking. Trip planning is an administrative impact use case, not a tourist itinerary. Unknown/stale evidence blocks positive assurance but does not declare a legal prohibition.

### EXP-21 — Dopady životních změn
A single factual change in address, work, study, family, citizenship, document or decision re-evaluates affected dependencies. Distinguish observed, user-proposed, confirmed and authoritative events. Preserve unrelated data and immutable previous evaluations. Regulatory changes similarly re-evaluate only after controlled publication. Reuses Dependency Re-evaluation, Regulatory Radar and Next Best Action.

### EXP-22 — Problémy, zamítnutí a obnova situace
Lost documents, unclear letters, adverse decisions, threatened deadlines, unpaid wages or suspicious intermediaries create a safe evidence chronology and specialist handoff. Urgent known contacts/deadlines are not hidden behind profile completion. AI assistance is not representation or a submitted appeal. Safe-contact preferences govern notifications and collaboration.

### EXP-23 — Ověřené služby a moderovaná komunita
Directory of reviewers, translators, legal/tax specialists, schools and integration providers with separately evidenced attributes, languages, scope, pricing and availability. Verifying one attribute does not guarantee the provider. Community content cannot publish rules. Sponsored placement is visible and cannot affect eligibility or recognition. Marketplace is an optional consumer of truth, not its source.

### EXP-24 — Odjezd, návrat a přenositelnost historie
Coordinate exits, confirmations, relationship termination and preserved history. Return refreshes facts and rules, not a new identity. Provide export, revocation of sharing and governed retention/erasure. Changing country, employer or subscription payer neither confiscates the personal passport nor transfers its access rights. Reuses Privacy Lifecycle, Archive and Account Governance.

## Differentiators

| ID | Capability | Required boundary |
|---|---|---|
| DIF-01 | Co mohu dělat dnes? | Goal/condition projection, not a personal score or blanket permission. |
| DIF-02 | Co se změní, když…? | Side-effect-free simulation with explicit assumptions, never a real filing. |
| DIF-03 | Jeden podklad, více použití | Purpose/recipient requirements rechecked; no automatic reuse of legal conclusions. |
| DIF-04 | Nejbližší proveditelný postup | Dependency/critical-path plan, known/estimated/unknown cost separation, no guaranteed dates. |
| DIF-05 | Změna pravidla → osobní dopad | Effective-dated expert-approved rule publication precedes impact messages. |
| DIF-06 | Předání případu bez opakovaného vysvětlování | Explicitly scoped evidence, chronology, open questions and review history. |

## User surface

Seven intent entries are projections inside the existing CALPQ navigation, not seven new global tabs or a separate application:
NAV-01 Co potřebuji vyřídit; NAV-02 Můj pobyt a doklady; NAV-03 Moje práce a kvalifikace; NAV-04 Moje rodina; NAV-05 Plánuji změnu; NAV-06 Potřebuji vysvětlit dokument; NAV-07 Další možnosti.

Each action card exposes reason, next step, evidence, due date provenance, owner, verification scope, source, last review and specialist review option. Missing evidence is visually/textually distinct from a breached obligation. Color never carries meaning alone. Current, future, conditional and historical opportunities remain visibly distinct. Progressive disclosure supports easy language and full source detail. Unavailable routes or stale translations are explicitly labelled; the application must not claim universal coverage.

## Architecture integration

The new bounded application coordination context is **MobilityCase**, with references into the existing single Core. It orchestrates generic rules/cases through ports and cannot issue or mutate AuthorizationGrant, RecognitionDecision or VerificationDecision. New namespace contracts are semantic architecture specifications, not deployed HTTP endpoints or new production enums.

| Existing responsibility | Reuse / impact |
|---|---|
| Subject Identity, entity resolution | Multiple temporally scoped citizenship/residence facts and evidenced name variants, not locale-derived identity. |
| Credential/Activity/Profession/Requirement Catalog | Country/goal-specific requirements and recognition references. |
| Equivalence/Recognition | Existing rule, route and authoritative decision, exact scope and jurisdiction. |
| Eligibility and temporal rules | Deterministic outcomes and effective intervals, no second EXPATS evaluator. |
| Application Journey/Paths | Arrival, renewal, education, family and profession dependency paths. |
| Intake, Archive, Evidence Ladder | Original/translation lineage, untrusted proposals, verification provenance. |
| Family, Access Governance | Equal authority, delegated purpose, child handover and individual boundaries. |
| Lifecycle, Notifications, Next Best Action | Derived obligations and actions, not detached reminders. |
| Regulatory Radar, Dependency Re-evaluation | Approved changes, source freshness, targeted recalculation and replay. |
| B2B Assignment Guard | Existing assignment semantics; employer receives minimal projection. |
| Privacy, Audit, Selective Sharing | Purpose-limited access and reproducible, retention-aware evidence. |

Normative extension contracts: [Mobility](../contracts/EXPAT_MOBILITY_CONTEXT.md), [Localization](../contracts/LOCALIZATION_SEMANTIC_PARITY.md), [Safeguards](../security/EXPAT_PRIVACY_SAFEGUARD_MODEL.md), [ADR](../adr/ADR-0004-expat-global-mobility.md). Localization is horizontal for all CALPQ, including Passport, Family, Health and B2B.

## Rule governance

Use a reviewed source registry for Czech/EU institutions, competent recognition bodies, professional authorities, insurance/social/tax institutions and official forms. An information page, legislation, individual decision and community report are different evidence types. Record source/version, effective interval, jurisdiction, covered population, authority, reviewer and related tests. Fetch time is not legal-review time. Source conflicts and unsupported cohorts require review.

AI translates, proposes, classifies, searches and explains. It cannot create legal status, recognition, authority or clinical decisions. Critical publication uses qualified human review and four-eyes governance. Regulatory classification, privacy assessment and sector-specific obligations are release gates to be assessed for the actual intended use; this architecture makes no current legal-compliance certification.

## Commercial variants

| ID | Variant | Intended value |
|---|---|---|
| VAR-01 | Expat Basic | Basic orientation, overview and essential tasks; candidate free entry scope. |
| VAR-02 | Expat Personal | Ongoing documents, changes, deadlines and personal paths. |
| VAR-03 | Expat Family | Shared planning, children and delegated tasks with individual privacy. |
| VAR-04 | Professional Bridge | Recognized qualification pathways and profession gaps. |
| VAR-05 | Employer | Purpose-limited workforce case administration. |
| VAR-06 | University | International admissions, evidence and study transitions. |
| VAR-07 | Advisor Workspace | Case collaboration for qualified advisers and relocation specialists. |
| VAR-08 | Integration / Municipality | Assisted use for integration/community/public support services. |
| VAR-09 | Global Mobility | Later jurisdiction packs, posting and Czech nationals abroad. |

Possible billing: individual/family subscription, active organization cases, institutional license and separately priced expert services. No price is approved here. Eligibility result must not depend on tariff or sponsorship. Export and access to personal originals must not be coercive lock-in. Do not monetize fear through misleading urgency. Acquisition partners (employers, universities, language schools, integration services, professional bodies, relocation providers) are hypotheses, not claimed existing distribution.

## Delivery phases

PHA-A shared foundation: localization, subject facts, document types, source ownership, permissions, tests and supported-route catalogue.
PHA-B personal product: documents, arrival plan, tasks, explanations and a bounded reviewed set of routes.
PHA-C qualifications/employers: selected reviewed professional pilots, Gap Navigator and B2B consumption.
PHA-D family/institutions/special regimes: deeper family, university and health administration, protected-case review.
PHA-E global mobility: separately reviewed jurisdiction packs, never find-and-replace copies of Czech law.

Dependencies and implementation gates are in [intake/delivery](../planning/CALPQ_EXPAT_0001_INTAKE_AND_DELIVERY.md). Measure useful completed tasks, rule/translation defects, reusable evidence, expert support cost and actual willingness to pay, not registrations alone. Architectural coverage earns no runtime milestone credit.

## End-to-end acceptance stories

STORY-01 Foreign nurse: education evidence → independently assessed academic/professional route → language/gaps → residence/work conditions → reviewed decisions → minimal employer projection. No step grants another step's authority.

STORY-02 Mixed-nationality family: coordinate address/school/tasks, keep each member's status and documents separate, propagate only relevant changes, require valid representation and identical rights for equivalent parental authority.

STORY-03 Graduate: a confirmed study completion triggers relevant residence/work/insurance reassessment, preserves Professional Passport, reuses permissible originals and discloses only necessary evidence to a new employer.

## Acceptance and evidence

[Machine-readable traceability](../planning/expat_scope.json) defines 24 capability pairs and 16 cross-cutting scenarios (64 total). These are **SPECIFIED_NOT_EXECUTED** product acceptance scenarios, not passing runtime tests. Architecture integrity and negative validator tests are separately executable. Source chapter coverage and all cross-cutting IDs must remain complete. Actual commit/PR/CI evidence belongs to #134 and the resulting PR; repository storage is not merge, merge is not deployment.
