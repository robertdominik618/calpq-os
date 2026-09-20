import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { ActorId, SourceId } from '../src/ids.ts';
import { ActorKind, ActorReference } from '../src/party-references.ts';
import { Jurisdiction } from '../src/jurisdiction.ts';
import { VerificationState, VerificationStateCode } from '../src/verification-state.ts';
import { DateOnly, UtcInstant } from '../src/time.ts';
import { VersionId } from '../src/version.ts';
import { SourceReference, SourceType } from '../src/provenance/source-reference.ts';
import {
  AuthoritativeSourceRecord,
  AuthoritativeSourceRegistry,
  AuthoritativeSourceRegistryStatus,
} from '../src/regulatory/authoritative-source-registry.ts';
import { validateScope } from '../../../scripts/ci/m07-admission.mjs';

const SOURCE_A = '018f6f4c-4b9a-7a11-8a11-111111111111';
const SOURCE_B = '018f6f4c-4b9a-7a11-8a11-222222222222';
const SOURCE_C = '018f6f4c-4b9a-7a11-8a11-333333333333';
const ACTOR_A = '018f6f4c-4b9a-7a11-8a11-aaaaaaaaaaaa';

function makeSource(options: {
  id?: string;
  state?: VerificationStateCode;
  locator?: string | null;
  sourceType?: SourceType;
  version?: string;
  publicationDate?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  retrievedAt?: string | null;
} = {}): SourceReference {
  return SourceReference.create({
    id: SourceId.from(options.id ?? SOURCE_A),
    authority: ActorReference.create(ActorId.from(ACTOR_A), ActorKind.EXTERNAL_AUTHORITY),
    jurisdiction: Jurisdiction.fromCode('CZ'),
    sourceType: options.sourceType ?? SourceType.LAW,
    canonicalLocator: options.locator === undefined ? 'https://example.invalid/law/1' : options.locator,
    version: VersionId.from(options.version ?? 'v1'),
    publicationDate: options.publicationDate === undefined
      ? null
      : options.publicationDate === null
        ? null
        : DateOnly.from(options.publicationDate),
    effectiveFrom: options.effectiveFrom === undefined
      ? null
      : options.effectiveFrom === null
        ? null
        : DateOnly.from(options.effectiveFrom),
    effectiveTo: options.effectiveTo === undefined
      ? null
      : options.effectiveTo === null
        ? null
        : DateOnly.from(options.effectiveTo),
    retrievedAt: options.retrievedAt === null
      ? (null as unknown as UtcInstant)
      : UtcInstant.from(options.retrievedAt ?? '2026-09-20T07:33:32Z'),
    verificationState: VerificationState.from(options.state ?? VerificationStateCode.UNVERIFIED),
  });
}

function makeRecord(options: {
  id?: string;
  state?: VerificationStateCode;
  locator?: string | null;
  domain?: string;
  reviewReason?: string | null;
  version?: string;
  publicationDate?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
} = {}): AuthoritativeSourceRecord {
  return AuthoritativeSourceRecord.create({
    source: makeSource(options),
    affectedDomain: options.domain ?? 'CZ.AUTHORIZATION',
    reviewReason: options.reviewReason,
  });
}

test('M07S01-01 accepts minimal UNVERIFIED record', () => {
  const record = makeRecord();
  assert.equal(record.registryStatus, AuthoritativeSourceRegistryStatus.UNVERIFIED);
});

test('M07S01-02 accepts fully populated VERIFIED record', () => {
  const record = makeRecord({
    state: VerificationStateCode.VERIFIED,
    publicationDate: '2026-01-01',
    effectiveFrom: '2026-01-02',
    effectiveTo: '2027-01-01',
    version: '2026.1',
  });
  assert.equal(record.registryStatus, AuthoritativeSourceRegistryStatus.VERIFIED);
  assert.equal(record.source.publicationDate?.toString(), '2026-01-01');
});

test('M07S01-03 maps stale source to STALE_REVIEW_REQUIRED', () => {
  const record = makeRecord({ state: VerificationStateCode.STALE, reviewReason: 'New official version detected' });
  assert.equal(record.registryStatus, AuthoritativeSourceRegistryStatus.STALE_REVIEW_REQUIRED);
});

test('M07S01-04 rejects source states outside registry contract', () => {
  assert.throws(() => makeRecord({ state: VerificationStateCode.FAILED }));
  assert.throws(() => makeRecord({ state: VerificationStateCode.NOT_APPLICABLE }));
});

test('M07S01-05 rejects invalid stable source identity', () => {
  assert.throws(() => SourceId.from(''));
});

test('M07S01-06 rejects invalid issuer identity', () => {
  assert.throws(() => ActorId.from('invalid'));
});

