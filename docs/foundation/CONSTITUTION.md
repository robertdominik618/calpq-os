# CALPQ Constitution

Status: `M00 FOUNDATION / NORMATIVE`  
ID: `CALPQ-CONST-0001`  
Date: `2026-09-13`

## Purpose

This document defines the non-negotiable engineering and governance rules for CALPQ.

## Ten principles

1. Architecture before implementation.
2. Quality before speed.
3. Simplicity before complexity.
4. Reusable modules.
5. Documented decisions.
6. Testable features.
7. UI contains no business logic.
8. Core has no UI dependency.
9. Plugins extend Core through contracts and do not modify Core.
10. Every commit improves the project.

## Rule hierarchy

When requirements conflict, apply this order:

1. applicable law and binding regulatory duties,
2. security, privacy and protection of people,
3. this Constitution,
4. approved architecture contracts and ADRs,
5. testable product requirements,
6. UX/UI preferences and implementation convenience.

Apple HIG or any other UX guideline may not override legal, security, privacy or accessibility requirements.

## M00 gate

Until `M00 FOUNDATION` is explicitly released:

- Foundation development is `AUTHORIZED`.
- Product feature development is `FROZEN`.
- Technology stack is `NOT_YET_APPROVED`.
- Product business logic and dependency manifests are not introduced without an approved decision record.
- New product ideas enter through `CALPQ-PRIPOJ`; intake does not itself authorize implementation.

## Core and AI boundary

Authoritative deterministic rules must remain separate from probabilistic AI assistance. AI may assist, explain, classify, extract and propose. It may not by itself create a legal fact, certify an entitlement or replace a required authoritative or human decision unless a separately approved process explicitly permits it.

OCR and extraction provide evidence and proposed structured data; they are not legal verification.

## Evidence

Material decisions must be traceable to their inputs, rule or contract version, provenance, processing time, actor/process, result and any required human confirmation or correction.

## Architecture boundaries

- Domain/Core rules are framework-independent.
- UI renders state and captures intent; it does not own domain truth.
- Adapters translate external systems into explicit ports/contracts.
- Plugins extend behavior through approved extension points.
- Cross-boundary calls require explicit contracts.

## Change control

A material change to Core contracts, technology, security/privacy boundaries, authoritative sources or regulated behavior requires before implementation: impact analysis, ADR, contract impact, test impact, relevant legal/security/privacy review and explicit approval.

## Definition of done

A Foundation artifact is complete only when it is versioned, uniquely identified, reviewable, linked to applicable quality gates and verifiable by automation or an explicit review procedure.
