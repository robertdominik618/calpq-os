# CALPQ Privileged Administration & Break-Glass Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0016-F`

## Purpose
Separate ordinary user/organization administration from exceptional security-sensitive administration.

## Privileged operations
Examples include canonical Subject merge/split approval, TrustEntity/AuthorityScope changes, privileged role/delegation changes, sensitive evidence disclosure, security-policy changes and emergency access.

## Four-eyes baseline
High-impact content/trust/security changes SHOULD support maker/reviewer separation where risk warrants it. One actor may prepare a change while another authorized actor approves publication/activation.

## Break-glass
Break-glass is an exceptional path, never an invisible extension of normal role permissions.

A break-glass record includes:
- actor;
- declared reason;
- requested scope;
- start and expiry;
- step-up assurance evidence;
- approver/reviewer where policy requires;
- accessed capability/data class;
- resulting audit references.

## Constraints
- minimum necessary scope and duration;
- automatic expiry;
- explicit visible audit trail;
- post-use review;
- no permanent role elevation by break-glass;
- no bypass of professional/legal qualification requirements;
- no suppression of privacy/retention rules except where a separately governed legal/security basis explicitly permits a constrained exception.

## Separation
Administrative authority over CALPQ never becomes issuer/verifier authority merely because the administrator can configure the platform.
