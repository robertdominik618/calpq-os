const CONTRACT_NAME_PATTERN = /^[A-Z][A-Z0-9_]{2,127}$/;

abstract class ContractName {
  readonly #value: string;

  protected constructor(value: string) {
    if (typeof value !== 'string' || !CONTRACT_NAME_PATTERN.test(value)) {
      throw new TypeError('Contract name must be a stable uppercase semantic identifier');
    }
    this.#value = value;
    Object.freeze(this);
  }

  toString(): string {
    return this.#value;
  }

  toJSON(): string {
    return this.#value;
  }
}

export class CommandType extends ContractName {
  declare private readonly __commandTypeBrand: void;
  private constructor(value: string) { super(value); }
  static from(value: string): CommandType { return new CommandType(value); }
}

export class EventType extends ContractName {
  declare private readonly __eventTypeBrand: void;
  private constructor(value: string) { super(value); }
  static from(value: string): EventType { return new EventType(value); }
}

export class AggregateType extends ContractName {
  declare private readonly __aggregateTypeBrand: void;
  private constructor(value: string) { super(value); }
  static from(value: string): AggregateType { return new AggregateType(value); }
}
