import { SubjectReference, UtcInstant, VerificationState, VersionId } from '../../../core/src/index.ts';
import { ApplicationExecutionContext } from '../application-execution-context.ts';
import { OrganizationScopeReference, TenantScopeReference } from '../references.ts';
import { AccessDisposition, TenantAccessDecision, TenantAccessDeniedError, TenantBoundary, TenantContext } from '../tenant/tenant-governance.ts';
import {
  LifecycleReevaluationBatchOutcome,
  LifecycleReevaluationOutcome,
  LifecycleSelectiveReevaluation,
} from './selective-reevaluation.ts';

export const CONTINUOUS_COMPLIANCE_OPERATION = 'credential.lifecycle.continuous-compliance';
export const CONTINUOUS_COMPLIANCE_FIELD = 'credential:continuous-compliance';

export const ContinuousComplianceScopeKind = {
  SUBJECT: 'SUBJECT',
  ORGANIZATION: 'ORGANIZATION',
  ACTIVITY: 'ACTIVITY',
  ASSIGNMENT: 'ASSIGNMENT',
} as const;
export type ContinuousComplianceScopeKind = (typeof ContinuousComplianceScopeKind)[keyof typeof ContinuousComplianceScopeKind];

export const ContinuousComplianceConditionType = {
  AUTHORIZATION: 'AUTHORIZATION',
  CREDENTIAL: 'CREDENTIAL',
  EVIDENCE: 'EVIDENCE',
  REQUIREMENT: 'REQUIREMENT',
  RECOGNITION: 'RECOGNITION',
  RENEWAL: 'RENEWAL',
  RECURRING_OBLIGATION: 'RECURRING_OBLIGATION',
  ROLE_DELEGATION: 'ROLE_DELEGATION',
  ASSIGNMENT: 'ASSIGNMENT',
  ORGANIZATION: 'ORGANIZATION',
} as const;
export type ContinuousComplianceConditionType = (typeof ContinuousComplianceConditionType)[keyof typeof ContinuousComplianceConditionType];

export const ContinuousComplianceConditionState = {
  SATISFIED: 'SATISFIED',
  SATISFIED_WITH_CONDITIONS: 'SATISFIED_WITH_CONDITIONS',
  UNSATISFIED: 'UNSATISFIED',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  INDETERMINATE: 'INDETERMINATE',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
} as const;
export type ContinuousComplianceConditionState = (typeof ContinuousComplianceConditionState)[keyof typeof ContinuousComplianceConditionState];

export const ContinuousComplianceTiming = {
  CURRENT: 'CURRENT',
  FUTURE: 'FUTURE',
} as const;
export type ContinuousComplianceTiming = (typeof ContinuousComplianceTiming)[keyof typeof ContinuousComplianceTiming];

export const ContinuousComplianceSourceKind = {
  BASELINE_EVALUATION: 'BASELINE_EVALUATION',
  REEVALUATION_DECISION: 'REEVALUATION_DECISION',
} as const;
export type ContinuousComplianceSourceKind = (typeof ContinuousComplianceSourceKind)[keyof typeof ContinuousComplianceSourceKind];

export const ContinuousComplianceStatus = {
  COMPLIANT: 'COMPLIANT',
  COMPLIANT_WITH_CONDITIONS: 'COMPLIANT_WITH_CONDITIONS',
  AT_RISK: 'AT_RISK',
  NON_COMPLIANT: 'NON_COMPLIANT',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  INDETERMINATE: 'INDETERMINATE',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
} as const;
export type ContinuousComplianceStatus = (typeof ContinuousComplianceStatus)[keyof typeof ContinuousComplianceStatus];

type DeepReadonly<T> = T extends readonly (infer U)[] ? readonly DeepReadonly<U>[] : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;
const SCOPE_KINDS = Object.freeze(Object.values(ContinuousComplianceScopeKind));
const CONDITION_TYPES = Object.freeze(Object.values(ContinuousComplianceConditionType));
const CONDITION_STATES = Object.freeze(Object.values(ContinuousComplianceConditionState));
const TIMINGS = Object.freeze(Object.values(ContinuousComplianceTiming));
const SOURCE_KINDS = Object.freeze(Object.values(ContinuousComplianceSourceKind));
const MAX_FACTS = 256;
const MAX_REFERENCES = 256;
const MAX_REASON_CODES = 128;

