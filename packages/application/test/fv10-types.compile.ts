import {
  DocumentIntakeId,
  VerificationClaim,
  VerificationRecord,
  VerificationRecordState,
  VerificationRequestId,
} from '../src/index.ts';
import type { AuthorityResolverPort, VerificationProviderPort } from '../src/index.ts';

declare const requestId: VerificationRequestId;
declare const intakeId: DocumentIntakeId;
declare const record: VerificationRecord;
declare const provider: VerificationProviderPort;
declare const authorityResolver: AuthorityResolverPort;

void requestId;
void provider;
void authorityResolver;

// @ts-expect-error Verification request identity is semantically distinct from intake identity.
const wrongRequestId: VerificationRequestId = intakeId;
void wrongRequestId;

// @ts-expect-error Verification records are immutable after construction.
record.state = VerificationRecordState.INDETERMINATE;

// @ts-expect-error Verified claim snapshots are immutable.
record.verifiedClaims.push(VerificationClaim.from('credential.other'));

// @ts-expect-error Arbitrary strings are not controlled verification record states.
const invalidState: VerificationRecordState = 'LEGAL_AUTHORIZED';
void invalidState;
