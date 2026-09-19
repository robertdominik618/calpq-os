import { ActorReference, SubjectReference, UtcInstant } from '../../../core/src/index.ts';
import { ApplicationExecutionContext } from '../application-execution-context.ts';
import { OrganizationScopeReference, TenantScopeReference } from '../references.ts';
import { AccessDisposition, TenantAccessDecision, TenantAccessDeniedError, TenantBoundary, TenantContext } from '../tenant/tenant-governance.ts';

export const HISTORICAL_REPLAY_OPERATION = 'credential.lifecycle.historical-replay';
export const HISTORICAL_REPLAY_FIELD = 'credential:historical-replay';

export const LifecycleReplayMode = { AS_WAS: 'AS_WAS', AS_IS: 'AS_IS' } as const;
export type LifecycleReplayMode = (typeof LifecycleReplayMode)[keyof typeof LifecycleReplayMode];

export const LifecycleHistoricalReplayTargetType = {
  ELIGIBILITY_ASSESSMENT: 'ELIGIBILITY_ASSESSMENT',
  AUTHORIZATION_GRANT: 'AUTHORIZATION_GRANT',
  RENEWAL_EVALUATION: 'RENEWAL_EVALUATION',
  RECURRING_OBLIGATION: 'RECURRING_OBLIGATION',
  RENEWAL_CASE: 'RENEWAL_CASE',
  NOTIFICATION_PROJECTION: 'NOTIFICATION_PROJECTION',
  DEPENDENCY_IMPACT: 'DEPENDENCY_IMPACT',
  REEVALUATION_DECISION: 'REEVALUATION_DECISION',
  CONTINUOUS_COMPLIANCE: 'CONTINUOUS_COMPLIANCE',
  ASSIGNMENT_DECISION: 'ASSIGNMENT_DECISION',
} as const;
export type LifecycleHistoricalReplayTargetType = (typeof LifecycleHistoricalReplayTargetType)[keyof typeof LifecycleHistoricalReplayTargetType];

export const LifecycleReplayAvailability = {
  AVAILABLE: 'AVAILABLE',
  INPUT_MISSING: 'INPUT_MISSING',
  VERSION_UNAVAILABLE: 'VERSION_UNAVAILABLE',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  INDETERMINATE: 'INDETERMINATE',
} as const;
export type LifecycleReplayAvailability = (typeof LifecycleReplayAvailability)[keyof typeof LifecycleReplayAvailability];

export const LifecycleHistoricalReplayOutcome = {
  MATCH: 'MATCH',
  EXPLAINED_DIVERGENCE: 'EXPLAINED_DIVERGENCE',
  INPUT_MISSING: 'INPUT_MISSING',
  VERSION_UNAVAILABLE: 'VERSION_UNAVAILABLE',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  INDETERMINATE: 'INDETERMINATE',
} as const;
export type LifecycleHistoricalReplayOutcome = (typeof LifecycleHistoricalReplayOutcome)[keyof typeof LifecycleHistoricalReplayOutcome];

export const LifecycleHistoricalReplayComparisonOutcome = {
  SAME_OUTCOME: 'SAME_OUTCOME',
  CHANGED_OUTCOME: 'CHANGED_OUTCOME',
  COMPARISON_UNAVAILABLE: 'COMPARISON_UNAVAILABLE',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  INDETERMINATE: 'INDETERMINATE',
} as const;
export type LifecycleHistoricalReplayComparisonOutcome = (typeof LifecycleHistoricalReplayComparisonOutcome)[keyof typeof LifecycleHistoricalReplayComparisonOutcome];

export const LifecycleReplayDivergenceReasonKind = {
  CORRECTED_EVIDENCE: 'CORRECTED_EVIDENCE',
  SOURCE_VERSION_CHANGED: 'SOURCE_VERSION_CHANGED',
  RULE_VERSION_CHANGED: 'RULE_VERSION_CHANGED',
  CONTRACT_VERSION_CHANGED: 'CONTRACT_VERSION_CHANGED',
  EVIDENCE_SET_CHANGED: 'EVIDENCE_SET_CHANGED',
  IMPLEMENTATION_DEFECT_DETECTED: 'IMPLEMENTATION_DEFECT_DETECTED',
  HISTORICAL_DEPENDENCY_UNAVAILABLE: 'HISTORICAL_DEPENDENCY_UNAVAILABLE',
  CURRENT_SCOPE_CHANGED: 'CURRENT_SCOPE_CHANGED',
  MANUAL_REVIEW_DECISION: 'MANUAL_REVIEW_DECISION',
  OTHER_GOVERNED_REASON: 'OTHER_GOVERNED_REASON',
} as const;
export type LifecycleReplayDivergenceReasonKind = (typeof LifecycleReplayDivergenceReasonKind)[keyof typeof LifecycleReplayDivergenceReasonKind];

export const LifecycleReplayDifferenceKind = {
  RULE_VERSION: 'RULE_VERSION',
  SOURCE_VERSION: 'SOURCE_VERSION',
  CONTRACT_VERSION: 'CONTRACT_VERSION',
  EVIDENCE: 'EVIDENCE',
} as const;
export type LifecycleReplayDifferenceKind = (typeof LifecycleReplayDifferenceKind)[keyof typeof LifecycleReplayDifferenceKind];