function requiredText(value: string, label: string, max = 4096): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > max) throw new RangeError(`${label} is too long`);
  return normalized;
}
function opaque(value: string, label: string, max = 256): string {
  const normalized = requiredText(value, label, max);
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(normalized)) throw new TypeError(`${label} contains unsupported characters`);
  return normalized;
}
function instant(value: UtcInstant): number {
  if (!(value instanceof UtcInstant)) throw new TypeError('Explicit UtcInstant required');
  return value.toEpochMilliseconds();
}
function same(a: { toString(): string }, b: { toString(): string }): boolean { return a.toString() === b.toString(); }
function sameSubject(a: SubjectReference | null, b: SubjectReference | null): boolean {
  if (a === null || b === null) return a === b;
  return same(a.id, b.id) && a.kind === b.kind;
}
function compare(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0; }
function dense<T>(value: readonly T[], max: number, min = 0): T[] {
  if (!Array.isArray(value) || value.length < min || value.length > max) throw new TypeError('Bounded dense collection required');
  for (let i = 0; i < value.length; i++) if (!(i in value)) throw new TypeError('Sparse collection rejected');
  return Array.from(value);
}
function controlled<T extends string>(value: T, allowed: readonly string[], label: string): T {
  if (typeof value !== 'string' || !allowed.includes(value)) throw new TypeError(`${label} must be controlled`);
  return value;
}
function freeze<T>(value: T): DeepReadonly<T> {
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value as Record<string, unknown>)) freeze(child);
    Object.freeze(value);
  }
  return value as DeepReadonly<T>;
}
function stringRefs(values: readonly string[], label: string, max = MAX_REFERENCES): readonly string[] {
  const result = dense(values, max).map(value => opaque(value, label)).sort(compare);
  if (new Set(result).size !== result.length) throw new TypeError(`Duplicate ${label}`);
  return Object.freeze(result);
}

export interface ContinuousComplianceScopeInput {
  readonly reference: string;
  readonly version: VersionId;
  readonly kind: ContinuousComplianceScopeKind;
  readonly tenant: TenantScopeReference;
  readonly organization: OrganizationScopeReference;
  readonly subject: SubjectReference | null;
  readonly jurisdictionReference: string;
  readonly activityReference: string | null;
  readonly assignmentReference: string | null;
  readonly credentialScopeReference: string | null;
  readonly capturedAt: UtcInstant;
  readonly asKnownAt: UtcInstant;
  readonly provenanceReference: string;
}

export interface ContinuousComplianceScopeView {
  readonly reference: string;
  readonly version: string;
  readonly kind: ContinuousComplianceScopeKind;
  readonly tenant: string;
  readonly organization: string;
  readonly subject: null | { readonly id: string; readonly kind: string };
  readonly jurisdictionReference: string;
  readonly activityReference: string | null;
  readonly assignmentReference: string | null;
  readonly credentialScopeReference: string | null;
  readonly capturedAt: string;
  readonly asKnownAt: string;
  readonly provenanceReference: string;
}

export class ContinuousComplianceScope {
  readonly reference: string;
  readonly version: VersionId;
  readonly kind: ContinuousComplianceScopeKind;
  readonly tenant: TenantScopeReference;
  readonly organization: OrganizationScopeReference;
  readonly subject: SubjectReference | null;
  readonly jurisdictionReference: string;
  readonly activityReference: string | null;
  readonly assignmentReference: string | null;
  readonly credentialScopeReference: string | null;
  readonly capturedAt: UtcInstant;
  readonly asKnownAt: UtcInstant;
  readonly provenanceReference: string;

  private constructor(input: ContinuousComplianceScopeInput) {
    this.reference=input.reference; this.version=input.version; this.kind=input.kind; this.tenant=input.tenant; this.organization=input.organization;
    this.subject=input.subject; this.jurisdictionReference=input.jurisdictionReference; this.activityReference=input.activityReference;
    this.assignmentReference=input.assignmentReference; this.credentialScopeReference=input.credentialScopeReference;
    this.capturedAt=input.capturedAt; this.asKnownAt=input.asKnownAt; this.provenanceReference=input.provenanceReference;
    Object.freeze(this);
  }

