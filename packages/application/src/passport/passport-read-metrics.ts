import { ProfessionalPassportProjection, PassportAuthorityClass } from './professional-passport.ts';

export interface PassportReadMetrics {
  readonly evidenceCount: number;
  readonly verifiedEvidenceCount: number;
  readonly evidenceOnlyCount: number;
  readonly derivedInformationCount: number;
}

export function summarizePassportAuthorityClasses(passport: ProfessionalPassportProjection): PassportReadMetrics {
  if (!(passport instanceof ProfessionalPassportProjection)) {
    throw new TypeError('Passport read metrics require ProfessionalPassportProjection input');
  }
  if (passport.authorizationAuthority !== false) {
    throw new TypeError('Passport read metrics require a non-authoritative projection');
  }

  let verifiedEvidenceCount = 0;
  let evidenceOnlyCount = 0;
  let derivedInformationCount = 0;

  for (const item of passport.items) {
    switch (item.authorityClass) {
      case PassportAuthorityClass.VERIFIED_EVIDENCE:
        verifiedEvidenceCount += 1;
        break;
      case PassportAuthorityClass.EVIDENCE:
        evidenceOnlyCount += 1;
        break;
      case PassportAuthorityClass.DERIVED_INFORMATION:
        derivedInformationCount += 1;
        break;
      default:
        throw new TypeError('Passport item authority class must remain controlled');
    }
  }

  return Object.freeze({
    evidenceCount: passport.items.length,
    verifiedEvidenceCount,
    evidenceOnlyCount,
    derivedInformationCount,
  });
}
