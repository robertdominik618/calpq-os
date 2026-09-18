import type { RenewalCaseDefinition, RenewalEvidencePackage, RenewalCaseGrant, RenewalExternalObservation, RenewalCaseCommand, RenewalCaseHistory, RenewalCaseInvocation } from '../src/lifecycle/renewal-case.ts';
declare const d:RenewalCaseDefinition,p:RenewalEvidencePackage,g:RenewalCaseGrant,o:RenewalExternalObservation,c:RenewalCaseCommand,h:RenewalCaseHistory,i:RenewalCaseInvocation;
const next:RenewalCaseHistory=h.apply({command:c,invocation:i});void next;
// @ts-expect-error immutable case ID
d.id='changed';
// @ts-expect-error immutable basis
d.basis=d.basis;
// @ts-expect-error required claims readonly
d.requiredClaims.push('claim:other');
// @ts-expect-error occurrences readonly
d.requiredOccurrences.push(d.requiredOccurrences[0]!);
// @ts-expect-error package reference immutable
p.reference='changed';
// @ts-expect-error package evidence immutable
p.evidenceSnapshot=p.evidenceSnapshot;
// @ts-expect-error projection collection readonly
p.obligationProjections.push(p.obligationProjections[0]!);
// @ts-expect-error grant actor immutable
g.actor=g.grantedBy;
// @ts-expect-error grant permissions readonly
g.permissions.push('CANCEL');
// @ts-expect-error external observation immutable
o.submissionReference='changed';
// @ts-expect-error requested claims readonly
o.requestedClaims.push('claim:other');
// @ts-expect-error command expected revision immutable
c.expectedRevision=2;
// @ts-expect-error command payload immutable
c.change={kind:'CANCEL'};
// @ts-expect-error history revision immutable
h.revision=999;
// @ts-expect-error history append only through apply
h.records.push(h.records[0]!);
// @ts-expect-error serialized records readonly
h.toJSON().records.push(h.toJSON().records[0]!);