  static create(input: ContinuousComplianceScopeInput): ContinuousComplianceScope {
    const kind=controlled(input.kind,SCOPE_KINDS,'Continuous compliance scope kind');
    if (!(input.version instanceof VersionId) || !(input.tenant instanceof TenantScopeReference) || !(input.organization instanceof OrganizationScopeReference)) throw new TypeError('Governed compliance scope identity required');
    if (input.subject!==null && !(input.subject instanceof SubjectReference)) throw new TypeError('Compliance subject must be governed or null');
    const captured=instant(input.capturedAt), known=instant(input.asKnownAt);
    if (captured>known) throw new RangeError('Compliance scope capture exceeds knowledge horizon');

    const activity=input.activityReference===null?null:opaque(input.activityReference,'Activity reference');
    const assignment=input.assignmentReference===null?null:opaque(input.assignmentReference,'Assignment reference');
    if (kind===ContinuousComplianceScopeKind.SUBJECT && input.subject===null) throw new TypeError('Subject compliance scope requires subject');
    if (kind===ContinuousComplianceScopeKind.ORGANIZATION && input.subject!==null) throw new TypeError('Organization compliance scope cannot imply person subject');
    if ((kind===ContinuousComplianceScopeKind.ACTIVITY || kind===ContinuousComplianceScopeKind.ASSIGNMENT) && activity===null) throw new TypeError('Activity/assignment scope requires activity reference');
    if (kind===ContinuousComplianceScopeKind.ASSIGNMENT && (input.subject===null || assignment===null)) throw new TypeError('Assignment scope requires subject and assignment reference');
    if (kind!==ContinuousComplianceScopeKind.ASSIGNMENT && assignment!==null) throw new TypeError('Assignment reference permitted only for assignment scope');

    return new ContinuousComplianceScope({
      ...input,
      reference:opaque(input.reference,'Compliance scope reference'),
      kind,
      jurisdictionReference:opaque(input.jurisdictionReference,'Jurisdiction reference'),
      activityReference:activity,
      assignmentReference:assignment,
      credentialScopeReference:input.credentialScopeReference===null?null:opaque(input.credentialScopeReference,'Credential scope reference'),
      provenanceReference:opaque(input.provenanceReference,'Scope provenance reference'),
    });
  }

  toJSON(): DeepReadonly<ContinuousComplianceScopeView> {
    return freeze({
      reference:this.reference,version:this.version.toString(),kind:this.kind,tenant:this.tenant.toString(),organization:this.organization.toString(),
      subject:this.subject===null?null:{id:this.subject.id.toString(),kind:this.subject.kind},jurisdictionReference:this.jurisdictionReference,
      activityReference:this.activityReference,assignmentReference:this.assignmentReference,credentialScopeReference:this.credentialScopeReference,
      capturedAt:this.capturedAt.toString(),asKnownAt:this.asKnownAt.toString(),provenanceReference:this.provenanceReference,
    });
  }
}

export interface ContinuousComplianceConditionFactInput {
  readonly reference: string;
  readonly scope: ContinuousComplianceScope;
  readonly targetReference: string;
  readonly conditionType: ContinuousComplianceConditionType;
  readonly state: ContinuousComplianceConditionState;
  readonly timing: ContinuousComplianceTiming;
  readonly blocking: boolean;
  readonly actionRequired: boolean;
  readonly effectiveAt: UtcInstant;
  readonly evaluatedAt: UtcInstant;
  readonly asKnownAt: UtcInstant;
  readonly validUntil: UtcInstant | null;
  readonly verificationState: VerificationState;
  readonly sourceKind: ContinuousComplianceSourceKind;
  readonly sourceReference: string;
  readonly sourceVersion: VersionId | null;
  readonly reevaluationDecisionReference: string | null;
  readonly evidenceReferences: readonly string[];
  readonly conditionReferences: readonly string[];
  readonly provenanceReference: string;
  readonly correlationReference: string;
  readonly causationReference: string | null;
  readonly reasonCodes: readonly string[];
}

export interface ContinuousComplianceConditionFactView {
  readonly reference: string;
  readonly targetReference: string;
  readonly conditionType: ContinuousComplianceConditionType;
  readonly state: ContinuousComplianceConditionState;
  readonly timing: ContinuousComplianceTiming;
  readonly blocking: boolean;
  readonly actionRequired: boolean;
  readonly effectiveAt: string;
  readonly evaluatedAt: string;
  readonly asKnownAt: string;
  readonly validUntil: string | null;
  readonly verificationState: string;
  readonly sourceKind: ContinuousComplianceSourceKind;
  readonly sourceReference: string;
  readonly sourceVersion: string | null;
  readonly reevaluationDecisionReference: string | null;
  readonly evidenceReferences: readonly string[];
  readonly conditionReferences: readonly string[];
  readonly provenanceReference: string;
  readonly correlationReference: string;
  readonly causationReference: string | null;
  readonly reasonCodes: readonly string[];
}

export class ContinuousComplianceConditionFact {
  readonly reference: string;
  readonly scope: ContinuousComplianceScope;
  readonly targetReference: string;
  readonly conditionType: ContinuousComplianceConditionType;
  readonly state: ContinuousComplianceConditionState;
  readonly timing: ContinuousComplianceTiming;
  readonly blocking: boolean;
  readonly actionRequired: boolean;
  readonly effectiveAt: UtcInstant;
  readonly evaluatedAt: UtcInstant;
  readonly asKnownAt: UtcInstant;
  readonly validUntil: UtcInstant | null;
  readonly verificationState: VerificationState;
  readonly sourceKind: ContinuousComplianceSourceKind;
  readonly sourceReference: string;
  readonly sourceVersion: VersionId | null;
  readonly reevaluationDecisionReference: string | null;
  readonly evidenceReferences: readonly string[];
  readonly conditionReferences: readonly string[];
  readonly provenanceReference: string;
  readonly correlationReference: string;
  readonly causationReference: string | null;
  readonly reasonCodes: readonly string[];

