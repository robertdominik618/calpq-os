# CALPQ EXPATS — Privacy, Safety and Specialist Boundaries

ID: `CALPQ-EXPAT-0001-S01`; status `OWNER_APPROVED_ARCHITECTURE / RELEASE_ASSESSMENTS_PENDING`.
Parent: [EXPATS](../architecture/CALPQ_EXPAT_0001_GLOBAL_MOBILITY.md).

## Purpose and separation

Reuse [security/privacy baseline](../foundation/SECURITY_PRIVACY_BASELINE.md), [access policy](../contracts/ACCESS_POLICY_MODEL.md), [cross-tenant isolation](../contracts/CROSS_TENANT_ISOLATION_MODEL.md) and [consent/legal basis](../contracts/CONSENT_LEGAL_BASIS_MODEL.md). Isolate personal, family, professional, health and organizational views. Each access requires actor, subject, purpose, capability, scope, interval and a documented applicable basis. Do not assume consent is appropriate for every employment or public-service interaction.

Citizenship/residence are personal data, not automatically classified as a statutory special category merely because of the label; health and other legally sensitive details require their proper treatment. Data classification and jurisdiction-specific legal basis must be assessed before release. This is a design requirement, not a completed compliance opinion.

## Least-disclosure matrix

| Actor/context | Intended permitted output after valid authorization | Denied by default |
|---|---|---|
| Individual | Own scoped evidence, history and export | Another person's case |
| Verified representative | Explicitly authorized child/represented-subject scope | Blanket household access |
| Partner | Individually granted selected data | Private residence/health/protection case of other adult |
| Employer/HR | Assignment conditions, status scope, freshness, needed verification metadata | Full residence, family, health or protection dossier |
| University | Admission/study-specific facts | Unrelated work/family/health records |
| Specialist | Time- and purpose-scoped selected evidence/chronology | Entire passport by default or onward unrestricted disclosure |
| SVJ/housing operator | Relevant address/service communication | Immigration/tax/medical proceedings |
| Translator/provider | Selected document needed for agreed service | Other documents, account tokens, rule publication rights |
| Community/marketplace | Moderated public or intentionally published content | Private identity/status profiling |

Equivalent verified parental authority gives identical capabilities to mother and father. MOTHER/FATHER, sex, gender, nationality, profile creator or payer does not privilege one parent. Differences require explicit effective-dated evidenced authority/restriction. Handover/revocation rechecks grants while retaining lawful history; a family relationship alone is not full access. Preserve the approved Family baseline and the dependency on #84; do not claim that its code is merged.

## Threats and required controls

RISK-01 Sensitive previews: generic push/email subject, safe contact preferences, no residence/protection/diagnosis in lock-screen text.
RISK-02 Coercive household/employer access: individual grants, purpose limitation, revocation, no payer ownership and safe specialist handoff.
RISK-03 Protection-case exposure: minimal collection, restricted contacts, no automatic home-state embassy referral, no broad nationality tagging.
RISK-04 OCR/prompt injection: quarantine, malware checks, treat document content as untrusted evidence, prevent tool execution, credential leakage or rules changes.
RISK-05 Cross-tenant leak: scoped loading, least-privilege references, opaque IDs, deny-by-default lookup/export, audit every material disclosure.
RISK-06 False legal assurance: UNKNOWN/REVIEW_REQUIRED preserved, no inference from missing files, separate residence/work/recognition/insurance/tax questions.
RISK-07 Stale/mistranslated rules: version and expert-review gates, source conflict handling, visible unsupported route/locale.
RISK-08 Automated exclusion: no hidden adverse employer/education decision; explain scope, correct data and route uncertain cases to a qualified human.
RISK-09 Medical overreach: vaccine/insurance document administration is not diagnosis or clinical equivalence; clinician-reviewed decisions at health boundary.
RISK-10 Representation illusion: generated appeal/form is not filed or accepted and does not create legal representation; actual evidence required.
RISK-11 Marketplace manipulation: no sponsorship/tariff effect on truth, no fear-based false urgency, verified attributes not whole-provider guarantee.
RISK-12 Tracking and retention: editable declared trips, no continuous location surveillance; retention by purpose and evidence type, not indefinite copies in audit.
RISK-13 Account/provider exit: accessible export, revoke sharing, verify handoff, no ownership transfer to new payer/employer.
RISK-14 Political influence: Civic education is neutral, no inferred voting preference or personalized political persuasion; internal tests cannot condition civic rights.
RISK-15 Missing/damaged originals: preserve lineage, support conflict/recovery and specialist review instead of quietly fabricating replacements.
RISK-16 External outage: bounded retries, visible provider failure and freshness, no false receipt, restored access rechecks current authority.

## Review and publication

Separate content author/editor, qualified reviewer and publisher responsibilities; critical changes require four-eyes governance. Specialist review is scoped by profession, jurisdiction, purpose and competence, with source/evidence references. AI outputs are marked proposals/explanations. No LLM is source of law or clinical recommendation. Any actual employment, education, migration or healthcare AI use needs intended-use classification and applicable regulatory assessment before release; this pack does not assert a legal classification or certification.

## Retention, logging and recovery

Maintain provenance and immutable evaluation metadata sufficient for replay while storing sensitive originals separately under retention/access policy. Audit records who accessed which claim or document and why; do not say a full document was viewed when only status was disclosed. Purge, redaction, legal hold, backup recovery and lawful erasure require separately governed lifecycle rules. No physical deletion is enabled here.

Emergency contacts and already known urgent deadlines must remain available without exhaustive profile completion. Unknown deadlines are explicitly uncertain and trigger prompt specialist review. Communication choice must consider unsafe household/employer access. Never promise legal outcome, authority processing time, medical safety or refund based only on automated explanation.
