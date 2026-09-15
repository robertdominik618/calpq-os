-- CALPQ-MIG-0001
-- Purpose: PostgreSQL 18 persistence baseline for migration registry and outbox/inbox delivery.
BEGIN;

CREATE TABLE calpq_schema_migrations (
  migration_id text PRIMARY KEY,
  checksum_sha256 char(64) NOT NULL,
  applied_at timestamptz NOT NULL,
  deployment_id text NOT NULL
);

CREATE TABLE calpq_outbox (
  event_id uuid PRIMARY KEY,
  tenant_scope text NOT NULL,
  stream_key text NOT NULL,
  aggregate_revision bigint NOT NULL CHECK (aggregate_revision >= 0),
  event_type text NOT NULL,
  payload_version text NOT NULL,
  payload_json jsonb NOT NULL,
  correlation_id uuid,
  causation_id uuid,
  available_at timestamptz NOT NULL,
  published_at timestamptz,
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  last_error text,
  created_at timestamptz NOT NULL
);

CREATE INDEX calpq_outbox_pending_idx
  ON calpq_outbox (available_at, created_at)
  WHERE published_at IS NULL;

CREATE INDEX calpq_outbox_stream_idx
  ON calpq_outbox (tenant_scope, stream_key, aggregate_revision);

CREATE TABLE calpq_inbox (
  consumer_id text NOT NULL,
  event_id uuid NOT NULL,
  processed_at timestamptz NOT NULL,
  PRIMARY KEY (consumer_id, event_id)
);

CREATE TABLE calpq_consumer_checkpoint (
  consumer_id text NOT NULL,
  stream_key text NOT NULL,
  source_position text NOT NULL,
  updated_at timestamptz NOT NULL,
  PRIMARY KEY (consumer_id, stream_key)
);

COMMIT;
