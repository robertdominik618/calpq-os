# CALPQ Registry Linking Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0011-C`

## Purpose

Link CALPQ subjects to external registry records without making external identifiers the canonical CALPQ identity.

## RegistryLink

A registry link must retain:
- CALPQ subject ID;
- external registry/source ID;
- external record identifier;
- subject kind;
- jurisdiction;
- source snapshot/version;
- verification status;
- effective/observed time;
- provenance;
- link confidence or review state.

## Link states

`CANDIDATE | VERIFIED | REJECTED | STALE | REVIEW_REQUIRED | SUPERSEDED`

Only `VERIFIED` links may be used as authoritative identity evidence within their documented scope.

## Hard rules

- one external identifier MUST NOT silently reassign from one CALPQ subject to another;
- registry reuse/reassignment scenarios require historical preservation and review;
- registry outage means the link cannot be freshly verified, not that the subject ceases to exist;
- current registry state MUST NOT overwrite the historical snapshot used by a prior decision;
- external schemas and APIs remain adapter concerns.

## Organization identities

Organization registration number, branch identifier, VAT identifier, establishment identifier and trade-name aliases are separate concepts and must not be collapsed into one universal organization key.