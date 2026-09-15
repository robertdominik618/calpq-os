import {
  ASSURANCE_RANK,
  AuthorityStatus,
  TechnicalCheckStatus,
  VerificationRecord,
  VerificationRecordState,
} from './verification-model.ts';
import type {
  CheckedClaimObservation,
  VerificationClaim,
  VerificationMethod,
  VerificationRequest,
} from './verification-model.ts';
import type { AuthorityResolverPort, VerificationProviderPort } from './verification-ports.ts';

function claimKey(claim: VerificationClaim): string {
  return claim.toString();
}

function uniqueClaims(claims: readonly VerificationClaim[]): readonly VerificationClaim[] {
  const seen = new Set<string>();
  const result: VerificationClaim[] = [];
  for (const claim of claims) {
    const key = claimKey(claim);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(claim);
    }
  }
  return Object.freeze(result);
}

function selectRoute(
  request: VerificationRequest,
  providers: readonly VerificationProviderPort[],
): { readonly provider: VerificationProviderPort; readonly method: VerificationMethod } | null {
  const eligible = providers
    .filter((provider) => ASSURANCE_RANK[provider.capability.maxAssurance] >= ASSURANCE_RANK[request.requiredAssurance])
    .sort((left, right) => left.capability.adapterId.localeCompare(right.capability.adapterId));

  for (const provider of eligible) {
    const method = request.acceptableMethods.find((candidate) => provider.capability.methods.includes(candidate));
    if (method !== undefined) return Object.freeze({ provider, method });
  }
  return null;
}

function detectConflictingClaims(observations: readonly CheckedClaimObservation[]): readonly VerificationClaim[] {
  const statuses = new Map<string, Set<string>>();
  const claims = new Map<string, VerificationClaim>();
  for (const observation of observations) {
    const key = claimKey(observation.claim);
    const current = statuses.get(key) ?? new Set<string>();
    current.add(observation.status);
    statuses.set(key, current);
    claims.set(key, observation.claim);
  }
  const conflicts: VerificationClaim[] = [];
  for (const [key, values] of statuses) {
    if (values.size > 1) {
      const claim = claims.get(key);
      if (claim !== undefined) conflicts.push(claim);
    }
  }
  return Object.freeze(conflicts);
}

export async function orchestrateVerification(input: {
  readonly request: VerificationRequest;
  readonly providers: readonly VerificationProviderPort[];
  readonly authorityResolver: AuthorityResolverPort;
}): Promise<VerificationRecord> {
  const route = selectRoute(input.request, input.providers);
  if (route === null) {
    return new VerificationRecord({
      requestId: input.request.id,
      state: VerificationRecordState.INDETERMINATE,
      indeterminateClaims: input.request.claims,
      reasonCodes: ['NO_APPROVED_ROUTE'],
    });
  }

  const technical = await route.provider.verify(input.request, route.method);
  if (technical.adapterId !== route.provider.capability.adapterId) {
    throw new TypeError('Verification provider result adapter identity does not match selected capability');
  }
  if (technical.method !== route.method) {
    throw new TypeError('Verification provider result method does not match selected route');
  }

  if (technical.outage) {
    return new VerificationRecord({
      requestId: input.request.id,
      adapterId: technical.adapterId,
      verifier: technical.verifier,
      method: technical.method,
      sourceVersion: technical.sourceVersion,
      checkedClaims: uniqueClaims(technical.observations.map((observation) => observation.claim)),
      indeterminateClaims: input.request.claims,
      state: VerificationRecordState.INDETERMINATE,
      reasonCodes: ['PROVIDER_OUTAGE'],
    });
  }

  const requested = new Map(input.request.claims.map((claim) => [claimKey(claim), claim]));
  for (const observation of technical.observations) {
    if (!requested.has(claimKey(observation.claim))) {
      throw new TypeError('Provider returned an observation for a claim that was not requested');
    }
  }

  const conflicts = detectConflictingClaims(technical.observations);
  const conflictKeys = new Set(conflicts.map(claimKey));
  const verified: VerificationClaim[] = [];
  const notVerified: VerificationClaim[] = [];
  const indeterminate: VerificationClaim[] = [];
  const review: VerificationClaim[] = [...conflicts];
  const reasons: string[] = conflicts.map((claim) => `CONFLICTING_ROUTE_RESULTS:${claim.toString()}`);

  const grouped = new Map<string, CheckedClaimObservation[]>();
  for (const observation of technical.observations) {
    const key = claimKey(observation.claim);
    const list = grouped.get(key) ?? [];
    list.push(observation);
    grouped.set(key, list);
  }

  for (const claim of input.request.claims) {
    const key = claimKey(claim);
    const observations = grouped.get(key) ?? [];
    if (conflictKeys.has(key)) continue;
    if (observations.length === 0) {
      indeterminate.push(claim);
      reasons.push(`UNCHECKED_CLAIM:${key}`);
      continue;
    }

    const observation = observations[0];
    if (observation === undefined) continue;
    if (observation.status === TechnicalCheckStatus.INDETERMINATE) {
      indeterminate.push(claim);
      reasons.push(`TECHNICAL_INDETERMINATE:${key}`);
      continue;
    }
    if (observation.status === TechnicalCheckStatus.FAILED) {
      notVerified.push(claim);
      reasons.push(`TECHNICAL_CHECK_FAILED:${key}`);
      continue;
    }

    if (technical.verifier === null) {
      review.push(claim);
      reasons.push(`VERIFIER_IDENTITY_MISSING:${key}`);
      continue;
    }

    const authority = await input.authorityResolver.resolve({
      verifier: technical.verifier,
      claim,
      jurisdiction: input.request.jurisdiction,
      useCase: input.request.useCase,
      evaluationInstant: input.request.evaluationInstant,
    });
    if (authority.status === AuthorityStatus.SUFFICIENT) {
      verified.push(claim);
    } else if (authority.status === AuthorityStatus.INSUFFICIENT) {
      notVerified.push(claim);
      reasons.push(`AUTHORITY_INSUFFICIENT:${key}:${authority.reasonCode}`);
    } else {
      review.push(claim);
      reasons.push(`AUTHORITY_REVIEW_REQUIRED:${key}:${authority.reasonCode}`);
    }
  }

  let state: VerificationRecordState;
  if (review.length > 0) state = VerificationRecordState.REVIEW_REQUIRED;
  else if (verified.length === input.request.claims.length) state = VerificationRecordState.VERIFIED;
  else if (verified.length > 0) state = VerificationRecordState.PARTIAL;
  else if (indeterminate.length > 0) state = VerificationRecordState.INDETERMINATE;
  else state = VerificationRecordState.NOT_VERIFIED;

  return new VerificationRecord({
    requestId: input.request.id,
    adapterId: technical.adapterId,
    verifier: technical.verifier,
    method: technical.method,
    sourceVersion: technical.sourceVersion,
    checkedClaims: uniqueClaims(technical.observations.map((observation) => observation.claim)),
    verifiedClaims: uniqueClaims(verified),
    notVerifiedClaims: uniqueClaims(notVerified),
    indeterminateClaims: uniqueClaims(indeterminate),
    reviewClaims: uniqueClaims(review),
    state,
    reasonCodes: reasons,
  });
}