type DeepReadonly<T> = T extends readonly (infer U)[] ? readonly DeepReadonly<U>[] : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;
const MODES = Object.freeze(Object.values(LifecycleReplayMode));
const TARGET_TYPES = Object.freeze(Object.values(LifecycleHistoricalReplayTargetType));
const AVAILABILITY = Object.freeze(Object.values(LifecycleReplayAvailability));
const DIVERGENCE_KINDS = Object.freeze(Object.values(LifecycleReplayDivergenceReasonKind));
const MAX_VERSION_REFERENCES = 64;
const MAX_EVIDENCE_REFERENCES = 256;
const MAX_REASON_CODES = 128;
const MAX_DIVERGENCE_REASONS = 64;
const CORE_BLOCKED_AVAILABLE_STATES = new Set(['VERSION_QUERY_UNRESOLVED','AMBIGUOUS_REVIEW_REQUIRED','NOT_FOUND','NOT_YET_KNOWN']);

function requiredText(value:string,label:string,max=4096):string{
  if(typeof value!=='string') throw new TypeError(`${label} must be text`);
  const normalized=value.trim();
  if(normalized.length===0) throw new TypeError(`${label} must not be empty`);
  if(normalized.length>max) throw new RangeError(`${label} is too long`);
  return normalized;
}
function opaque(value:string,label:string,max=256):string{
  const normalized=requiredText(value,label,max);
  if(!/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(normalized)) throw new TypeError(`${label} contains unsupported characters`);
  return normalized;
}
function instant(value:UtcInstant):number{
  if(!(value instanceof UtcInstant)) throw new TypeError('Explicit UtcInstant required');
  return value.toEpochMilliseconds();
}
function same(a:{toString():string},b:{toString():string}):boolean{return a.toString()===b.toString();}
function sameSubject(a:SubjectReference|null,b:SubjectReference|null):boolean{
  if(a===null||b===null) return a===b;
  return same(a.id,b.id)&&a.kind===b.kind;
}
function compare(a:string,b:string):number{return a<b?-1:a>b?1:0;}
function dense<T>(value:readonly T[],max:number,min=0):T[]{
  if(!Array.isArray(value)||value.length<min||value.length>max) throw new TypeError('Bounded dense collection required');
  for(let i=0;i<value.length;i++) if(!(i in value)) throw new TypeError('Sparse collection rejected');
  return Array.from(value);
}
function controlled<T extends string>(value:T,allowed:readonly string[],label:string):T{
  if(typeof value!=='string'||!allowed.includes(value)) throw new TypeError(`${label} must be controlled`);
  return value;
}
function freeze<T>(value:T):DeepReadonly<T>{
  if(value!==null&&typeof value==='object'){
    for(const child of Object.values(value as Record<string,unknown>)) freeze(child);
    Object.freeze(value);
  }
  return value as DeepReadonly<T>;
}
function refs(values:readonly string[],label:string,max:number):readonly string[]{
  const result=dense(values,max).map(value=>opaque(value,label)).sort(compare);
  if(new Set(result).size!==result.length) throw new TypeError(`Duplicate ${label}`);
  return Object.freeze(result);
}
function exact(a:readonly string[],b:readonly string[]):boolean{
  return a.length===b.length&&a.every((value,index)=>value===b[index]);
}

export interface LifecycleHistoricalDecisionAnchorInput{
  readonly reference:string;
  readonly targetType:LifecycleHistoricalReplayTargetType;
  readonly targetReference:string;
  readonly originalDecisionReference:string;
  readonly tenant:TenantScopeReference;
  readonly organization:OrganizationScopeReference;
  readonly subject:SubjectReference|null;
  readonly jurisdictionReference:string;
  readonly originalOutcome:string;
  readonly evaluatedAt:UtcInstant;
  readonly asKnownAt:UtcInstant;
  readonly ruleVersionReferences:readonly string[];
  readonly sourceVersionReferences:readonly string[];
  readonly contractVersionReferences:readonly string[];
  readonly evidenceReferences:readonly string[];
  readonly provenanceReference:string;
  readonly correlationReference:string;
  readonly causationReference:string|null;
  readonly implementationContractReference:string;
  readonly inputComplete:boolean;
}

export interface LifecycleHistoricalDecisionAnchorView{
  readonly reference:string;
  readonly targetType:LifecycleHistoricalReplayTargetType;
  readonly targetReference:string;
  readonly originalDecisionReference:string;
  readonly tenant:string;
  readonly organization:string;
  readonly subject:null|{readonly id:string;readonly kind:string};
  readonly jurisdictionReference:string;
  readonly originalOutcome:string;
  readonly evaluatedAt:string;
  readonly asKnownAt:string;
  readonly ruleVersionReferences:readonly string[];
  readonly sourceVersionReferences:readonly string[];
  readonly contractVersionReferences:readonly string[];
  readonly evidenceReferences:readonly string[];
  readonly provenanceReference:string;
  readonly correlationReference:string;
  readonly causationReference:string|null;
  readonly implementationContractReference:string;
  readonly inputComplete:boolean;
}

export class LifecycleHistoricalDecisionAnchor{
  readonly reference:string;
  readonly targetType:LifecycleHistoricalReplayTargetType;
  readonly targetReference:string;
  readonly originalDecisionReference:string;
  readonly tenant:TenantScopeReference;
  readonly organization:OrganizationScopeReference;
  readonly subject:SubjectReference|null;
  readonly jurisdictionReference:string;
  readonly originalOutcome:string;
  readonly evaluatedAt:UtcInstant;
  readonly asKnownAt:UtcInstant;
  readonly ruleVersionReferences:readonly string[];
  readonly sourceVersionReferences:readonly string[];
  readonly contractVersionReferences:readonly string[];
  readonly evidenceReferences:readonly string[];
  readonly provenanceReference:string;
  readonly correlationReference:string;
  readonly causationReference:string|null;
  readonly implementationContractReference:string;
  readonly inputComplete:boolean;

