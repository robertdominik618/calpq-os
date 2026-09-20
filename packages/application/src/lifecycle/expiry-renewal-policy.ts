import { ActorReference, CredentialDefinitionReference, DateOnly, Jurisdiction, SourceReference, UtcInstant, VersionId } from '../../../core/src/index.ts';
import { ApplicationExecutionContext } from '../application-execution-context.ts';
import { AccessDisposition, TenantAccessDecision, TenantAccessDeniedError, TenantBoundary, TenantContext } from '../tenant/tenant-governance.ts';
import { CredentialLifecycleBasis } from './credential-lifecycle-timeline.ts';

export const EXPIRY_RENEWAL_OPERATION = 'credential.lifecycle.policy.evaluate';
export const EXPIRY_RENEWAL_FIELD = 'credential:expiry-renewal-policy';
export type CalendarUnit = 'DAYS' | 'MONTHS' | 'YEARS';
export type MonthEndConvention = 'CLAMP' | 'REJECT';
type DeepReadonly<T> = T extends readonly (infer U)[] ? readonly DeepReadonly<U>[] : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;
type Mutable<T> = { -readonly [K in keyof T]: T[K] };

function opaque(value: string): string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/.test(value)) throw new TypeError('Bounded opaque reference required');
  return value;
}
function instant(value: UtcInstant): number {
  if (!(value instanceof UtcInstant)) throw new TypeError('Explicit UtcInstant required');
  return value.toEpochMilliseconds();
}
function date(value: DateOnly): string {
  if (!(value instanceof DateOnly)) throw new TypeError('Explicit DateOnly required');
  const text = value.toString();
  if (Number(text.slice(0,4)) < 1) throw new RangeError('Supported calendar years are 0001 through 9999');
  return text;
}
function same(a: {toString(): string}, b: {toString(): string}): boolean { return a.toString() === b.toString(); }
function compare(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0; }
function freeze<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value as Record<string, unknown>)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
function exact(value: unknown, keys: readonly string[]): void {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Controlled rule record required');
  if (Object.keys(value).sort().join('|') !== [...keys].sort().join('|')) throw new TypeError('Unexpected or missing rule fields');
}
function integer(value: number, minimum: number, maximum: number): void {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) throw new RangeError('Calendar quantity outside explicit bounds');
}
function leap(year: number): boolean { return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0); }
function monthDays(year: number, month: number): number { return [31,leap(year)?29:28,31,30,31,30,31,31,30,31,30,31][month-1]!; }
function beforeYear(year: number): number { const y=year-1; return 365*y+Math.floor(y/4)-Math.floor(y/100)+Math.floor(y/400); }
function parts(value: DateOnly): readonly [number, number, number] {
  const text=date(value); return [Number(text.slice(0,4)),Number(text.slice(5,7)),Number(text.slice(8,10))];
}
function fromParts(year: number, month: number, day: number): DateOnly {
  integer(year,1,9999);
  return DateOnly.from(`${String(year).padStart(4,'0')}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`);
}
function ordinal(year: number, month: number, day: number): number {
  let result=beforeYear(year)+day;
  for(let m=1;m<month;m++) result+=monthDays(year,m);
  return result;
}
function fromOrdinal(value: number): DateOnly {
  integer(value,1,beforeYear(10000));
  let low=1,high=9999;
  while(low<high){const middle=Math.floor((low+high+1)/2);if(beforeYear(middle)<value)low=middle;else high=middle-1;}
  let remaining=value-beforeYear(low),month=1;
  while(remaining>monthDays(low,month)){remaining-=monthDays(low,month);month++;}
  return fromParts(low,month,remaining);
}

