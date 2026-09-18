# CALPQ-GLOBAL-0001 — Global Credential, Permit & Qualification Architecture

Status: `OWNER_APPROVED_TARGET_ARCHITECTURE / RUNTIME_NOT_DELIVERED_BY_THIS_CHANGE`.
Datum: 2026-09-18. Rozhodnutí: [#137](https://github.com/robertdominik618/calpq-os/issues/137).

## 1. Stav a závaznost

Vlastník schválil celý bezprostředně předcházející návrh od kapitoly 1 do 5 včetně 4.1–4.28 a požádal o skutečné připojení do GitHub architektury. Tento dokument převádí návrh na normativní cílovou architekturu; neomezuje schválený rozsah na MVP. Původní návrhový JSON zůstává beze změny v bezeztrátovém archivu. Aktuální schválení je samostatný [adopční záznam](../planning/global/adoption.json), nikoli přepsaný historický status zdroje.

Původní v1 metrika 60/130 = 46,15 % se nezvyšuje za architekturu. Nový globální rozsah nemá schválené váhy ani nový jmenovatel. Údaj přibližně 1 500 českých dokladů je pracovní vstup vlastníka, nikoli ověřený celkový počet. Vstupní chybný odkaz u metriky je veden v [traceability a odchylkách](../planning/global/ADOPTION_AND_TRACEABILITY.md).

## 2. Přijaté podklady

Zachovat všech 93 trhů/územních kontextů, 94 inventárních záznamů v 19 jurisdikcích, 35 cílových jazyků, 20 sektorových větví, 16 pracovních balíčků G01–G16, 40 scénářů G-AC-001–G-AC-040, 38 zdrojových záznamů, 18 populačních a 7 rozlohových signálů. Jejich přesný text, pořadí, stav, URL a omezení jsou v původním archivu; žádný externí údaj není tímto přijetím nově právně ověřen. Inventární rodiny nejsou totéž co individuální licence; seznam trhů není výčet suverénních států.

## 3. Zachovaný základ

Passport → Eligibility → Path → Lifecycle → Evidence; Family → Age Unlock → Opportunity → Employment. [EXPATS](CALPQ_EXPAT_0001_GLOBAL_MOBILITY.md) je spotřebitel společného jádra a zdroj již připojených kontraktů. Jedna osoba a její historie přetrvávají při změně země, zaměstnavatele i plátce. Samostatně se vyhodnocuje vydávající jurisdikce, místo/činnost použití, rozhodný čas a uznání. Povolení provozovny, vozidla, zařízení, stavby, projektu nebo firmy se nesmí převést na osobní kvalifikaci.

## 4.1. Tři produktové vrstvy — GLOBAL-01

Vrstva A Moje doklady: bezpečný archiv, třídění, návrhy extrakce, potvrzení údajů, potvrzené termíny, export a řízené sdílení; archiv není právní ověření. Vrstva B Katalog a cesty: odborně zpracované vybrané podmínky, autority a postupy; žádná deklarace úplnosti země. Vrstva C Posouzení a ověření: existující deterministické evaluátory a skutečně podporované externí ověření pro přesný rozsah. A může růst dříve než C, ale nesmí obejít bezpečnostní a tržní podmínky. Například administrace japonského dokumentu není úplné posouzení jeho použitelnosti v Japonsku, Německu a ČR.

## 4.2. Jednotka expanze — GLOBAL-02

Země × sektor × konkrétní uživatelská cesta × jazyk tvoří plánovací jednotku. Přeshraniční jednotka přidává zdrojovou a cílovou jurisdikci a činnost/profesi. Obsahová dostupnost, provozní schopnost a obchodní dostupnost jsou nezávislé. Modelové cesty DE/technické profese/správa kvalifikací/cs-de a CZ/zahraniční vzdělání/uznání/uk-cs jsou prioritizační návrhy, ne publikované právní postupy. Placený pilot nemusí čekat na kompletní katalog země, ale může slíbit pouze doložený rozsah.

## 4.3. Populační signály — GLOBAL-03

Uchovat původních 18 signálů s rokem, jednotkou, metodikou, varováním a URL. Jde o importované zaokrouhlené projekce, nikoli sčítání, počet zákazníků nebo TAM. Evropskou statistickou řadu neslučovat bez metodického vysvětlení s jinou globální projekcí. Populační údaj má pouze plánovací roli a neovlivňuje osobní právní výsledek. Indie, Čína a Indonésie jsou v modelu od začátku; velikost sama neurčuje první hluboký katalog ani první tržby. Změna dat vyžaduje nový označený zdrojový snapshot, nikoli přepis originálu.

## 4.4. Rozloha a územní členění — GLOBAL-04

Zachovat 7 rozlohových signálů a jejich označení pevninské plochy v km²; nezaměňovat je za celkovou plochu nebo kupní sílu. Náklady obsahu závisí na skutečných územních a institucionálních rozdílech, nikoli jen km². Country-only pole nestačí: jurisdikční kontext zahrnuje relevantní stát, provincii, region, obec, místo výkonu a čas. Samotná rozloha nesmí automaticky vytvářet federální model ani rozhodovat příslušnost úřadu. Viz [působnost](../contracts/GLOBAL_JURISDICTION_APPLICABILITY.md).

## 4.5. Geografické vlny — GLOBAL-05

Přesné pořadí a všech 93 ID zachovává zdrojový registr. Každá položka je přijatý plánovací cíl, nikoli aktivní služba:

| Vlna | Trhy / územní kontexty v původním pořadí |
|---|---|
| W0 | CZ |
| W1 | SK, DE, PL, AT, UA |
| W2A | FR, ES, IT, RO, BG, PT, NL, BE, IE |
| W2B | HU, GR, SE, DK, FI, HR, SI, LT, LV, EE, CY, MT, LU |
| W3 | GB, CH, NO, IS, LI, MD, RS, BA, ME, MK, AL, TR, GE, AM, AZ |
| W4 | US, CA, AU, NZ, BR, MX, AR, CL, CO, PE |
| W5 | IN, PH, VN, ID, SG, MY, TH, BD, PK, NP, LK, KH, LA, MM |
| W6 | CN, HK, MO, TW, MN, KR, JP, KZ, UZ, RU |
| W7 | AE, SA, QA, KW, BH, OM, JO, EG, MA, DZ, TN, NG, ZA, KE, ET, CD |

UA je v první vlně také zdrojovým koridorem. Mongolský či jiný zahraniční doklad může být užitečný v ČR dříve než přímý prodej v zemi původu. Ruština neznamená prodej v RU; čínština neznamená provoz v CN. EU/EHP/Schengen/eurozóna jsou samostatné effective-dated režimy; DACH/Nordics jsou také možné produktové skupiny, ne automatická pravidla. Tabulka neřeší politický status území.

## 4.6. Prioritizace — GLOBAL-06

Přijmout šest vah: doložený problém a ochota platit 25 %; distribuce 20 %; kvalitní zdroje a správce 20 %; znovupoužitelnost 15 %; ekonomika a složitost 10 %; relevantní populace 10 %. Uchovat vstup, původ, čas a nejistotu každého signálu. Chybějící měření nesmí být vymyšlené skóre. Populaci normalizovat v transparentním verzovaném modelu; rozloha je nákladový signál. Pořadí není politické hodnocení ani skóre lidí a nemá rozhodovací oprávnění. Trh nelze aktivovat pouhým překladem.

## 4.7. Katalogové osy — GLOBAL-07

Oddělit sémantický druh položky, sektor, subjekt a čas. Druhy zahrnují licence, povolení, registrace, kvalifikace, certifikace, zkoušky, školení, zdravotní posudky, průkazy, uznání, výjimky, zastupování a osobní stav. Definice, grant konkrétního držitele, vzor, verze pravidla, překlad a osobní dokument jsou odlišné objekty a počítadla.

| ID | Sektor |
|---|---|
| S01 | Identita a osobní stav |
| S02 | Migrace a práce |
| S03 | Vzdělání a uznání |
| S04 | Silniční doprava |
| S05 | Technická řemesla |
| S06 | BOZP a požární ochrana |
| S07 | Stavebnictví a provozovny |
| S08 | Zdravotnictví a péče |
| S09 | Rodina a zdravotní evidence |
| S10 | Podnikání a společnosti |
| S11 | Finance, účetnictví a právo |
| S12 | Letectví a drony |
| S13 | Vodní a železniční doprava |
| S14 | Potraviny, zemědělství a veterina |
| S15 | Životní prostředí a energie |
| S16 | Zvlášť regulované činnosti |
| S17 | Výuka, sociální péče a děti |
| S18 | Sport, cestovní služby a kultura |
| S19 | Digitální a soukromé certifikace |
| S20 | Místní a speciální oprávnění |

Přesné původní discovery_targets, subject_scope, priority a commercial_use zůstávají v archivu. Tato struktura nedokládá existenci každé položky ve všech zemích. Vícesektorová položka má stabilní ID, ne kopii v každém sektoru.

## 4.8. Startovní inventář — GLOBAL-08

Přijmout všech SEED-001–SEED-094 beze změny štítků, record_level, zdrojových URL, rule_status a next_action. Zahrnuje 19 jurisdikcí: AT, BG, CN, DE, ES, FR, GB, IT, JP, KR, MN, PL, PT, RO, RU, SG, SK, TR, UA. Zachovat rozdíl KATEGORIE_V_OFICIÁLNÍM_INDEXU a POJEM_V_OFICIÁLNÍM_ZDROJI jako původní zdrojové tvrzení; obojí zůstává nepublikované pro právní evaluaci. Příklady ze schváleného podkladu: Gewerbeberechtigung, Befähigungsnachweis, GISA, Cartão de Cidadão, eVisa, Employment Pass, S Pass a Work Permits. Toto není nová kontrola jejich aktuálních právních podmínek. PRADO je zdroj vybraných vzorů/kategorií, ne univerzální seznam licencí ani ověření držitele.

## 4.9. Zdroje obsahu — GLOBAL-09

Přijmout všech 38 zdrojových záznamů včetně jejich omezení. Registry úřadů a profesních orgánů, PRADO, ESCO, Diia, DigiLocker, ABLIS a vzdělávací systémy mají rozdílnou roli. ESCO propojuje významy, nevytváří oprávnění. Komunita přináší podnět, nikoli publikované pravidlo. Existence URL ani veřejná dostupnost nedává právo hromadného převzetí nebo neveřejného API. Záznam zdroje musí obsahovat licenci použití, povolené operace, čas, rozsah a správce. Vstupní URL nejsou automaticky potvrzením všech polí řádku.

## 4.10. Jazyky a písma — GLOBAL-10

Sdílený [lokalizační kontrakt](../contracts/LOCALIZATION_SEMANTIC_PARITY.md) se rozšiřuje o celý přijatý cílový katalog; nevzniká druhý lokalizační engine. Původní EXPATS kohorty zůstávají historickým kontextem, GLOBAL stanovuje následující pořadí pro nové globální rollouty:

| Vlna | Jazyky |
|---|---|
| L0 | cs, en |
| L1 | uk, sk, de, pl, vi |
| L2 | ro, bg, es, fr, it, pt, ru, tr, mn |
| L3 | ar, zh, ko, ja |
| L4 | hi, bn, ur, pa, ta, te, ne, si, th, id, ms, fil |
| L5 | km, lo, my |

35 jazyků není konečný limit. Tržní language_candidates mohou obsahovat další budoucí lokální jazyky; nepočítají se tím mezi 35 dodaných mutací. Zachovat de-DE/de-AT/de-CH, pt-PT/pt-BR, es-ES/es-MX, regionální francouzskou terminologii, zh-Hans/zh-Hant, mn-Cyrl a explicitní varianty písma pa. Locale, občanství, zdrojová země a země použití jsou nezávislé. Čtyři dostupnosti (UI, AI vysvětlení, odborný obsah, úřední text) jsou nezávislé příznaky, nikoli žebřík právní pravdy. RTL, čtečky, původní jména, nejasná data, bezpečný fallback a invalidace zastaralých překladů jsou povinné.

## 4.11. Připojení vrstev — GLOBAL-11

Stávající TypeScript-first modulární monorepo a dependency-inward pravidla zůstávají. Core vlastní invarianty; application/MobilityCase koordinuje; adapters obsluhují zdroje; UI prezentuje. Jurisdiction Catalog a obsahové packy rozšiřují stávající Catalog, Evidence, Recognition, Paths, Lifecycle a Regulatory Radar. Nová země obvykle přidává obsah, ne kopii Core. Skutečně nový koncept vyžaduje verzovaný kontrakt, ADR a testy. Nezavádět mikroservisu na stát ani novou databázi pouze proto, že vztahy tvoří graf. Žádná změna stacku nebo produkčního API není touto architekturou provedena.

## 4.12. CountryCredentialPack — GLOBAL-12

[Kontrakt packu](../contracts/GLOBAL_COUNTRY_PACK.md) stanoví stabilní ID, schema/package version, kompatibilitu, správce, působnost, autority, katalog, pravidla, recognition refs, zdroje, lokalizaci, závislosti, integritu a pokrytí. Je to distribuční/obsahový balíček, nikoli aplikace nebo spustitelný plugin. Aktivace vyžaduje schválenou verzi, správné závislosti a provozní gate. Hash potvrzuje integritu, ne právní správnost. Neplatný, stažený, nekompatibilní nebo neúplný pack nelze použít pro kladnou právní garanci. Tento intake nepublikuje žádný produkční pack.

## 4.13. Působnost pravidel — GLOBAL-13

[Působnost](../contracts/GLOBAL_JURISDICTION_APPLICABILITY.md) nesmí být jednoduchá dědičnost EU → stát → region. Každý příslušný požadavek má vlastní rozsah, předmět, příslušnou autoritu, čas a reviewed composition policy. Neplatí univerzální nejpřísnější-pravidlo-vyhrává ani nejnovější-web-vyhrává. Konflikt, neznámá výjimka nebo chybějící podnárodní kontext vedou k přezkumu. Obchodní skupiny a pojmenování regionu samy nezakládají právní účinek. Členství v režimech je datované a oddělené od tržních vln.

## 4.14. Identita a mandáty — GLOBAL-14

CredentialDefinition má stabilní identitu nezávislou na překladu, grafickém vzoru a změně názvu. Autorita a její mandát jsou samostatně verzované s platností, věcnou a územní působností, ověřovacími schopnostmi a provenance. Lze modelovat historického vydavatele i nástupce, bez automatického přenosu všech pravomocí. Fingerprint/vzor dokumentu může navrhnout klasifikaci, nikdy pravost nebo oprávnění. Definice, individuální grant, osobní evidence a potvrzení třetí strany mají různé lifecycle a access hranice.

## 4.15. Přeshraniční uznávání — GLOBAL-15

[Rozšíření recognition](../contracts/GLOBAL_RECOGNITION_EXTENSION.md) používá existující EquivalenceRule, RecognitionRoute a RecognitionDecision. A → B není B → A a A → B + B → C není automaticky A → C. Academic recognition, professional recognition, pracovní přístup, pobyt, jazyk a konkrétní činnost se hodnotí odděleně. Zachovat částečné splnění, zbývající podmínky, čas a osobní rozsah rozhodnutí. Dva pohledy: kde mohu využít doložené podklady a co z nich použiji pro zvolený cíl. Žádný kurz, text CV nebo podobný název nevytváří rozhodnutí autority.

## 4.16. Obsahový provoz — GLOBAL-16

[Zdrojová governance](../contracts/GLOBAL_SOURCE_AUTHORITY_GOVERNANCE.md): discovery → právo použití → snapshot → návrh → odborná kontrola → jazyková kontrola → testy → publikace → Radar. AI může navrhnout a porovnat, nikoli sama kvalifikovaně schválit kritické pravidlo. Druhá osoba kontroluje právně významnou publikaci. Změna zdroj → pravidlo → katalog → cesty → recognition → uživatel/firma → překlad → akce. Chyba vyvolá odvolání publikace, přezkum dotčených případů a dohledatelnou opravu, ne tichý přepis. Kapacita odborné údržby je omezení expanze i ekonomiky.

## 4.17. Pokrytí — GLOBAL-17

Coverage je vektor: inventář, zdroj, odborné zpracování, workflow, deterministické posouzení, externí ověřování, jazyk. Každá míra má scope ID, verzi, definici čitatele/jmenovatele, čas a důkaz. Pokud neznáme celkový rozsah, žádné procento úplnosti země. 30/50 označuje pouze jmenovaný pilotní katalog. Počet zdrojů, překladů, vzorů a osobních dokumentů se nesčítá jako právní typy. Importované 93/94/35 jsou rozsah architektonického vstupu, nikoli aktivované země, ověřené licence nebo hotové překlady.

## 4.18. Interoperabilita — GLOBAL-18

Používat stávající provider-neutral boundary pro W3C VC, OpenID4VP, EDC/EUDI a místní systémy; nepřebírat nový stack. Verze a oprávnění skutečného adaptéru se kontrolují před realizací. Oddělit podpis, trust vydavatele, mandát, vazbu na držitele, stav/revokaci, rozsah, freshness a právní použitelnost. Validní kryptografie sama nedává právo činnosti. CALPQ se nevydává za státní peněženku ani veřejnou autoritu. Konkurenční hodnota je propojení důkazu, činnosti, cesty, změny a přenositelnosti, ne tvrzení o unikátnosti archivu.

## 4.19. Soukromí a provoz — GLOBAL-19

[Bezpečnostní model](../security/GLOBAL_PRIVACY_OPERATIONS.md) odděluje veřejný katalog od soukromých originálů. Scope a účel předchází načtení dat, zahrnují subjekt a oprávnění role. HR nedostává automaticky rodinný, zdravotní nebo pobytový spis. QR/odkaz potřebuje appropriate recipient binding, rozsah, expiraci, odvolání a audit; noindex není přístupová ochrana. Dostupnost země/plateb/daní/zpracování/předávání se posuzuje odděleně. Minors a ochranné/klinické situace mají své schválené hranice. Nepoužívat osobní historii jako reklamní komoditu.

## 4.20. Workforce Passport — GLOBAL-20

První obchodní zaměření je správa kvalifikačních dokladů a úkolů organizace: pracovníci, požadované podklady, platnosti, žádosti o doplnění, vícejazyčné instrukce, minimální sdílení, audit a export. Úplné právní posouzení se zapne jen v doloženém rozsahu. Pilotní hypotézy: technické firmy, dopravci, opakované kvalifikační požadavky, školicí organizace a zaměstnavatelé zahraničních pracovníků. Zdravotnická automatizace vyžaduje specialisty; veřejné instituce nejsou jediná cesta k příjmům. Neprodávat neomezenou garanci právní bezchybnosti.

## 4.21. Osobní a rodinné produkty — GLOBAL-21

Free: omezený archiv, potvrzené termíny, veřejný katalog a vlastní export. Personal: větší správa/historie/cesty/sdílení. Family: více osob a delegace bez sloučení jejich práv. Professional: profesní a přeshraniční cesty. Employer/Institution: role, požadavky, správa a podporované ověřování. Specialist Workspace: účelově omezené případy. Předplatné může přidat funkce, nikdy vlastnictví člověka, rodičovskou autoritu nebo lepší právní výsledek. Základní přístup k vlastním originálům a export nesmí být nátlakový lock-in.

## 4.22. Distribuce — GLOBAL-22

Tři přijaté cesty růstu: organizace → pracovník, vydavatel/škola → absolvent, osoba → příjemce důkazu. Pozvánka a převzetí dokladu mají oprávnění, účel a potvrzení; import tabulky neznamená automatické založení účtů. Příjemce nemusí zakládat účet jen kvůli čtení povoleného výstupu, avšak citlivý výstup stále vyžaduje odpovídající ověření příjemce. Po změně firmy si osoba zachová historii; nový employer nepřebírá staré granty. Měřit přijetí pozvánek, aktivaci, dokončení úkolů, konverzi a trvalý užitek; viralita není slib.

## 4.23. Veřejný katalog a komunity — GLOBAL-23

Veřejná stránka má vysvětlit konkrétní činnost v jurisdikci, původní názvy, zdroj, autoritu, datum kontroly a meze pokrytí. Překlad státu v generickém AI textu nenahrazuje místní obsah. Nezavádět masové klonované SEO stránky, spam nebo indexaci soukromých dokladů. Moderované příspěvky a nahlášené chyby jsou vstupy review. Transparentní referral odměny mohou souviset s doloženým doporučením či odborně přijatým příspěvkem, nikoli s cizími citlivými dokumenty. Marketplace nesmí měnit credential truth.

## 4.24. Cenové experimenty — GLOBAL-24

[Cenová a tržní hranice](../contracts/GLOBAL_MARKET_COMMERCIAL_BOUNDARY.md) zachovává hypotézy: Personal 49 EUR/rok; Family 89 EUR/rok; Professional 99 EUR/rok; Employer Starter 149 EUR/měsíc, příklad 25 aktivních profilů; další profil příklad 3 EUR/měsíc. Nastavení pilotu, odborná služba a API se oceňují podle skutečného rozsahu. Tyto hodnoty nejsou aktivní ceník, daňová kalkulace ani potvrzená poptávka. Software, expert a úřední poplatky se oddělují. Platební provider je adaptér; úspěšná platba nemůže autorizovat výkon činnosti.

## 4.25. Jednotková ekonomika — GLOBAL-25

Přijaté ilustrace: 10 × 149 + 300 × 49 / 12 = 2715 EUR měsíčního ekvivalentu; 100 × 149 + 3000 × 49 / 12 = 27150 EUR. Výchozí předpoklad je hypotetický čistý výnos před náklady a bez daňové složky; nejde o prognózu, hotovost ani zisk. Příklad obsahu: 500 × 0,5 + 50 × 3 = 400 hodin; 400 × 60 = 24000 EUR, bez vývoje, překladu, bezpečnosti a průběžné údržby. Hypotézy se měří a verzují. Sledovat odbornou údržbu, podporu, akvizici, výpočty, úložiště, platby, vady a ztráty. Neobjednávat plošnou hlubokou databázi před validací use case.

## 4.26. Pilot a role — GLOBAL-26

90denní rámec je podmíněný plán od samostatně schváleného startu, ne deadline ani zahájený program. Dny 1–15: baseline/kontrakty/segment; 16–30: omezený katalog a demonstrace plus validace ochoty platit; 31–60: pouze bezpečně připuštěný placený pilot; 61–90: vyhodnocení kvality/ekonomiky a selektivní rozšíření. Nejdříve nejvýše dvě hluboké cílové jurisdikce: CZ/DE; SK/UA zdrojové koridory; technické profese a správa kvalifikačních dokladů. PL/AT zůstávají v první inventární vlně. Před bezpečnostní připraveností jen syntetická data. Odpovědnosti: produkt, architektura/vývoj, QA, bezpečnost, obsah a smluvní odborní/jazykoví revieweři. Kritický autor a nezávislý reviewer nesmějí být jedna nekontrolovaná role.

## 4.27. Akceptační scénáře — GLOBAL-27

Zachovat všech 40 G-AC-001–G-AC-040 v původním znění a stavu SPECIFIED_NOT_EXECUTED. Zahrnují locale parity, působnost, zdrojový mandát, lifecycle, recognition direction/non-transitivity, subjekt oprávnění, family, privacy, stale překlad, outage, pack validitu, untrusted intake, simulaci, podání, idempotenci, komerční nestrannost, pokrytí, dostupnost trhu a bezpečný pilot. Traceability mapuje každý scénář na kontrakt. Nové provedené testy architektonického validátoru budou vykázány zvlášť. Počet kontrol necertifikuje právní obsah ani produkční službu.

## 4.28. GitHub připojení — GLOBAL-28

Samostatná navazující větev nad přesným EXPATS headem 5b8b655b4b0102c4513c79ca996068c99b949e0e. [ADR-0005](../adr/ADR-0005-global-jurisdiction-packs.md), kontrakty, zdrojový archiv, adopce a testy tvoří ohraničený balíček. Architecture/Book a existující lokalizační/recognition kontrakty dostávají append-only odkazy. Nezměnit produkční zdroje, historické admission záznamy, stávající testy nebo workflow. #135/#136/#84 jsou explicitní závislosti, #133 se nemění. Složení na větvi není merge do integračního základu ani deployment. Před merge musí být kompatibilní governance a samostatně doložené aktuální kontroly.

## 5. Proč a konečný cíl

Široce dostupná bezpečná osobní historie, selektivně hluboké právní katalogy a první příjmy z kvalifikační administrace jsou společná strategie. Kompletní světový katalog není podmínkou prvního užitečného produktu; neověřené právní sliby nejsou způsob rychlé monetizace. Globální plán zachovává právo člověka rozhodovat, chrání soukromí a nehodnotí hodnotu osoby nebo politické preference. Tato implementace architektury nepřidává žádné oprávnění držiteli, žádný aktivovaný trh, žádný hotový překlad ani prodanou službu.