  private constructor(input:LifecycleHistoricalDecisionAnchorInput,ruleRefs:readonly string[],sourceRefs:readonly string[],contractRefs:readonly string[],evidenceRefs:readonly string[]){
    this.reference=input.reference;this.targetType=input.targetType;this.targetReference=input.targetReference;this.originalDecisionReference=input.originalDecisionReference;
    this.tenant=input.tenant;this.organization=input.organization;this.subject=input.subject;this.jurisdictionReference=input.jurisdictionReference;this.originalOutcome=input.originalOutcome;
    this.evaluatedAt=input.evaluatedAt;this.asKnownAt=input.asKnownAt;this.ruleVersionReferences=ruleRefs;this.sourceVersionReferences=sourceRefs;this.contractVersionReferences=contractRefs;this.evidenceReferences=evidenceRefs;
    this.provenanceReference=input.provenanceReference;this.correlationReference=input.correlationReference;this.causationReference=input.causationReference;this.implementationContractReference=input.implementationContractReference;this.inputComplete=input.inputComplete;
    Object.freeze(this);
  }

  static create(input:LifecycleHistoricalDecisionAnchorInput):LifecycleHistoricalDecisionAnchor{
    const targetType=controlled(input.targetType,TARGET_TYPES,'Historical replay target type');
    if(!(input.tenant instanceof TenantScopeReference)||!(input.organization instanceof OrganizationScopeReference)) throw new TypeError('Historical decision anchor requires tenant and organization scope');
    if(input.subject!==null&&!(input.subject instanceof SubjectReference)) throw new TypeError('Historical decision anchor subject must be governed');
    const evaluated=instant(input.evaluatedAt),known=instant(input.asKnownAt);
    if(evaluated>known) throw new RangeError('Original evaluation cannot exceed original knowledge horizon');
    if(typeof input.inputComplete!=='boolean') throw new TypeError('Historical input completeness must be boolean');
    const ruleRefs=refs(input.ruleVersionReferences,'Rule version reference',MAX_VERSION_REFERENCES);
    const sourceRefs=refs(input.sourceVersionReferences,'Source version reference',MAX_VERSION_REFERENCES);
    const contractRefs=refs(input.contractVersionReferences,'Contract version reference',MAX_VERSION_REFERENCES);
    const evidenceRefs=refs(input.evidenceReferences,'Evidence reference',MAX_EVIDENCE_REFERENCES);
    return new LifecycleHistoricalDecisionAnchor({
      ...input,
      reference:opaque(input.reference,'Historical anchor reference'),
      targetType,
      targetReference:opaque(input.targetReference,'Historical target reference'),
      originalDecisionReference:opaque(input.originalDecisionReference,'Original decision reference'),
      jurisdictionReference:opaque(input.jurisdictionReference,'Jurisdiction reference'),
      originalOutcome:requiredText(input.originalOutcome,'Original semantic outcome',512),
      provenanceReference:opaque(input.provenanceReference,'Historical provenance reference'),
      correlationReference:opaque(input.correlationReference,'Historical correlation reference'),
      causationReference:input.causationReference===null?null:opaque(input.causationReference,'Historical causation reference'),
      implementationContractReference:opaque(input.implementationContractReference,'Implementation contract reference'),
    },ruleRefs,sourceRefs,contractRefs,evidenceRefs);
  }

  toJSON():DeepReadonly<LifecycleHistoricalDecisionAnchorView>{
    return freeze({
      reference:this.reference,targetType:this.targetType,targetReference:this.targetReference,originalDecisionReference:this.originalDecisionReference,
      tenant:this.tenant.toString(),organization:this.organization.toString(),subject:this.subject===null?null:{id:this.subject.id.toString(),kind:this.subject.kind},
      jurisdictionReference:this.jurisdictionReference,originalOutcome:this.originalOutcome,evaluatedAt:this.evaluatedAt.toString(),asKnownAt:this.asKnownAt.toString(),
      ruleVersionReferences:[...this.ruleVersionReferences],sourceVersionReferences:[...this.sourceVersionReferences],contractVersionReferences:[...this.contractVersionReferences],evidenceReferences:[...this.evidenceReferences],
      provenanceReference:this.provenanceReference,correlationReference:this.correlationReference,causationReference:this.causationReference,implementationContractReference:this.implementationContractReference,inputComplete:this.inputComplete,
    });
  }
}

export interface LifecycleReplaySnapshotInput{
  readonly reference:string;
  readonly mode:LifecycleReplayMode;
  readonly anchor:LifecycleHistoricalDecisionAnchor;
  readonly targetReference:string;
  readonly targetType:LifecycleHistoricalReplayTargetType;
  readonly jurisdictionReference:string;
  readonly subject:SubjectReference|null;
  readonly availability:LifecycleReplayAvailability;
  readonly semanticOutcome:string|null;
  readonly evaluatedAt:UtcInstant;
  readonly asKnownAt:UtcInstant;
  readonly ruleVersionReferences:readonly string[];
  readonly sourceVersionReferences:readonly string[];
  readonly contractVersionReferences:readonly string[];
  readonly evidenceReferences:readonly string[];
  readonly evaluator:ActorReference;
  readonly provenanceReference:string;
  readonly correlationReference:string;
  readonly causationReference:string|null;
  readonly coreHistoricalReplayState:string|null;
  readonly s07DecisionReference:string|null;
  readonly s08ProjectionReference:string|null;
  readonly reasonCodes:readonly string[];
}

