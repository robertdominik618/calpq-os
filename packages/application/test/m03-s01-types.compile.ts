import {
  DashboardDestination,
  DashboardReadModel,
  ProfessionalPassportProjection,
} from '../src/index.ts';
import type { DashboardNavigationItem } from '../src/index.ts';

declare const passport: ProfessionalPassportProjection;
const model = DashboardReadModel.fromPassport(passport);

const passportDestination: typeof DashboardDestination[keyof typeof DashboardDestination] = DashboardDestination.PASSPORT;
void passportDestination;

const navigationItem: DashboardNavigationItem = {
  destination: DashboardDestination.EVIDENCE,
  labelKey: 'navigation.evidence',
};
void navigationItem;

const nonAuthoritative: false = model.authorizationAuthority;
void nonAuthoritative;

// @ts-expect-error dashboard destinations are controlled
const invalidDestination: typeof DashboardDestination[keyof typeof DashboardDestination] = 'SETTINGS';
void invalidDestination;

// @ts-expect-error DashboardReadModel is immutable
model.evidenceCount = 99;

// @ts-expect-error navigation items are immutable
model.navigation[0] = navigationItem;

// @ts-expect-error read model only accepts ProfessionalPassportProjection
DashboardReadModel.fromPassport({});
