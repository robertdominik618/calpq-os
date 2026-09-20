import type {
  AuthoritativeSourceRecord,
  AuthoritativeSourceRecordInput,
  AuthoritativeSourceRegistry,
  AuthoritativeSourceRegistryStatusCode,
} from '../src/regulatory/index.ts';

declare const record: AuthoritativeSourceRecord;
declare const registry: AuthoritativeSourceRegistry;
declare const input: AuthoritativeSourceRecordInput;
declare const status: AuthoritativeSourceRegistryStatusCode;

void status;

// @ts-expect-error authoritative source records are readonly
record.affectedDomain = 'OTHER';

// @ts-expect-error registry status is readonly
record.registryStatus = 'VERIFIED';

// @ts-expect-error review reason is readonly
record.reviewReason = 'changed';

// @ts-expect-error registry size is readonly
registry.size = 0;

// @ts-expect-error registry list is readonly
registry.list().push(record);

// @ts-expect-error record input source reference is readonly
input.source = record.source;
