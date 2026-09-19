import { ActorId, SubjectId } from './ids.ts';

export const ActorKind = {
  HUMAN_USER: 'HUMAN_USER',
  ORGANIZATION: 'ORGANIZATION',
  SYSTEM_PROCESS: 'SYSTEM_PROCESS',
  EXTERNAL_AUTHORITY: 'EXTERNAL_AUTHORITY',
} as const;
export type ActorKind = (typeof ActorKind)[keyof typeof ActorKind];
const ACTOR_KINDS = new Set<string>(Object.values(ActorKind));

export const SubjectKind = {
  PERSON: 'PERSON',
  ORGANIZATION: 'ORGANIZATION',
  ASSET: 'ASSET',
  DOMAIN_OBJECT: 'DOMAIN_OBJECT',
} as const;
export type SubjectKind = (typeof SubjectKind)[keyof typeof SubjectKind];
const SUBJECT_KINDS = new Set<string>(Object.values(SubjectKind));

export class ActorReference {
  readonly id: ActorId;
  readonly kind: ActorKind;

  private constructor(id: ActorId, kind: ActorKind) {
    this.id = id;
    this.kind = kind;
    Object.freeze(this);
  }

  static create(id: ActorId, kind: ActorKind): ActorReference {
    if (!(id instanceof ActorId)) {
      throw new TypeError('Actor reference requires ActorId');
    }
    if (!ACTOR_KINDS.has(kind)) {
      throw new TypeError('Actor kind is not controlled');
    }
    return new ActorReference(id, kind);
  }

  toJSON(): { readonly referenceType: 'ACTOR'; readonly id: string; readonly kind: ActorKind } {
    return { referenceType: 'ACTOR', id: this.id.toString(), kind: this.kind };
  }
}

export class SubjectReference {
  readonly id: SubjectId;
  readonly kind: SubjectKind;

  private constructor(id: SubjectId, kind: SubjectKind) {
    this.id = id;
    this.kind = kind;
    Object.freeze(this);
  }

  static create(id: SubjectId, kind: SubjectKind): SubjectReference {
    if (!(id instanceof SubjectId)) {
      throw new TypeError('Subject reference requires SubjectId');
    }
    if (!SUBJECT_KINDS.has(kind)) {
      throw new TypeError('Subject kind is not controlled');
    }
    return new SubjectReference(id, kind);
  }

  toJSON(): { readonly referenceType: 'SUBJECT'; readonly id: string; readonly kind: SubjectKind } {
    return { referenceType: 'SUBJECT', id: this.id.toString(), kind: this.kind };
  }
}
