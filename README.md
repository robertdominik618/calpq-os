# CALPQ OS — Kompetence / Licence

CALPQ OS je projektový základ pro systém práce s kompetencemi, kvalifikacemi, oprávněními, doklady, lifecycle povinnostmi a ověřitelnými důkazy.

## Aktuální stav

- Milestone: `M00 FOUNDATION`
- Foundation development: `AUTHORIZED`
- Product feature development: `FROZEN`
- První implementační jednotka: `CALPQ-FND-0001 — Foundation Framework`
- Technologický stack: `NOT YET APPROVED`

Dokud M00 Foundation neprojde definovanými quality gates, nesmí být do repozitáře zaváděn produkční feature kód.

## Závazné principy

1. Architecture before implementation.
2. Quality before speed.
3. Simplicity before complexity.
4. Reusable modules.
5. Documented decisions.
6. Testable features.
7. UI contains no business logic.
8. Core does not know UI.
9. Plugins do not modify Core.
10. Every commit improves the project.

## Foundation scope

M00 Foundation musí před uvolněním feature developmentu obsahovat a ověřit minimálně:

- Constitution
- Book
- Architecture
- Apple HIG alignment
- Human Workflow Guidelines
- Foundation Framework
- Test Framework
- governance pro ADR, contracts, security/privacy, accessibility a změnové řízení

## Governance

Nové produktové nápady vstupují do projektu přes proces `CALPQ-PRIPOJ`. Změny technologie, enginů nebo základních kontraktů vyžadují impact analýzu, ADR, testovací dopad a explicitní schválení před implementací.

## Právní a bezpečnostní hranice

CALPQ musí respektovat české a evropské právní požadavky, privacy, security a accessibility. AI, OCR nebo extrakce dat nesmí být zaměňovány za právní ověření oprávnění nebo autoritativní rozhodnutí, pokud takový status nebyl doložen odpovídajícím zdrojem a procesem.

---

Repository initialized for CALPQ-FND-0001 on 2026-09-13.
