# CALPQ M10 — Intelligence Layer & Guided Decisions Baseline

Status: `PLANNING ONLY / BLOCKED`
ID: `CALPQ-M10-PLAN-0001`
Depends on: M03-M09 governed product/domain outputs.

## Purpose
Add high-value AI-assisted guidance without granting AI authority over evidence verification, eligibility, authorization, regulatory applicability or organization assignment truth.

## Scope
M10 covers:
- Next Best Action Engine;
- What-if simulator;
- conversational guidance;
- explanation generation;
- semantic/intent search;
- document assistance;
- user/reviewer decision support;
- human-review assistance;
- model/provider-neutral AI adapters.

## Authority boundary
Deterministic CALPQ Core and governed source/evidence/rule/decision records remain authoritative.

AI may:
- summarize;
- retrieve/search;
- classify/propose;
- explain existing governed results;
- generate candidate next actions;
- simulate hypothetical inputs using deterministic evaluators;
- assist human review.

AI may not by itself:
- mark evidence VERIFIED;
- alter a RequirementSet or regulatory rule;
- change an EligibilityAssessment;
- create/mutate AuthorizationGrant;
- change B2B assignment outcome;
- resolve legal/regulatory ambiguity without the approved review path.

## Next Best Action
NBA uses governed inputs such as current gaps, lifecycle obligations, upcoming dates, review states and available qualification paths. Ranking/presentation may use intelligence, but the underlying eligibility/action feasibility must remain explainable and source-backed.

## What-if simulator
What-if runs hypothetical scenarios without mutating authoritative state. Inputs and outputs are clearly marked simulated. Deterministic rule evaluation should be reused where applicable; AI may formulate scenarios/explanations but cannot silently change rules.

## Conversational guidance
The assistant should be able to answer questions by referencing governed CALPQ data, sources and reasons. When certainty is insufficient, it must expose uncertainty/review requirements rather than inventing a definitive legal/credential conclusion.

## Semantic/intent search
Semantic retrieval helps locate catalog, evidence, rules, actions and explanations. Retrieval ranking is not proof of applicability or truth. Returned material remains linked to its governed source/version/context.

## Document assistance
AI/OCR assistance may extract, normalize, classify and explain documents but always remains within M05 evidence/extraction/review boundaries.

## Human review support
AI may assemble evidence bundles, highlight conflicts, summarize sources and propose reviewer questions. Final review decisions remain attributable to the authorized human/authority process when required.

## Model/provider neutrality
Core/Application contracts describe capabilities and normalized outputs. Provider prompts, model IDs, SDKs and raw responses stay in adapters/operational metadata. Provider changes must not silently change domain truth semantics.

## Safety/security
Untrusted document/web content must not override system policy or domain rules. Prompts/responses exclude unnecessary sensitive evidence and secrets; material AI proposals retain provenance/model metadata where needed for review.

## Exit criteria
M10 planning is ready when every AI-assisted capability has an explicit authority boundary, deterministic source of truth, uncertainty handling, provenance and provider-neutral interface.