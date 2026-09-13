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