export interface LifecycleReplaySnapshotView{
  readonly reference:string;
  readonly mode:LifecycleReplayMode;
  readonly targetReference:string;
  readonly targetType:LifecycleHistoricalReplayTargetType;
  readonly jurisdictionReference:string;
  readonly subject:null|{readonly id:string;readonly kind:string};
  readonly availability:LifecycleReplayAvailability;
  readonly semanticOutcome:string|null;
  readonly evaluatedAt:string;
  readonly asKnownAt:string;
  readonly ruleVersionReferences:readonly string[];
  readonly sourceVersionReferences:readonly string[];
  readonly contractVersionReferences:readonly string[];
  readonly evidenceReferences:readonly string[];
  readonly evaluatorId:string;
  readonly evaluatorKind:string;
  readonly provenanceReference:string;
  readonly correlationReference:string;
  readonly causationReference:string|null;
  readonly coreHistoricalReplayState:string|null;
  readonly s07DecisionReference:string|null;
  readonly s08ProjectionReference:string|null;
  readonly reasonCodes:readonly string[];
}

export class LifecycleReplaySnapshot{
  readonly reference:string;readonly mode:LifecycleReplayMode;readonly anchor:LifecycleHistoricalDecisionAnchor;readonly targetReference:string;readonly targetType:LifecycleHistoricalReplayTargetType;
  readonly jurisdictionReference:string;readonly subject:SubjectReference|null;readonly availability:LifecycleReplayAvailability;readonly semanticOutcome:string|null;
  readonly evaluatedAt:UtcInstant;readonly asKnownAt:UtcInstant;readonly ruleVersionReferences:readonly string[];readonly sourceVersionReferences:readonly string[];readonly contractVersionReferences:readonly string[];readonly evidenceReferences:readonly string[];
  readonly evaluator:ActorReference;readonly provenanceReference:string;readonly correlationReference:string;readonly causationReference:string|null;readonly coreHistoricalReplayState:string|null;readonly s07DecisionReference:string|null;readonly s08ProjectionReference:string|null;readonly reasonCodes:readonly string[];

  private constructor(input:LifecycleReplaySnapshotInput,ruleRefs:readonly string[],sourceRefs:readonly string[],contractRefs:readonly string[],evidenceRefs:readonly string[],reasonCodes:readonly string[]){
    Object.assign(this,input);this.ruleVersionReferences=ruleRefs;this.sourceVersionReferences=sourceRefs;this.contractVersionReferences=contractRefs;this.evidenceReferences=evidenceRefs;this.reasonCodes=reasonCodes;Object.freeze(this);
  }

  static create(input:LifecycleReplaySnapshotInput):LifecycleReplaySnapshot{
    const mode=controlled(input.mode,MODES,'Replay mode');
    if(!(input.anchor instanceof LifecycleHistoricalDecisionAnchor)) throw new TypeError('Replay snapshot requires exact historical anchor');
    const targetType=controlled(input.targetType,TARGET_TYPES,'Replay snapshot target type');
    if(input.targetReference!==input.anchor.targetReference||targetType!==input.anchor.targetType||input.jurisdictionReference!==input.anchor.jurisdictionReference||!sameSubject(input.subject,input.anchor.subject)) throw new TypeError('Replay snapshot target scope must match anchor');
    const availability=controlled(input.availability,AVAILABILITY,'Replay availability');
    const semanticOutcome=input.semanticOutcome===null?null:requiredText(input.semanticOutcome,'Replay semantic outcome',512);
    if(availability===LifecycleReplayAvailability.AVAILABLE&&semanticOutcome===null) throw new TypeError('Available replay snapshot requires semantic outcome');
    if(availability!==LifecycleReplayAvailability.AVAILABLE&&semanticOutcome!==null) throw new TypeError('Unavailable replay snapshot cannot carry semantic outcome');
    const evaluated=instant(input.evaluatedAt),known=instant(input.asKnownAt);
    if(evaluated>known) throw new RangeError('Replay snapshot evaluation cannot exceed knowledge horizon');
    if(!(input.evaluator instanceof ActorReference)) throw new TypeError('Replay snapshot requires evaluator actor');
    const ruleRefs=refs(input.ruleVersionReferences,'Snapshot rule version reference',MAX_VERSION_REFERENCES);
    const sourceRefs=refs(input.sourceVersionReferences,'Snapshot source version reference',MAX_VERSION_REFERENCES);
    const contractRefs=refs(input.contractVersionReferences,'Snapshot contract version reference',MAX_VERSION_REFERENCES);
    const evidenceRefs=refs(input.evidenceReferences,'Snapshot evidence reference',MAX_EVIDENCE_REFERENCES);
    const reasonCodes=refs(input.reasonCodes,'Replay reason code',MAX_REASON_CODES);
    const coreState=input.coreHistoricalReplayState===null?null:opaque(input.coreHistoricalReplayState,'Core historical replay state');
    const s07=input.s07DecisionReference===null?null:opaque(input.s07DecisionReference,'S07 decision reference');
    const s08=input.s08ProjectionReference===null?null:opaque(input.s08ProjectionReference,'S08 projection reference');

    if(mode===LifecycleReplayMode.AS_WAS){
      if(input.evaluatedAt.toString()!==input.anchor.evaluatedAt.toString()||input.asKnownAt.toString()!==input.anchor.asKnownAt.toString()) throw new TypeError('AS_WAS must use exact original temporal horizon');
      if(!exact(ruleRefs,input.anchor.ruleVersionReferences)||!exact(sourceRefs,input.anchor.sourceVersionReferences)||!exact(contractRefs,input.anchor.contractVersionReferences)||!exact(evidenceRefs,input.anchor.evidenceReferences)) throw new TypeError('AS_WAS must use exact original versions and evidence');
      if(s08!==null) throw new TypeError('Current S08 projection metadata cannot bind AS_WAS');
      if(availability===LifecycleReplayAvailability.AVAILABLE&&coreState!==null&&CORE_BLOCKED_AVAILABLE_STATES.has(coreState)) throw new TypeError('Ambiguous or unavailable Core historical replay cannot become AVAILABLE');
      if(!input.anchor.inputComplete&&availability===LifecycleReplayAvailability.AVAILABLE) throw new TypeError('Incomplete historical anchor cannot become AVAILABLE');
    }else{
      if(evaluated<instant(input.anchor.asKnownAt)) throw new RangeError('AS_IS evaluation cannot predate original knowledge horizon');
    }

    return new LifecycleReplaySnapshot({
      ...input,
      reference:opaque(input.reference,'Replay snapshot reference'),
      mode,targetReference:opaque(input.targetReference,'Replay target reference'),targetType,jurisdictionReference:opaque(input.jurisdictionReference,'Replay jurisdiction reference'),
      availability,semanticOutcome,provenanceReference:opaque(input.provenanceReference,'Replay provenance reference'),correlationReference:opaque(input.correlationReference,'Replay correlation reference'),
      causationReference:input.causationReference===null?null:opaque(input.causationReference,'Replay causation reference'),coreHistoricalReplayState:coreState,s07DecisionReference:s07,s08ProjectionReference:s08,
    },ruleRefs,sourceRefs,contractRefs,evidenceRefs,reasonCodes);
  }

