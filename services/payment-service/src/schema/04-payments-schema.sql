-- ============================================================================
-- ULTRON MICROSERVICES: PAYMENT SERVICE SCHEMA
-- Bounded Context: Payment gateway integration, idempotency, outbox pattern
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS ultron_payments;
SET search_path TO ultron_payments, public;

DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('INITIATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL, -- Loose reference to ultron_orders
    idempotency_key VARCHAR(128) NOT NULL UNIQUE,
    provider_name VARCHAR(64) NOT NULL, -- e.g., 'STRIPE', 'PAYSTACK', 'LIGHTNING'
    provider_transaction_id VARCHAR(128),
    amount_cents BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'ZAR',
    status payment_status NOT NULL DEFAULT 'INITIATED',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactional Outbox Pattern for reliable event publishing
CREATE TABLE IF NOT EXISTS payment_outbox_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aggregate_type VARCHAR(64) NOT NULL,
    aggregate_id VARCHAR(128) NOT NULL,
    event_type VARCHAR(128) NOT NULL,
    payload JSONB NOT NULL,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_order ON payment_transactions(order_id);
CREATE INDEX idx_payment_provider_tx ON payment_transactions(provider_transaction_id);
CREATE INDEX idx_outbox_unpublished ON payment_outbox_events(published) WHERE published = FALSE;