  private constructor(input: ContinuousComplianceConditionFactInput, evidenceReferences:readonly string[], conditionReferences:readonly string[], reasonCodes:readonly string[]) {
    this.reference=input.reference; this.scope=input.scope; this.targetReference=input.targetReference; this.conditionType=input.conditionType; this.state=input.state;
    this.timing=input.timing; this.blocking=input.blocking; this.actionRequired=input.actionRequired; this.effectiveAt=input.effectiveAt;
    this.evaluatedAt=input.evaluatedAt; this.asKnownAt=input.asKnownAt; this.validUntil=input.validUntil; this.verificationState=input.verificationState;
    this.sourceKind=input.sourceKind; this.sourceReference=input.sourceReference; this.sourceVersion=input.sourceVersion;
    this.reevaluationDecisionReference=input.reevaluationDecisionReference; this.evidenceReferences=Object.freeze([...evidenceReferences]);
    this.conditionReferences=Object.freeze([...conditionReferences]); this.provenanceReference=input.provenanceReference;
    this.correlationReference=input.correlationReference; this.causationReference=input.causationReference; this.reasonCodes=Object.freeze([...reasonCodes]);
    Object.freeze(this);
  }

  static create(input: ContinuousComplianceConditionFactInput): ContinuousComplianceConditionFact {
    if (!(input.scope instanceof ContinuousComplianceScope)) throw new TypeError('Continuous compliance fact requires exact governed scope');
    const conditionType=controlled(input.conditionType,CONDITION_TYPES,'Continuous compliance condition type');
    const state=controlled(input.state,CONDITION_STATES,'Continuous compliance condition state');
    const timing=controlled(input.timing,TIMINGS,'Continuous compliance timing');
    const sourceKind=controlled(input.sourceKind,SOURCE_KINDS,'Continuous compliance source kind');
    if (typeof input.blocking!=='boolean' || typeof input.actionRequired!=='boolean') throw new TypeError('Compliance blocking/action flags must be boolean');
    const effective=instant(input.effectiveAt), evaluated=instant(input.evaluatedAt), known=instant(input.asKnownAt);
    if (known>evaluated) throw new RangeError('Compliance fact knowledge horizon exceeds evaluation instant');
    if (timing===ContinuousComplianceTiming.CURRENT && effective>evaluated) throw new RangeError('Current compliance fact cannot be future-effective');
    if (timing===ContinuousComplianceTiming.FUTURE && effective<=evaluated) throw new RangeError('Future compliance fact must be future-effective');
    if (input.validUntil!==null && instant(input.validUntil)<evaluated) throw new RangeError('Compliance fact validity predates its evaluation');
    if (!(input.verificationState instanceof VerificationState)) throw new TypeError('Compliance fact requires governed verification state');
    if (input.sourceVersion!==null && !(input.sourceVersion instanceof VersionId)) throw new TypeError('Compliance source version must be VersionId or null');

    const sourceReference=opaque(input.sourceReference,'Compliance source reference');
    const reevaluationDecisionReference=input.reevaluationDecisionReference===null?null:requiredText(input.reevaluationDecisionReference,'Reevaluation decision reference',4096);
    if (sourceKind===ContinuousComplianceSourceKind.BASELINE_EVALUATION && reevaluationDecisionReference!==null) throw new TypeError('Baseline fact cannot claim reevaluation decision');
    if (sourceKind===ContinuousComplianceSourceKind.REEVALUATION_DECISION) {
      if (reevaluationDecisionReference===null) throw new TypeError('Reevaluation-sourced fact requires decision reference');
      if (sourceReference!==reevaluationDecisionReference) throw new TypeError('Reevaluation source must equal exact decision reference');
    }

    const evidenceReferences=stringRefs(input.evidenceReferences,'evidence reference');
    const conditionReferences=stringRefs(input.conditionReferences,'condition reference');
    const reasonCodes=stringRefs(input.reasonCodes,'compliance reason code',MAX_REASON_CODES);
    if (state===ContinuousComplianceConditionState.SATISFIED_WITH_CONDITIONS && conditionReferences.length===0) throw new TypeError('Conditional compliance requires explicit conditions');
    if (state===ContinuousComplianceConditionState.NOT_APPLICABLE && (input.blocking || input.actionRequired)) throw new TypeError('Not-applicable condition cannot block or require action');
    const verification=input.verificationState.toString();
    if (verification==='NOT_APPLICABLE' && state!==ContinuousComplianceConditionState.NOT_APPLICABLE) throw new TypeError('Not-applicable verification requires not-applicable state');
    if (state===ContinuousComplianceConditionState.NOT_APPLICABLE && verification!=='VERIFIED' && verification!=='NOT_APPLICABLE') throw new TypeError('Not-applicable state requires verified/not-applicable verification');

    return new ContinuousComplianceConditionFact({
      ...input,
      reference:opaque(input.reference,'Compliance fact reference'),
      targetReference:opaque(input.targetReference,'Compliance target reference'),
      conditionType,state,timing,sourceKind,sourceReference,reevaluationDecisionReference,
      provenanceReference:opaque(input.provenanceReference,'Compliance provenance reference'),
      correlationReference:opaque(input.correlationReference,'Compliance correlation reference'),
      causationReference:input.causationReference===null?null:opaque(input.causationReference,'Compliance causation reference'),
    },evidenceReferences,conditionReferences,reasonCodes);
  }

