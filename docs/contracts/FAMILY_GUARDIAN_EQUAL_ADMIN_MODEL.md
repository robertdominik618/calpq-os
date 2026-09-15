# Family Guardian Equal Administration Model

**Contract ID:** CALPQ-FAM-GOV-0001  
**Status:** BINDING ARCHITECTURE CONTRACT  
**Date:** 2026-09-15

## 1. Purpose

This contract defines the authorization invariant for parents and guardians in CALPQ Family. It applies across all child-related capabilities, including the Vaccination Passport and future sensitive Family domains.

The contract intentionally separates a human relationship label (`MOTHER`, `FATHER`, `GUARDIAN`, etc.) from the verified authority and capability grant used for authorization.

## 2. Fundamental invariant

**Mother and father SHALL have exactly equal full administrative access when both possess equivalent verified full parental authority for the child.**

The CALPQ authorization layer MUST NOT assign a stronger or weaker permission set because an actor is a mother or a father.

Authorization SHALL be derived from:

1. verified subject identity,
2. verified relationship/authority fact,
3. `AuthorityScope`,
4. effective-dated restrictions or revocations,
5. explicit `AccessGrant`,
6. purpose/context constraints where required,
7. audit and legal-basis/provenance requirements.

Authorization SHALL NOT be derived from sex, gender or preference for `MOTHER` versus `FATHER`.

## 3. Canonical full-parent role

A parent with verified unrestricted parental authority is mapped to:

`FULL_PARENTAL_ADMIN`

The role is semantic/capability-based. It is not a separate mother-admin or father-admin role.

For equivalent authority:

```text
capabilities(MOTHER, FULL_PARENTAL_ADMIN)
==
capabilities(FATHER, FULL_PARENTAL_ADMIN)
```

Any implementation that produces a difference solely from `relationship_type = MOTHER|FATHER` violates this contract.

## 4. Full administrative capability set

Subject to domain-specific legal constraints, `FULL_PARENTAL_ADMIN` includes the same capability set for both mother and father, including:

- view child profile,
- manage child profile metadata that the Family model permits,
- view and manage credential/document lifecycle,
- upload documents and evidence,
- review/correct OCR extraction proposals,
- manage reminders and notifications,
- view lifecycle history,
- manage Family goals where permitted,
- manage vaccination history and evidence,
- view vaccination lifecycle plans,
- manage vaccination reminders,
- create/manage family travel contexts,
- view travel-health requirement/recommendation evaluations,
- initiate selective disclosure where legally permitted,
- prepare clinician/provider handoff,
- view access/audit information within the permitted scope,
- perform all other child-profile administrative actions granted to `FULL_PARENTAL_ADMIN`.

A domain MAY impose an additional legal/clinical approval boundary on an action. The boundary SHALL apply equally to mother and father when their verified authority is equivalent.

## 5. Restriction model

A parent’s capabilities MAY be restricted only by an explicit governance fact such as:

- effective-dated court decision,
- legally valid authority limitation,
- administrative decision,
- verified revocation,
- expired authority,
- explicit legal rule,
- another provenance-backed restriction recognized by CALPQ governance.

Every restriction MUST have:

- stable identifier,
- affected subject/actor,
- scope,
- `valid_from`,
- optional `valid_to`,
- source/provenance,
- reason code,
- audit trail.

The system MUST NOT infer a restriction from:

- mother/father label,
- sex or gender,
- who created the Family Account first,
- who uploaded the first document,
- who is the billing/account holder,
- who uses the application more frequently.

## 6. Family Account ownership does not override parental authority

Technical creation or billing ownership of `FamilyAccount` SHALL NOT implicitly grant one parent greater governance over the child than another parent with equivalent verified full parental authority.

Platform administration and parental authority are separate concepts.

A parent MUST NOT be able to demote another equally authorized parent merely because the first parent created the CALPQ Family space.

Any authority change SHALL pass through the Family governance workflow and require a valid basis/provenance.

## 7. Vaccination Passport application

For the Vaccination Passport, equal `FULL_PARENTAL_ADMIN` means both equally authorized parents may, under the same rules:

- read the child’s vaccination history,
- upload paper vaccination cards/certificates,
- confirm or correct extraction proposals,
- add user-asserted historical records,
- view evidence/verification level,
- see conflicts and data-quality issues,
- view dose-series and booster lifecycle output,
- manage notification preferences for the child,
- create travel-health contexts for the child,
- inspect travel requirement/recommendation output,
- generate selective-sharing packages where permitted,
- prepare clinician summaries,
- receive rule-change impact notices.

Neither parent receives greater access merely from being `MOTHER` or `FATHER`.

## 8. Deny-by-default for others

The equal-parent invariant does not create automatic access for siblings, grandparents, partners, relatives or other Family members.

Those actors remain deny-by-default unless a valid authority/grant exists.

## 9. Account handover

Child-to-adult or other governance handover MUST preserve:

- historical authority records,
- access grants/restrictions,
- audit events,
- document/evidence provenance,
- vaccination/credential history.

The handover MAY change current parental capabilities based on the applicable governance rules, but it SHALL NOT rewrite historical authority states.

## 10. Audit requirements

At minimum, the audit ledger SHALL record:

- actor,
- subject child,
- capability/action,
- resource/domain,
- decision (`ALLOW`/`DENY`),
- policy/authority version,
- relevant restriction/grant identifiers,
- timestamp,
- correlation/request ID where applicable.

A permission decision SHALL be explainable as “allowed/denied because …” without reference to hidden mother/father preference logic.

## 11. Authorization pseudologic

```text
function authorize(actor, child, capability, at):
    identity = verify_identity(actor)
    authority = resolve_authority(actor, child, at)

    if authority is UNKNOWN:
        return DENY_REQUIRES_REVIEW

    restrictions = effective_restrictions(actor, child, capability, at)
    grants = effective_grants(actor, child, capability, at)

    return evaluate(authority.scope, restrictions, grants, capability)
```

`relationship_type` may help establish/prove the relationship but SHALL NOT independently alter capability strength between `MOTHER` and `FATHER` under equivalent authority.

## 12. Required tests / acceptance criteria

- `FAM-EQ-AC-001`: mother + verified full parental authority resolves to `FULL_PARENTAL_ADMIN`.
- `FAM-EQ-AC-002`: father + verified full parental authority resolves to `FULL_PARENTAL_ADMIN`.
- `FAM-EQ-AC-003`: their effective capability sets are identical when no differing restriction exists.
- `FAM-EQ-AC-004`: Family Account creator status does not create a stronger parental role.
- `FAM-EQ-AC-005`: billing-owner status does not create a stronger parental role.
- `FAM-EQ-AC-006`: vaccination capabilities are identical for equivalently authorized mother/father.
- `FAM-EQ-AC-007`: an explicit provenance-backed restriction may lawfully produce a difference.
- `FAM-EQ-AC-008`: a restriction outside its effective date does not alter the current capability set.
- `FAM-EQ-AC-009`: unknown authority fails closed / requires review; it does not silently grant access.
- `FAM-EQ-AC-010`: non-parent family members remain deny-by-default absent grant.
- `FAM-EQ-AC-011`: every allow/deny is auditable and explainable.
- `FAM-EQ-AC-012`: no policy branch may use `MOTHER` vs `FATHER` as a privilege multiplier.

## 13. Architectural invariant

This contract is mandatory for current and future CALPQ Family modules. Domain implementations MAY narrow actions for legal, clinical, age or purpose reasons, but those constraints MUST be expressed as explicit rules and MUST apply symmetrically to equivalently authorized mother and father.

**The system shall model authority, not parental hierarchy.**