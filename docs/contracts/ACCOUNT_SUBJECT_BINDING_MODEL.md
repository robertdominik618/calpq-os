# CALPQ Account / Wallet / Subject Binding Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0011-D`

## Purpose

Bind application accounts, authentication identities and wallet identities to CALPQ subjects without confusing authentication with real-world identity.

## Binding kinds

`ACCOUNT | AUTH_PROVIDER_IDENTITY | WALLET_UNIT | DEVICE_IDENTITY | DELEGATED_ACCESS`

## Binding states

`PENDING | VERIFIED | REVOKED | STALE | REVIEW_REQUIRED | SUPERSEDED`

## Hard boundaries

- successful login proves control of an account, not necessarily the real-world subject identity;
- possession of a wallet unit does not by itself prove every claim about the holder;
- email ownership does not prove legal identity;
- organization-admin rights do not transfer organization identity to the administrator;
- delegated access does not transfer professional credentials or authorization grants.

## Binding evidence

A verified binding must record the method, assurance context, source, time, scope and evidence/provenance used to establish the binding.

## Recovery and reassignment

Account recovery, email change, device replacement or wallet replacement MUST NOT silently move credentials/evidence between subjects. Rebinding requires explicit policy and audit evidence.

## Multiple accounts

A subject may legitimately have multiple accounts or authentication methods. Canonical subject identity remains independent from account lifecycle.