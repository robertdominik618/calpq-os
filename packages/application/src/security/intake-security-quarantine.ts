import { UtcInstant } from '../../../core/src/index.ts';
import { OriginalArchiveEntry } from '../archive/original-document-archive.ts';
import { IntakeProcessingState } from '../intake/document-intake.ts';

const MAX_REFERENCE_LENGTH = 1024;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

function normalizeReference(value: string, label: string): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > MAX_REFERENCE_LENGTH) throw new RangeError(`${label} is too long`);
  if (CONTROL_CHARACTER_PATTERN.test(normalized)) throw new TypeError(`${label} must not contain control characters`);
  return normalized;
}

export const IntakeSecurityControl = {
  CONTENT_TYPE_VALIDATION: 'CONTENT_TYPE_VALIDATION',
  MALWARE_SCAN: 'MALWARE_SCAN',
  CONTENT_SAFETY_SCAN: 'CONTENT_SAFETY_SCAN',
  ACTIVE_CONTENT_SCAN: 'ACTIVE_CONTENT_SCAN',
  CONTAINER_STRUCTURE_SCAN: 'CONTAINER_STRUCTURE_SCAN',
  EXTERNAL_CONTENT_SAFETY: 'EXTERNAL_CONTENT_SAFETY',
  EMBEDDED_INSTRUCTION_CONTENT: 'EMBEDDED_INSTRUCTION_CONTENT',
} as const;
export type IntakeSecurityControl = (typeof IntakeSecurityControl)[keyof typeof IntakeSecurityControl];
const SECURITY_CONTROLS = new Set<string>(Object.values(IntakeSecurityControl));

export const IntakeSecurityObservationOutcome = {
  PASS: 'PASS',
  SUSPICIOUS: 'SUSPICIOUS',
  UNSUPPORTED: 'UNSUPPORTED',
  MALICIOUS: 'MALICIOUS',
  INDETERMINATE: 'INDETERMINATE',
  FAILED: 'FAILED',
} as const;
export type IntakeSecurityObservationOutcome = (typeof IntakeSecurityObservationOutcome)[keyof typeof IntakeSecurityObservationOutcome];
const OBSERVATION_OUTCOMES = new Set<string>(Object.values(IntakeSecurityObservationOutcome));

export const IntakeSecurityObservationReason = {
  CONTROL_PASSED: 'CONTROL_PASSED',
  SUSPICIOUS_CONTENT: 'SUSPICIOUS_CONTENT',
  UNSUPPORTED_CONTENT: 'UNSUPPORTED_CONTENT',
  MALICIOUS_CONTENT: 'MALICIOUS_CONTENT',
  INDETERMINATE_RESULT: 'INDETERMINATE_RESULT',
  CONTROL_FAILED: 'CONTROL_FAILED',
} as const;
export type IntakeSecurityObservationReason = (typeof IntakeSecurityObservationReason)[keyof typeof IntakeSecurityObservationReason];
const OBSERVATION_REASONS = new Set<string>(Object.values(IntakeSecurityObservationReason));

const REQUIRED_REASON_BY_OUTCOME: Readonly<Record<IntakeSecurityObservationOutcome, IntakeSecurityObservationReason>> = Object.freeze({
  [IntakeSecurityObservationOutcome.PASS]: IntakeSecurityObservationReason.CONTROL_PASSED,
  [IntakeSecurityObservationOutcome.SUSPICIOUS]: IntakeSecurityObservationReason.SUSPICIOUS_CONTENT,
  [IntakeSecurityObservationOutcome.UNSUPPORTED]: IntakeSecurityObservationReason.UNSUPPORTED_CONTENT,
  [IntakeSecurityObservationOutcome.MALICIOUS]: IntakeSecurityObservationReason.MALICIOUS_CONTENT,
  [IntakeSecurityObservationOutcome.INDETERMINATE]: IntakeSecurityObservationReason.INDETERMINATE_RESULT,
  [IntakeSecurityObservationOutcome.FAILED]: IntakeSecurityObservationReason.CONTROL_FAILED,
});

export const IntakeSecurityDisposition = {
  PROCESSING_ALLOWED: 'PROCESSING_ALLOWED',
  QUARANTINED: 'QUARANTINED',
  HUMAN_REVIEW_REQUIRED: 'HUMAN_REVIEW_REQUIRED',
} as const;
export type IntakeSecurityDisposition = (typeof IntakeSecurityDisposition)[keyof typeof IntakeSecurityDisposition];

export class SecurityControlPolicy {
  readonly policyReference: string;
  readonly requiredControls: readonly IntakeSecurityControl[];

