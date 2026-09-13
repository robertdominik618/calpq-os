# CALPQ-M01-PREP-0016 — Security Architecture Baseline

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`

## Objective
Provide a provider-neutral security architecture for identity, credential, evidence, organization, sharing, administration and audit workflows before production implementation begins.

## Security chain
`Asset -> Trust Boundary -> Security Policy -> Preventive Control -> Detection -> Review/Response -> Audit Evidence`.

## Required properties
- identity/session assurance is separate from Subject identity and professional authorization;
- secrets/private keys remain outside Core domain state;
- cryptographic validity never proves issuer authority or legal competence;
- untrusted documents, external content and AI/OCR output cannot control policy or privileged actions;
- organization/admin scope is explicit and isolated;
- high-impact operations support elevated assurance and, where warranted, maker/reviewer separation;
- exceptional access is scoped, time-bounded, auditable and cannot create professional authorization;
- security signals may trigger protective restrictions/review but do not directly rewrite credential/legal truth;
- telemetry contains minimum necessary diagnostic data and is never a source of domain truth;
- security design remains provider/algorithm neutral.

## External alignment
The implementation should map controls to current authoritative security guidance, including NIST CSF 2.0, NIST SP 800-63-4 for digital identity concepts, and relevant ENISA/NIS2 technical guidance where applicable. Applicability is reviewed separately; alignment does not by itself establish legal compliance.

## M00 boundary
This baseline is design-only. It does not authorize product feature implementation, security-provider selection, production key material or deployment changes while M00 feature development remains frozen.