test('M07S01-07 rejects empty canonical reference', () => {
  assert.throws(() => makeSource({ locator: '' }));
  assert.throws(() => makeRecord({ locator: null }));
});

test('M07S01-08 rejects unknown jurisdiction', () => {
  assert.throws(() => Jurisdiction.fromCode('UNKNOWN'));
});

test('M07S01-09 rejects empty affected domain', () => {
  assert.throws(() => makeRecord({ domain: '' }));
});

test('M07S01-10 rejects unknown source classification', () => {
  assert.throws(() => SourceReference.create({
    id: SourceId.from(SOURCE_A),
    authority: ActorReference.create(ActorId.from(ACTOR_A), ActorKind.EXTERNAL_AUTHORITY),
    jurisdiction: Jurisdiction.fromCode('CZ'),
    sourceType: 'BLOG' as SourceType,
    canonicalLocator: 'https://example.invalid/blog',
    version: VersionId.from('v1'),
    retrievedAt: UtcInstant.from('2026-09-20T07:33:32Z'),
    verificationState: VerificationState.from(VerificationStateCode.UNVERIFIED),
  }));
});

test('M07S01-11 preserves source version separately from source identity', () => {
  const source = makeSource({ version: '2026.09' });
  assert.equal(source.id.toString(), SOURCE_A);
  assert.equal(source.version.toString(), '2026.09');
});

test('M07S01-12 keeps publication date distinct from effective date', () => {
  const source = makeSource({ publicationDate: '2026-01-01', effectiveFrom: '2026-02-01' });
  assert.equal(source.publicationDate?.toString(), '2026-01-01');
  assert.equal(source.effectiveFrom?.toString(), '2026-02-01');
});

test('M07S01-13 preserves explicit retrieval instant', () => {
  const source = makeSource({ retrievedAt: '2026-09-19T10:11:12+02:00' });
  assert.equal(source.retrievedAt.toString(), '2026-09-19T08:11:12.000Z');
});

test('M07S01-14 preserves effective-from independently', () => {
  assert.equal(makeSource({ effectiveFrom: '2026-03-01' }).effectiveFrom?.toString(), '2026-03-01');
});

test('M07S01-15 preserves effective-to independently', () => {
  assert.equal(makeSource({ effectiveTo: '2026-12-31' }).effectiveTo?.toString(), '2026-12-31');
});

test('M07S01-16 rejects reversed effective interval', () => {
  assert.throws(() => makeSource({ effectiveFrom: '2026-12-31', effectiveTo: '2026-01-01' }));
});

test('M07S01-17 allows unknown publication date', () => {
  assert.equal(makeSource({ publicationDate: null }).publicationDate, null);
});

test('M07S01-18 rejects missing retrieval instant instead of inventing one', () => {
  assert.throws(() => makeSource({ retrievedAt: null }));
});

test('M07S01-19 allows unknown effective bounds', () => {
  const source = makeSource({ effectiveFrom: null, effectiveTo: null });
  assert.equal(source.effectiveFrom, null);
  assert.equal(source.effectiveTo, null);
});

test('M07S01-20 requires review reason for stale/review-required status', () => {
  assert.throws(() => makeRecord({ state: VerificationStateCode.STALE }));
  assert.throws(() => makeRecord({ state: VerificationStateCode.REVIEW_REQUIRED }));
});

test('M07S01-21 VERIFIED does not require review reason', () => {
  assert.equal(makeRecord({ state: VerificationStateCode.VERIFIED }).reviewReason, null);
});

test('M07S01-22 UNVERIFIED does not require review reason', () => {
  assert.equal(makeRecord().reviewReason, null);
});

test('M07S01-23 preserves provenance through the underlying SourceReference', () => {
  const source = makeSource();
  const record = AuthoritativeSourceRecord.create({ source, affectedDomain: 'CZ.AUTHORIZATION' });
  assert.equal(record.source, source);
  assert.equal(record.source.authority.id.toString(), ACTOR_A);
  assert.equal(record.source.canonicalLocator, 'https://example.invalid/law/1');
});

test('M07S01-24 rejects duplicate source identities', () => {
  assert.throws(() => AuthoritativeSourceRegistry.create([makeRecord(), makeRecord()]));
});

test('M07S01-25 resolves existing source deterministically', () => {
  const a = makeRecord({ id: SOURCE_A });
  const b = makeRecord({ id: SOURCE_B });
  const registry = AuthoritativeSourceRegistry.create([a, b]);
  assert.equal(registry.findBySourceId(SourceId.from(SOURCE_B)), b);
});