  toJSON(): DeepReadonly<ContinuousComplianceConditionFactView> {
    return freeze({
      reference:this.reference,targetReference:this.targetReference,conditionType:this.conditionType,state:this.state,timing:this.timing,blocking:this.blocking,
      actionRequired:this.actionRequired,effectiveAt:this.effectiveAt.toString(),evaluatedAt:this.evaluatedAt.toString(),asKnownAt:this.asKnownAt.toString(),
      validUntil:this.validUntil?.toString()??null,verificationState:this.verificationState.toString(),sourceKind:this.sourceKind,
      sourceReference:this.sourceReference,sourceVersion:this.sourceVersion?.toString()??null,reevaluationDecisionReference:this.reevaluationDecisionReference,
      evidenceReferences:[...this.evidenceReferences],conditionReferences:[...this.conditionReferences],provenanceReference:this.provenanceReference,
      correlationReference:this.correlationReference,causationReference:this.causationReference,reasonCodes:[...this.reasonCodes],
    });
  }
}

export interface ContinuousComplianceProjectionInput {
  readonly context: ApplicationExecutionContext;
  readonly authorizedContext: TenantContext;
  readonly boundary: TenantBoundary;
  readonly accessDecision: TenantAccessDecision;
  readonly scope: ContinuousComplianceScope;
  readonly facts: readonly ContinuousComplianceConditionFact[];
  readonly reevaluation: LifecycleSelectiveReevaluation | null;
  readonly evaluatedAt: UtcInstant;
  readonly asKnownAt: UtcInstant;
  readonly maxFacts: number;
}

export interface ContinuousComplianceSourceVersionView {
  readonly sourceReference: string;
  readonly version: string;
}

export interface ContinuousComplianceProjectionView {
  readonly scope: ContinuousComplianceScopeView;
  readonly status: ContinuousComplianceStatus;
  readonly evaluatedAt: string;
  readonly asKnownAt: string;
  readonly facts: readonly ContinuousComplianceConditionFactView[];
  readonly currentFactReferences: readonly string[];
  readonly futureFactReferences: readonly string[];
  readonly blockingFactReferences: readonly string[];
  readonly conditionalFactReferences: readonly string[];
  readonly reviewFactReferences: readonly string[];
  readonly indeterminateFactReferences: readonly string[];
  readonly actionRequiredFactReferences: readonly string[];
  readonly notApplicableFactReferences: readonly string[];
  readonly reevaluationDecisionReferences: readonly string[];
  readonly sourceVersions: readonly ContinuousComplianceSourceVersionView[];
  readonly reasonCodes: readonly string[];
  readonly organizationAggregateOnly: boolean;
  readonly actorId: string;
  readonly correlationId: string;
  readonly accessDecisionReference: string;
  readonly accessAuditReference: string;
  readonly authorizationAuthority: false;
  readonly credentialStateMutated: false;
  readonly authorizationStateMutated: false;
  readonly historicalDecisionMutated: false;
  readonly reevaluationDecisionMutated: false;
  readonly assignmentDecisionMutated: false;
  readonly complianceStateChanged: false;
  readonly notificationScheduled: false;
  readonly providerInvoked: false;
  readonly eventsEmitted: 0;
  readonly physicalDeletionAuthorized: false;
  readonly assignmentInferenceAuthorized: false;
}

