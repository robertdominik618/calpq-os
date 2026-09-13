# CALPQ Security Identity & Session Boundary

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0016-B`

## Purpose
Define security requirements around authentication, session assurance and high-risk operations without confusing login state with real-world identity or legal authorization.

## Principles
- authentication proves control of an authenticator/account session, not every real-world claim about the Subject;
- sensitive actions may require step-up authentication according to risk;
- account recovery is a security-sensitive rebinding flow and cannot silently transfer credentials or evidence between Subjects;
- session assurance, identity-proofing assurance and professional-authorization state remain separate concepts;
- privileged organization/admin actions require explicit scope and cannot inherit rights from ordinary user sessions.

## High-risk actions
Examples include changing canonical identity bindings, approving Subject merge/split, modifying TrustEntity/AuthorityScope, issuing privileged delegation, exposing original evidence, changing security-sensitive access policy or initiating break-glass access.

## Session requirements
Security policy may constrain authenticator class, session age, recent re-authentication, device/context signals, user presence and recovery state. Missing required assurance resolves to deny/re-authenticate/review, never implicit allow.

## Recovery boundary
Recovery must preserve audit linkage, invalidate or supersede compromised bindings where appropriate and require explicit re-evaluation of security-sensitive bindings. Recovery success alone does not prove professional eligibility or authorization.

## Federation
External identity providers are adapters. Provider assertions are normalized with issuer, audience, assurance context, time and provenance before they may influence account/Subject binding policy.

## NIST alignment
The implementation may use NIST SP 800-63-4 concepts for identity proofing, authentication and federation assurance, but CALPQ policy remains risk-based and jurisdiction/provider neutral.
