import { SubjectReference } from '../../../core/src/index.ts';
import { CredentialCardReadModel } from '../credential-card/credential-card-read-model.ts';
import { CredentialExplanationReadModel } from '../explanation/credential-explanation-read-model.ts';
import { MissingConditionNextActionReadModel } from '../guidance/missing-condition-next-action-read-model.ts';
import { ProfessionalPassportSummaryReadModel } from '../passport/professional-passport-summary.ts';
import { ActivityTimelineReadModel } from '../timeline/activity-timeline-read-model.ts';

export const IntentSearchIntent = {
  CREDENTIAL: 'CREDENTIAL',
  EVIDENCE: 'EVIDENCE',
  EXPLANATION: 'EXPLANATION',
  ACTIVITY: 'ACTIVITY',
  NEXT_ACTION: 'NEXT_ACTION',
} as const;
export type IntentSearchIntent = (typeof IntentSearchIntent)[keyof typeof IntentSearchIntent];

export const IntentSearchSourceKind = {
  PASSPORT_SUMMARY: 'PASSPORT_SUMMARY',
  CREDENTIAL_CARD: 'CREDENTIAL_CARD',
  CREDENTIAL_EXPLANATION: 'CREDENTIAL_EXPLANATION',
  ACTIVITY_TIMELINE: 'ACTIVITY_TIMELINE',
  MISSING_CONDITION_GUIDANCE: 'MISSING_CONDITION_GUIDANCE',
} as const;
export type IntentSearchSourceKind = (typeof IntentSearchSourceKind)[keyof typeof IntentSearchSourceKind];

export const IntentSearchRecordKind = {
  CREDENTIAL_GROUP: 'CREDENTIAL_GROUP',
  CREDENTIAL_CARD: 'CREDENTIAL_CARD',
  SOURCE_REFERENCE: 'SOURCE_REFERENCE',
  EVIDENCE_REFERENCE: 'EVIDENCE_REFERENCE',
  VERIFICATION_ITEM: 'VERIFICATION_ITEM',
  REQUIREMENT_REASON: 'REQUIREMENT_REASON',
  TIMELINE_EVENT: 'TIMELINE_EVENT',
  TIMELINE_OMISSION: 'TIMELINE_OMISSION',
  MISSING_CONDITION: 'MISSING_CONDITION',
  NEXT_ACTION: 'NEXT_ACTION',
} as const;
export type IntentSearchRecordKind = (typeof IntentSearchRecordKind)[keyof typeof IntentSearchRecordKind];

export const IntentSearchMatchKind = {
  EXACT: 'EXACT',
  PREFIX: 'PREFIX',
} as const;
export type IntentSearchMatchKind = (typeof IntentSearchMatchKind)[keyof typeof IntentSearchMatchKind];

export const IntentSearchOrdering = {
  SCORE_DESC_THEN_STABLE_ID: 'SCORE_DESC_THEN_STABLE_ID',
} as const;

export const IntentSearchNoResultReason = {
  NO_MATCHING_APPROVED_RECORDS: 'NO_MATCHING_APPROVED_RECORDS',
} as const;

const SOURCE_SCOPE: Readonly<Record<IntentSearchIntent, readonly IntentSearchSourceKind[]>> = Object.freeze({
  [IntentSearchIntent.CREDENTIAL]: Object.freeze([
    IntentSearchSourceKind.PASSPORT_SUMMARY,
    IntentSearchSourceKind.CREDENTIAL_CARD,
  ]),
  [IntentSearchIntent.EVIDENCE]: Object.freeze([
    IntentSearchSourceKind.CREDENTIAL_EXPLANATION,
  ]),
  [IntentSearchIntent.EXPLANATION]: Object.freeze([
    IntentSearchSourceKind.CREDENTIAL_EXPLANATION,
  ]),
  [IntentSearchIntent.ACTIVITY]: Object.freeze([
    IntentSearchSourceKind.ACTIVITY_TIMELINE,
  ]),
  [IntentSearchIntent.NEXT_ACTION]: Object.freeze([
    IntentSearchSourceKind.MISSING_CONDITION_GUIDANCE,
  ]),
});

