# CALPQ Road Transport Tachograph & Driver-Hours Applicability Contract

ID: `CALPQ-TRANSPORT-0001-C01`  
Status: `OWNER_REQUESTED_TARGET_CONTRACT / RUNTIME_NOT_IMPLEMENTED`  
Parent: [CALPQ-TRANSPORT-0001](../architecture/CALPQ_TRANSPORT_0001_TACHOGRAPH_DRIVER_HOURS.md)

## 1. Contract purpose

This contract defines the semantic inputs and outputs needed to evaluate driving/rest, tachograph and recordkeeping applicability without embedding jurisdiction rules in UI or creating a second evaluator.

It composes with:
- [GLOBAL Jurisdiction & Applicability](GLOBAL_JURISDICTION_APPLICABILITY.md);
- existing Core primitives and temporal evaluation;
- evidence/provenance;
- dependency re-evaluation and decision replay.

## 2. ApplicabilityContext extension

A transport query SHALL reference or provide:

```text
subject_ref
vehicle_ref
optional_trailer_refs[]
operation_interval
route_segments[]
operation_type
carriage_subject
commerciality
evidence_snapshot
as_of
requested_dimensions[]
```

Optional exemption-specific facts are requested only when a candidate rule requires them.

## 3. Vehicle facts

`VehicleFactSet` SHALL keep these concepts separate:

```text
technical_category
registered_category
body_code
special_purpose_code
technical_max_mass
registered_max_mass
seating_capacity
registration_jurisdiction
registration_valid_from
registration_valid_to
conversion_refs[]
source_refs[]
```

No derived category may overwrite the evidenced registration value.

## 4. Combination facts

`CombinationFactSet`:

```text
motor_vehicle_ref
trailer_refs[]
motor_vehicle_max_mass
each_trailer_max_mass
combination_max_permissible_mass
actual_mass_optional
calculation_or_source_ref
valid_at
```

Where a rule depends on “including trailer or semitrailer”, the combination field is mandatory. If it cannot be established, the affected decision dimension cannot be TRUE.

## 5. Operation semantics

### CarriageSubject
- GOODS
- PASSENGERS
- OTHER
- MIXED
- UNKNOWN

### Commerciality
- FOR_HIRE_OR_REWARD
- OWN_ACCOUNT_PROFESSIONAL
- PRIVATE_NON_COMMERCIAL
- UNKNOWN

### OperationType
- DOMESTIC
- INTERNATIONAL
- CABOTAGE
- TRANSIT
- MIXED
- UNKNOWN

These values describe the case and cannot be inferred solely from vehicle registration.

## 6. Conversion semantics

`VehicleConversionRecord` includes:

- conversion_type;
- affected_vehicle_fields;
- physical_completion_status/date;
- technical_inspection_status/date;
- authority_approval_status/date;
- registration_update_status/date;
- jurisdiction;
- evidence_refs;
- valid_from/to;
- supersedes_ref.

A camping body attachment without evidence of approval/registration change SHALL NOT mutate `registered_category`.

## 7. Rule-pack concept

Transport rules are declarative, effective-dated content under existing source governance.

A rule may match:

- jurisdiction/regime;
- route/operation type;
- carriage subject;
- commerciality;
- vehicle/combination mass band;
- category/body/special-purpose facts where legally relevant;
- driver-main-activity or radius facts;
- time interval;
- exemption-specific evidence.

A rule SHALL explicitly declare its effect on one or more independent decision dimensions.

## 8. Decision dimensions

`TransportComplianceDecision` SHALL contain a map of dimensions.

Minimum dimension IDs:

- TRD-DRIVING-REST-SCOPE
- TRD-TACHOGRAPH-INSTALL
- TRD-TACHOGRAPH-USE
- TRD-ALT-RECORDING
- TRD-DRIVER-CARD
- TRD-BREAKS
- TRD-DAILY-REST
- TRD-WEEKLY-REST
- TRD-CONTROL-DOCUMENTS
- TRD-EXEMPTION

Each dimension:

```text
status = TRUE | FALSE | UNKNOWN | REQUIRES_REVIEW
rule_refs[]
source_refs[]
evidence_refs[]
effective_interval
reason_codes[]
unknown_inputs[]
conflicts[]
evaluator_version
context_hash
```

## 9. Composition semantics

Allowed reviewed relationships include:

- BASE_SCOPE
- SUPPLEMENTAL_SCOPE
- EXCLUSION
- EXEMPTION
- RECORDING_SUBSTITUTE
- PRECEDENCE
- NON_APPLICABLE

No universal “strictest rule wins” function exists.

For a route spanning multiple jurisdictions, CALPQ may produce:
- per-segment decisions;
- an overall trip warning if a required segment obligation cannot be satisfied;
- no silent collapse of materially different local obligations.

## 10. Candidate rule examples — non-executable

The following are traceability examples only:

### EU-GOODS-35
Goods road carriage above 3.5 t, including trailer/semitrailer, candidate base scope under Regulation 561/2006.

### EU-INTL-LCV-25-2026
From 2026-07-01, international/cabotage goods operation above 2.5 t, candidate EU scope.

### EU-NONCOMMERCIAL-75-EXEMPT
Non-commercial goods carriage up to 7.5 t, candidate exclusion under Article 3(h).

### DE-DOMESTIC-28-35
German national supplemental driver-hours/recording scope for goods vehicles/combinations >2.8 t and <=3.5 t, with separate installation/use semantics.

These identifiers SHALL NOT be used by runtime until admitted through content governance.

## 11. Camper classification guard

A `CamperUseView` may summarize:
- physical camping accommodation present;
- removable/fixed body;
- registered category/body;
- formal conversion status.

It is presentation/evidence context only.

Prohibited:
```text
if camper_present then tachograph_required = false
if registered_M1 then all transport rules = false
if registered_N1 then tachograph_required = true
```

Any such shortcut is a contract violation.

## 12. Human review triggers

At minimum REQUIRES_REVIEW when:
- registration and physical configuration materially conflict;
- conversion evidence is incomplete but category is outcome-determinative;
- mass/combination data is inconsistent;
- commerciality is unclear;
- route semantics (domestic/international/cabotage) are unclear;
- two effective rule sources conflict;
- a claimed exemption lacks required facts;
- only proposal-level law supports a result.

## 13. Explainability

Every output must answer:
- which rule applied;
- why the case matched it;
- which exemption was considered;
- which evidence supported the match;
- which jurisdiction and date mattered;
- what would change the result.

The AI layer may convert this to plain language but cannot alter the structured result.

## 14. Privacy

A roadside or employer-facing verification view should disclose only the necessary transport-compliance result and supporting metadata authorized for the purpose. It must not expose unrelated personal credentials, family data or full document archives.

## 15. Replay

A historical transport decision SHALL preserve:
- full material context snapshot;
- exact rule/source versions;
- evidence versions;
- evaluator version;
- conversion/registration state;
- route and decision time.

Current rule changes trigger current re-evaluation without rewriting historical results.
