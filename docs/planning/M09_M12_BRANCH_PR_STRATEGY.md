# CALPQ M09-M12 Branch / PR Strategy

Status: `PLANNING ONLY / IMPLEMENTATION BLOCKED`

## Branch sequence
- `impl/m09-trust-sharing-interoperability`
- `impl/m10-intelligence-guided-decisions`
- `impl/m11-production-ux-operations`
- `impl/m12-hardening-pilot-ga`

Each implementation branch starts only after the milestone admission criteria are satisfied. Later branches build on reviewed predecessor output where the dependency is hard; enabling M11 infrastructure may be delivered earlier only as bounded support work and does not imply M11 milestone exit.

## PR rules
- one milestone execution PR per governed milestone unless a smaller split is needed for reviewability;
- mergeability is not completion evidence;
- every PR links its milestone epic and execution package;
- required CI, architecture boundaries and milestone-specific exit evidence must pass;
- no PR may claim authorization merely because CI is green;
- M12 GA release remains a separate explicit evidence-backed decision.

## Review focus
M09: trust semantics, minimum necessary disclosure, protocol neutrality.
M10: deterministic authority boundary, source lineage, hypothetical-vs-authoritative distinction.
M11: runtime reliability, tenant/access propagation, non-authoritative client/cache/telemetry.
M12: production evidence, recovery, security/privacy, pilot acceptance and release governance.
