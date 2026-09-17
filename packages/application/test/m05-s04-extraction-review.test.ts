import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ActorId,
  ActorKind,
  ActorReference,
  ContentHash,
  EvidenceId,
  EvidenceKind,
  EvidenceReference,
  UtcInstant,
  VerificationState,
  VerificationStateCode,
} from '../../core/src/index.ts';
import { OrganizationScopeReference } from '../src/index.ts';
import {
  DocumentIntakeId,
  IntakeChannelProvenance,
  IntakeMediaMetadata,
  IntakeSecurityClassification,
  MultiChannelIntakeSubmission,
} from '../src/intake/index.ts';
import {
  ArchiveByteIntegrityObservation,
  OriginalArchiveEntry,
} from '../src/archive/index.ts';
import {
  DerivedExtractionProposalRecord,
  ExtractionConfidence,
  ExtractionFieldProposal,
  ExtractionProcessorKind,
  ExtractionProcessorReference,
  ExtractionFieldReviewDecision,
  ExtractionFieldReviewDisposition,
  ExtractionProposalReviewHistory,
  ExtractionReviewActorRole,
  ExtractionReviewRevision,
  ExtractionReviewState,
} from '../src/extraction/index.ts';

const actor = ActorReference.create(ActorId.from('018f22e2-79b0-7cc3-98c4-dc0c0c079001'), ActorKind.HUMAN_USER);
const reviewer = ActorReference.create(ActorId.from('018f22e2-79b0-7cc3-98c4-dc0c0c079002'), ActorKind.HUMAN_USER);
const org = OrganizationScopeReference.from('org:m05-s04');
const originalEvidence = EvidenceReference.original({
  id: EvidenceId.from('018f22e2-79b0-7cc3-98c4-dc0c0c079003'),
  kind: EvidenceKind.DOCUMENT,
  contentReference: 'object://m05-s04/original.pdf',
  mediaType: 'application/pdf',
  contentHash: ContentHash.sha256('a'.repeat(64)),
  acquiredAt: UtcInstant.from('2026-09-17T09:00:00Z'),
  acquiredBy: actor,
  verificationState: VerificationState.from(VerificationStateCode.UNVERIFIED),
});
const submission = MultiChannelIntakeSubmission.create({
  id: DocumentIntakeId.from('018f22e2-79b0-7cc3-98c4-dc0c0c079004'),
  provenance: IntakeChannelProvenance.fileUpload('upload:m05-s04'),
  receivedAt: UtcInstant.from('2026-09-17T09:01:00Z'),
  receivedBy: actor,
  organization: org,
  originalArtifact: originalEvidence,
  media: IntakeMediaMetadata.create({ mediaType: 'application/pdf', byteLength: 1024, originalFileName: 'credential.pdf' }),
  securityClassification: IntakeSecurityClassification.CONFIDENTIAL,
});
const archive = OriginalArchiveEntry.create({
  submission,
  storageObjectReference: 'archive://m05-s04/original',
  archivedAt: UtcInstant.from('2026-09-17T09:03:00Z'),
  encryptionProfileReference: 'enc:v1',
  accessPolicyReference: 'access:v1',
  retentionPolicyReference: 'retention:v1',
  integrity: ArchiveByteIntegrityObservation.matched({
    observedContentHash: ContentHash.sha256('a'.repeat(64)),
    checkedAt: UtcInstant.from('2026-09-17T09:02:00Z'),
    methodReference: 'sha256:v1',
  }),
});
const nameField = ExtractionFieldProposal.create({ fieldPath: 'holder.name', proposedValue: 'Alice Example', sourceLocator: 'page:1', confidence: ExtractionConfidence.from(0.92) });
const expiryField = ExtractionFieldProposal.create({ fieldPath: 'credential.expiresOn', proposedValue: '2028-09-17', sourceLocator: 'page:1', confidence: ExtractionConfidence.from(0.81) });
const processor = ExtractionProcessorReference.create({ kind: ExtractionProcessorKind.OCR_ENGINE, processorReference: 'ocr:neutral', processorVersion: '1.0.0' });
const derived = EvidenceReference.derived({
  id: EvidenceId.from('018f22e2-79b0-7cc3-98c4-dc0c0c079005'),
  kind: EvidenceKind.EXTRACTED_METADATA,
  contentReference: 'derived://m05-s04/extraction',
  mediaType: 'application/json',
  acquiredAt: UtcInstant.from('2026-09-17T09:04:00Z'),
  acquiredBy: actor,
  derivationParent: originalEvidence.id,
  verificationState: VerificationState.from(VerificationStateCode.UNVERIFIED),
});
const proposal = DerivedExtractionProposalRecord.create({ derivedEvidence: derived, parent: archive, processor, proposals: [expiryField, nameField] });