const RECORD_SCOPE: Readonly<Record<IntentSearchIntent, readonly IntentSearchRecordKind[]>> = Object.freeze({
  [IntentSearchIntent.CREDENTIAL]: Object.freeze([
    IntentSearchRecordKind.CREDENTIAL_GROUP,
    IntentSearchRecordKind.CREDENTIAL_CARD,
  ]),
  [IntentSearchIntent.EVIDENCE]: Object.freeze([
    IntentSearchRecordKind.SOURCE_REFERENCE,
    IntentSearchRecordKind.EVIDENCE_REFERENCE,
    IntentSearchRecordKind.VERIFICATION_ITEM,
  ]),
  [IntentSearchIntent.EXPLANATION]: Object.freeze([
    IntentSearchRecordKind.SOURCE_REFERENCE,
    IntentSearchRecordKind.EVIDENCE_REFERENCE,
    IntentSearchRecordKind.VERIFICATION_ITEM,
    IntentSearchRecordKind.REQUIREMENT_REASON,
  ]),
  [IntentSearchIntent.ACTIVITY]: Object.freeze([
    IntentSearchRecordKind.TIMELINE_EVENT,
    IntentSearchRecordKind.TIMELINE_OMISSION,
  ]),
  [IntentSearchIntent.NEXT_ACTION]: Object.freeze([
    IntentSearchRecordKind.MISSING_CONDITION,
    IntentSearchRecordKind.NEXT_ACTION,
  ]),
});

function subjectKey(subject: SubjectReference): string {
  return `${subject.kind}:${subject.id.toString()}`;
}

