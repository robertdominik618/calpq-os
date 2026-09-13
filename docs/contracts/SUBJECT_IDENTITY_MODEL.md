# CALPQ Subject Identity Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0011-A`

## Purpose

Define a stable CALPQ `Subject` identity that is independent from accounts, external registry identifiers, wallets, documents and display names.

## Subject

A `Subject` represents one real-world person or organization as understood by CALPQ.

Required properties:
- stable CALPQ subject ID;
- subject kind: `PERSON | ORGANIZATION`;
- lifecycle state;
- provenance for asserted identity facts;
- links to external identifiers through separate bindings;
- audit history.

## Hard boundaries

The following MUST NOT be treated as sufficient proof that two records identify the same subject:
- same display name;
- same email or phone number;
- same employer;
- same address;
- similar OCR output;
- same account owner assertion;
- same organization name.

A login account, wallet unit, registry record or credential artifact is never itself the canonical subject.

## Identity facts

Identity facts retain source and verification state. Examples include legal name, date of birth, organization registration identifier, nationality or registered office. Sensitive identifiers MUST be minimized and protected according to purpose.

## Result

Identity handling must preserve the distinction between `Subject`, identity evidence, external identifier and application account.