test('M07S01-26 returns null for unknown source identity', () => {
  const registry = AuthoritativeSourceRegistry.create([makeRecord({ id: SOURCE_A })]);
  assert.equal(registry.findBySourceId(SourceId.from(SOURCE_C)), null);
});

test('M07S01-27 preserves deterministic input order', () => {
  const a = makeRecord({ id: SOURCE_A });
  const b = makeRecord({ id: SOURCE_B });
  assert.deepEqual(AuthoritativeSourceRegistry.create([b, a]).list(), [b, a]);
});

test('M07S01-28 does not mutate caller-provided records', () => {
  const record = makeRecord();
  const input = [record];
  const registry = AuthoritativeSourceRegistry.create(input);
  input.pop();
  assert.equal(registry.size, 1);
  assert(Object.isFrozen(record));
  assert(Object.isFrozen(registry.list()));
});

test('M07S01-29 exposes readonly registry surface', () => {
  const registry = AuthoritativeSourceRegistry.create([makeRecord()]);
  assert.equal(registry.size, 1);
  assert(Object.isFrozen(registry));
});

test('M07S01-30 exposes no parser/OCR/AI confidence upgrade API', () => {
  const source = readFileSync('packages/core/src/regulatory/authoritative-source-registry.ts', 'utf8');
  assert(!/confidence|ocr|parser|aiScore|upgradeVerification/i.test(source));
});

test('M07S01-31 exposes no legal applicability decision API', () => {
  const source = readFileSync('packages/core/src/regulatory/authoritative-source-registry.ts', 'utf8');
  assert(!/isApplicable|decideApplicability|legalDecision|eligibility/i.test(source));
});

test('M07S01-32 imports no network/provider/persistence dependency', () => {
  const source = readFileSync('packages/core/src/regulatory/authoritative-source-registry.ts', 'utf8');
  assert(!/fetch\(|node:|axios|openai|anthropic|adapter|database|repository/i.test(source));
});

test('M07S01-33 regulatory barrel exports only approved S01 registry symbols', () => {
  const barrel = readFileSync('packages/core/src/regulatory/index.ts', 'utf8');
  for (const name of ['AuthoritativeSourceRecord', 'AuthoritativeSourceRegistry', 'AuthoritativeSourceRegistryStatus']) {
    assert(barrel.includes(name));
  }
  assert(!/applicab|provider|fetch|adapter/i.test(barrel));
});

test('M07S01-34 activation record binds exact M07 admission identities', () => {
  const activation = JSON.parse(readFileSync('docs/planning/m07-s01-activation.json', 'utf8'));
  assert.equal(activation.admission_pr, 163);
  assert.equal(activation.admission_head, '35e461e6e6c095c7cfea5a7bb5fa922ac0488c4c');
  assert.equal(activation.admission_merge, '3882c146634869a817509f4bc8441738185ce257');
  assert.equal(activation.admission_tree, '49ce26c80bd30e6bd5b3e66897f13bb17ad7d883');
});

test('M07S01-35 admission scope validator accepts only authorized S01 paths', () => {
  assert.doesNotThrow(() => validateScope([
    {
      path: 'packages/core/src/regulatory/authoritative-source-registry.ts',
      status: 'A',
      mode: '100644',
    },
  ], 'S01'));

  for (const path of [
    'packages/application/src/regulatory/x.ts',
    'packages/adapters/src/regulatory/x.ts',
    'apps/web/src/regulatory/x.ts',
    'README.md',
  ]) {
    assert.throws(() => validateScope([{ path, status: 'M', mode: '100644' }], 'S01'));
  }
});

test('M07S01-36 M07 admission validator supports S01 mode', () => {
  const validator = readFileSync('scripts/ci/m07-admission.mjs', 'utf8');
  assert(validator.includes("mode==='S01'"));
  assert(validator.includes("validateScope(delta,'S01')"));
});

test('M07S01-37 M08 remains implementation-blocked', () => {
  const m08 = readFileSync('docs/planning/M08_EXECUTION_PACKAGE.md', 'utf8');
  assert(m08.includes('IMPLEMENTATION BLOCKED'));
});

test('M07S01-38 architecture boundary test remains present', () => {
  const architecture = readFileSync('tests/architecture_boundaries_test.sh', 'utf8');
  assert(architecture.length > 0);
});

test('M07S01-39 production release authority remains false', () => {
  const activation = JSON.parse(readFileSync('docs/planning/m07-s01-activation.json', 'utf8'));
  assert.equal(activation.production_release_authorized, false);
});

test('M07S01-40 legal-interpretation authority remains false', () => {
  const activation = JSON.parse(readFileSync('docs/planning/m07-s01-activation.json', 'utf8'));
  assert.equal(activation.legal_interpretation_authorized, false);
});