function text(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function normalize(value: string): string {
  return value.normalize('NFKC').trim().toLowerCase();
}

function requiredSearchTerm(value: string): string {
  if (typeof value !== 'string') throw new TypeError('Intent search term must be text');
  const normalized = normalize(value);
  if (normalized.length === 0) throw new TypeError('Intent search term must not be empty');
  if (normalized.length > 160) throw new RangeError('Intent search term is too long');
  return normalized;
}

function stableStrings(values: readonly (string | null | undefined)[]): readonly string[] {
  return Object.freeze([...new Set(values.flatMap((value) => {
    const resolved = text(value);
    return resolved === null ? [] : [resolved];
  }))].sort((left, right) => left.localeCompare(right)));
}

interface SearchTokenInput {
  readonly field: string;
  readonly value: string;
  readonly weight: number;
}

interface SearchCandidate {
  readonly candidate: IntentSearchToken;
  readonly kind: IntentSearchMatchKind;
  readonly score: number;
}

export class IntentSearchToken {
  readonly field: string;
  readonly value: string;
  readonly normalized: string;
  readonly weight: number;

  private constructor(input: SearchTokenInput) {
    this.field = input.field;
    this.value = input.value;
    this.normalized = normalize(input.value);
    this.weight = input.weight;
    Object.freeze(this);
  }

  static create(input: SearchTokenInput): IntentSearchToken {
    if (typeof input.field !== 'string' || input.field.trim().length === 0) {
      throw new TypeError('Intent search token field must be non-empty text');
    }
    if (typeof input.value !== 'string' || input.value.trim().length === 0) {
      throw new TypeError('Intent search token value must be non-empty text');
    }
    if (!Number.isSafeInteger(input.weight) || input.weight < 1 || input.weight > 100) {
      throw new RangeError('Intent search token weight must be an integer from 1 to 100');
    }
    return new IntentSearchToken({ field: input.field.trim(), value: input.value.trim(), weight: input.weight });
  }

  toJSON() {
    return { field: this.field, value: this.value, weight: this.weight } as const;
  }
}

export class ApprovedSearchRecord {
  readonly sourceKind: IntentSearchSourceKind;
  readonly recordKind: IntentSearchRecordKind;
  readonly recordId: string;
  readonly tokens: readonly IntentSearchToken[];
  readonly references: readonly string[];
  readonly searchAuthority = false as const;
  readonly decisionAuthority = false as const;

  private constructor(input: {
    readonly sourceKind: IntentSearchSourceKind;
    readonly recordKind: IntentSearchRecordKind;
    readonly recordId: string;
    readonly tokens: readonly IntentSearchToken[];
    readonly references?: readonly string[];
  }) {
    this.sourceKind = input.sourceKind;
    this.recordKind = input.recordKind;
    this.recordId = input.recordId;
    this.tokens = Object.freeze([...input.tokens]);
    this.references = stableStrings(input.references ?? []);
    Object.freeze(this);
  }

  static create(input: {
    readonly sourceKind: IntentSearchSourceKind;
    readonly recordKind: IntentSearchRecordKind;
    readonly recordId: string;
    readonly tokens: readonly IntentSearchToken[];
    readonly references?: readonly string[];
  }): ApprovedSearchRecord {
    if (typeof input.recordId !== 'string' || input.recordId.trim().length === 0) {
      throw new TypeError('Approved search record requires stable recordId');
    }
    if (!Array.isArray(input.tokens) || input.tokens.length === 0 ||
        input.tokens.some((candidate) => !(candidate instanceof IntentSearchToken))) {
      throw new TypeError('Approved search record requires governed IntentSearchToken values');
    }
    return new ApprovedSearchRecord({ ...input, recordId: input.recordId.trim() });
  }

  toJSON() {
    return {
      sourceKind: this.sourceKind,
      recordKind: this.recordKind,
      recordId: this.recordId,
      references: this.references,
      searchAuthority: this.searchAuthority,
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}

function token(field: string, value: string | null | undefined, weight: number): IntentSearchToken[] {
  const resolved = text(value);
  return resolved === null ? [] : [IntentSearchToken.create({ field, value: resolved, weight })];
}

function tokens(field: string, values: readonly (string | null | undefined)[], weight: number): IntentSearchToken[] {
  return stableStrings(values).map((value) => IntentSearchToken.create({ field, value, weight }));
}

export class ApprovedSearchQueryModel {
  readonly subject: SubjectReference;
  readonly sourceKind: IntentSearchSourceKind;
  readonly records: readonly ApprovedSearchRecord[];
  readonly searchAuthority = false as const;
  readonly decisionAuthority = false as const;

  private constructor(subject: SubjectReference, sourceKind: IntentSearchSourceKind, records: readonly ApprovedSearchRecord[]) {
    this.subject = subject;
    this.sourceKind = sourceKind;
    this.records = Object.freeze([...records].sort((left, right) =>
      left.recordKind.localeCompare(right.recordKind) || left.recordId.localeCompare(right.recordId)));
    Object.freeze(this);
  }

  static fromPassportSummary(summary: ProfessionalPassportSummaryReadModel): ApprovedSearchQueryModel {
    if (!(summary instanceof ProfessionalPassportSummaryReadModel) || summary.authorizationAuthority !== false) {
      throw new TypeError('Intent search Passport source must be governed ProfessionalPassportSummaryReadModel');
    }
    const records = summary.groups.map((group) => ApprovedSearchRecord.create({
      sourceKind: IntentSearchSourceKind.PASSPORT_SUMMARY,
      recordKind: IntentSearchRecordKind.CREDENTIAL_GROUP,
      recordId: group.credentialDefinitionId,
      tokens: [
        ...token('credentialDefinitionId', group.credentialDefinitionId, 100),
        ...tokens('credentialDefinitionVersion', group.credentialDefinitionVersions, 80),
        ...tokens('assessmentId', group.assessments.map((item) => item.assessmentId), 90),
        ...tokens('requirementSetId', group.assessments.map((item) => item.requirementSetId), 80),
        ...tokens('requirementSetVersion', group.assessments.map((item) => item.requirementSetVersion), 70),
        ...tokens('eligibilityOutcome', group.assessments.map((item) => item.eligibilityOutcome), 70),
      ],
      references: group.assessments.map((item) => item.assessmentId),
    }));
    return new ApprovedSearchQueryModel(summary.subject, IntentSearchSourceKind.PASSPORT_SUMMARY, records);
  }

  static fromCredentialCard(card: CredentialCardReadModel): ApprovedSearchQueryModel {
    if (!(card instanceof CredentialCardReadModel) || card.authorizationAuthority !== false) {
      throw new TypeError('Intent search Credential Card source must be governed CredentialCardReadModel');
    }
    const record = ApprovedSearchRecord.create({
      sourceKind: IntentSearchSourceKind.CREDENTIAL_CARD,
      recordKind: IntentSearchRecordKind.CREDENTIAL_CARD,
      recordId: card.assessmentId,
      tokens: [
        ...token('assessmentId', card.assessmentId, 100),
        ...token('credentialDefinitionId', card.credentialDefinitionId, 100),
        ...token('credentialDefinitionVersion', card.credentialDefinitionVersion, 80),
        ...token('requirementSetId', card.requirementSetId, 80),
        ...token('requirementSetVersion', card.requirementSetVersion, 70),
        ...token('eligibilityOutcome', card.eligibility.outcome, 80),
        ...token('documentAvailability', card.document.availability, 60),
        ...token('documentReasonCode', card.document.reasonCode, 70),
        ...token('documentArtifactId', card.document.artifactId, 80),
        ...token('documentBindingReference', card.document.bindingReference, 70),
        ...token('lifecycleReasonCode', card.lifecycle.reasonCode, 60),
      ],
      references: [card.credentialDefinitionId, card.requirementSetId],
    });
    return new ApprovedSearchQueryModel(card.subject, IntentSearchSourceKind.CREDENTIAL_CARD, [record]);
  }

  static fromExplanation(explanation: CredentialExplanationReadModel): ApprovedSearchQueryModel {
    if (!(explanation instanceof CredentialExplanationReadModel) ||
        explanation.authorizationAuthority !== false || explanation.decisionAuthority !== false) {
      throw new TypeError('Intent search explanation source must be governed CredentialExplanationReadModel');
    }
    const records: ApprovedSearchRecord[] = [];
    for (const source of explanation.eligibility.sources) {
      records.push(ApprovedSearchRecord.create({
        sourceKind: IntentSearchSourceKind.CREDENTIAL_EXPLANATION,
        recordKind: IntentSearchRecordKind.SOURCE_REFERENCE,
        recordId: source.sourceId,
        tokens: [
          ...token('sourceId', source.sourceId, 100),
          ...token('sourceType', source.sourceType, 80),
          ...token('sourceVersion', source.version, 70),
          ...token('sourceVerificationState', source.verificationState, 70),
        ],
        references: [explanation.assessmentId, explanation.provenanceIdentity],
      }));
    }
    for (const evidence of explanation.eligibility.evidence) {
      records.push(ApprovedSearchRecord.create({
        sourceKind: IntentSearchSourceKind.CREDENTIAL_EXPLANATION,
        recordKind: IntentSearchRecordKind.EVIDENCE_REFERENCE,
        recordId: evidence.evidenceId,
        tokens: [
          ...token('evidenceId', evidence.evidenceId, 100),
          ...token('evidenceKind', evidence.kind, 80),
          ...token('evidenceClass', evidence.evidenceClass, 80),
          ...token('mediaType', evidence.mediaType, 60),
          ...token('sourceId', evidence.sourceId, 70),
          ...token('evidenceVerificationState', evidence.verificationState, 70),
        ],
        references: stableStrings([explanation.assessmentId, explanation.provenanceIdentity, evidence.sourceId]),
      }));
    }
    for (const item of explanation.verification.verificationItems) {
      records.push(ApprovedSearchRecord.create({
        sourceKind: IntentSearchSourceKind.CREDENTIAL_EXPLANATION,
        recordKind: IntentSearchRecordKind.VERIFICATION_ITEM,
        recordId: `${item.evidenceId}:${item.provenanceIdentity}`,
        tokens: [
          ...token('evidenceId', item.evidenceId, 100),
          ...token('provenanceIdentity', item.provenanceIdentity, 90),
          ...token('origin', item.origin, 70),
          ...token('authorityClass', item.authorityClass, 70),
          ...token('verificationStatus', item.verificationStatus, 80),
          ...token('verificationRecordState', item.verificationRecordState, 80),
          ...token('verificationMethod', item.verificationMethod, 70),
          ...token('sourceVersion', item.sourceVersion, 60),
          ...token('verificationSourceVersion', item.verificationSourceVersion, 60),
        ],
        references: [explanation.assessmentId, item.evidenceId, item.provenanceIdentity],
      }));
    }
    for (const reason of explanation.eligibility.requirementReasons) {
      records.push(ApprovedSearchRecord.create({
        sourceKind: IntentSearchSourceKind.CREDENTIAL_EXPLANATION,
        recordKind: IntentSearchRecordKind.REQUIREMENT_REASON,
        recordId: `${reason.requirementId}:${explanation.assessmentId}`,
        tokens: [
          ...token('requirementId', reason.requirementId, 100),
          ...token('outcome', reason.outcome, 80),
          ...tokens('reasonCode', reason.reasonCodes, 90),
        ],
        references: [explanation.assessmentId, explanation.provenanceIdentity],
      }));
    }
    return new ApprovedSearchQueryModel(
      explanation.subject,
      IntentSearchSourceKind.CREDENTIAL_EXPLANATION,
      records,
    );
  }

  static fromTimeline(timeline: ActivityTimelineReadModel): ApprovedSearchQueryModel {
    if (!(timeline instanceof ActivityTimelineReadModel) ||
        timeline.authorizationAuthority !== false || timeline.decisionAuthority !== false) {
      throw new TypeError('Intent search timeline source must be governed ActivityTimelineReadModel');
    }
    const records: ApprovedSearchRecord[] = [];
    for (const event of timeline.events) {
      records.push(ApprovedSearchRecord.create({
        sourceKind: IntentSearchSourceKind.ACTIVITY_TIMELINE,
        recordKind: IntentSearchRecordKind.TIMELINE_EVENT,
        recordId: event.eventId,
        tokens: [
          ...token('eventId', event.eventId, 100),
          ...token('eventKind', event.kind, 90),
          ...token('eventSourceKind', event.sourceKind, 70),
          ...tokens('reasonCode', event.reasonCodes, 80),
          ...tokens('referenceKind', event.references.map((reference) => reference.kind), 60),
          ...tokens('referenceId', event.references.map((reference) => reference.id), 80),
        ],
        references: event.references.map((reference) => reference.id),
      }));
    }
    for (const omission of timeline.omissions) {
      records.push(ApprovedSearchRecord.create({
        sourceKind: IntentSearchSourceKind.ACTIVITY_TIMELINE,
        recordKind: IntentSearchRecordKind.TIMELINE_OMISSION,
        recordId: `${omission.sourceKind}:${omission.sourceReference}`,
        tokens: [
          ...token('sourceKind', omission.sourceKind, 70),
          ...token('sourceReference', omission.sourceReference, 100),
          ...token('reasonCode', omission.reasonCode, 90),
        ],
        references: [omission.sourceReference],
      }));
    }
    return new ApprovedSearchQueryModel(timeline.subject, IntentSearchSourceKind.ACTIVITY_TIMELINE, records);
  }

  static fromGuidance(guidance: MissingConditionNextActionReadModel): ApprovedSearchQueryModel {
    if (!(guidance instanceof MissingConditionNextActionReadModel) ||
        guidance.authorizationAuthority !== false || guidance.decisionAuthority !== false ||
        guidance.actionRecommendationAuthority !== false) {
      throw new TypeError('Intent search guidance source must be governed MissingConditionNextActionReadModel');
    }
    const records: ApprovedSearchRecord[] = [];
    for (const condition of guidance.missingConditions) {
      records.push(ApprovedSearchRecord.create({
        sourceKind: IntentSearchSourceKind.MISSING_CONDITION_GUIDANCE,
        recordKind: IntentSearchRecordKind.MISSING_CONDITION,
        recordId: `${condition.requirementId}:${guidance.assessmentId}`,
        tokens: [
          ...token('requirementId', condition.requirementId, 100),
          ...token('conditionState', condition.state, 90),
          ...tokens('reasonCode', condition.reasonCodes, 90),
          ...token('nextActionAvailability', condition.nextActionAvailability, 70),
          ...token('nextActionReason', condition.nextActionReason, 70),
        ],
        references: [guidance.assessmentId, guidance.provenanceIdentity],
      }));
      for (const action of condition.nextActions) {
        records.push(ApprovedSearchRecord.create({
          sourceKind: IntentSearchSourceKind.MISSING_CONDITION_GUIDANCE,
          recordKind: IntentSearchRecordKind.NEXT_ACTION,
          recordId: `${condition.requirementId}:${action.actionCode}`,
          tokens: [
            ...token('requirementId', condition.requirementId, 90),
            ...token('actionCode', action.actionCode, 100),
            ...token('labelKey', action.labelKey, 70),
            ...token('reasonCode', action.reasonCode, 90),
            ...token('provenanceIdentity', action.provenanceIdentity, 80),
            ...tokens('supportingSourceId', action.supportingSourceIds, 60),
            ...tokens('supportingEvidenceId', action.supportingEvidenceIds, 60),
          ],
          references: [guidance.assessmentId, action.provenanceIdentity],
        }));
      }
    }
    return new ApprovedSearchQueryModel(
      guidance.subject,
      IntentSearchSourceKind.MISSING_CONDITION_GUIDANCE,
      records,
    );
  }

  toJSON() {
    return {
      subject: this.subject.toJSON(),
      sourceKind: this.sourceKind,
      records: this.records.map((record) => record.toJSON()),
      searchAuthority: this.searchAuthority,
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}

export class IntentSearchQuery {
  readonly subject: SubjectReference;
  readonly intent: IntentSearchIntent;
  readonly terms: readonly string[];
  readonly limit: number;
  readonly searchAuthority = false as const;

  private constructor(subject: SubjectReference, intent: IntentSearchIntent, terms: readonly string[], limit: number) {
    this.subject = subject;
    this.intent = intent;
    this.terms = Object.freeze([...terms]);
    this.limit = limit;
    Object.freeze(this);
  }

  static create(input: {
    readonly subject: SubjectReference;
    readonly intent: IntentSearchIntent;
    readonly terms: readonly string[];
    readonly limit?: number;
  }): IntentSearchQuery {
    if (!(input.subject instanceof SubjectReference)) throw new TypeError('Intent search requires SubjectReference');
    if (!Object.values(IntentSearchIntent).includes(input.intent)) throw new TypeError('Intent search intent must be controlled');
    if (!Array.isArray(input.terms) || input.terms.length === 0 || input.terms.length > 8) {
      throw new RangeError('Intent search requires 1 to 8 terms');
    }
    const terms = input.terms.map(requiredSearchTerm);
    if (new Set(terms).size !== terms.length) throw new TypeError('Intent search terms must be unique after normalization');
    const limit = input.limit ?? 25;
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw new RangeError('Intent search limit must be 1 to 100');
    return new IntentSearchQuery(input.subject, input.intent, terms, limit);
  }

  toJSON() {
    return {
      subject: this.subject.toJSON(),
      intent: this.intent,
      terms: this.terms,
      limit: this.limit,
      searchAuthority: this.searchAuthority,
    } as const;
  }
}

export class IntentSearchHit {
  readonly sourceKind: IntentSearchSourceKind;
  readonly recordKind: IntentSearchRecordKind;
  readonly recordId: string;
  readonly score: number;
  readonly matchedFields: readonly string[];
  readonly matchKinds: readonly IntentSearchMatchKind[];
  readonly references: readonly string[];
  readonly searchAuthority = false as const;
  readonly rankingAuthority = false as const;
  readonly decisionAuthority = false as const;

  private constructor(input: {
    readonly record: ApprovedSearchRecord;
    readonly score: number;
    readonly matchedFields: readonly string[];
    readonly matchKinds: readonly IntentSearchMatchKind[];
  }) {
    this.sourceKind = input.record.sourceKind;
    this.recordKind = input.record.recordKind;
    this.recordId = input.record.recordId;
    this.score = input.score;
    this.matchedFields = stableStrings(input.matchedFields);
    this.matchKinds = Object.freeze([...input.matchKinds]);
    this.references = input.record.references;
    Object.freeze(this);
  }

  static match(record: ApprovedSearchRecord, terms: readonly string[]): IntentSearchHit | null {
    let score = 0;
    const fields: string[] = [];
    const kinds: IntentSearchMatchKind[] = [];
    for (const term of terms) {
      const candidates: SearchCandidate[] = [];
      for (const candidate of record.tokens) {
        if (candidate.normalized === term) {
          candidates.push({ candidate, kind: IntentSearchMatchKind.EXACT, score: candidate.weight + 100 });
        } else if (candidate.normalized.startsWith(term)) {
          candidates.push({ candidate, kind: IntentSearchMatchKind.PREFIX, score: candidate.weight + 50 });
        }
      }
      candidates.sort((left, right) =>
        right.score - left.score || left.candidate.field.localeCompare(right.candidate.field));
      const best = candidates[0];
      if (best === undefined) return null;
      score += best.score;
      fields.push(best.candidate.field);
      kinds.push(best.kind);
    }
    return new IntentSearchHit({ record, score, matchedFields: fields, matchKinds: kinds });
  }

  toJSON() {
    return {
      sourceKind: this.sourceKind,
      recordKind: this.recordKind,
      recordId: this.recordId,
      score: this.score,
      matchedFields: this.matchedFields,
      matchKinds: this.matchKinds,
      references: this.references,
      searchAuthority: this.searchAuthority,
      rankingAuthority: this.rankingAuthority,
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}

export class IntentSearchReadModel {
  readonly query: IntentSearchQuery;
  readonly ordering = IntentSearchOrdering.SCORE_DESC_THEN_STABLE_ID;
  readonly hits: readonly IntentSearchHit[];
  readonly resultCount: number;
  readonly truncated: boolean;
  readonly noResultReason: string | null;
  readonly searchAuthority = false as const;
  readonly rankingAuthority = false as const;
  readonly decisionAuthority = false as const;
  readonly authorizationAuthority = false as const;

  private constructor(query: IntentSearchQuery, hits: readonly IntentSearchHit[], truncated: boolean) {
    this.query = query;
    this.hits = Object.freeze([...hits]);
    this.resultCount = this.hits.length;
    this.truncated = truncated;
    this.noResultReason = this.hits.length === 0 ? IntentSearchNoResultReason.NO_MATCHING_APPROVED_RECORDS : null;
    Object.freeze(this);
  }

  static search(input: {
    readonly query: IntentSearchQuery;
    readonly models: readonly ApprovedSearchQueryModel[];
  }): IntentSearchReadModel {
    if (!(input.query instanceof IntentSearchQuery)) throw new TypeError('Intent search requires IntentSearchQuery');
    if (!Array.isArray(input.models) || input.models.some((model) => !(model instanceof ApprovedSearchQueryModel))) {
      throw new TypeError('Intent search models must use ApprovedSearchQueryModel');
    }
    const subject = subjectKey(input.query.subject);
    const allowedSources = new Set(SOURCE_SCOPE[input.query.intent]);
    const allowedRecords = new Set(RECORD_SCOPE[input.query.intent]);
    const recordKeys = new Set<string>();
    const matches: IntentSearchHit[] = [];

    for (const model of input.models) {
      if (model.searchAuthority !== false || model.decisionAuthority !== false) {
        throw new TypeError('Intent search model must remain non-authoritative');
      }
      if (subjectKey(model.subject) !== subject) throw new TypeError('Intent search cannot mix subjects');
      if (!allowedSources.has(model.sourceKind)) continue;
      for (const record of model.records) {
        if (!allowedRecords.has(record.recordKind)) continue;
        const key = `${record.sourceKind}\u0000${record.recordKind}\u0000${record.recordId}`;
        if (recordKeys.has(key)) throw new TypeError(`Duplicate approved search record: ${record.recordId}`);
        recordKeys.add(key);
        const hit = IntentSearchHit.match(record, input.query.terms);
        if (hit !== null) matches.push(hit);
      }
    }

    matches.sort((left, right) =>
      right.score - left.score ||
      left.sourceKind.localeCompare(right.sourceKind) ||
      left.recordKind.localeCompare(right.recordKind) ||
      left.recordId.localeCompare(right.recordId));
    const truncated = matches.length > input.query.limit;
    return new IntentSearchReadModel(input.query, matches.slice(0, input.query.limit), truncated);
  }

  toJSON() {
    return {
      query: this.query.toJSON(),
      ordering: this.ordering,
      resultCount: this.resultCount,
      truncated: this.truncated,
      noResultReason: this.noResultReason,
      hits: this.hits.map((hit) => hit.toJSON()),
      searchAuthority: this.searchAuthority,
      rankingAuthority: this.rankingAuthority,
      decisionAuthority: this.decisionAuthority,
      authorizationAuthority: this.authorizationAuthority,
    } as const;
  }
}
