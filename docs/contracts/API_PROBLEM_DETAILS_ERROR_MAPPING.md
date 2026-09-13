# CALPQ API Error Mapping

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0018-C`

HTTP error responses follow RFC 9457 Problem Details semantics.

CALPQ keeps a stable machine-readable `error_code` and `correlation_id`. Human-readable text may be localized and is never the only machine decision signal.

Provider-specific and infrastructure-specific error objects are translated before crossing the API boundary.

Legitimate domain results such as `NOT_SATISFIED`, `INDETERMINATE` and `REVIEW_REQUIRED` remain domain results rather than generic transport errors.