/** Pure Gregorian arithmetic, not a legal duration rule or a DateOnly-to-instant conversion. */
export function shiftLifecycleDate(value: DateOnly, amount: number, unit: CalendarUnit, monthEnd: MonthEndConvention): DateOnly {
  const [year,month,day]=parts(value);
  if (!['DAYS','MONTHS','YEARS'].includes(unit) || !['CLAMP','REJECT'].includes(monthEnd)) throw new TypeError('Explicit calendar unit and month-end convention required');
  const maximum=unit==='DAYS'?365250:unit==='MONTHS'?12000:1000;
  integer(amount,-maximum,maximum);
  if(unit==='DAYS')return fromOrdinal(ordinal(year,month,day)+amount);
  const index=(year-1)*12+(month-1)+amount*(unit==='YEARS'?12:1);
  integer(index,0,9999*12-1);
  const targetYear=Math.floor(index/12)+1,targetMonth=index%12+1,maximumDay=monthDays(targetYear,targetMonth);
  if(day>maximumDay && monthEnd==='REJECT')throw new RangeError('Explicit month-end adjustment required');
  return fromParts(targetYear,targetMonth,Math.min(day,maximumDay));
}

export type ExpiryRule =
  | {readonly kind:'DECLARED_EXPIRES_ON'}
  | {readonly kind:'NO_FIXED_EXPIRY'}
  | {readonly kind:'AFTER_ANCHOR'; readonly anchor:'ISSUED_ON'|'EFFECTIVE_FROM'; readonly amount:number; readonly unit:CalendarUnit; readonly monthEnd:MonthEndConvention; readonly boundary:'ANNIVERSARY_DATE'|'PREVIOUS_DAY'};
export type RenewalRule =
  | {readonly mode:'NOT_REQUIRED'}
  | {readonly mode:'UNKNOWN'}
  | {readonly mode:'WINDOW'; readonly opensDaysBeforeExpiry:number; readonly dueDaysBeforeExpiry:number; readonly graceDaysAfterDue:number};

function expiryRule(rule: ExpiryRule): ExpiryRule {
  if (rule === null || typeof rule !== 'object') throw new TypeError('Expiry rule required');
  if (rule.kind==='DECLARED_EXPIRES_ON' || rule.kind==='NO_FIXED_EXPIRY') exact(rule,['kind']);
  else if (rule.kind==='AFTER_ANCHOR') {
    exact(rule,['kind','anchor','amount','unit','monthEnd','boundary']);
    if(!['ISSUED_ON','EFFECTIVE_FROM'].includes(rule.anchor) || !['DAYS','MONTHS','YEARS'].includes(rule.unit) || !['CLAMP','REJECT'].includes(rule.monthEnd) || !['ANNIVERSARY_DATE','PREVIOUS_DAY'].includes(rule.boundary))throw new TypeError('Uncontrolled expiry rule');
    integer(rule.amount,1,rule.unit==='DAYS'?365250:rule.unit==='MONTHS'?12000:1000);
  } else throw new TypeError('Unsupported expiry rule');
  return Object.freeze({...rule});
}
function renewalRule(rule: RenewalRule): RenewalRule {
  if(rule===null || typeof rule!=='object')throw new TypeError('Renewal rule required');
  if(rule.mode==='NOT_REQUIRED'||rule.mode==='UNKNOWN')exact(rule,['mode']);
  else if(rule.mode==='WINDOW'){
    exact(rule,['mode','opensDaysBeforeExpiry','dueDaysBeforeExpiry','graceDaysAfterDue']);
    for(const amount of [rule.opensDaysBeforeExpiry,rule.dueDaysBeforeExpiry,rule.graceDaysAfterDue])integer(amount,0,365250);
    if(rule.opensDaysBeforeExpiry<rule.dueDaysBeforeExpiry)throw new RangeError('Window cannot open after due date');
  }else throw new TypeError('Unsupported renewal rule');
  return Object.freeze({...rule});
}