function history() { return ExtractionProposalReviewHistory.start(proposal); }
function confirmed(reason = 'Reviewed against visible document') { return ExtractionFieldReviewDecision.confirmed({ fieldProposal: nameField, reason }); }
function corrected(value: string | number | boolean | null = 'Alicia Example') { return ExtractionFieldReviewDecision.corrected({ fieldProposal: nameField, correctedValue: value, reason: 'Visible source differs from extraction' }); }
function rejected() { return ExtractionFieldReviewDecision.rejected({ fieldProposal: nameField, reason: 'Field not present in source' }); }
function escalated() { return ExtractionFieldReviewDecision.humanReviewRequired({ fieldProposal: nameField, reason: 'Ambiguous source requires human review' }); }
function append(state: Exclude<typeof ExtractionReviewState[keyof typeof ExtractionReviewState], 'PROPOSED'>, decisions: readonly ExtractionFieldReviewDecision[] = [], at = '2026-09-17T09:05:00Z') {
  return history().append({ state, reviewedBy: actor, actorRole: ExtractionReviewActorRole.USER, reviewedAt: UtcInstant.from(at), reason: 'Review completed', fieldDecisions: decisions });
}

test('M05S04-01 canonical review states are exact', () => assert.deepEqual(Object.values(ExtractionReviewState), ['PROPOSED','USER_CONFIRMED','USER_CORRECTED','REJECTED','HUMAN_REVIEW_REQUIRED']));
test('M05S04-02 actor roles are controlled', () => assert.deepEqual(Object.values(ExtractionReviewActorRole), ['USER','REVIEWER']));
test('M05S04-03 field dispositions are controlled', () => assert.deepEqual(Object.values(ExtractionFieldReviewDisposition), ['CONFIRMED','CORRECTED','REJECTED','HUMAN_REVIEW_REQUIRED']));
test('M05S04-04 new history begins PROPOSED', () => assert.equal(history().currentState, ExtractionReviewState.PROPOSED));
test('M05S04-05 new history has zero revisions', () => assert.equal(history().revisions.length, 0));
test('M05S04-06 history preserves exact S03 proposal object', () => assert.strictEqual(history().proposal, proposal));
test('M05S04-07 confirmed decision preserves exact field object', () => assert.strictEqual(confirmed().fieldProposal, nameField));
test('M05S04-08 confirmed decision has no corrected value', () => { const d=confirmed(); assert.equal(d.hasCorrectedValue,false); assert.equal(d.correctedValue,null); });
test('M05S04-09 corrected decision records replacement string', () => assert.equal(corrected('Alicia').correctedValue, 'Alicia'));
test('M05S04-10 corrected-to-null is explicit', () => { const d=corrected(null); assert.equal(d.hasCorrectedValue,true); assert.equal(d.correctedValue,null); });
test('M05S04-11 corrected finite number is supported', () => assert.equal(corrected(42).correctedValue, 42));
test('M05S04-12 corrected boolean is supported', () => assert.equal(corrected(false).correctedValue, false));
test('M05S04-13 non-finite corrected number fails closed', () => assert.throws(() => corrected(Number.NaN), TypeError));
test('M05S04-14 oversized corrected text fails closed', () => assert.throws(() => corrected('x'.repeat(4097)), RangeError));
test('M05S04-15 control chars in corrected text fail closed', () => assert.throws(() => corrected('bad\nvalue'), TypeError));
test('M05S04-16 rejection requires a reason', () => assert.equal(rejected().disposition, ExtractionFieldReviewDisposition.REJECTED));
test('M05S04-17 human-review escalation requires a reason', () => assert.equal(escalated().disposition, ExtractionFieldReviewDisposition.HUMAN_REVIEW_REQUIRED));
test('M05S04-18 empty reason fails closed', () => assert.throws(() => ExtractionFieldReviewDecision.rejected({ fieldProposal:nameField, reason:'   ' }), TypeError));
test('M05S04-19 USER_CONFIRMED accepts confirmed decisions', () => assert.equal(append(ExtractionReviewState.USER_CONFIRMED,[confirmed()]).currentState, ExtractionReviewState.USER_CONFIRMED));
test('M05S04-20 USER_CONFIRMED rejects corrected decisions', () => assert.throws(() => append(ExtractionReviewState.USER_CONFIRMED,[corrected()]), TypeError));
test('M05S04-21 USER_CORRECTED requires at least one correction', () => assert.throws(() => append(ExtractionReviewState.USER_CORRECTED,[confirmed()]), TypeError));
test('M05S04-22 USER_CORRECTED allows confirmed plus corrected', () => assert.equal(append(ExtractionReviewState.USER_CORRECTED,[confirmed(), corrected()]).currentState, ExtractionReviewState.USER_CORRECTED));
test('M05S04-23 USER_CORRECTED rejects rejected decisions', () => assert.throws(() => append(ExtractionReviewState.USER_CORRECTED,[corrected(), rejected()]), TypeError));
test('M05S04-24 REJECTED accepts rejected decisions', () => assert.equal(append(ExtractionReviewState.REJECTED,[rejected()]).currentState, ExtractionReviewState.REJECTED));
test('M05S04-25 REJECTED rejects confirmed decisions', () => assert.throws(() => append(ExtractionReviewState.REJECTED,[confirmed()]), TypeError));
test('M05S04-26 HUMAN_REVIEW_REQUIRED accepts escalation decisions', () => assert.equal(append(ExtractionReviewState.HUMAN_REVIEW_REQUIRED,[escalated()]).currentState, ExtractionReviewState.HUMAN_REVIEW_REQUIRED));
test('M05S04-27 HUMAN_REVIEW_REQUIRED rejects corrections', () => assert.throws(() => append(ExtractionReviewState.HUMAN_REVIEW_REQUIRED,[corrected()]), TypeError));
test('M05S04-28 PROPOSED cannot be appended as a revision', () => assert.throws(() => ExtractionReviewRevision.create({ proposal, revisionNumber:1, state:ExtractionReviewState.PROPOSED as never, reviewedBy:actor, actorRole:ExtractionReviewActorRole.USER, reviewedAt:UtcInstant.from('2026-09-17T09:05:00Z'), reason:'invalid' }), TypeError));
test('M05S04-29 first appended revision number is one', () => assert.equal(append(ExtractionReviewState.USER_CONFIRMED,[confirmed()]).revisions[0]!.revisionNumber,1));
test('M05S04-30 second appended revision number is two', () => { const h=append(ExtractionReviewState.USER_CONFIRMED,[confirmed()]).append({ state:ExtractionReviewState.USER_CORRECTED, reviewedBy:reviewer, actorRole:ExtractionReviewActorRole.REVIEWER, reviewedAt:UtcInstant.from('2026-09-17T09:06:00Z'), reason:'Second review', fieldDecisions:[corrected()] }); assert.equal(h.revisions[1]!.revisionNumber,2); });
test('M05S04-31 append does not mutate prior history', () => { const h0=history(); const h1=h0.append({ state:ExtractionReviewState.USER_CONFIRMED, reviewedBy:actor, actorRole:ExtractionReviewActorRole.USER, reviewedAt:UtcInstant.from('2026-09-17T09:05:00Z'), reason:'Confirm', fieldDecisions:[confirmed()] }); assert.equal(h0.revisions.length,0); assert.equal(h1.revisions.length,1); });
test('M05S04-32 append does not mutate S03 proposal', () => { const before=JSON.stringify(proposal.toJSON()); append(ExtractionReviewState.USER_CORRECTED,[corrected()]); assert.equal(JSON.stringify(proposal.toJSON()),before); });
test('M05S04-33 append does not mutate immutable S02 original', () => { const before=JSON.stringify(archive.toJSON()); append(ExtractionReviewState.USER_CORRECTED,[corrected()]); assert.equal(JSON.stringify(archive.toJSON()),before); });
test('M05S04-34 revisions are immutable', () => assert.equal(Object.isFrozen(append(ExtractionReviewState.USER_CONFIRMED,[confirmed()]).revisions[0]), true));
test('M05S04-35 histories and revision arrays are immutable', () => { const h=append(ExtractionReviewState.USER_CONFIRMED,[confirmed()]); assert.equal(Object.isFrozen(h),true); assert.equal(Object.isFrozen(h.revisions),true); });
test('M05S04-36 field decisions are immutable', () => assert.equal(Object.isFrozen(confirmed()), true));
test('M05S04-37 revision field-decision array is immutable', () => assert.equal(Object.isFrozen(append(ExtractionReviewState.USER_CONFIRMED,[confirmed()]).revisions[0]!.fieldDecisions),true));
test('M05S04-38 review cannot predate S03 proposal', () => assert.throws(() => append(ExtractionReviewState.USER_CONFIRMED,[confirmed()],'2026-09-17T09:03:59Z'), RangeError));
test('M05S04-39 later revision cannot predate preceding revision', () => { const h=append(ExtractionReviewState.USER_CONFIRMED,[confirmed()],'2026-09-17T09:06:00Z'); assert.throws(() => h.append({ state:ExtractionReviewState.REJECTED, reviewedBy:reviewer, actorRole:ExtractionReviewActorRole.REVIEWER, reviewedAt:UtcInstant.from('2026-09-17T09:05:59Z'), reason:'Rejected', fieldDecisions:[rejected()] }), RangeError); });
test('M05S04-40 decision must use exact field object from proposal', () => { const clone=ExtractionFieldProposal.create({ fieldPath:'holder.name', proposedValue:'Alice Example', sourceLocator:'page:1', confidence:ExtractionConfidence.from(0.92) }); assert.throws(() => append(ExtractionReviewState.USER_CONFIRMED,[ExtractionFieldReviewDecision.confirmed({ fieldProposal:clone })]), TypeError); });
test('M05S04-41 duplicate field-path decisions fail closed', () => assert.throws(() => append(ExtractionReviewState.USER_CONFIRMED,[confirmed('one'),confirmed('two')]), TypeError));
test('M05S04-42 field decisions are canonically ordered', () => { const a=ExtractionFieldReviewDecision.confirmed({fieldProposal:nameField}); const b=ExtractionFieldReviewDecision.confirmed({fieldProposal:expiryField}); const h=append(ExtractionReviewState.USER_CONFIRMED,[a,b]); const paths=h.revisions[0]!.fieldDecisions.map(d=>d.fieldProposal.fieldPath); assert.deepEqual(paths,[...paths].sort()); });
test('M05S04-43 serialization is deterministic', () => { const a=append(ExtractionReviewState.USER_CORRECTED,[confirmed(),corrected()]); const b=append(ExtractionReviewState.USER_CORRECTED,[corrected(),confirmed()]); assert.deepEqual(a.toJSON(),b.toJSON()); });
test('M05S04-44 user confirmation does not promote verification', () => { const h=append(ExtractionReviewState.USER_CONFIRMED,[confirmed()]); assert.equal(h.proposal.derivedEvidence.verificationState.toString(), VerificationStateCode.UNVERIFIED); assert.equal(h.toJSON().proposalVerificationState, VerificationStateCode.UNVERIFIED); });
test('M05S04-45 user correction does not promote verification', () => { const h=append(ExtractionReviewState.USER_CORRECTED,[corrected()]); assert.equal(h.proposal.derivedEvidence.verificationState.toString(), VerificationStateCode.UNVERIFIED); });
test('M05S04-46 reviewer role does not create verification authority', () => { const h=history().append({ state:ExtractionReviewState.USER_CONFIRMED, reviewedBy:reviewer, actorRole:ExtractionReviewActorRole.REVIEWER, reviewedAt:UtcInstant.from('2026-09-17T09:05:00Z'), reason:'Reviewer confirms assertion', fieldDecisions:[confirmed()] }); assert.equal(h.revisions[0]!.actorRole,ExtractionReviewActorRole.REVIEWER); assert.equal(h.proposal.derivedEvidence.verificationState.toString(),VerificationStateCode.UNVERIFIED); });
test('M05S04-47 history preserves root original evidence identity', () => assert.equal(append(ExtractionReviewState.USER_CONFIRMED,[confirmed()]).toJSON().rootOriginalEvidenceId, originalEvidence.id.toString()));
test('M05S04-48 review source exposes no verification eligibility recognition or authorization authority', async () => { const source=await import('node:fs').then(fs=>fs.readFileSync(new URL('../src/extraction/extraction-review.ts', import.meta.url),'utf8')); assert.equal(/VerificationState\.from|orchestrateVerification|EligibilityAssessment|RecognitionDecision|AuthorizationGrant|Date\.now\(|Math\.random\(/.test(source),false); });
