-- CALPQ-MIG-0002
-- Forward-only EXPAND fix: add explicit delivery review/quarantine state without rewriting migration 0001.
BEGIN;

ALTER TABLE calpq_outbox
  ADD COLUMN delivery_state text NOT NULL DEFAULT 'PENDING';

ALTER TABLE calpq_outbox
  ADD CONSTRAINT calpq_outbox_delivery_state_chk
  CHECK (delivery_state IN ('PENDING', 'PUBLISHED', 'REVIEW_REQUIRED')) NOT VALID;

ALTER TABLE calpq_outbox
  VALIDATE CONSTRAINT calpq_outbox_delivery_state_chk;

CREATE INDEX calpq_outbox_delivery_state_idx
  ON calpq_outbox (delivery_state, available_at);

CREATE TABLE calpq_delivery_review (
  review_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES calpq_outbox(event_id),
  consumer_id text,
  reason_code text NOT NULL,
  error_summary text,
  opened_at timestamptz NOT NULL,
  resolved_at timestamptz,
  UNIQUE (event_id, consumer_id, reason_code)
);

COMMIT;
