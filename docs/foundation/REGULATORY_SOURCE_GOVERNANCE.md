# CALPQ Regulatory Source Governance

Status: `M00 FOUNDATION / NORMATIVE`  
ID: `CALPQ-REG-0001`  
Date: `2026-09-13`

## Purpose

CALPQ must be able to explain which authoritative material supported a rule or decision at a specific point in time. Regulatory truth is versioned evidence, not an untraceable text constant.

## Required source record

A source-backed rule must be able to identify at least:

- source authority and canonical reference;
- jurisdiction and affected domain;
- source/rule version;
- publication or retrieval date where relevant;
- effective-from date and, when known, effective-to date;
- verification status;
- provenance connecting the normalized rule to its source.

## Verification states

At minimum the model must distinguish `VERIFIED`, `UNVERIFIED` and `STALE/REVIEW_REQUIRED` states. Missing or stale source verification may not be silently presented as current authoritative truth.

## Historical integrity

Historical decisions retain the rule/source version used at the time. Updating a current rule must not rewrite the evidence basis of an earlier decision.

## Change control

A material change to a source-backed rule requires controlled review before activation. The review must consider effective dates, migration/transition behavior, affected decisions/tests and whether users require a change notice.

## AI boundary

Automated summaries and AI explanations remain distinguishable from verified source-backed rules. AI may help identify or explain a source, but does not by itself upgrade a rule to `VERIFIED`.


## Dynamic operational and contextual sources — CALPQ-CONTEXT-0001 extension (2026-09-23)

Context-aware evaluation must preserve source class. A normative rule, geospatial boundary, temporary operational notice, environmental observation, astronomical derivation and device/user location observation are not interchangeable.

Dynamic sources add explicit issued/retrieved/effective/expiry/cancellation times, geometry/coverage version, freshness and source limitations. A stale or unavailable operational feed must not be interpreted as absence of restriction. A GPS fix must not be interpreted as proof of legal entry or permission.

The detailed target contract is [DYNAMIC_OPERATIONAL_SOURCE_MODEL](../contracts/DYNAMIC_OPERATIONAL_SOURCE_MODEL.md). Architecture approval does not activate any provider or publish any dynamic rule.
