# CALPQ-M01-PREP-0001 — Core Kernel Contract Pack

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`  
Date: `2026-09-13`  
Depends on: `CALPQ-FND-0001`, `ADR-0002`

## Purpose

Prepare the minimum stable semantic contract for the first real CALPQ Core implementation after M00 is explicitly released. This document does not authorize product source code while `feature_development = FROZEN`.

## Kernel scope

The first Core kernel must define only cross-domain primitives that every later module can reuse:

1. typed durable identifiers;
2. deterministic time and revision semantics;
3. actor, subject and process attribution;
4. authoritative-source and provenance references;
5. evidence references and original-vs-derived distinction;
6. deterministic decision/result envelope;
7. stable domain-error taxonomy;
8. provider-neutral ports for clock and identifier generation.

## Explicit non-goals

This preparation does not define credential-specific rules, election rules, document OCR, UI behavior, database implementation, identity provider, AI provider, notification provider or any concrete external adapter.

## Dependency boundary

The kernel belongs to `packages/core`. It may depend only on language/runtime primitives and approved Core-local abstractions. It may not import React, Expo, Fastify, PostgreSQL clients, provider SDKs, UI packages or adapter packages.

`packages/contracts` may expose transport/port schemas derived from Core semantics, but transport schemas must not redefine domain truth.

## Determinism rule

Given the same explicit inputs, rule/version references and clock/id inputs supplied through ports, Core behavior must be reproducible. Core may not read wall-clock time, random values, environment variables, network state or provider SDK state directly.

## First implementation acceptance criteria

After M00 release, the first Core implementation slice is acceptable only when:

- all primitives have unit tests before dependent feature code;
- IDs are type-safe and non-interchangeable across aggregate types;
- timestamps serialize canonically;
- source/evidence provenance is preserved by contract;
- errors use stable machine-readable codes;
- provider errors cannot leak into Core as domain truth;
- no UI or adapter dependency enters Core;
- architecture tests prove the dependency direction.

## Related contracts

- `docs/contracts/CORE_PRIMITIVES.md`
- `docs/contracts/CORE_PROVENANCE_AND_EVIDENCE.md`
- `docs/contracts/CORE_RESULT_AND_ERROR_MODEL.md`
- `docs/architecture/M01_CORE_IMPLEMENTATION_ORDER.md`

## Release boundary

Until `foundation/manifest.json` explicitly changes M00 to a released state and feature development to an authorized state, this pack is documentation only. No `.ts`, `.tsx`, `.js` or runtime feature implementation is authorized by this document.