  toInput():LifecycleReplaySnapshotInput{
    return {reference:this.reference,mode:this.mode,anchor:this.anchor,targetReference:this.targetReference,targetType:this.targetType,jurisdictionReference:this.jurisdictionReference,subject:this.subject,availability:this.availability,semanticOutcome:this.semanticOutcome,evaluatedAt:this.evaluatedAt,asKnownAt:this.asKnownAt,ruleVersionReferences:this.ruleVersionReferences,sourceVersionReferences:this.sourceVersionReferences,contractVersionReferences:this.contractVersionReferences,evidenceReferences:this.evidenceReferences,evaluator:this.evaluator,provenanceReference:this.provenanceReference,correlationReference:this.correlationReference,causationReference:this.causationReference,coreHistoricalReplayState:this.coreHistoricalReplayState,s07DecisionReference:this.s07DecisionReference,s08ProjectionReference:this.s08ProjectionReference,reasonCodes:this.reasonCodes};
  }

  toJSON():DeepReadonly<LifecycleReplaySnapshotView>{
    return freeze({reference:this.reference,mode:this.mode,targetReference:this.targetReference,targetType:this.targetType,jurisdictionReference:this.jurisdictionReference,subject:this.subject===null?null:{id:this.subject.id.toString(),kind:this.subject.kind},availability:this.availability,semanticOutcome:this.semanticOutcome,evaluatedAt:this.evaluatedAt.toString(),asKnownAt:this.asKnownAt.toString(),ruleVersionReferences:[...this.ruleVersionReferences],sourceVersionReferences:[...this.sourceVersionReferences],contractVersionReferences:[...this.contractVersionReferences],evidenceReferences:[...this.evidenceReferences],evaluatorId:this.evaluator.id.toString(),evaluatorKind:this.evaluator.kind,provenanceReference:this.provenanceReference,correlationReference:this.correlationReference,causationReference:this.causationReference,coreHistoricalReplayState:this.coreHistoricalReplayState,s07DecisionReference:this.s07DecisionReference,s08ProjectionReference:this.s08ProjectionReference,reasonCodes:[...this.reasonCodes]});
  }
}

export interface LifecycleReplayDivergenceReasonInput{
  readonly mode:LifecycleReplayMode;
  readonly reason:LifecycleReplayDivergenceReasonKind;
  readonly governedReference:string|null;
}
export interface LifecycleReplayDivergenceReasonView{
  readonly mode:LifecycleReplayMode;
  readonly reason:LifecycleReplayDivergenceReasonKind;
  readonly governedReference:string|null;
}
export class LifecycleReplayDivergenceReason{
  readonly mode:LifecycleReplayMode;readonly reason:LifecycleReplayDivergenceReasonKind;readonly governedReference:string|null;
  private constructor(input:LifecycleReplayDivergenceReasonInput){this.mode=input.mode;this.reason=input.reason;this.governedReference=input.governedReference;Object.freeze(this);}
  static create(input:LifecycleReplayDivergenceReasonInput):LifecycleReplayDivergenceReason{
    const mode=controlled(input.mode,MODES,'Divergence mode'),reason=controlled(input.reason,DIVERGENCE_KINDS,'Divergence reason');
    const governedReference=input.governedReference===null?null:opaque(input.governedReference,'Governed divergence reference');
    if(reason===LifecycleReplayDivergenceReasonKind.OTHER_GOVERNED_REASON&&governedReference===null) throw new TypeError('OTHER_GOVERNED_REASON requires governed reference');
    return new LifecycleReplayDivergenceReason({mode,reason,governedReference});
  }
  toJSON():DeepReadonly<LifecycleReplayDivergenceReasonView>{return freeze({mode:this.mode,reason:this.reason,governedReference:this.governedReference});}
}

