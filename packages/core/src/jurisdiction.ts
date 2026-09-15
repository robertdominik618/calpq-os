export const JurisdictionCode = {
  EUROPEAN_UNION: 'EU',
  CZECH_REPUBLIC: 'CZ',
  CZECH_PRAGUE: 'CZ-10',
  CZECH_CENTRAL_BOHEMIA: 'CZ-20',
} as const;
export type JurisdictionCode = (typeof JurisdictionCode)[keyof typeof JurisdictionCode];

export const JurisdictionScope = {
  SUPRANATIONAL: 'SUPRANATIONAL',
  STATE: 'STATE',
  SUBNATIONAL: 'SUBNATIONAL',
} as const;
export type JurisdictionScope = (typeof JurisdictionScope)[keyof typeof JurisdictionScope];

const JURISDICTIONS: Readonly<Record<JurisdictionCode, JurisdictionScope>> = Object.freeze({
  EU: JurisdictionScope.SUPRANATIONAL,
  CZ: JurisdictionScope.STATE,
  'CZ-10': JurisdictionScope.SUBNATIONAL,
  'CZ-20': JurisdictionScope.SUBNATIONAL,
});

export class Jurisdiction {
  readonly code: JurisdictionCode;
  readonly scope: JurisdictionScope;

  private constructor(code: JurisdictionCode, scope: JurisdictionScope) {
    this.code = code;
    this.scope = scope;
    Object.freeze(this);
  }

  static fromCode(value: string): Jurisdiction {
    if (typeof value !== 'string' || !Object.prototype.hasOwnProperty.call(JURISDICTIONS, value)) {
      throw new TypeError('Jurisdiction must be a controlled code');
    }

    const code = value as JurisdictionCode;
    return new Jurisdiction(code, JURISDICTIONS[code]);
  }

  toString(): string {
    return this.code;
  }

  toJSON(): { readonly code: JurisdictionCode; readonly scope: JurisdictionScope } {
    return { code: this.code, scope: this.scope };
  }
}
