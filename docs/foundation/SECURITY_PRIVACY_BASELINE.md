# CALPQ Security and Privacy Baseline

Status: `M00 FOUNDATION / NORMATIVE`  
ID: `CALPQ-SEC-0001`  
Date: `2026-09-13`

## Principles

CALPQ is secure-by-design and privacy-by-design. Security/privacy requirements are architecture and acceptance criteria, not a post-release hardening phase.

## Mandatory baseline

- Collect and retain only data required for an explicit CALPQ purpose.
- Classify personal, credential, evidence and operational data before production storage.
- Apply least-privilege access and explicit authorization at trust boundaries.
- Separate original evidence from extracted, normalized and AI-derived information.
- Protect sensitive data in transit and at rest using platform-appropriate supported mechanisms.
- Keep secrets outside source code, repository history and application logs.
- Record auditable material state changes without placing unnecessary sensitive payloads in logs.
- Define retention/deletion behavior before a feature persists personal or evidentiary data.
- Threat-review features that materially affect identity, eligibility, authorization, document evidence or regulated outcomes.
- Define backup/recovery expectations before an authoritative datastore is used in production.
- Review third-party dependencies and provider integrations as supply-chain/trust-boundary changes.
- AI/OCR providers never become the authoritative owner of CALPQ domain truth merely by being integrated.

## Implementation gate

A product feature may be implemented after M00 release, but it may not reach production with unresolved security/privacy acceptance criteria applicable to its data and trust boundaries. Concrete provider/deployment controls are refined by ADR/contract when those providers are selected.

## Evidence

Relevant pull requests must state security/privacy impact when they add a new data category, external provider, authorization path, persistent store or regulated decision path.