export interface LifecycleHistoricalReplayResultView{
  readonly mode:LifecycleReplayMode;
  readonly outcome:LifecycleHistoricalReplayOutcome;
  readonly snapshotReference:string|null;
  readonly availability:LifecycleReplayAvailability;
  readonly semanticOutcome:string|null;
  readonly evaluatedAt:string|null;
  readonly asKnownAt:string|null;
  readonly ruleVersionReferences:readonly string[];
  readonly sourceVersionReferences:readonly string[];
  readonly contractVersionReferences:readonly string[];
  readonly evidenceReferences:readonly string[];
  readonly s07DecisionReference:string|null;
  readonly s08ProjectionReference:string|null;
  readonly reasonCodes:readonly string[];
}
export interface LifecycleReplayDifferenceView{
  readonly kind:LifecycleReplayDifferenceKind;
  readonly reference:string;
  readonly side:'AS_WAS_ONLY'|'AS_IS_ONLY';
}
export interface LifecycleHistoricalReplayComparisonView{
  readonly outcome:LifecycleHistoricalReplayComparisonOutcome;
  readonly originalOutcome:string;
  readonly asWasOutcome:string|null;
  readonly asIsOutcome:string|null;
  readonly differenceReferences:readonly LifecycleReplayDifferenceView[];
  readonly reasonCodes:readonly string[];
}
export interface LifecycleHistoricalReplayInput{
  readonly context:ApplicationExecutionContext;
  readonly authorizedContext:TenantContext;
  readonly boundary:TenantBoundary;
  readonly accessDecision:TenantAccessDecision;
  readonly anchor:LifecycleHistoricalDecisionAnchor;
  readonly snapshots:readonly LifecycleReplaySnapshot[];
  readonly requestedModes:readonly LifecycleReplayMode[];
  readonly divergenceReasons:readonly LifecycleReplayDivergenceReason[];
  readonly correctiveReviewReference:string|null;
  readonly replayedAt:UtcInstant;
  readonly asKnownAt:UtcInstant;
  readonly maxSnapshots:number;
  readonly maxDifferenceReferences:number;
}
export interface LifecycleHistoricalReplayView{
  readonly anchor:LifecycleHistoricalDecisionAnchorView;
  readonly replayedAt:string;
  readonly asKnownAt:string;
  readonly requestedModes:readonly LifecycleReplayMode[];
  readonly results:readonly LifecycleHistoricalReplayResultView[];
  readonly comparison:LifecycleHistoricalReplayComparisonView;
  readonly divergenceReasons:readonly LifecycleReplayDivergenceReasonView[];
  readonly correctiveReviewRequired:boolean;
  readonly correctiveReviewReference:string|null;
  readonly reasonCodes:readonly string[];
  readonly actorId:string;
  readonly correlationId:string;
  readonly accessDecisionReference:string;
  readonly accessAuditReference:string;
  readonly authorizationAuthority:false;
  readonly credentialStateMutated:false;
  readonly authorizationStateMutated:false;
  readonly historicalDecisionMutated:false;
  readonly reevaluationDecisionMutated:false;
  readonly complianceProjectionMutated:false;
  readonly assignmentDecisionMutated:false;
  readonly notificationScheduled:false;
  readonly providerInvoked:false;
  readonly eventsEmitted:0;
  readonly physicalDeletionAuthorized:false;
}

function assertReaderBase(input:LifecycleHistoricalReplayInput):void{
  const c=input.context,reader=input.authorizedContext,access=input.accessDecision;
  if(!(c instanceof ApplicationExecutionContext)||!(reader instanceof TenantContext)||!(input.boundary instanceof TenantBoundary)||!(access instanceof TenantAccessDecision)) throw new TenantAccessDeniedError();
  input.boundary.assertKnown(reader);
  if(c.tenantScope===null||c.organizationScope===null||c.purpose===null||c.accessDecision===null||c.operation.toString()!==HISTORICAL_REPLAY_OPERATION) throw new TenantAccessDeniedError();
  if(!same(c.tenantScope,reader.tenant)||!same(c.organizationScope,reader.organization)||!same(c.purpose,reader.purpose)||!same(c.actor.id,reader.actor.id)||c.actor.kind!==reader.actor.kind||!same(c.correlationId,reader.correlationId)) throw new TenantAccessDeniedError();
  if(access.disposition!==AccessDisposition.ALLOW||!same(access.tenant,reader.tenant)||!same(access.purpose,reader.purpose)||!same(access.reference,c.accessDecision)||!access.allowedFields.includes(HISTORICAL_REPLAY_FIELD)) throw new TenantAccessDeniedError();
}
function assertAnchorScope(input:LifecycleHistoricalReplayInput):void{
  const a=input.anchor,c=input.context,reader=input.authorizedContext;
  if(!(a instanceof LifecycleHistoricalDecisionAnchor)) throw new TypeError('Exact historical decision anchor required');
  if(!same(a.tenant,reader.tenant)||!same(a.organization,reader.organization)) throw new TenantAccessDeniedError();
  if(a.subject===null){if(c.subject!==null) throw new TenantAccessDeniedError();}else if(c.subject===null||!sameSubject(a.subject,c.subject)) throw new TenantAccessDeniedError();
}
function mapUnavailable(value:LifecycleReplayAvailability):LifecycleHistoricalReplayOutcome{
  switch(value){
    case LifecycleReplayAvailability.INPUT_MISSING:return LifecycleHistoricalReplayOutcome.INPUT_MISSING;
    case LifecycleReplayAvailability.VERSION_UNAVAILABLE:return LifecycleHistoricalReplayOutcome.VERSION_UNAVAILABLE;
    case LifecycleReplayAvailability.REVIEW_REQUIRED:return LifecycleHistoricalReplayOutcome.REVIEW_REQUIRED;
    case LifecycleReplayAvailability.INDETERMINATE:return LifecycleHistoricalReplayOutcome.INDETERMINATE;
    default:throw new TypeError('Availability is not fail-closed');
  }
}
function symmetric(kind:LifecycleReplayDifferenceKind,a:readonly string[],b:readonly string[]):LifecycleReplayDifferenceView[]{
  const aa=new Set(a),bb=new Set(b),out:LifecycleReplayDifferenceView[]=[];
  for(const ref of a) if(!bb.has(ref)) out.push({kind,reference:ref,side:'AS_WAS_ONLY'});
  for(const ref of b) if(!aa.has(ref)) out.push({kind,reference:ref,side:'AS_IS_ONLY'});
  return out;
}