function assertReader(input: ContinuousComplianceProjectionInput): void {
  const c=input.context,reader=input.authorizedContext,access=input.accessDecision,scope=input.scope;
  if (!(c instanceof ApplicationExecutionContext) || !(reader instanceof TenantContext) || !(input.boundary instanceof TenantBoundary) || !(access instanceof TenantAccessDecision) || !(scope instanceof ContinuousComplianceScope)) throw new TenantAccessDeniedError();
  input.boundary.assertKnown(reader);
  if (c.tenantScope===null || c.organizationScope===null || c.purpose===null || c.accessDecision===null || c.operation.toString()!==CONTINUOUS_COMPLIANCE_OPERATION) throw new TenantAccessDeniedError();
  if (!same(c.tenantScope,reader.tenant) || !same(c.organizationScope,reader.organization) || !same(c.purpose,reader.purpose) || !same(c.actor.id,reader.actor.id) || c.actor.kind!==reader.actor.kind || !same(c.correlationId,reader.correlationId)) throw new TenantAccessDeniedError();
  if (access.disposition!==AccessDisposition.ALLOW || !same(access.tenant,reader.tenant) || !same(access.purpose,reader.purpose) || !same(access.reference,c.accessDecision) || !access.allowedFields.includes(CONTINUOUS_COMPLIANCE_FIELD)) throw new TenantAccessDeniedError();
  if (!same(scope.tenant,reader.tenant) || !same(scope.organization,reader.organization)) throw new TenantAccessDeniedError();
  if (scope.subject===null) {
    if (c.subject!==null) throw new TenantAccessDeniedError();
  } else if (c.subject===null || !sameSubject(scope.subject,c.subject)) throw new TenantAccessDeniedError();
}

function isStale(fact:ContinuousComplianceConditionFact,evaluated:number):boolean {
  return fact.validUntil!==null && instant(fact.validUntil)<evaluated;
}
function verificationTreatment(fact:ContinuousComplianceConditionFact):'VERIFIED'|'REVIEW'|'INDETERMINATE'|'NOT_APPLICABLE' {
  const value=fact.verificationState.toString();
  if (value==='VERIFIED') return 'VERIFIED';
  if (value==='STALE') return 'INDETERMINATE';
  if (value==='NOT_APPLICABLE') return 'NOT_APPLICABLE';
  return 'REVIEW';
}

