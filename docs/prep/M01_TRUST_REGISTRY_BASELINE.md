# CALPQ-M01-PREP-0010 — Trust Registry Baseline

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`

Flow: `Evidence -> TrustEntity -> AuthorityResolution -> VerificationRoute -> VerificationRecord -> Credential/Eligibility/Authorization`.

Mandatory rules:
- identity is not authority;
- cryptographic validity is not legal/professional competence;
- authority is role + scope + jurisdiction + time bound;
- issuer and verifier authority are independent;
- external registries/protocols stay in adapters;
- UNVERIFIED/STALE/conflicting trust data cannot yield unconditional authority;
- provider outage yields INDETERMINATE, not a negative legal fact;
- partial verification promotes only checked claims;
- verification never creates EligibilityAssessment or AuthorizationGrant by itself;
- historical trust/verification snapshots remain immutable;
- trust changes re-evaluate through PREP-0007;
- verifier disclosure follows purpose scope and minimum necessary data.

Links:
- PREP-0003 consumes verified evidence;
- PREP-0005 projects verification state;
- PREP-0007 handles trust change impact;
- PREP-0008 handles review/action cases;
- PREP-0009 produces evidence candidates without authority escalation.
