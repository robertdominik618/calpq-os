function normalizeReference(value: string, label: string): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > 256) throw new RangeError(`${label} is too long`);
  return normalized;
}

abstract class ApplicationReference {
  readonly #value: string;

  protected constructor(value: string, label: string) {
    this.#value = normalizeReference(value, label);
    Object.freeze(this);
  }

  toString(): string {
    return this.#value;
  }

  toJSON(): string {
    return this.#value;
  }
}

export class ApplicationOperationReference extends ApplicationReference {
  private constructor(value: string) { super(value, 'Operation reference'); }
  static from(value: string): ApplicationOperationReference { return new ApplicationOperationReference(value); }
}

export class TenantScopeReference extends ApplicationReference {
  private constructor(value: string) { super(value, 'Tenant scope reference'); }
  static from(value: string): TenantScopeReference { return new TenantScopeReference(value); }
}

export class OrganizationScopeReference extends ApplicationReference {
  private constructor(value: string) { super(value, 'Organization scope reference'); }
  static from(value: string): OrganizationScopeReference { return new OrganizationScopeReference(value); }
}

export class AccessDecisionReference extends ApplicationReference {
  private constructor(value: string) { super(value, 'Access decision reference'); }
  static from(value: string): AccessDecisionReference { return new AccessDecisionReference(value); }
}

export class PurposeReference extends ApplicationReference {
  private constructor(value: string) { super(value, 'Purpose reference'); }
  static from(value: string): PurposeReference { return new PurposeReference(value); }
}
