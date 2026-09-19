export type EnvelopePayload = Readonly<Record<string, unknown>>;

export function freezePayload<TPayload extends EnvelopePayload>(payload: TPayload): TPayload {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('Envelope payload must be a plain record');
  }
  return Object.freeze({ ...payload }) as TPayload;
}
