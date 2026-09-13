# CALPQ M01 Security Test Matrix

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0016-T`

Mandatory scenarios for post-M00 implementation tests:

1. Successful login does not prove every real-world identity claim.
2. Account recovery does not silently move credentials between Subjects.
3. High-impact identity rebinding requires policy-defined elevated assurance.
4. Organization role does not create professional authorization.
5. Delegation outside valid scope is rejected.
6. Privileged administration does not imply issuer/verifier authority.
7. Raw secrets/private keys never enter Core aggregate state.
8. Secrets are absent from command/event payloads and ordinary logs.
9. Key rotation preserves historical verification provenance.
10. Retired key material is not selected for new signing operations.
11. Cryptographic success does not upgrade legal authority.
12. Provider/algorithm changes do not alter Core semantics.
13. Uploaded document content cannot change security policy.
14. Instructions embedded in evidence are treated as data, not privileged instructions.
15. OCR/AI output cannot promote itself to VERIFIED.
16. AI output cannot widen role, delegation or AccessDecision scope.
17. AI tool execution requires independent Application authorization.
18. Minimum-necessary data is sent to AI/OCR providers.
19. Old share/presentation cannot hide later revocation or expiry.
20. Replay-sensitive proof obeys its freshness/audience policy.
21. Rate/throttling outcome is not treated as domain rejection.
22. Sensitive search/discovery is constrained by AccessPolicy.
23. High-impact configuration supports maker/reviewer separation where policy requires.
24. Exceptional access is time-bounded and auditable.
25. Exceptional access does not create permanent role elevation.
26. Exceptional access cannot bypass professional qualification requirements.
27. Security signal does not directly grant/revoke AuthorizationGrant.
28. Protective session/access restriction remains distinct from credential truth.
29. Telemetry/anomaly data is supporting evidence, not domain truth.
30. Telemetry excludes raw evidence, credentials, secrets and unnecessary PII.
31. Security review closure does not rewrite historical domain decisions.
32. Security/provider outage fails closed for privileged mutation/disclosure.
33. Core has no provider SDK/KMS/telemetry/security-vendor dependency.
34. NIST/ENISA mappings remain informative references, not Core authority.
35. PREP-0016 remains design-only while M00 feature development is frozen.
