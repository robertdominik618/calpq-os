import type { VerificationProviderPort } from '../src/verification/index.ts';
import {
  VerificationClaimResolution,
  VerificationProviderRequest,
  VerificationProviderResult,
  VerificationRequest,
  VerificationRouteDefinition,
  VerificationRouteRegistrySnapshot,
  VerificationRouteResult,
  VerificationRouteSelection,
} from '../src/verification/index.ts';

declare const route: VerificationRouteDefinition;
declare const registry: VerificationRouteRegistrySnapshot;
declare const request: VerificationRequest;
declare const selection: VerificationRouteSelection;
declare const providerRequest: VerificationProviderRequest;
declare const providerResult: VerificationProviderResult;
declare const routeResult: VerificationRouteResult;
declare const claimResolution: VerificationClaimResolution;
declare const port: VerificationProviderPort;

// @ts-expect-error route identity is immutable
route.id = route.id;
// @ts-expect-error supported claims are readonly
route.supportedClaims.push('x');
// @ts-expect-error jurisdictions are readonly
route.jurisdictions.push(route.jurisdictions[0]!);
// @ts-expect-error route registry contents are readonly
registry.routes.push(route);
// @ts-expect-error registry knowledge cutoff is immutable
registry.asKnownAt = registry.asKnownAt;
// @ts-expect-error request claims are readonly
request.claims.push('x');
// @ts-expect-error request methods are readonly
request.acceptableMethods.push(request.acceptableMethods[0]!);
// @ts-expect-error request assurance is immutable
request.requiredAssurance = request.requiredAssurance;
// @ts-expect-error selection items are readonly
selection.items.push(selection.items[0]!);
// @ts-expect-error uncovered claims are readonly
selection.uncoveredClaims.push('x');
// @ts-expect-error provider request claim set is readonly
providerRequest.claims.push('x');
// @ts-expect-error provider result outcome is immutable
providerResult.outcome = providerResult.outcome;
// @ts-expect-error provider result checked claims are readonly
providerResult.checkedClaims.push('x');
// @ts-expect-error normalized route outcome is immutable
routeResult.outcome = routeResult.outcome;
// @ts-expect-error route result authority records are readonly
routeResult.authorityResolutions.push(routeResult.authorityResolutions[0]!);
// @ts-expect-error claim resolution outcome is immutable
claimResolution.outcome = claimResolution.outcome;
// @ts-expect-error claim resolution results are readonly
claimResolution.routeResults.push(routeResult);
// @ts-expect-error provider port capability is readonly
port.capability = 'other';
