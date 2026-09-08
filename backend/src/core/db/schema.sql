-- ============================================================================
-- ULTRON MICROSERVICES: CATALOG SERVICE SCHEMA
-- Bounded Context: Device specifications, base models, metadata
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS ultron_catalog;
SET search_path TO ultron_catalog, public;

CREATE TABLE IF NOT EXISTS catalog_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand VARCHAR(64) NOT NULL,
    model_name VARCHAR(128) NOT NULL,
    storage_capacity_gb INT NOT NULL,
    color_name VARCHAR(64) NOT NULL,
    model_number VARCHAR(32),
    network_carrier_lock VARCHAR(32) DEFAULT 'FACTORY_UNLOCKED',
    release_year INT NOT NULL,
    base_retail_price_cents BIGINT NOT NULL,
    image_gallery_urls JSONB DEFAULT '[]'::jsonb,
    technical_specs JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_catalog_model_spec UNIQUE (brand, model_name, storage_capacity_gb, color_name)
);

CREATE INDEX idx_catalog_brand_model ON catalog_devices(brand, model_name);
-- ============================================================================
-- ULTRON MICROSERVICES: INVENTORY SERVICE SCHEMA
-- Bounded Context: Physical item tracking, Redlock state, audit trails
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS ultron_inventory;
SET search_path TO ultron_inventory, public;

DO $$ BEGIN CREATE TYPE phone_condition_grade AS ENUM ('MINT', 'GOOD', 'FAIR'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE phone_inventory_status AS ENUM ('AVAILABLE', 'LOCKED_CHECKOUT_HOLD', 'RESERVED_PAYMENT_PENDING', 'SOLD', 'RETURN_INSPECTION', 'DECOMMISSIONED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE reservation_status AS ENUM ('ACTIVE', 'CONVERTED_TO_SALE', 'EXPIRED_RELEASED', 'MANUALLY_CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL, -- Loose reference to ultron_catalog.catalog_devices (Microservice Bounded Context)
    
    imei VARCHAR(15) NOT NULL,
    serial_number VARCHAR(32) NOT NULL,
    
    condition_grade phone_condition_grade NOT NULL,
    battery_health_percentage INT NOT NULL CHECK (battery_health_percentage BETWEEN 50 AND 100),
    cosmetic_scratches_rating INT NOT NULL CHECK (cosmetic_scratches_rating BETWEEN 1 AND 10),
    has_original_box BOOLEAN NOT NULL DEFAULT FALSE,
    has_original_charger BOOLEAN NOT NULL DEFAULT FALSE,
    
    inspection_id VARCHAR(64) NOT NULL,
    inspector_technician_id VARCHAR(64) NOT NULL,
    inspected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    selling_price_cents BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'ZAR',
    
    status phone_inventory_status NOT NULL DEFAULT 'AVAILABLE',
    active_lock_session_id VARCHAR(128) DEFAULT NULL,
    locked_at TIMESTAMPTZ DEFAULT NULL,
    lock_expires_at TIMESTAMPTZ DEFAULT NULL,
    
    warehouse_facility_code VARCHAR(32) NOT NULL DEFAULT 'CPT-WH-01',
    warehouse_bin_location VARCHAR(32) NOT NULL DEFAULT 'BIN-A-44',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_inventory_imei UNIQUE (imei),
    CONSTRAINT uq_inventory_serial UNIQUE (serial_number)
);

CREATE TABLE IF NOT EXISTS checkout_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
    imei VARCHAR(15) NOT NULL,
    buyer_user_id VARCHAR(64) NOT NULL,
    session_id VARCHAR(128) NOT NULL,
    client_ip VARCHAR(45) NOT NULL,
    status reservation_status NOT NULL DEFAULT 'ACTIVE',
    ttl_seconds INT NOT NULL DEFAULT 600,
    reserved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    released_at TIMESTAMPTZ DEFAULT NULL,
    order_id UUID DEFAULT NULL,
    CONSTRAINT uq_active_session_reservation UNIQUE (session_id, inventory_item_id)
);

CREATE TABLE IF NOT EXISTS inventory_state_audit_log (
    id BIGSERIAL PRIMARY KEY,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    imei VARCHAR(15) NOT NULL,
    previous_status phone_inventory_status NOT NULL,
    new_status phone_inventory_status NOT NULL,
    triggered_by_service VARCHAR(64) NOT NULL,
    correlation_id VARCHAR(128) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_imei ON inventory_items(imei);
CREATE INDEX IF NOT EXISTS idx_inventory_storefront_filter ON inventory_items(device_id, status, condition_grade, selling_price_cents) WHERE status = 'AVAILABLE';
CREATE INDEX IF NOT EXISTS idx_inventory_lock_expiry ON inventory_items(lock_expires_at) WHERE status = 'LOCKED_CHECKOUT_HOLD';
CREATE INDEX IF NOT EXISTS idx_reservations_session ON checkout_reservations(session_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_log_imei_time ON inventory_state_audit_log(imei, recorded_at DESC);

-- Audit Trigger
CREATE OR REPLACE FUNCTION fn_audit_inventory_status_change() RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO inventory_state_audit_log (
            inventory_item_id, imei, previous_status, new_status, triggered_by_service, correlation_id, metadata
        ) VALUES (
            NEW.id, NEW.imei, OLD.status, NEW.status, 
            COALESCE(current_setting('ultron.service_name', true), 'inventory-service'),
            COALESCE(NEW.active_lock_session_id, 'SYSTEM_TRIGGER'),
            jsonb_build_object('lock_expires_at', NEW.lock_expires_at, 'updated_at', NEW.updated_at)
        );
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_inventory_status ON inventory_items;
CREATE TRIGGER trg_audit_inventory_status
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION fn_audit_inventory_status_change();
-- ============================================================================
-- ULTRON MICROSERVICES: ORDER SERVICE SCHEMA
-- Bounded Context: Order orchestration, lifecycle management
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SCHEMA IF NOT EXISTS ultron_orders;
SET search_path TO ultron_orders, public;

DO $$ BEGIN CREATE TYPE order_status AS ENUM ('PENDING_PAYMENT', 'PAYMENT_CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(128) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    total_amount_cents BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'ZAR',
    status order_status NOT NULL DEFAULT 'PENDING_PAYMENT',
    shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL, -- Loose reference to ultron_inventory
    imei VARCHAR(15) NOT NULL,
    price_cents BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
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
CREATE SCHEMA IF NOT EXISTS ultron_users;

CREATE TABLE IF NOT EXISTS ultron_users.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
