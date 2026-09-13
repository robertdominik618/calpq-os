# CALPQ Catalog External Reference Boundary

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`  
ID: `CALPQ-M01-PREP-0004-E`

## Purpose

Keep external classifications and professional-recognition data useful without making CALPQ Core dependent on their identifiers, update cadence or legal interpretation.

## External reference classes

CALPQ may map to:

- occupation/skill classifications such as ESCO/ISCO;
- national qualification frameworks and EQF levels;
- Europass qualification/digital-credential references;
- regulated-profession databases and competent-authority directories;
- national registers and sector classifications.

## Mapping record

Every external mapping records:

- CALPQ concept ID/version;
- external system;
- external concept ID;
- external dataset/version;
- mapping relation (`EXACT`, `BROADER`, `NARROWER`, `RELATED`, `CANDIDATE`);
- verification status;
- mapped_at;
- provenance/source.

`CANDIDATE` mappings cannot affect authoritative eligibility or authorization decisions.

## Version isolation

An external source update creates a new mapping/source version. Historical CALPQ catalog and eligibility decisions retain the exact external version they referenced.

## Legal boundary

An external occupational classification does not prove that a profession/activity is legally regulated. Regulation and recognition rules come from separately governed authoritative legal/regulatory sources.

## Adapter rule

Import, synchronization, vocabulary translation and API-specific fields live in adapters. Core sees only stable CALPQ contracts and versioned source references.

## Invariants

1. No external identifier is a CALPQ primary key.
2. No external taxonomy update mutates historical decisions in place.
3. Classification similarity is not legal equivalence.
4. Regulated-profession status requires authoritative jurisdiction-specific provenance.
5. External-source outages cannot change already recorded historical truth.
