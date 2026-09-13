# CALPQ Purpose Limitation Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-CONTRACT-PURPOSE-LIMITATION-0001`

## Purpose
Ensure that access and disclosure are evaluated against a declared, specific and legitimate purpose rather than against a generic requester role.

## PurposeDefinition
A purpose definition carries:
- stable purpose ID;
- description;
- permitted claim categories;
- prohibited claim categories;
- legal/policy basis;
- jurisdiction;
- retention constraints;
- onward-transfer constraints;
- effective version.

## Rules
A requester MUST NOT reuse data for a materially different purpose without a new compatible legal basis/policy decision.

A broad label such as `COMPLIANCE`, `HR` or `ADMIN` is insufficient unless resolved to a concrete versioned purpose.

Purpose changes require re-evaluation of:
- legal basis / consent;
- requested claims;
- retention;
- onward transfer;
- relying-party authority.

## Compatibility
Where policy permits compatible further processing, that compatibility decision must itself be explicit, versioned and auditable. It MUST NOT be inferred solely from organizational convenience.
