# CALPQ M04 Delivery Batches

Status: `PLANNING ONLY / IMPLEMENTATION BLOCKED`
ID: `CALPQ-M04-DELIVERY-0001`

## Purpose
Define implementation-sized batches for M04 Credential Catalog, Qualification Paths & Gap Intelligence.

## Batch M04-A — Catalog Core
Scope:
1. Activity catalog;
2. Profession catalog;
3. Credential catalog;
4. RequirementDefinition / RequirementSet versioning;
5. source and jurisdiction linkage;
6. immutable effective-date semantics.

Definition of Done:
- each catalog object is versioned and source-backed;
- effective dates and jurisdiction are explicit;
- historical decisions can resolve the exact catalog/rule version used;
- catalog data remains distinct from evidence and subject state.

## Batch M04-B — Qualification Paths & Recognition
Scope:
1. QualificationPath graph;
2. path prerequisites;
3. equivalence candidates;
4. recognition workflow;
5. human/authority review states;
6. explainable path selection.

Definition of Done:
- paths are deterministic over versioned catalog inputs;
- equivalence does not self-create recognition;
- human/authority review cannot be bypassed by AI confidence;
- every selected path is explainable.

## Batch M04-C — Gap Navigator & Target Planning
Scope:
1. current-vs-target gap calculation;
2. missing requirement classification;
3. blocking vs. optional gap semantics;
4. next-step candidates;
5. target activity/profession planning;
6. regression and historical-version tests.

Definition of Done:
- Gap Navigator never fabricates satisfaction;
- unresolved evidence yields indeterminate/review semantics;
- gap output is derived from governed catalog + current verified state;
- historical target evaluations remain reproducible.

## Exit
M04 exit requires catalog, path/recognition and gap batches complete with source/version lineage and no authority escalation.
