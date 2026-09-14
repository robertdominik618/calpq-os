# CALPQ M07 Delivery Batches

Status: `PLANNING ONLY / IMPLEMENTATION BLOCKED`
ID: `CALPQ-M07-DELIVERY-0001`

## Batch M07-A — Regulatory Source Governance
Scope:
1. authoritative source registry;
2. source/version snapshots;
3. effective-date metadata;
4. source retrieval provenance;
5. stale/review-required state;
6. legal/human review routing.

Definition of Done:
- every material rule source is versioned and attributable;
- source freshness is explicit;
- parser/model output cannot finalize applicability;
- historical decisions retain the source version used.

## Batch M07-B — Change Events & Impact Graph
Scope:
1. RegulatoryChangeEvent;
2. rule/requirement delta model;
3. dependency/impact graph;
4. affected Credential/Path resolution;
5. affected Subject/Organization resolution;
6. effective-date activation logic.

Definition of Done:
- change impact is traceable source -> rule -> dependency -> affected target;
- impact resolution is deterministic over approved mappings;
- unknown/conflicting scope produces review-required semantics;
- no historical decision is rewritten.

## Batch M07-C — Radar, Review & Explainable Actions
Scope:
1. Regulatory Radar feed;
2. review queue;
3. applicability decision evidence;
4. change explanation;
5. recommended action generation;
6. notification integration.

Definition of Done:
- Radar distinguishes signal from approved applicability;
- human/legal review remains attributable;
- action recommendation cites source/rule/effective date;
- notification does not create a legal/domain state by itself.

## Exit
M07 exit requires governed sources, impact propagation and explainable reviewed actions with preserved lineage.
