# CALPQ Schema Migration & Evolution Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0017-D`

## Migration authority
Production schema changes use explicit, ordered SQL migrations committed to Git. Applied migrations are immutable; any correction is a new migration.

A migration registry records at minimum migration ID/version, checksum, applied time and deployment identity. Checksum mismatch for an already-applied migration is a failure requiring review.

## Compatibility strategy
Prefer expand/contract evolution for changes that must coexist with multiple application versions:
1. add compatible structure;
2. deploy code able to read/write both forms where needed;
3. backfill/reconcile;
4. validate new constraints/indexes;
5. switch canonical reads/writes;
6. remove obsolete representation only after an explicit compatibility window.

## PostgreSQL implementation guidance
For large tables, use PostgreSQL-supported low-impact techniques where appropriate, such as adding eligible constraints as `NOT VALID` and validating them separately. Locking impact must be reviewed per migration.

## Data backfill
Large or semantic backfills are explicit jobs/migrations with resumability, checkpoints and verification. A schema migration MUST NOT silently reinterpret historical legal/domain meaning.

## Domain-content boundary
A legal/regulatory/catalog rule version change is domain data/versioning, not a database schema migration. Schema migration changes storage representation; it does not rewrite the applicable rule version used by historical decisions.

## Safety rules
- no production ORM auto-migration;
- no destructive representation change without explicit migration/recovery plan;
- no broad cascade policy across governed historical records by default;
- migration rollback expectations are explicit: forward-fix may be safer than reverse DDL/data rollback;
- backup/restore compatibility must be tested for material schema changes.
