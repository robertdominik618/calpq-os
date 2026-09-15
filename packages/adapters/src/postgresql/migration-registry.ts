import { UtcInstant } from '../../../core/src/index.ts';

export const MigrationPhase = {
  BASELINE: 'BASELINE',
  EXPAND: 'EXPAND',
  CONTRACT: 'CONTRACT',
} as const;
export type MigrationPhase = (typeof MigrationPhase)[keyof typeof MigrationPhase];

const PHASES = new Set<string>(Object.values(MigrationPhase));
const CHECKSUM = /^[0-9a-f]{64}$/;
const MIGRATION_ID = /^\d{4}_[a-z0-9_]+$/;
const SQL_FILE = /^\d{4}_[a-z0-9_]+\.sql$/;

export interface MigrationDefinitionInput {
  readonly id: string;
  readonly file: string;
  readonly phase: MigrationPhase;
  readonly checksumSha256: string;
}

export interface AppliedMigrationInput {
  readonly id: string;
  readonly checksumSha256: string;
  readonly appliedAt: UtcInstant;
  readonly deploymentId: string;
}

export class MigrationDefinition {
  readonly id: string;
  readonly file: string;
  readonly phase: MigrationPhase;
  readonly checksumSha256: string;

  private constructor(input: MigrationDefinitionInput) {
    this.id = input.id;
    this.file = input.file;
    this.phase = input.phase;
    this.checksumSha256 = input.checksumSha256;
    Object.freeze(this);
  }

  static create(input: MigrationDefinitionInput): MigrationDefinition {
    if (!MIGRATION_ID.test(input.id)) throw new TypeError('Migration id must be ordered and canonical');
    if (!SQL_FILE.test(input.file)) throw new TypeError('Migration file must be an ordered .sql file');
    if (!input.file.startsWith(input.id)) throw new TypeError('Migration file must begin with migration id');
    if (!PHASES.has(input.phase)) throw new TypeError('Migration phase is not controlled');
    if (!CHECKSUM.test(input.checksumSha256)) throw new TypeError('Migration checksum must be lowercase SHA-256');
    return new MigrationDefinition(input);
  }
}

export class AppliedMigration {
  readonly id: string;
  readonly checksumSha256: string;
  readonly appliedAt: UtcInstant;
  readonly deploymentId: string;

  private constructor(input: AppliedMigrationInput) {
    this.id = input.id;
    this.checksumSha256 = input.checksumSha256;
    this.appliedAt = input.appliedAt;
    this.deploymentId = input.deploymentId.trim();
    Object.freeze(this);
  }

  static create(input: AppliedMigrationInput): AppliedMigration {
    if (!MIGRATION_ID.test(input.id)) throw new TypeError('Applied migration id is invalid');
    if (!CHECKSUM.test(input.checksumSha256)) throw new TypeError('Applied migration checksum is invalid');
    if (!(input.appliedAt instanceof UtcInstant)) throw new TypeError('Applied migration requires UtcInstant');
    if (typeof input.deploymentId !== 'string' || input.deploymentId.trim().length === 0) {
      throw new TypeError('Applied migration requires deployment identity');
    }
    return new AppliedMigration(input);
  }
}

export class MigrationIntegrityError extends Error {
  readonly migrationId: string;

  constructor(message: string, migrationId: string) {
    super(message);
    this.name = 'MigrationIntegrityError';
    this.migrationId = migrationId;
  }
}

export class MigrationManifest {
  readonly schemaVersion: 1;
  readonly database: 'postgresql-18';
  readonly migrations: readonly MigrationDefinition[];

  private constructor(migrations: readonly MigrationDefinition[]) {
    this.schemaVersion = 1;
    this.database = 'postgresql-18';
    this.migrations = Object.freeze([...migrations]);
    Object.freeze(this);
  }

  static create(input: {
    readonly schemaVersion: number;
    readonly database: string;
    readonly migrations: readonly MigrationDefinitionInput[];
  }): MigrationManifest {
    if (input.schemaVersion !== 1) throw new TypeError('Unsupported migration manifest schema version');
    if (input.database !== 'postgresql-18') throw new TypeError('FV-08 migration manifest requires PostgreSQL 18');

    const migrations = input.migrations.map(MigrationDefinition.create);
    const ids = migrations.map((migration) => migration.id);
    if (new Set(ids).size !== ids.length) throw new TypeError('Migration ids must be unique');
    for (let index = 1; index < ids.length; index += 1) {
      const previous = ids[index - 1];
      const current = ids[index];
      if (previous === undefined || current === undefined || previous >= current) {
        throw new TypeError('Migrations must be strictly ordered by id');
      }
    }
    return new MigrationManifest(migrations);
  }

  pending(applied: readonly AppliedMigration[]): readonly MigrationDefinition[] {
    if (applied.length > this.migrations.length) {
      throw new MigrationIntegrityError('Applied migration history is longer than manifest', 'UNKNOWN');
    }

    for (let index = 0; index < applied.length; index += 1) {
      const recorded = applied[index];
      const expected = this.migrations[index];
      if (recorded === undefined || expected === undefined) {
        throw new MigrationIntegrityError('Applied migration history is not a manifest prefix', 'UNKNOWN');
      }
      if (recorded.id !== expected.id) {
        throw new MigrationIntegrityError('Applied migrations must be an exact ordered manifest prefix', recorded.id);
      }
      if (recorded.checksumSha256 !== expected.checksumSha256) {
        throw new MigrationIntegrityError('Applied migration checksum does not match immutable manifest', recorded.id);
      }
    }

    return Object.freeze(this.migrations.slice(applied.length));
  }
}
