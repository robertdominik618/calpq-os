const UUID_V7_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

abstract class UuidV7Value {
  readonly #value: string;

  protected constructor(value: string) {
    if (typeof value !== 'string') {
      throw new TypeError('UUIDv7 value must be a string');
    }

    const canonical = value.toLowerCase();
    if (!UUID_V7_PATTERN.test(canonical)) {
      throw new TypeError('Expected an RFC 9562 UUIDv7 value');
    }

    this.#value = canonical;
    Object.freeze(this);
  }

  toString(): string {
    return this.#value;
  }

  toJSON(): string {
    return this.#value;
  }
}

export class ActorId extends UuidV7Value {
  declare private readonly __actorIdBrand: void;
  private constructor(value: string) { super(value); }
  static from(value: string): ActorId { return new ActorId(value); }
}

export class SubjectId extends UuidV7Value {
  declare private readonly __subjectIdBrand: void;
  private constructor(value: string) { super(value); }
  static from(value: string): SubjectId { return new SubjectId(value); }
}

export class CredentialId extends UuidV7Value {
  declare private readonly __credentialIdBrand: void;
  private constructor(value: string) { super(value); }
  static from(value: string): CredentialId { return new CredentialId(value); }
}

export class CredentialDefinitionId extends UuidV7Value {
  declare private readonly __credentialDefinitionIdBrand: void;
  private constructor(value: string) { super(value); }
  static from(value: string): CredentialDefinitionId { return new CredentialDefinitionId(value); }
}

export class RequirementSetId extends UuidV7Value {
  declare private readonly __requirementSetIdBrand: void;
  private constructor(value: string) { super(value); }
  static from(value: string): RequirementSetId { return new RequirementSetId(value); }
}

export class EligibilityAssessmentId extends UuidV7Value {
  declare private readonly __eligibilityAssessmentIdBrand: void;
  private constructor(value: string) { super(value); }
  static from(value: string): EligibilityAssessmentId { return new EligibilityAssessmentId(value); }
}

export class CredentialArtifactId extends UuidV7Value {
  declare private readonly __credentialArtifactIdBrand: void;
  private constructor(value: string) { super(value); }
  static from(value: string): CredentialArtifactId { return new CredentialArtifactId(value); }
}

export class EvidenceId extends UuidV7Value {
  declare private readonly __evidenceIdBrand: void;
  private constructor(value: string) { super(value); }
  static from(value: string): EvidenceId { return new EvidenceId(value); }
}

export class SourceId extends UuidV7Value {
  declare private readonly __sourceIdBrand: void;
  private constructor(value: string) { super(value); }
  static from(value: string): SourceId { return new SourceId(value); }
}

export class DecisionId extends UuidV7Value {
  declare private readonly __decisionIdBrand: void;
  private constructor(value: string) { super(value); }
  static from(value: string): DecisionId { return new DecisionId(value); }
}

export class RuleSetId extends UuidV7Value {
  declare private readonly __ruleSetIdBrand: void;
  private constructor(value: string) { super(value); }
  static from(value: string): RuleSetId { return new RuleSetId(value); }
}

export class EventId extends UuidV7Value {
  declare private readonly __eventIdBrand: void;
  private constructor(value: string) { super(value); }
  static from(value: string): EventId { return new EventId(value); }
}

export class CommandId extends UuidV7Value {
  declare private readonly __commandIdBrand: void;
  private constructor(value: string) { super(value); }
  static from(value: string): CommandId { return new CommandId(value); }
}

export class AggregateId extends UuidV7Value {
  declare private readonly __aggregateIdBrand: void;
  private constructor(value: string) { super(value); }
  static from(value: string): AggregateId { return new AggregateId(value); }
}

export class CorrelationId extends UuidV7Value {
  declare private readonly __correlationIdBrand: void;
  private constructor(value: string) { super(value); }
  static from(value: string): CorrelationId { return new CorrelationId(value); }
}
