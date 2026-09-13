# CALPQ Identity Merge / Split Governance

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0011-E`

## Purpose

Govern correction of duplicate or incorrectly combined subjects without losing evidence history or silently moving rights.

## Operations

`PROPOSE_MERGE | APPROVE_MERGE | REJECT_MERGE | PROPOSE_SPLIT | APPROVE_SPLIT | REASSIGN_LINK | REOPEN_IDENTITY_CASE`

## Merge rules

A merge must:
- preserve both original subject IDs in history;
- record the evidence snapshot and policy version;
- identify who approved the merge;
- preserve conflicts rather than hiding them;
- re-evaluate dependent projections instead of blindly copying their current status.

AuthorizationGrant, RecognitionDecision, AssignmentDecision and verification results MUST NOT be silently transferred merely because two subject records were merged.

## Split rules

A split must support reassignment of individual evidence/link records with provenance. Historical decisions must remain reproducible against the identity graph that existed when they were made.

## Automatic merge boundary

High-confidence automation may propose a merge, but any policy-defined high-impact or conflicting case must route to human review. Similar names or contact details must never be enough for irreversible automatic merge.

## Audit

Merge/split operations are immutable audit events and must support later explanation and reversal through a new governed operation rather than destructive history editing.