  private constructor(policyReference: string, requiredControls: readonly IntakeSecurityControl[]) {
    this.policyReference = policyReference;
    this.requiredControls = requiredControls;
    Object.freeze(this);
  }

  static create(input: {
    readonly policyReference: string;
    readonly requiredControls: readonly IntakeSecurityControl[];
  }): SecurityControlPolicy {
    const policyReference = normalizeReference(input.policyReference, 'Security policy reference');
    if (!Array.isArray(input.requiredControls) || input.requiredControls.length === 0) {
      throw new TypeError('Security policy requires at least one control');
    }
    const controls = [...input.requiredControls];
    const seen = new Set<string>();
    for (const control of controls) {
      if (!SECURITY_CONTROLS.has(control)) throw new TypeError('Security policy control must be controlled');
      if (seen.has(control)) throw new TypeError('Security policy must not contain duplicate controls');
      seen.add(control);
    }
    controls.sort();
    return new SecurityControlPolicy(policyReference, Object.freeze(controls));
  }

  toJSON() {
    return Object.freeze({
      policyReference: this.policyReference,
      requiredControls: Object.freeze([...this.requiredControls]),
    });
  }
}

export class SecurityScannerReference {
  readonly adapterReference: string;
  readonly engineReference: string;
  readonly engineVersion: string;
  readonly configurationReference: string;

  private constructor(input: {
    readonly adapterReference: string;
    readonly engineReference: string;
    readonly engineVersion: string;
    readonly configurationReference: string;
  }) {
    this.adapterReference = input.adapterReference;
    this.engineReference = input.engineReference;
    this.engineVersion = input.engineVersion;
    this.configurationReference = input.configurationReference;
    Object.freeze(this);
  }

  static create(input: {
    readonly adapterReference: string;
    readonly engineReference: string;
    readonly engineVersion: string;
    readonly configurationReference: string;
  }): SecurityScannerReference {
    return new SecurityScannerReference({
      adapterReference: normalizeReference(input.adapterReference, 'Security scanner adapter reference'),
      engineReference: normalizeReference(input.engineReference, 'Security scanner engine reference'),
      engineVersion: normalizeReference(input.engineVersion, 'Security scanner engine version'),
      configurationReference: normalizeReference(input.configurationReference, 'Security scanner configuration reference'),
    });
  }

  toJSON() {
    return Object.freeze({
      adapterReference: this.adapterReference,
      engineReference: this.engineReference,
      engineVersion: this.engineVersion,
      configurationReference: this.configurationReference,
    });
  }
}

export class IntakeSecurityObservation {
  readonly archiveEntry: OriginalArchiveEntry;
  readonly control: IntakeSecurityControl;
  readonly outcome: IntakeSecurityObservationOutcome;
  readonly reason: IntakeSecurityObservationReason;
  readonly observedAt: UtcInstant;
  readonly scanner: SecurityScannerReference;
  readonly signalReference: string | null;

  private constructor(input: {
    readonly archiveEntry: OriginalArchiveEntry;
    readonly control: IntakeSecurityControl;
    readonly outcome: IntakeSecurityObservationOutcome;
    readonly reason: IntakeSecurityObservationReason;
    readonly observedAt: UtcInstant;
    readonly scanner: SecurityScannerReference;
    readonly signalReference: string | null;
  }) {
    this.archiveEntry = input.archiveEntry;
    this.control = input.control;
    this.outcome = input.outcome;
    this.reason = input.reason;
    this.observedAt = input.observedAt;
    this.scanner = input.scanner;
    this.signalReference = input.signalReference;
    Object.freeze(this);
  }

