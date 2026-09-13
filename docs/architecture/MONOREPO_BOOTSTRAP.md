# CALPQ Monorepo Bootstrap

Status: `M00 FOUNDATION / TECHNOLOGY BOOTSTRAP`  
Decision: `ADR-0002 — ACCEPTED`  
Date: `2026-09-13`

## Purpose

This bootstrap creates physical package boundaries for the approved TypeScript-first architecture without authorizing product features.

## Workspace shells

- `packages/core` — pure domain Core.
- `packages/application` — use-case orchestration.
- `packages/contracts` — stable ports and wire contracts.
- `packages/adapters` — adapter layer placeholder.
- `apps/mobile` — future Expo/React Native composition root.
- `apps/web` — future web/PWA composition root.
- `apps/api` — future Fastify composition root.
- `workers/background` — future background-processing composition root.

## M00 restriction

All listed workspaces are bootstrap shells only. While `feature_development` remains `FROZEN`, they may contain only package metadata and explanatory README files. Product source directories and TypeScript/JavaScript implementation files are prohibited by Foundation Guard.

## Dependency direction

`core` -> nothing outward.  
`application` -> `core` and abstract contracts only.  
`contracts` -> no app or adapter dependency.  
`adapters` -> inward-facing contracts/application/core as applicable.  
`apps/*` and `workers/*` -> composition roots; domain truth never lives here.

## TypeScript

`tsconfig.base.json` establishes strict compiler semantics for future packages. Runtime trust boundaries will additionally require schema validation after M00 release.