export interface ExpiryRenewalPolicyInput {
  readonly id:string;
  readonly version:VersionId;
  readonly credentialDefinition:CredentialDefinitionReference;
  readonly jurisdiction:Jurisdiction;
  readonly validFrom:DateOnly;
  readonly validTo:DateOnly|null;
  readonly knownAt:UtcInstant;
  readonly source:SourceReference;
  readonly sourceSnapshotReference:string;
  readonly approvedAt:UtcInstant;
  readonly approvedBy:ActorReference;
  readonly approvalReference:string;
  readonly conditions:readonly string[];
  readonly expiry:ExpiryRule;
  readonly renewal:RenewalRule;
}

/** An approved scheduling-policy snapshot. Construction validates consistency, not authenticity. */
export class ExpiryRenewalPolicy {
  readonly id!:string;
  readonly version!:VersionId;
  readonly credentialDefinition!:CredentialDefinitionReference;
  readonly jurisdiction!:Jurisdiction;
  readonly validFrom!:DateOnly;
  readonly validTo!:DateOnly|null;
  readonly knownAt!:UtcInstant;
  readonly source!:SourceReference;
  readonly sourceSnapshotReference!:string;
  readonly approvedAt!:UtcInstant;
  readonly approvedBy!:ActorReference;
  readonly approvalReference!:string;
  readonly conditions!:readonly string[];
  readonly expiry!:ExpiryRule;
  readonly renewal!:RenewalRule;
  private constructor(input:ExpiryRenewalPolicyInput){Object.assign(this,input);Object.freeze(this);}
  static create(input:ExpiryRenewalPolicyInput):ExpiryRenewalPolicy {
    if(!(input.version instanceof VersionId)||!(input.credentialDefinition instanceof CredentialDefinitionReference)||!(input.jurisdiction instanceof Jurisdiction)||!(input.source instanceof SourceReference)||!(input.approvedBy instanceof ActorReference))throw new TypeError('Governed policy version, target, source and approval required');
    const start=date(input.validFrom),end=input.validTo===null?null:date(input.validTo),known=instant(input.knownAt);
    if(end!==null&&start>end)throw new RangeError('Inverted policy effectivity');
    if(instant(input.source.retrievedAt)>known||instant(input.approvedAt)>known)throw new RangeError('Policy knowledge predates source or approval');
    if(!Array.isArray(input.conditions)||input.conditions.length>1000)throw new TypeError('Bounded policy conditions required');
    const conditions=Array.from(input.conditions).map(opaque).sort(compare);
    if(new Set(conditions).size!==conditions.length)throw new TypeError('Duplicate policy conditions');
    return new ExpiryRenewalPolicy({id:opaque(input.id),version:input.version,credentialDefinition:input.credentialDefinition,jurisdiction:input.jurisdiction,validFrom:input.validFrom,validTo:input.validTo,knownAt:input.knownAt,source:input.source,sourceSnapshotReference:opaque(input.sourceSnapshotReference),approvedAt:input.approvedAt,approvedBy:input.approvedBy,approvalReference:opaque(input.approvalReference),conditions:Object.freeze(conditions),expiry:expiryRule(input.expiry),renewal:renewalRule(input.renewal)});
  }
  toJSON(){return freeze({id:this.id,version:this.version.toString(),credentialDefinition:{id:this.credentialDefinition.id.toString(),version:this.credentialDefinition.version.toString()},jurisdiction:this.jurisdiction.toString(),validFrom:this.validFrom.toString(),validTo:this.validTo?.toString()??null,knownAt:this.knownAt.toString(),sourceSnapshotReference:this.sourceSnapshotReference,approvedAt:this.approvedAt.toString(),approvedById:this.approvedBy.id.toString(),approvalReference:this.approvalReference,conditions:[...this.conditions],expiry:{...this.expiry},renewal:{...this.renewal},source:{id:this.source.id.toString(),version:this.source.version.toString(),authorityId:this.source.authority.id.toString(),jurisdiction:this.source.jurisdiction.toString(),retrievedAt:this.source.retrievedAt.toString(),verificationState:this.source.verificationState.toString(),effectiveFrom:this.source.effectiveFrom?.toString()??null,effectiveTo:this.source.effectiveTo?.toString()??null,hash:this.source.contentHash?.toString()??null}});}
}

