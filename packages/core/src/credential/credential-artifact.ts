import {
  CredentialArtifactId,
  DecisionId,
  EventId,
} from '../ids.ts';
import { ActorReference, SubjectReference } from '../party-references.ts';
import { DateOnly } from '../time.ts';
import { VerificationState } from '../verification-state.ts';
import {
  ArtifactFormat,
  CredentialArtifactKind,
  assertArtifactFormat,
  assertCredentialArtifactKind,
} from './artifact-types.ts';
import { EvidenceSnapshot } from './evidence-snapshot.ts';
import { ExternalArtifactReference } from './external-artifact-reference.ts';

export type CredentialArtifactProvenanceReference = DecisionId | EventId;

export interface CredentialArtifactInput {
  readonly id: CredentialArtifactId;
  readonly kind: CredentialArtifactKind;
  readonly format: ArtifactFormat;
  readonly subject?: SubjectReference | null;
  readonly issuer?: ActorReference | null;
  readonly issuedOn?: DateOnly | null;
  readonly effectiveFrom?: DateOnly | null;
  readonly expiresOn?: DateOnly | null;
  readonly verificationState: VerificationState;
  readonly provenanceRefs?: readonly CredentialArtifactProvenanceReference[];
  readonly evidenceSnapshot: EvidenceSnapshot;
  readonly externalReference: ExternalArtifactReference;
}

export class CredentialArtifact {
  readonly id: CredentialArtifactId;
  readonly kind: CredentialArtifactKind;
  readonly format: ArtifactFormat;
  readonly subject: SubjectReference | null;
  readonly issuer: ActorReference | null;
  readonly issuedOn: DateOnly | null;
  readonly effectiveFrom: DateOnly | null;
  readonly expiresOn: DateOnly | null;
  readonly verificationState: VerificationState;
  readonly provenanceRefs: readonly CredentialArtifactProvenanceReference[];
  readonly evidenceSnapshot: EvidenceSnapshot;
  readonly externalReference: ExternalArtifactReference;

  private constructor(input: CredentialArtifactInput) {
    this.id = input.id;
    this.kind = input.kind;
    this.format = input.format;
    this.subject = input.subject ?? null;
    this.issuer = input.issuer ?? null;
    this.issuedOn = input.issuedOn ?? null;
    this.effectiveFrom = input.effectiveFrom ?? null;
    this.expiresOn = input.expiresOn ?? null;
    this.verificationState = input.verificationState;
    this.provenanceRefs = Object.freeze([...(input.provenanceRefs ?? [])]);
    this.evidenceSnapshot = input.evidenceSnapshot;
    this.externalReference = input.externalReference;
    Object.freeze(this);
  }

  static create(input: CredentialArtifactInput): CredentialArtifact {
    if (!(input.id instanceof CredentialArtifactId)) throw new TypeError('CredentialArtifact requires CredentialArtifactId');
    assertCredentialArtifactKind(input.kind);
    assertArtifactFormat(input.format);
    if (input.subject !== undefined && input.subject !== null && !(input.subject instanceof SubjectReference)) {
      throw new TypeError('CredentialArtifact subject must use SubjectReference');
    }
    if (input.issuer !== undefined && input.issuer !== null && !(input.issuer instanceof ActorReference)) {
      throw new TypeError('CredentialArtifact issuer must use ActorReference');
    }
    for (const date of [input.issuedOn, input.effectiveFrom, input.expiresOn]) {
      if (date !== undefined && date !== null && !(date instanceof DateOnly)) {
        throw new TypeError('CredentialArtifact dates must use DateOnly');
      }
    }
    if (!(input.verificationState instanceof VerificationState)) {
      throw new TypeError('CredentialArtifact requires VerificationState');
    }
    if (!(input.evidenceSnapshot instanceof EvidenceSnapshot)) {
      throw new TypeError('CredentialArtifact requires immutable EvidenceSnapshot');
    }
    if (!(input.externalReference instanceof ExternalArtifactReference)) {
      throw new TypeError('CredentialArtifact requires ExternalArtifactReference');
    }
    for (const ref of input.provenanceRefs ?? []) {
      if (!(ref instanceof DecisionId) && !(ref instanceof EventId)) {
        throw new TypeError('CredentialArtifact provenance references must use DecisionId or EventId');
      }
    }

    const issued = input.issuedOn?.toString() ?? null;
    const effective = input.effectiveFrom?.toString() ?? null;
    const expires = input.expiresOn?.toString() ?? null;
    if (issued !== null && expires !== null && issued > expires) {
      throw new RangeError('CredentialArtifact issuance date must not be after expiry date');
    }
    if (effective !== null && expires !== null && effective > expires) {
      throw new RangeError('CredentialArtifact effective date must not be after expiry date');
    }

    return new CredentialArtifact(input);
  }
}
