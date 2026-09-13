# CALPQ OS — Kompetence / Licence

CALPQ OS je projektový základ pro systém práce s kompetencemi, kvalifikacemi, oprávněními, doklady, lifecycle povinnostmi a ověřitelnými důkazy.

## Aktuální stav

- Milestone: `M00 FOUNDATION`
- Foundation development: `AUTHORIZED`
- Technology stack: `APPROVED — ADR-0002`
- Technology bootstrap: `AUTHORIZED`
- M00 release: `BLOCKED`
- Product feature development: `FROZEN`

Schválení technologického stacku nepovoluje produktové funkce. Do samostatného M00 release rozhodnutí jsou povoleny pouze Foundation artefakty, workspace konfigurace, prázdné architektonické shells a jejich kontroly.

## Schválená technologická baseline

TypeScript-first monorepo; React Native + Expo pro iOS/iPadOS a Android; web/PWA; Node.js LTS + Fastify; PostgreSQL; explicitní porty pro storage, identity, AI, OCR a externí registry. Podrobnosti jsou v `docs/adr/ADR-0002-technology-stack-selection.md`.

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

## Bootstrap vrstvy

`packages/core`, `packages/application`, `packages/contracts`, `packages/adapters`, `apps/mobile`, `apps/web`, `apps/api`, `workers/background`.

Tyto vrstvy jsou během M00 source-empty. Foundation Guard blokuje produkční source code do explicitního M00 release.
