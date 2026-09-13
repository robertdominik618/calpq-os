# CALPQ-M01-PREP-0005 — Professional Passport & Gap Navigator Baseline

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`

## Objective

Connect the existing CALPQ domain contracts into one subject-centric product projection:

`SubjectProfile -> ProfessionalPassport -> EvidenceProjection -> Target -> GapNavigator -> NextBestAction -> Lifecycle/Renewal -> SelectiveSharing`.

## Required properties

- passport is a read model, never the legal source of truth;
- document, evidence, eligibility, authorization and temporal states remain separate;
- gap analysis uses exact versioned path/requirement/equivalence inputs;
- partial recognition preserves residual obligations;
- next-best-action is deterministic/advisory and cannot bypass requirements;
- lifecycle projection predicts obligations without fabricating authority events;
- selective sharing defaults to minimum necessary disclosure;
- historical projections remain reproducible from source versions and evidence snapshots.

## Product questions enabled

The baseline must support explainable answers to:
- What verified credentials and authorizations do I have?
- What do they currently allow me to do?
- What target activities/professions are reachable from my current state?
- What exactly is missing for a selected target?
- Which missing step should I do next and why?
- What expires or requires renewal soon?
- What can I safely prove to an employer, authority or client without oversharing?

## AI boundary

AI may summarize, translate and explain projections. It may propose likely mappings or helpful wording. It may not change verification state, requirement applicability, eligibility outcome, authorization state, residual obligations or deterministic ranking inputs.
