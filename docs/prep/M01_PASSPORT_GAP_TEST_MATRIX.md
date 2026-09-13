# CALPQ M01 Passport / Gap Navigator Test Matrix

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0005-T`

Mandatory scenarios for post-M00 executable tests:

1. Passport shows artifact without treating it as authorization.
2. OCR proposal remains non-authoritative.
3. Verified fact retains provenance.
4. Suspended grant is not shown as usable.
5. Expired temporal validity is distinguished from revocation.
6. Historical passport snapshot remains reproducible.
7. Gap analysis uses exact RequirementSet version.
8. Partial equivalence preserves residual requirements.
9. Recognition route alone does not satisfy a requirement.
10. Recognition decision affects only its valid scope/jurisdiction.
11. Missing information yields INFORMATION_MISSING, not failure.
12. Human-review requirement yields REVIEW_REQUIRED.
13. Already-satisfied prerequisite is not recommended again.
14. Mandatory prerequisite outranks a convenient optional action.
15. Next-best-action explains what it unlocks.
16. Recommendation cannot bypass legal prerequisite.
17. AI wording cannot alter deterministic action ranking inputs.
18. Renewal projection can flag upcoming obligation before expiry.
19. Passing time alone does not create an authority event.
20. Renewal prerequisite dependencies are ordered correctly.
21. Revoked grant cannot appear CURRENT in lifecycle projection.
22. Selective share excludes unrelated credentials by default.
23. Selective share excludes original evidence unless explicitly selected.
24. Old share projection must not hide later suspension/revocation.
25. Share audit records metadata without unnecessary sensitive payload.
26. New evidence creates new gap evaluation rather than mutating history.
27. New catalog/rule version creates a new evaluation snapshot.
28. Two valid paths can be compared without removing mandatory obligations.
29. Lowest-cost path is not chosen if legally inapplicable.
30. Passport projection failure never mutates authoritative Core state.