  static create(input: {
    readonly archiveEntry: OriginalArchiveEntry;
    readonly control: IntakeSecurityControl;
    readonly outcome: IntakeSecurityObservationOutcome;
    readonly reason: IntakeSecurityObservationReason;
    readonly observedAt: UtcInstant;
    readonly scanner: SecurityScannerReference;
    readonly signalReference?: string | null;
  }): IntakeSecurityObservation {
    if (!(input.archiveEntry instanceof OriginalArchiveEntry)) {
      throw new TypeError('Security observation requires OriginalArchiveEntry');
    }
    if (!SECURITY_CONTROLS.has(input.control)) throw new TypeError('Security observation control must be controlled');
    if (!OBSERVATION_OUTCOMES.has(input.outcome)) throw new TypeError('Security observation outcome must be controlled');
    if (!OBSERVATION_REASONS.has(input.reason)) throw new TypeError('Security observation reason must be controlled');
    if (REQUIRED_REASON_BY_OUTCOME[input.outcome] !== input.reason) {
      throw new TypeError('Security observation reason must match outcome');
    }
    if (!(input.observedAt instanceof UtcInstant)) throw new TypeError('Security observation requires UtcInstant');
    if (input.observedAt.toEpochMilliseconds() < input.archiveEntry.receivedAt.toEpochMilliseconds()) {
      throw new RangeError('Security observation must not predate intake receipt');
    }
    if (!(input.scanner instanceof SecurityScannerReference)) {
      throw new TypeError('Security observation requires SecurityScannerReference');
    }
    const signalReference = input.signalReference == null
      ? null
      : normalizeReference(input.signalReference, 'Security signal reference');

    return new IntakeSecurityObservation({
      archiveEntry: input.archiveEntry,
      control: input.control,
      outcome: input.outcome,
      reason: input.reason,
      observedAt: input.observedAt,
      scanner: input.scanner,
      signalReference,
    });
  }

  toJSON() {
    return Object.freeze({
      intakeId: this.archiveEntry.intakeId.toString(),
      originalEvidenceId: this.archiveEntry.originalArtifact.id.toString(),
      originalContentHash: this.archiveEntry.contentAddress.toJSON(),
      control: this.control,
      outcome: this.outcome,
      reason: this.reason,
      observedAt: this.observedAt.toString(),
      scanner: this.scanner.toJSON(),
      signalReference: this.signalReference,
    });
  }
}

function canonicalObservationKey(observation: IntakeSecurityObservation): string {
  return JSON.stringify(observation.toJSON());
}

export class IntakeSecurityAssessment {
  readonly archiveEntry: OriginalArchiveEntry;
  readonly policy: SecurityControlPolicy;
  readonly observations: readonly IntakeSecurityObservation[];
  readonly evaluatedAt: UtcInstant;
  readonly disposition: IntakeSecurityDisposition;
  readonly missingRequiredControls: readonly IntakeSecurityControl[];

  private constructor(input: {
    readonly archiveEntry: OriginalArchiveEntry;
    readonly policy: SecurityControlPolicy;
    readonly observations: readonly IntakeSecurityObservation[];
    readonly evaluatedAt: UtcInstant;
    readonly disposition: IntakeSecurityDisposition;
    readonly missingRequiredControls: readonly IntakeSecurityControl[];
  }) {
    this.archiveEntry = input.archiveEntry;
    this.policy = input.policy;
    this.observations = input.observations;
    this.evaluatedAt = input.evaluatedAt;
    this.disposition = input.disposition;
    this.missingRequiredControls = input.missingRequiredControls;
    Object.freeze(this);
  }

  static evaluate(input: {
    readonly archiveEntry: OriginalArchiveEntry;
    readonly policy: SecurityControlPolicy;
    readonly observations: readonly IntakeSecurityObservation[];
    readonly evaluatedAt: UtcInstant;
  }): IntakeSecurityAssessment {
    if (!(input.archiveEntry instanceof OriginalArchiveEntry)) {
      throw new TypeError('Security assessment requires OriginalArchiveEntry');
    }
    if (!(input.policy instanceof SecurityControlPolicy)) {
      throw new TypeError('Security assessment requires SecurityControlPolicy');
    }
    if (!Array.isArray(input.observations)) throw new TypeError('Security assessment observations must be an array');
    if (!(input.evaluatedAt instanceof UtcInstant)) throw new TypeError('Security assessment requires UtcInstant');
    if (input.evaluatedAt.toEpochMilliseconds() < input.archiveEntry.receivedAt.toEpochMilliseconds()) {
      throw new RangeError('Security assessment must not predate intake receipt');
    }

    const observations = [...input.observations];
    const seenControls = new Set<string>();
    for (const observation of observations) {
      if (!(observation instanceof IntakeSecurityObservation)) {
        throw new TypeError('Security assessment requires IntakeSecurityObservation values');
      }
      if (observation.archiveEntry !== input.archiveEntry) {
        throw new TypeError('Security observation must bind to the exact assessed archive entry');
      }
      if (observation.observedAt.toEpochMilliseconds() > input.evaluatedAt.toEpochMilliseconds()) {
        throw new RangeError('Security assessment cannot predate an included observation');
      }
      if (seenControls.has(observation.control)) {
        throw new TypeError('Security assessment must not contain duplicate control observations');
      }
      seenControls.add(observation.control);
    }
    observations.sort((left, right) => canonicalObservationKey(left).localeCompare(canonicalObservationKey(right)));

    const missingRequiredControls = input.policy.requiredControls
      .filter((control) => !seenControls.has(control));

    const hasQuarantineOutcome = observations.some((observation) =>
      observation.outcome === IntakeSecurityObservationOutcome.MALICIOUS
      || observation.outcome === IntakeSecurityObservationOutcome.SUSPICIOUS
      || observation.outcome === IntakeSecurityObservationOutcome.UNSUPPORTED);
    const hasReviewOutcome = observations.some((observation) =>
      observation.outcome === IntakeSecurityObservationOutcome.INDETERMINATE
      || observation.outcome === IntakeSecurityObservationOutcome.FAILED);

    const disposition = hasQuarantineOutcome
      ? IntakeSecurityDisposition.QUARANTINED
      : hasReviewOutcome || missingRequiredControls.length > 0
        ? IntakeSecurityDisposition.HUMAN_REVIEW_REQUIRED
        : IntakeSecurityDisposition.PROCESSING_ALLOWED;

    return new IntakeSecurityAssessment({
      archiveEntry: input.archiveEntry,
      policy: input.policy,
      observations: Object.freeze(observations),
      evaluatedAt: input.evaluatedAt,
      disposition,
      missingRequiredControls: Object.freeze([...missingRequiredControls]),
    });
  }