/** Pure read-only historical/current decision replay projection. It never mutates historical or current domain truth. */
export class LifecycleHistoricalReplay{
  readonly #view:DeepReadonly<LifecycleHistoricalReplayView>;
  private constructor(view:LifecycleHistoricalReplayView){this.#view=freeze(view);Object.freeze(this);}
  toJSON():DeepReadonly<LifecycleHistoricalReplayView>{return this.#view;}

  static evaluate(input:LifecycleHistoricalReplayInput):LifecycleHistoricalReplay{
    assertReaderBase(input);
    assertAnchorScope(input);
    const replayed=instant(input.replayedAt),requested=instant(input.context.requestedAt),known=instant(input.asKnownAt);
    if(replayed!==requested) throw new RangeError('Replay instant must match invocation horizon');
    if(known>replayed) throw new RangeError('Replay knowledge horizon exceeds replay instant');

    const requestedModes=dense(input.requestedModes,MODES.length,1).map(value=>controlled(value,MODES,'Requested replay mode'));
    if(new Set(requestedModes).size!==requestedModes.length) throw new TypeError('Requested replay modes must be unique');
    requestedModes.sort((a,b)=>MODES.indexOf(a)-MODES.indexOf(b));

    const maxSnapshots=Number.isSafeInteger(input.maxSnapshots)&&input.maxSnapshots>=1&&input.maxSnapshots<=2?input.maxSnapshots:(()=>{throw new RangeError('Snapshot budget outside explicit bounds');})();
    const maxDifferences=Number.isSafeInteger(input.maxDifferenceReferences)&&input.maxDifferenceReferences>=1&&input.maxDifferenceReferences<=1024?input.maxDifferenceReferences:(()=>{throw new RangeError('Difference budget outside explicit bounds');})();
    const snapshots=dense(input.snapshots,maxSnapshots);
    if(!snapshots.every(value=>value instanceof LifecycleReplaySnapshot)) throw new TypeError('Governed replay snapshots required');
    const snapshotMap=new Map<LifecycleReplayMode,LifecycleReplaySnapshot>();
    for(const current of snapshots){
      if(current.anchor!==input.anchor) throw new TypeError('Replay snapshot must bind exact anchor object');
      if(snapshotMap.has(current.mode)) throw new TypeError('Duplicate replay snapshot mode');
      if(instant(current.evaluatedAt)>replayed||instant(current.asKnownAt)>known) throw new RangeError('Replay snapshot exceeds request horizon');
      snapshotMap.set(current.mode,current);
    }

    const divergences=dense(input.divergenceReasons,MAX_DIVERGENCE_REASONS);
    if(!divergences.every(value=>value instanceof LifecycleReplayDivergenceReason)) throw new TypeError('Governed divergence reasons required');
    const divergenceKeys=divergences.map(value=>`${value.mode}|${value.reason}|${value.governedReference??''}`);
    if(new Set(divergenceKeys).size!==divergenceKeys.length) throw new TypeError('Duplicate divergence reason');
    const correctiveReviewReference=input.correctiveReviewReference===null?null:opaque(input.correctiveReviewReference,'Corrective review reference');

    const results:LifecycleHistoricalReplayResultView[]=[];
    for(const mode of requestedModes){
      const current=snapshotMap.get(mode)??null;
      let outcome:LifecycleHistoricalReplayOutcome;
      const reasons=new Set<string>();
      if(current===null){
        outcome=LifecycleHistoricalReplayOutcome.INPUT_MISSING;
        reasons.add('REPLAY_SNAPSHOT_MISSING');
        results.push({mode,outcome,snapshotReference:null,availability:LifecycleReplayAvailability.INPUT_MISSING,semanticOutcome:null,evaluatedAt:null,asKnownAt:null,ruleVersionReferences:[],sourceVersionReferences:[],contractVersionReferences:[],evidenceReferences:[],s07DecisionReference:null,s08ProjectionReference:null,reasonCodes:[...reasons]});
        continue;
      }
      for(const reason of current.reasonCodes) reasons.add(reason);
      if(current.availability!==LifecycleReplayAvailability.AVAILABLE){
        outcome=mapUnavailable(current.availability);
      }else if(current.semanticOutcome===input.anchor.originalOutcome){
        outcome=LifecycleHistoricalReplayOutcome.MATCH;
      }else{
        const modeReasons=divergences.filter(value=>value.mode===mode);
        outcome=modeReasons.length>0?LifecycleHistoricalReplayOutcome.EXPLAINED_DIVERGENCE:LifecycleHistoricalReplayOutcome.REVIEW_REQUIRED;
        for(const reason of modeReasons) reasons.add(`DIVERGENCE:${reason.reason}`);
      }
      reasons.add(`REPLAY_OUTCOME:${outcome}`);
      results.push({
        mode,outcome,snapshotReference:current.reference,availability:current.availability,semanticOutcome:current.semanticOutcome,evaluatedAt:current.evaluatedAt.toString(),asKnownAt:current.asKnownAt.toString(),
        ruleVersionReferences:[...current.ruleVersionReferences],sourceVersionReferences:[...current.sourceVersionReferences],contractVersionReferences:[...current.contractVersionReferences],evidenceReferences:[...current.evidenceReferences],
        s07DecisionReference:current.s07DecisionReference,s08ProjectionReference:current.s08ProjectionReference,reasonCodes:[...reasons].sort(compare),
      });
    }

    const wasResult=results.find(value=>value.mode===LifecycleReplayMode.AS_WAS)??null;
    const isResult=results.find(value=>value.mode===LifecycleReplayMode.AS_IS)??null;
    const wasSnapshot=snapshotMap.get(LifecycleReplayMode.AS_WAS)??null,isSnapshot=snapshotMap.get(LifecycleReplayMode.AS_IS)??null;
    const differenceReferences:LifecycleReplayDifferenceView[]=[];
    if(wasSnapshot!==null&&isSnapshot!==null){
      differenceReferences.push(...symmetric(LifecycleReplayDifferenceKind.RULE_VERSION,wasSnapshot.ruleVersionReferences,isSnapshot.ruleVersionReferences));
      differenceReferences.push(...symmetric(LifecycleReplayDifferenceKind.SOURCE_VERSION,wasSnapshot.sourceVersionReferences,isSnapshot.sourceVersionReferences));
      differenceReferences.push(...symmetric(LifecycleReplayDifferenceKind.CONTRACT_VERSION,wasSnapshot.contractVersionReferences,isSnapshot.contractVersionReferences));
      differenceReferences.push(...symmetric(LifecycleReplayDifferenceKind.EVIDENCE,wasSnapshot.evidenceReferences,isSnapshot.evidenceReferences));
    }
    differenceReferences.sort((a,b)=>compare(`${a.kind}|${a.reference}|${a.side}`,`${b.kind}|${b.reference}|${b.side}`));
    if(differenceReferences.length>maxDifferences) throw new RangeError('Replay difference budget exceeded');

    let comparisonOutcome:LifecycleHistoricalReplayComparisonOutcome;
    if(wasResult===null||isResult===null) comparisonOutcome=LifecycleHistoricalReplayComparisonOutcome.COMPARISON_UNAVAILABLE;
    else if([wasResult,isResult].some(value=>value.outcome===LifecycleHistoricalReplayOutcome.REVIEW_REQUIRED)) comparisonOutcome=LifecycleHistoricalReplayComparisonOutcome.REVIEW_REQUIRED;
    else if([wasResult,isResult].some(value=>value.outcome===LifecycleHistoricalReplayOutcome.INDETERMINATE)) comparisonOutcome=LifecycleHistoricalReplayComparisonOutcome.INDETERMINATE;
    else if([wasResult,isResult].some(value=>value.outcome===LifecycleHistoricalReplayOutcome.INPUT_MISSING||value.outcome===LifecycleHistoricalReplayOutcome.VERSION_UNAVAILABLE)) comparisonOutcome=LifecycleHistoricalReplayComparisonOutcome.COMPARISON_UNAVAILABLE;
    else comparisonOutcome=wasResult.semanticOutcome===isResult.semanticOutcome?LifecycleHistoricalReplayComparisonOutcome.SAME_OUTCOME:LifecycleHistoricalReplayComparisonOutcome.CHANGED_OUTCOME;

    const comparisonReasons=[`COMPARISON_OUTCOME:${comparisonOutcome}`];
    if(differenceReferences.length>0) comparisonReasons.push('VERSION_OR_EVIDENCE_DIFFERENCE');
    const comparison:LifecycleHistoricalReplayComparisonView={
      outcome:comparisonOutcome,originalOutcome:input.anchor.originalOutcome,asWasOutcome:wasResult?.semanticOutcome??null,asIsOutcome:isResult?.semanticOutcome??null,
      differenceReferences,reasonCodes:comparisonReasons.sort(compare),
    };

    const divergenceViews=[...divergences].sort((a,b)=>compare(`${a.mode}|${a.reason}|${a.governedReference??''}`,`${b.mode}|${b.reason}|${b.governedReference??''}`)).map(value=>value.toJSON());
    const correctiveReviewRequired=divergences.some(value=>value.reason===LifecycleReplayDivergenceReasonKind.IMPLEMENTATION_DEFECT_DETECTED);
    const reasonCodes=new Set<string>([`COMPARISON_OUTCOME:${comparisonOutcome}`]);
    for(const result of results) for(const reason of result.reasonCodes) reasonCodes.add(reason);
    if(correctiveReviewRequired) reasonCodes.add('CORRECTIVE_REVIEW_REQUIRED');

    return new LifecycleHistoricalReplay({
      anchor:input.anchor.toJSON(),replayedAt:input.replayedAt.toString(),asKnownAt:input.asKnownAt.toString(),requestedModes:[...requestedModes],results,comparison,
      divergenceReasons:divergenceViews,correctiveReviewRequired,correctiveReviewReference,reasonCodes:[...reasonCodes].sort(compare),
      actorId:input.context.actor.id.toString(),correlationId:input.context.correlationId.toString(),accessDecisionReference:input.accessDecision.reference.toString(),accessAuditReference:input.accessDecision.auditReference.toString(),
      authorizationAuthority:false,credentialStateMutated:false,authorizationStateMutated:false,historicalDecisionMutated:false,reevaluationDecisionMutated:false,complianceProjectionMutated:false,assignmentDecisionMutated:false,
      notificationScheduled:false,providerInvoked:false,eventsEmitted:0,physicalDeletionAuthorized:false,
    });
  }
}