export class LifecycleCalendarContext {
  readonly evaluatedAt:UtcInstant;
  readonly evaluatedOn:DateOnly;
  readonly utcOffsetMinutes:number;
  readonly calendarReference:string;
  private constructor(input:{readonly evaluatedAt:UtcInstant;readonly evaluatedOn:DateOnly;readonly utcOffsetMinutes:number;readonly calendarReference:string}){this.evaluatedAt=input.evaluatedAt;this.evaluatedOn=input.evaluatedOn;this.utcOffsetMinutes=input.utcOffsetMinutes;this.calendarReference=opaque(input.calendarReference);Object.freeze(this);}
  static create(input:{readonly evaluatedAt:UtcInstant;readonly evaluatedOn:DateOnly;readonly utcOffsetMinutes:number;readonly calendarReference:string}):LifecycleCalendarContext {
    const epoch=instant(input.evaluatedAt),calendarDay=date(input.evaluatedOn);
    integer(input.utcOffsetMinutes,-840,840);
    const offsetDay=UtcInstant.fromEpochMilliseconds(epoch+input.utcOffsetMinutes*60_000).toString().slice(0,10);
    if(calendarDay!==offsetDay)throw new RangeError('Calendar day does not match explicit instant and offset');
    return new LifecycleCalendarContext(input);
  }
  toJSON(){return freeze({evaluatedAt:this.evaluatedAt.toString(),evaluatedOn:this.evaluatedOn.toString(),utcOffsetMinutes:this.utcOffsetMinutes,calendarReference:this.calendarReference,precision:'DATE_ONLY' as const});}
}

export interface ExpiryRenewalEvaluationInput {
  readonly evaluationReference:string;
  readonly context:ApplicationExecutionContext;
  readonly authorizedContext:TenantContext;
  readonly boundary:TenantBoundary;
  readonly accessDecision:TenantAccessDecision;
  readonly basis:CredentialLifecycleBasis;
  readonly jurisdiction:Jurisdiction;
  readonly calendar:LifecycleCalendarContext;
  readonly policyEffectiveOn:DateOnly;
  readonly selectionBasisReference:string;
  readonly asKnownAt:UtcInstant;
  readonly policies:readonly ExpiryRenewalPolicy[];
}
interface CalculationStep {readonly operation:string;readonly inputs:readonly string[];readonly output:string|null;}
export interface ExpiryRenewalEvaluationView {
  readonly evaluationReference:string;
  readonly basis:DeepReadonly<ReturnType<CredentialLifecycleBasis['toJSON']>>;
  readonly calendar:DeepReadonly<ReturnType<LifecycleCalendarContext['toJSON']>>;
  readonly asKnownAt:string;
  readonly policyEffectiveOn:string;
  readonly selectionBasisReference:string;
  readonly readerId:string;
  readonly correlationId:string;
  readonly accessDecisionReference:string;
  readonly accessAuditReference:string;
  readonly outcome:'EVALUATED'|'INDETERMINATE'|'REVIEW_REQUIRED';
  readonly policy:DeepReadonly<ReturnType<ExpiryRenewalPolicy['toJSON']>>|null;
  readonly candidatePolicies:readonly Readonly<{id:string;version:string}>[];
  readonly expiryRelation:'BEFORE_EXPIRY'|'ON_EXPIRY_DATE'|'AFTER_EXPIRY'|'NO_FIXED_EXPIRY'|'UNKNOWN';
  readonly renewalState:'NOT_YET_OPEN'|'OPEN'|'DUE_TODAY'|'OVERDUE_WITHIN_GRACE'|'OVERDUE'|'NOT_REQUIRED'|'UNKNOWN';
  readonly declaredExpiryOn:string|null;
  readonly calculatedExpiryOn:string|null;
  readonly expiryOn:string|null;
  readonly windowOpensOn:string|null;
  readonly renewalDueOn:string|null;
  readonly graceEndsOn:string|null;
  readonly reasonCodes:readonly string[];
  readonly trace:readonly CalculationStep[];
  readonly legalValidityDetermined:false;
  readonly authorizationAuthority:false;
  readonly renewalPerformed:false;
  readonly notificationScheduled:false;
  readonly eventsEmitted:0;
}