  get canProceedToDerivedProcessing(): boolean {
    return this.disposition === IntakeSecurityDisposition.PROCESSING_ALLOWED;
  }

  toProcessingState(): IntakeProcessingState {
    return this.canProceedToDerivedProcessing
      ? IntakeProcessingState.DERIVATION_PENDING
      : IntakeProcessingState.REVIEW_REQUIRED;
  }

  toJSON() {
    return Object.freeze({
      intakeId: this.archiveEntry.intakeId.toString(),
      originalEvidenceId: this.archiveEntry.originalArtifact.id.toString(),
      originalContentHash: this.archiveEntry.contentAddress.toJSON(),
      policy: this.policy.toJSON(),
      evaluatedAt: this.evaluatedAt.toString(),
      disposition: this.disposition,
      canProceedToDerivedProcessing: this.canProceedToDerivedProcessing,
      processingState: this.toProcessingState(),
      missingRequiredControls: Object.freeze([...this.missingRequiredControls]),
      observations: Object.freeze(this.observations.map((observation) => observation.toJSON())),
      originalVerificationState: this.archiveEntry.originalArtifact.verificationState.toString(),
    });
  }
}

export interface IntakeSecurityScanRequest {
  readonly archiveEntry: OriginalArchiveEntry;
  readonly control: IntakeSecurityControl;
}

export interface IntakeSecurityScannerObservation {
  readonly outcome: IntakeSecurityObservationOutcome;
  readonly reason: IntakeSecurityObservationReason;
  readonly observedAt: UtcInstant;
  readonly signalReference?: string | null;
}

export interface IntakeSecurityScannerAdapterPort {
  readonly adapterReference: string;
  readonly engineReference: string;
  readonly engineVersion: string;
  readonly configurationReference: string;
  scan(request: IntakeSecurityScanRequest): IntakeSecurityScannerObservation;
}

export function normalizeIntakeSecurityScan(
  adapter: IntakeSecurityScannerAdapterPort,
  request: IntakeSecurityScanRequest,
): IntakeSecurityObservation {
  if (adapter === null || typeof adapter !== 'object') throw new TypeError('Security scanner adapter must be an object');
  if (!(request.archiveEntry instanceof OriginalArchiveEntry)) {
    throw new TypeError('Security scan request requires OriginalArchiveEntry');
  }
  if (!SECURITY_CONTROLS.has(request.control)) throw new TypeError('Security scan request control must be controlled');
  if (typeof adapter.scan !== 'function') throw new TypeError('Security scanner adapter must implement scan');

  const scanner = SecurityScannerReference.create({
    adapterReference: adapter.adapterReference,
    engineReference: adapter.engineReference,
    engineVersion: adapter.engineVersion,
    configurationReference: adapter.configurationReference,
  });
  const normalized = adapter.scan(request);
  if (normalized === null || typeof normalized !== 'object') {
    throw new TypeError('Security scanner adapter must return an observation');
  }

  return IntakeSecurityObservation.create({
    archiveEntry: request.archiveEntry,
    control: request.control,
    outcome: normalized.outcome,
    reason: normalized.reason,
    observedAt: normalized.observedAt,
    scanner,
    ...(normalized.signalReference === undefined ? {} : { signalReference: normalized.signalReference }),
  });
}
