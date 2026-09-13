# CALPQ M01 Privacy Lifecycle Test Matrix

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0013-T`

Mandatory scenarios for post-M00 executable tests:

1. Account closure does not apply one blanket lifecycle action to all domain records.
2. Authentication binding can end while legally preserved history remains.
3. Each retained category references a current documented basis and rule version.
4. No matching rule yields `REVIEW_REQUIRED` or `INDETERMINATE`, not silent indefinite storage.
5. A processing restriction does not equal terminal disposition.
6. A preservation hold blocks terminal disposition only for its declared scope.
7. A preservation hold does not grant wider read access.
8. Releasing a hold triggers lifecycle re-evaluation.
9. Derived data without independent basis follows the source lifecycle.
10. Derived data with independent basis records that basis explicitly.
11. Pseudonymised data is not treated as anonymous by default.
12. Historical decision evidence keeps policy/version references without unnecessary payload replication.
13. Restore/recovery reapplies current lifecycle restrictions before normal use.
14. Expired business usefulness alone does not justify continued storage.
15. AI may suggest lifecycle classification but cannot make the authoritative disposition decision.
16. A changed retention rule creates a new evaluation and does not rewrite historical decisions.
17. Conflicting jurisdiction rules require explicit resolution/review.
18. Lifecycle completion evidence is auditable without keeping the disposed payload accessible.