function assertReader(input:ExpiryRenewalEvaluationInput):void {
  const c=input.context,reader=input.authorizedContext,a=input.accessDecision;
  if(!(c instanceof ApplicationExecutionContext)||!(reader instanceof TenantContext)||!(input.boundary instanceof TenantBoundary)||!(a instanceof TenantAccessDecision))throw new TenantAccessDeniedError();
  input.boundary.assertKnown(reader);
  if(c.tenantScope===null||c.organizationScope===null||c.subject===null||c.purpose===null||c.accessDecision===null||c.operation.toString()!==EXPIRY_RENEWAL_OPERATION)throw new TenantAccessDeniedError();
  if(!same(c.tenantScope,reader.tenant)||!same(c.organizationScope,reader.organization)||!same(c.purpose,reader.purpose)||!same(c.actor.id,reader.actor.id)||c.actor.kind!==reader.actor.kind||!same(c.correlationId,reader.correlationId))throw new TenantAccessDeniedError();
  if(a.disposition!==AccessDisposition.ALLOW||!same(a.tenant,reader.tenant)||!same(a.purpose,reader.purpose)||!same(a.reference,c.accessDecision)||!a.allowedFields.includes(EXPIRY_RENEWAL_FIELD))throw new TenantAccessDeniedError();
  const basis=input.basis;
  if(!(basis instanceof CredentialLifecycleBasis)||!(input.jurisdiction instanceof Jurisdiction))throw new TenantAccessDeniedError();
  if(!same(basis.tenant,reader.tenant)||!same(basis.organization,reader.organization)||!same(basis.purpose,reader.purpose)||!same(basis.artifact.subject!.id,c.subject.id)||basis.artifact.subject!.kind!==c.subject.kind||!same(basis.jurisdiction,input.jurisdiction))throw new TenantAccessDeniedError();
}

