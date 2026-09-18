# CALPQ GLOBAL — přijetí, úplnost a integrační hranice

ID: CALPQ-GLOBAL-0001-TRACE. Datum: 2026-09-18. Stav: OWNER_APPROVED_TARGET_ARCHITECTURE.
Rozhodnutí vlastníka [#137](https://github.com/robertdominik618/calpq-os/issues/137): „Perfektní se vším souhlasím kompletně globální sekci implementuj do architektury projektu a podej o tom důkaz a připojit do GitHub architektury“.

## Rozsah souhlasu

Schválen je celý návrh 1–5 včetně všech 28 pododdílů 4.1–4.28 a cílový rozsah přiloženého inventáře. Ceny zůstávají schválenými experimentálními hypotézami, 90 dní podmíněným plánem od samostatného zahájení, nikoli novým závazkem k prodeji či termínu. Nová implementace je architektonický zápis a jeho testovatelnost; žádné přijetí dalšího runtime slice, právní publikace, tržní aktivace nebo automatický merge.

## Zachování a zdrojové odchylky

[Adoption JSON](adoption.json) váže rozhodnutí na přesné hashe. [Původní JSON](source/approved-input.json.gz) je uložen gzipem beze změny 147025 dekomprimovaných bytů. Originální SHA-256: `9ca9f824e095139607260a4a8b0343ace23fa70a652fa3bc848bcc90d6fe7c73`. Ukládá všechna původní data, URL, pořadí a statusy; tento zdroj se nestává produkčním rule packem. Workbook 46185 bytes / SHA-256 `ad961d7270f49dffb3355da2187afe962e0e9a4f31d9eb51b42b361edd6f7e8c` je identifikovaný doprovodný uživatelský soubor, nikoli další binární soubor uložený v tomto PR. Deset listů bylo ověřeno čtením struktury OOXML; bez editace nebo přepočtu.

GE-01: původní `/governance/prior_v1_progress/source` odkazuje chybně na PRADO Japan. Samostatná adopce odkazuje na kontrolovaný projektový záznam PR #133, původní JSON se neopravuje potichu.
GE-02: přesné porovnání doložilo 27 tržních řádků s URL seznamu EU a 66 ostatních s textem `Vlastní návrh tržního pořadí`. Poslední údaj není URL ani úřední podklad. Tímto opravujeme počáteční nepřesné tvrzení intake o EU-list URL u neevropských řádků; originální data se nemění. Ani seznam EU neověřuje všechny obchodní atributy řádku.
GE-03: populační/rozlohové a jiné externí údaje jsou importované snapshoty, v tomto kroku znovu neověřené. Nejsou zdrojem eligibility nebo prognózou zákazníků.
GE-04: status PROPOSAL_NOT_APPROVED_NOT_DEPLOYED v originálu správně zaznamenává minulost. Dnešní přijetí je samostatná vrstva; právní a provozní statusy se nepovyšují na hotové.

Jednotlivé soubory stejného názvu dodané v konverzaci se nepovažují automaticky za stejný obsah. Požadavky Family/Employment/EXPATS jsou převzaty ze schváleného kontextu a existujících odkazů; nepřepisují se do duplicitního Core.

## Pět hlavních kapitol schváleného návrhu

| Source | Způsob přijetí |
|---|---|
| SRC-01 | Stav projektu a význam procent: GLOBAL §1 a adoption prior_v1_progress, žádný nový jmenovatel. |
| SRC-02 | Konkrétní podklady: archiv, digests a skutečné počty; žádné fikční provedené produktové testy. |
| SRC-03 | Zachovat a rozšířit stávající produkt: GLOBAL §3 a samostatné počítání typu/grantu/vzoru/verze/překladu/evidence. |
| SRC-04 | Všech 28 pododdílů mají normativní odstavce GLOBAL-01–GLOBAL-28 a kontraktové mapování níže. |
| SRC-05 | Obchodní zdůvodnění a cílový model: GLOBAL §5, oddělení široké administrace od hlubokého ověření. |

## Traceability 4.1–4.28

J = [Jurisdiction](../../contracts/GLOBAL_JURISDICTION_APPLICABILITY.md); P = [Country pack](../../contracts/GLOBAL_COUNTRY_PACK.md); R = [Recognition](../../contracts/GLOBAL_RECOGNITION_EXTENSION.md); S = [Sources](../../contracts/GLOBAL_SOURCE_AUTHORITY_GOVERNANCE.md); C = [Commercial](../../contracts/GLOBAL_MARKET_COMMERCIAL_BOUNDARY.md); V = [Privacy](../../security/GLOBAL_PRIVACY_OPERATIONS.md); B = [Baseline](../../architecture/CALPQ_GLOBAL_0001_ARCHITECTURE.md).

| Source | ID | Hlavní kontrakt / oblast |
|---|---|---|
| 4.1 | GLOBAL-01 | C / tři vrstvy administrace, katalog, evaluace |
| 4.2 | GLOBAL-02 | J + C / země × sektor × cesta × jazyk a směrový koridor |
| 4.3 | GLOBAL-03 | S + C / 18 původních populačních signálů a meze |
| 4.4 | GLOBAL-04 | J + S / 7 rozloh a podnárodní působnost |
| 4.5 | GLOBAL-05 | B + J / všech 93 trhů W0–W7 |
| 4.6 | GLOBAL-06 | C / šest vah a žádné vymyšlené skóre |
| 4.7 | GLOBAL-07 | B + J / 20 sektorů, druhy a subjekty |
| 4.8 | GLOBAL-08 | S / 94 seedů v 19 jurisdikcích |
| 4.9 | GLOBAL-09 | S / všech 38 zdrojů, licence užití a role |
| 4.10 | GLOBAL-10 | B + sdílená lokalizace / 35 jazyků L0–L5 |
| 4.11 | GLOBAL-11 | J + P / stejné Core, žádné per-country aplikace |
| 4.12 | GLOBAL-12 | P / bezpečný verzovaný manifest |
| 4.13 | GLOBAL-13 | J / žádná slepá dědičnost nebo strictest-wins |
| 4.14 | GLOBAL-14 | S + J / stabilní ID a časové mandáty |
| 4.15 | GLOBAL-15 | R / směrovost, netranzitivita, zbývající podmínky |
| 4.16 | GLOBAL-16 | S + P / review, publikace, odvolání, Radar |
| 4.17 | GLOBAL-17 | P / sedm metrik pokrytí se scope/jmenovatelem |
| 4.18 | GLOBAL-18 | R + S / interoperabilita bez přenosu autority |
| 4.19 | GLOBAL-19 | V / oddělení dat a provozních podmínek |
| 4.20 | GLOBAL-20 | C / Workforce Passport a první segment |
| 4.21 | GLOBAL-21 | C + V / osobní a rodinné produkty |
| 4.22 | GLOBAL-22 | C + V / tři distribuční cesty a opt-in |
| 4.23 | GLOBAL-23 | C + S / veřejný katalog, komunity, nespamovat |
| 4.24 | GLOBAL-24 | C / cenové experimenty, nikoli aktivní ceník |
| 4.25 | GLOBAL-25 | C / ekonomické ilustrace, maintenance a nejistota |
| 4.26 | GLOBAL-26 | C + V / podmíněný 90denní pilot a odpovědnosti |
| 4.27 | GLOBAL-27 | Všechny kontrakty / 40 specifikovaných scénářů |
| 4.28 | GLOBAL-28 | ADR + adoption / GitHub, scope, review a oddělený merge |

## Původní G01–G16, bez přeznačení runtime za hotové

| ID | Původní pracovní balíček | Architektonické připojení |
|---|---|---|
| G01 | Příjem a řízení změny | ADR, adoption, B, Architecture a Book |
| G02 | Definice počítané položky | B §3/4.7, J a P |
| G03 | Jurisdikce a použitelnost | J |
| G04 | Autority a zdroje | S |
| G05 | Datové balíčky | P |
| G06 | Globální katalog | J + původní Activity/Profession/Credential Catalog |
| G07 | Uznávání mezi zeměmi | R + původní Recognition |
| G08 | Jazykové vrstvy | Sdílený Localization + B §4.10 |
| G09 | Obsahový provoz | S + P |
| G10 | Globální osobní produkt | C + původní Passport/Intake |
| G11 | B2B placený pilot | C + původní AssignmentGuard |
| G12 | Distribuce a aktivace | C + V |
| G13 | Platby a dostupnost trhu | C |
| G14 | Interoperabilita | R + S + existující adaptérové hranice |
| G15 | Soukromí a bezpečnost | V |
| G16 | Pilot a rozšiřování | C + P + B §4.26 |

Původní owner_role, output, boundary, gate a status zůstávají v source JSON. Tabulka znamená ARCHITECTURE_SPECIFIED, nikoli COMPLETED produktových balíčků.

## Všech 40 produktových scénářů

Přesné scenario/when/then/status jsou v archivním JSON; žádná změna jejich významu ani runtime execution claim.

| Scénář | Vlastník kontraktu |
|---|---|
| G-AC-001 | Sdílená lokalizace |
| G-AC-002 | J + lokalizace |
| G-AC-003 | J |
| G-AC-004 | J |
| G-AC-005 | S |
| G-AC-006 | S |
| G-AC-007 | P |
| G-AC-008 | P |
| G-AC-009 | J + R |
| G-AC-010 | P |
| G-AC-011 | V + původní Intake |
| G-AC-012 | R |
| G-AC-013 | P + původní Lifecycle |
| G-AC-014 | R |
| G-AC-015 | R |
| G-AC-016 | R |
| G-AC-017 | J + původní AssignmentGuard |
| G-AC-018 | J |
| G-AC-019 | V + původní Family/Age Unlock |
| G-AC-020 | V |
| G-AC-021 | V |
| G-AC-022 | V |
| G-AC-023 | V |
| G-AC-024 | S + lokalizace |
| G-AC-025 | S + P |
| G-AC-026 | P |
| G-AC-027 | V |
| G-AC-028 | R + původní MobilityCase |
| G-AC-029 | P + původní MobilityCase |
| G-AC-030 | C + P |
| G-AC-031 | C |
| G-AC-032 | V + C |
| G-AC-033 | P |
| G-AC-034 | R + původní MobilityCase |
| G-AC-035 | C + V |
| G-AC-036 | C |
| G-AC-037 | P + S |
| G-AC-038 | S |
| G-AC-039 | Adoption + B §1 |
| G-AC-040 | C + V |

## Implementační návaznosti a ochrana stávající práce

M03 spotřebuje jazykové/UX rozšíření; M04 katalog, působnost a recognition; M05 zdroje, evidence a intake; M06 lifecycle/replay; M07 source governance/Radar; M08 Workforce; M09 interoperabilitu/sdílení; M10 vysvětlení/simulace; M11 provoz/adaptéry; M12 security/pilot/release. Jde o dependency mapu, ne automatické rozšíření již přijatých slice scope nebo DoD. Samostatný runtime admission musí určit konkrétní smlouvy, soubory, migrace, testy a rollback.

Větev GLOBAL je stacked nad EXPATS #135 na base 5b8b655b4b0102c4513c79ca996068c99b949e0e. Integrační základ při přijetí: 4a3c97e2314b2c8ccdf508123bb9ce5a04b499f0. #135 není tímto sloučené; #136 vyžaduje kompatibilní řízení uzavřených rozsahů. Health #84 a samostatná M06 admission #133 nejsou měněny ani sloučeny. Stávající admission skripty mohou z tohoto důvodu hlásit selhání; nesmějí být vypnuty, ignorovány jako úspěch nebo potichu rozšířeny na všechny docs.

## Důkaz a reprodukce

Ověřit `bash scripts/global_architecture_check.sh`, `bash tests/global_architecture_test.sh` a na přesném intake headu `bash scripts/global_architecture_check.sh --base 5b8b655b4b0102c4513c79ca996068c99b949e0e`. Nástroj kontroluje hash originálu, registry, adopci, všech 28 oddílů, odkazy a přesný diff; jeho samostatné negativní testy jsou pouze architektonické. Specifikovaných 40 scénářů nesmí být zaměněno za provedené runtime testy. Specifický closed-diff check platí pro intake větev, nikoli všechny budoucí nesouvisející změny.

Schválený zdroj lze bezeztrátově obnovit: `gzip -dc docs/planning/global/source/approved-input.json.gz > /tmp/CALPQ_GLOBAL_0001_original.json`. Tím vzniká pouze kopie původního návrhu, nikoli produkční datový import. Lokální container nemohl naklonovat GitHub kvůli DNS; plné repozitářové kontroly je nutné doložit skutečnými GitHub Actions, ne tvrzením o lokálním běhu. Výsledky budou evidovány v konkrétním PR/comment s headem a rozlišením zelených/blokovaných kontrol.
