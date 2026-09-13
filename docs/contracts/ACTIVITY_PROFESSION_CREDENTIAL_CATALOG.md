# CALPQ Activity / Profession / Credential Catalog

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`  
ID: `CALPQ-M01-PREP-0004-A`

## Purpose

Define the canonical catalog graph that answers what a person wants to do, what profession or regulated activity that maps to, and which credential definitions may be relevant without conflating labour-market classification with legal authorization.

## Canonical concepts

### ActivityDefinition
Represents a task, service, operation or legally relevant activity. It may be broader or narrower than an occupation and may be regulated independently.

Required fields: `activity_id`, version, preferred label, aliases, description, jurisdiction scope, effective_from/effective_to, regulatory_status and source references.

### ProfessionDefinition
Represents an occupation/profession concept independent of a specific job or employer.

Required fields: `profession_id`, version, preferred label, aliases, description, jurisdiction scope, effective dates and external classification references.

### CredentialDefinition
Reuses PREP-0003. It defines the credential/authorization class, not a person's artifact or grant.

## Typed graph edges

Allowed catalog relations include:

- `ACTIVITY_PART_OF_PROFESSION`
- `ACTIVITY_REQUIRES_CREDENTIAL`
- `PROFESSION_REQUIRES_CREDENTIAL`
- `PROFESSION_RECOMMENDS_CREDENTIAL`
- `CREDENTIAL_ENABLES_ACTIVITY`
- `CREDENTIAL_RELEVANT_TO_PROFESSION`
- `BROADER_THAN`
- `NARROWER_THAN`
- `RELATED_TO`

Every relation is versioned, jurisdiction-aware, effective-dated and source-backed.

## External classifications

External systems such as ESCO/ISCO are references and mappings, never CALPQ primary identity. A CALPQ concept may hold external identifiers with source version and mapping confidence/status, but an external taxonomy update must not silently rewrite historical CALPQ decisions.

## Regulatory status

`regulatory_status` is one of:

- `UNREGULATED`
- `REGULATED`
- `PARTIALLY_REGULATED`
- `UNKNOWN_REVIEW_REQUIRED`

Regulation is jurisdiction- and time-specific. A profession may be unregulated while one activity inside it is regulated.

## Invariants

1. Occupation/profession is not the same as a job position.
2. Activity is not automatically identical to profession.
3. A catalog edge is not an authorization decision.
4. A credential definition is not a person's credential artifact or grant.
5. Historical graph versions remain reproducible.
6. External taxonomy identifiers never replace CALPQ stable IDs.