/** Calendar projection only. Never emits a domain transition, notification or renewal command. */
export class ExpiryRenewalEvaluation {
  readonly #view:ExpiryRenewalEvaluationView;
  private constructor(view:ExpiryRenewalEvaluationView){this.#view=freeze(view);Object.freeze(this);}
  toJSON():ExpiryRenewalEvaluationView{return this.#view;}
  static evaluate(input:ExpiryRenewalEvaluationInput):ExpiryRenewalEvaluation {
    assertReader(input);
    if(!(input.calendar instanceof LifecycleCalendarContext))throw new TypeError('Governed calendar context required');
    const known=instant(input.asKnownAt),requested=instant(input.context.requestedAt);
    if(known>requested||instant(input.calendar.evaluatedAt)>requested||instant(input.basis.recordedAt)>known)throw new RangeError('Evaluation exceeds invocation or knowledge horizon');
    const selectionDay=date(input.policyEffectiveOn),today=date(input.calendar.evaluatedOn);
    if(selectionDay>today)throw new RangeError('Future policy applicability requires a separate simulation');
    if(!Array.isArray(input.policies)||input.policies.length>1000)throw new TypeError('Bounded policy candidates required');
    const all=Array.from(input.policies);
    if(!all.every(p=>p instanceof ExpiryRenewalPolicy))throw new TypeError('Dense governed policy candidates required');
    const relevant=all.filter(p=>instant(p.knownAt)<=known&&same(p.credentialDefinition.id,input.basis.credentialDefinition.id)&&same(p.credentialDefinition.version,input.basis.credentialDefinition.version)&&same(p.jurisdiction,input.jurisdiction));
    const key=(p:ExpiryRenewalPolicy)=>JSON.stringify([p.id,p.version.toString()]);
    if(new Set(relevant.map(key)).size!==relevant.length)throw new TypeError('Duplicate visible policy/version identity');
    const selected=relevant.filter(p=>p.validFrom.toString()<=selectionDay&&(p.validTo===null||p.validTo.toString()>=selectionDay)).sort((a,b)=>compare(key(a),key(b)));
    const reasons:string[]=[],trace:CalculationStep[]=[];
    const artifact=input.basis.artifact;
    const data:Mutable<ExpiryRenewalEvaluationView>={evaluationReference:opaque(input.evaluationReference),basis:input.basis.toJSON(),calendar:input.calendar.toJSON(),asKnownAt:input.asKnownAt.toString(),policyEffectiveOn:selectionDay,selectionBasisReference:opaque(input.selectionBasisReference),readerId:input.context.actor.id.toString(),correlationId:input.context.correlationId.toString(),accessDecisionReference:input.accessDecision.reference.toString(),accessAuditReference:input.accessDecision.auditReference.toString(),outcome:'INDETERMINATE',policy:null,candidatePolicies:selected.map(p=>({id:p.id,version:p.version.toString()})),expiryRelation:'UNKNOWN',renewalState:'UNKNOWN',declaredExpiryOn:artifact.expiresOn?.toString()??null,calculatedExpiryOn:null,expiryOn:null,windowOpensOn:null,renewalDueOn:null,graceEndsOn:null,reasonCodes:reasons,trace,legalValidityDetermined:false,authorizationAuthority:false,renewalPerformed:false,notificationScheduled:false,eventsEmitted:0};
    const finish=(outcome:ExpiryRenewalEvaluationView['outcome'],reason?:string):ExpiryRenewalEvaluation=>{data.outcome=outcome;if(reason)reasons.push(reason);data.reasonCodes=[...new Set(reasons)].sort(compare);return new ExpiryRenewalEvaluation(data);};
    if(selected.length===0)return finish('INDETERMINATE','NO_APPLICABLE_POLICY');
    if(selected.length!==1)return finish('REVIEW_REQUIRED','POLICY_AMBIGUOUS');
    const policy=selected[0]!;data.policy=policy.toJSON();
    if(policy.source.verificationState.toString()!=='VERIFIED')reasons.push('POLICY_SOURCE_UNVERIFIED');
    if(!same(policy.source.jurisdiction,policy.jurisdiction))reasons.push('POLICY_SOURCE_JURISDICTION_MISMATCH');
    if((policy.source.effectiveFrom!==null&&policy.source.effectiveFrom.toString()>selectionDay)||(policy.source.effectiveTo!==null&&policy.source.effectiveTo.toString()<selectionDay))reasons.push('POLICY_SOURCE_OUTSIDE_EFFECTIVITY');
    if(policy.conditions.length>0)reasons.push('POLICY_CONDITIONS_UNRESOLVED');
    if(artifact.verificationState.toString()!=='VERIFIED')reasons.push('ARTIFACT_FACTS_UNVERIFIED');
    if(reasons.length>0)return finish('REVIEW_REQUIRED');
    let expiry:DateOnly|null=null;
    if(policy.expiry.kind==='NO_FIXED_EXPIRY'){
      if(artifact.expiresOn!==null)return finish('REVIEW_REQUIRED','EXPIRY_DATE_CONFLICT');
      data.expiryRelation='NO_FIXED_EXPIRY';trace.push({operation:'EXPLICIT_NO_FIXED_EXPIRY',inputs:[policy.id,policy.version.toString()],output:null});
    }else if(policy.expiry.kind==='DECLARED_EXPIRES_ON'){
      if(artifact.expiresOn===null)return finish('INDETERMINATE','DECLARED_EXPIRY_MISSING');
      expiry=artifact.expiresOn;trace.push({operation:'DECLARED_EXPIRES_ON',inputs:[input.basis.snapshotReference],output:expiry.toString()});
    }else{
      const rule=policy.expiry,anchor=rule.anchor==='ISSUED_ON'?artifact.issuedOn:artifact.effectiveFrom;
      if(anchor===null)return finish('INDETERMINATE','EXPIRY_ANCHOR_MISSING');
      try{
        expiry=shiftLifecycleDate(anchor,rule.amount,rule.unit,rule.monthEnd);
        trace.push({operation:'CALENDAR_SHIFT',inputs:[rule.anchor,anchor.toString(),String(rule.amount),rule.unit,rule.monthEnd],output:expiry.toString()});
        if(rule.boundary==='PREVIOUS_DAY'){expiry=shiftLifecycleDate(expiry,-1,'DAYS','REJECT');trace.push({operation:'PREVIOUS_DAY',inputs:['-1','DAYS'],output:expiry.toString()});}
      }catch(error){if(error instanceof RangeError)return finish('REVIEW_REQUIRED','CALENDAR_ADJUSTMENT_REQUIRED');throw error;}
      data.calculatedExpiryOn=expiry.toString();
      if(artifact.expiresOn!==null&&!same(artifact.expiresOn,expiry))return finish('REVIEW_REQUIRED','EXPIRY_DATE_CONFLICT');
      if([artifact.issuedOn,artifact.effectiveFrom].some(start=>start!==null&&start.toString()>expiry!.toString()))return finish('REVIEW_REQUIRED','EXPIRY_BEFORE_ARTIFACT_START');
    }
    if(expiry!==null){data.expiryOn=expiry.toString();data.expiryRelation=today<data.expiryOn?'BEFORE_EXPIRY':today===data.expiryOn?'ON_EXPIRY_DATE':'AFTER_EXPIRY';}
    if(policy.renewal.mode==='UNKNOWN')return finish('INDETERMINATE','RENEWAL_RULE_UNKNOWN');
    if(policy.renewal.mode==='NOT_REQUIRED'){data.renewalState='NOT_REQUIRED';return finish('EVALUATED','EXPLICIT_POLICY_EVALUATED');}
    if(expiry===null)return finish('INDETERMINATE','RENEWAL_EXPIRY_ANCHOR_MISSING');
    const window=policy.renewal;
    try{
      const opens=shiftLifecycleDate(expiry,-window.opensDaysBeforeExpiry,'DAYS','REJECT');
      const due=shiftLifecycleDate(expiry,-window.dueDaysBeforeExpiry,'DAYS','REJECT');
      const grace=shiftLifecycleDate(due,window.graceDaysAfterDue,'DAYS','REJECT');
      data.windowOpensOn=opens.toString();data.renewalDueOn=due.toString();data.graceEndsOn=grace.toString();
      trace.push({operation:'RENEWAL_OPENS',inputs:[expiry.toString(),String(-window.opensDaysBeforeExpiry),'DAYS'],output:opens.toString()},{operation:'RENEWAL_DUE',inputs:[expiry.toString(),String(-window.dueDaysBeforeExpiry),'DAYS'],output:due.toString()},{operation:'RENEWAL_GRACE_END_NOT_VALIDITY_EXTENSION',inputs:[due.toString(),String(window.graceDaysAfterDue),'DAYS'],output:grace.toString()});
      data.renewalState=today<opens.toString()?'NOT_YET_OPEN':today<due.toString()?'OPEN':today===due.toString()?'DUE_TODAY':today<=grace.toString()?'OVERDUE_WITHIN_GRACE':'OVERDUE';
    }catch(error){if(error instanceof RangeError)return finish('REVIEW_REQUIRED','CALENDAR_ADJUSTMENT_REQUIRED');throw error;}
    return finish('EVALUATED','EXPLICIT_POLICY_EVALUATED');
  }
}