/** Pure current compliance projection. It never grants/revokes authorization, mutates history, sends notifications or writes persistence. */
export class ContinuousComplianceProjection {
  readonly #view: DeepReadonly<ContinuousComplianceProjectionView>;
  private constructor(view:ContinuousComplianceProjectionView){this.#view=freeze(view);Object.freeze(this);}
  toJSON():DeepReadonly<ContinuousComplianceProjectionView>{return this.#view;}

  static evaluate(input:ContinuousComplianceProjectionInput):ContinuousComplianceProjection {
    assertReader(input);
    const evaluated=instant(input.evaluatedAt),requested=instant(input.context.requestedAt),known=instant(input.asKnownAt);
    if (evaluated!==requested) throw new RangeError('Compliance projection instant must match invocation horizon');
    if (known>evaluated || instant(input.scope.asKnownAt)>known || instant(input.scope.capturedAt)>known) throw new RangeError('Compliance projection exceeds knowledge horizon');
    if (!Number.isSafeInteger(input.maxFacts) || input.maxFacts<1 || input.maxFacts>MAX_FACTS) throw new RangeError('Compliance max-facts budget outside bounds');

    const facts=dense(input.facts,MAX_FACTS);
    if (facts.length>input.maxFacts) throw new RangeError('Compliance fact budget exceeded');
    if (!facts.every(value=>value instanceof ContinuousComplianceConditionFact)) throw new TypeError('Governed compliance facts required');
    if (new Set(facts.map(value=>value.reference)).size!==facts.length) throw new TypeError('Duplicate compliance fact reference');
    for (const current of facts) {
      if (current.scope!==input.scope) throw new TypeError('Compliance fact must bind exact projection scope');
      if (instant(current.evaluatedAt)>evaluated || instant(current.asKnownAt)>known) throw new RangeError('Compliance fact exceeds projection horizon');
    }
    facts.sort((a,b)=>compare(a.reference,b.reference));

    let reevaluationView:ReturnType<LifecycleSelectiveReevaluation['toJSON']>|null=null;
    const decisionMap=new Map<string,ReturnType<LifecycleSelectiveReevaluation['toJSON']>['decisions'][number]>();
    if (input.reevaluation!==null) {
      if (!(input.reevaluation instanceof LifecycleSelectiveReevaluation)) throw new TypeError('Exact selective reevaluation batch required');
      reevaluationView=input.reevaluation.toJSON();
      if (reevaluationView.correlationId!==input.context.correlationId.toString()) throw new TenantAccessDeniedError();
      if (instant(UtcInstant.from(reevaluationView.evaluatedAt))>evaluated || instant(UtcInstant.from(reevaluationView.asKnownAt))>known) throw new RangeError('Reevaluation batch exceeds compliance horizon');
      for (const decision of reevaluationView.decisions) decisionMap.set(decision.decisionReference,decision);
    }

    for (const current of facts) {
      if (current.sourceKind===ContinuousComplianceSourceKind.REEVALUATION_DECISION) {
        if (reevaluationView===null || current.reevaluationDecisionReference===null) throw new TypeError('Reevaluation fact requires supplied exact batch');
        const decision=decisionMap.get(current.reevaluationDecisionReference);
        if (decision===undefined) throw new TypeError('Reevaluation decision not present in supplied batch');
        if (decision.targetReference!==current.targetReference) throw new TypeError('Reevaluation decision target mismatch');
        if (decision.correlationReference!==current.correlationReference) throw new TypeError('Reevaluation decision correlation mismatch');
        if (decision.outcome===LifecycleReevaluationOutcome.REVIEW_REQUIRED && current.state!==ContinuousComplianceConditionState.REVIEW_REQUIRED) throw new TypeError('Review decision requires review compliance fact');
        if (decision.outcome===LifecycleReevaluationOutcome.INDETERMINATE && current.state!==ContinuousComplianceConditionState.INDETERMINATE) throw new TypeError('Indeterminate decision requires indeterminate compliance fact');
        if (decision.outcome===LifecycleReevaluationOutcome.FUTURE_IMPACT_REGISTERED && current.timing!==ContinuousComplianceTiming.FUTURE) throw new TypeError('Future reevaluation decision requires future compliance fact');
        if (decision.outcome!==LifecycleReevaluationOutcome.FUTURE_IMPACT_REGISTERED && current.timing!==ContinuousComplianceTiming.CURRENT) throw new TypeError('Current reevaluation decision requires current compliance fact');
        if (decision.outcome===LifecycleReevaluationOutcome.ACTION_REQUIRED && !current.actionRequired) throw new TypeError('Action-required reevaluation decision requires action flag');
      }
    }

    const currentFacts=facts.filter(value=>value.timing===ContinuousComplianceTiming.CURRENT);
    const futureFacts=facts.filter(value=>value.timing===ContinuousComplianceTiming.FUTURE);
    const reviewRefs:string[]=[];
    const indeterminateRefs:string[]=[];
    const blockingBreaches:string[]=[];
    const nonBlockingRisks:string[]=[];
    const conditionalRefs:string[]=[];
    const compliantRefs:string[]=[];
    const notApplicableRefs:string[]=[];
    const actionRefs:string[]=[];
    const reasons=new Set<string>();

    for (const current of currentFacts) {
      const stale=isStale(current,evaluated);
      const verification=verificationTreatment(current);
      if (current.actionRequired) actionRefs.push(current.reference);
      if (current.state===ContinuousComplianceConditionState.SATISFIED_WITH_CONDITIONS) conditionalRefs.push(current.reference);
      if (current.state===ContinuousComplianceConditionState.NOT_APPLICABLE) notApplicableRefs.push(current.reference);

      if (stale || verification==='INDETERMINATE') {
        indeterminateRefs.push(current.reference); reasons.add('CURRENT_FACT_STALE_OR_INDETERMINATE'); continue;
      }
      if (verification==='REVIEW') {
        reviewRefs.push(current.reference); reasons.add('CURRENT_FACT_REQUIRES_VERIFICATION_REVIEW'); continue;
      }
      if (verification==='NOT_APPLICABLE') continue;

      switch(current.state){
        case ContinuousComplianceConditionState.UNSATISFIED:
          if (current.blocking) blockingBreaches.push(current.reference); else nonBlockingRisks.push(current.reference);
          break;
        case ContinuousComplianceConditionState.REVIEW_REQUIRED:
          reviewRefs.push(current.reference); break;
        case ContinuousComplianceConditionState.INDETERMINATE:
          indeterminateRefs.push(current.reference); break;
        case ContinuousComplianceConditionState.SATISFIED_WITH_CONDITIONS:
          break;
        case ContinuousComplianceConditionState.SATISFIED:
          compliantRefs.push(current.reference); break;
        case ContinuousComplianceConditionState.NOT_APPLICABLE:
          break;
      }
    }

    const futureRiskRefs=futureFacts.filter(value=>value.state!==ContinuousComplianceConditionState.NOT_APPLICABLE).map(value=>value.reference);
    const verifiedCurrentActionRisk=currentFacts.some(value=>value.actionRequired && !isStale(value,evaluated) && verificationTreatment(value)==='VERIFIED' && value.state!==ContinuousComplianceConditionState.NOT_APPLICABLE);

    let status:ContinuousComplianceStatus;
    if (blockingBreaches.length>0) {
      status=ContinuousComplianceStatus.NON_COMPLIANT; reasons.add('VERIFIED_CURRENT_BLOCKING_CONDITION_UNSATISFIED');
    } else if (reviewRefs.length>0) {
      status=ContinuousComplianceStatus.REVIEW_REQUIRED; reasons.add('CURRENT_REVIEW_REQUIRED');
    } else if (indeterminateRefs.length>0 || currentFacts.length===0) {
      status=ContinuousComplianceStatus.INDETERMINATE; reasons.add(currentFacts.length===0?'CURRENT_FACTS_MISSING':'CURRENT_FACTS_INDETERMINATE');
    } else if (futureRiskRefs.length>0 || nonBlockingRisks.length>0 || verifiedCurrentActionRisk) {
      status=ContinuousComplianceStatus.AT_RISK; reasons.add('KNOWN_RISK_OR_ACTION_PRESENT');
    } else if (conditionalRefs.length>0) {
      status=ContinuousComplianceStatus.COMPLIANT_WITH_CONDITIONS; reasons.add('CURRENT_CONDITIONS_SATISFIED_WITH_EXPLICIT_CONDITIONS');
    } else if (compliantRefs.length>0) {
      status=ContinuousComplianceStatus.COMPLIANT; reasons.add('CURRENT_APPLICABLE_CONDITIONS_SATISFIED');
    } else if (currentFacts.length>0 && currentFacts.every(value=>value.state===ContinuousComplianceConditionState.NOT_APPLICABLE)) {
      status=ContinuousComplianceStatus.NOT_APPLICABLE; reasons.add('EXPLICIT_NOT_APPLICABLE');
    } else {
      status=ContinuousComplianceStatus.INDETERMINATE; reasons.add('NO_SAFE_STATUS_CONCLUSION');
    }
    reasons.add(`COMPLIANCE_STATUS:${status}`);
    if (futureRiskRefs.length>0) reasons.add('FUTURE_RISK_PRESENT');

    const sourceVersions=[...new Map(facts.filter(value=>value.sourceVersion!==null).map(value=>[`${value.sourceReference}|${value.sourceVersion!.toString()}`,{sourceReference:value.sourceReference,version:value.sourceVersion!.toString()}])).values()]
      .sort((a,b)=>compare(`${a.sourceReference}|${a.version}`,`${b.sourceReference}|${b.version}`));
    const reevaluationDecisionReferences=[...new Set(facts.map(value=>value.reevaluationDecisionReference).filter((value):value is string=>value!==null))].sort(compare);

    return new ContinuousComplianceProjection({
      scope:input.scope.toJSON(),
      status,
      evaluatedAt:input.evaluatedAt.toString(),
      asKnownAt:input.asKnownAt.toString(),
      facts:facts.map(value=>value.toJSON()),
      currentFactReferences:currentFacts.map(value=>value.reference).sort(compare),
      futureFactReferences:futureFacts.map(value=>value.reference).sort(compare),
      blockingFactReferences:facts.filter(value=>value.blocking).map(value=>value.reference).sort(compare),
      conditionalFactReferences:[...new Set(conditionalRefs)].sort(compare),
      reviewFactReferences:[...new Set(reviewRefs)].sort(compare),
      indeterminateFactReferences:[...new Set(indeterminateRefs)].sort(compare),
      actionRequiredFactReferences:[...new Set(actionRefs)].sort(compare),
      notApplicableFactReferences:[...new Set(notApplicableRefs)].sort(compare),
      reevaluationDecisionReferences,
      sourceVersions,
      reasonCodes:[...reasons].sort(compare),
      organizationAggregateOnly:input.scope.kind===ContinuousComplianceScopeKind.ORGANIZATION,
      actorId:input.context.actor.id.toString(),
      correlationId:input.context.correlationId.toString(),
      accessDecisionReference:input.accessDecision.reference.toString(),
      accessAuditReference:input.accessDecision.auditReference.toString(),
      authorizationAuthority:false,
      credentialStateMutated:false,
      authorizationStateMutated:false,
      historicalDecisionMutated:false,
      reevaluationDecisionMutated:false,
      assignmentDecisionMutated:false,
      complianceStateChanged:false,
      notificationScheduled:false,
      providerInvoked:false,
      eventsEmitted:0,
      physicalDeletionAuthorized:false,
      assignmentInferenceAuthorized:false,
    });
  }
}
