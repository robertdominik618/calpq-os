# CALPQ-M01-PREP-0011 — Subject Identity, Entity Resolution, Registry Linking & Account Binding Baseline

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`

## Objective

Provide one stable subject identity layer beneath Passport, Credential, Trust Registry and B2B decisions.

## Core chain

`Identity evidence -> Entity resolution -> Subject -> Registry/account bindings -> Passport/Credential/Assignment projections`

## Normative invariants

1. `Subject` is canonical; account, wallet, document and registry IDs are bindings/evidence.
2. Same name/contact details never prove same subject by themselves.
3. Strong authoritative conflicts block silent auto-merge.
4. Registry links are versioned, scoped and historically reproducible.
5. Authentication success does not equal real-world identity verification.
6. Account/wallet rebinding must not silently move credentials/evidence between subjects.
7. Merge/split preserves history and triggers dependent re-evaluation.
8. Identity merge does not automatically transfer AuthorizationGrant or historical decision semantics.
9. Sensitive identity attributes are processed on a minimum-necessary basis.
10. AI/OCR may propose matches but cannot independently approve high-impact identity merges.

## Integration

PREP-0011 feeds PREP-0003 Credential/Authorization, PREP-0005 Professional Passport, PREP-0006 B2B Assignment, PREP-0007 Continuous Compliance, PREP-0009 Document Intake and PREP-0010 Trust Registry.

## External identity systems

EUDI PID, national eID, registry identifiers, wallet identifiers and authentication-provider identifiers are external identity evidence/bindings. Their protocol and schema details remain adapter concerns; CALPQ keeps its own stable subject ID and provenance.