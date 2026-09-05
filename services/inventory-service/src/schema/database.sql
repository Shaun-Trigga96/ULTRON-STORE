-- ============================================================================
-- ULTRON STORE — ENTERPRISE MICROSERVICES DATABASE SCHEMA
-- Target Engine: PostgreSQL 15+ (GCP Cloud SQL with Private IP Peering)
-- High-Availability Pre-Owned Mobile Phone E-Commerce Engine
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Clean teardown if rebuilding
-- DROP SCHEMA IF EXISTS ultron_inventory CASCADE;
CREATE SCHEMA IF NOT EXISTS ultron_inventory;
SET search_path TO ultron_inventory, public;

-- ----------------------------------------------------------------------------
-- 1. ENUMS FOR STRICT STATE MANAGEMENT
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE phone_condition_grade AS ENUM ('MINT', 'GOOD', 'FAIR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE phone_inventory_status AS ENUM (
        'AVAILABLE',               -- Ready for customer browsing & checkout
        'LOCKED_CHECKOUT_HOLD',   -- Sub-millisecond Redis lock active (10m TTL)
        'RESERVED_PAYMENT_PENDING',-- Payment intent initiated with gateway
        'SOLD',                    -- Transaction committed and finalized
        'RETURN_INSPECTION',       -- RMA / Reverse logistics inspection
        'DECOMMISSIONED'           -- Parts / Recycled / Defective
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reservation_status AS ENUM ('ACTIVE', 'CONVERTED_TO_SALE', 'EXPIRED_RELEASED', 'MANUALLY_CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- 2. CATALOG: DEVICE SPECIFICATIONS & BASE MODELS (Read-Heavy Cache Target)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS catalog_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand VARCHAR(64) NOT NULL,                 -- e.g. 'Apple', 'Samsung', 'Google'
    model_name VARCHAR(128) NOT NULL,           -- e.g. 'iPhone 15 Pro Max', 'Galaxy S24 Ultra'
    storage_capacity_gb INT NOT NULL,           -- e.g. 128, 256, 512, 1024
    color_name VARCHAR(64) NOT NULL,            -- e.g. 'Natural Titanium', 'Titanium Black'
    model_number VARCHAR(32),                   -- e.g. 'A3106', 'SM-S928B'
    network_carrier_lock VARCHAR(32) DEFAULT 'FACTORY_UNLOCKED',
    release_year INT NOT NULL,
    base_retail_price_cents BIGINT NOT NULL,    -- Base price in cents (e.g. 2399900 = R23,999.00)
    image_gallery_urls JSONB DEFAULT '[]'::jsonb,
    technical_specs JSONB DEFAULT '{}'::jsonb,  -- Chipset, camera, display resolution
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_catalog_model_spec UNIQUE (brand, model_name, storage_capacity_gb, color_name)
);

-- ----------------------------------------------------------------------------
-- 3. INVENTORY: PHYSICAL INDIVIDUAL UNITS (QUANTITY: 1 CONSTRAINT PER IMEI)
-- Every refurbished phone is uniquely identified by its 15-digit IMEI.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES catalog_devices(id) ON DELETE RESTRICT,
    
    -- Hardware Unique Identifiers
    imei VARCHAR(15) NOT NULL,
    serial_number VARCHAR(32) NOT NULL,
    
    -- Pre-Owned Certification Grading
    condition_grade phone_condition_grade NOT NULL,
    battery_health_percentage INT NOT NULL CHECK (battery_health_percentage BETWEEN 50 AND 100),
    cosmetic_scratches_rating INT NOT NULL CHECK (cosmetic_scratches_rating BETWEEN 1 AND 10), -- 10 = flawless
    has_original_box BOOLEAN NOT NULL DEFAULT FALSE,
    has_original_charger BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Certified Inspection Data
    inspection_id VARCHAR(64) NOT NULL,
    inspector_technician_id VARCHAR(64) NOT NULL,
    inspected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Pricing
    selling_price_cents BIGINT NOT NULL,        -- Dynamic pricing reflecting battery & cosmetic grade
    currency VARCHAR(3) NOT NULL DEFAULT 'ZAR',
    
    -- Live Real-Time Availability & Lock Metadata
    status phone_inventory_status NOT NULL DEFAULT 'AVAILABLE',
    active_lock_session_id VARCHAR(128) DEFAULT NULL,   -- Active Redis Redlock correlation ID
    locked_at TIMESTAMPTZ DEFAULT NULL,
    lock_expires_at TIMESTAMPTZ DEFAULT NULL,           -- Auto-release threshold
    
    -- Warehouse Physical Location
    warehouse_facility_code VARCHAR(32) NOT NULL DEFAULT 'CPT-WH-01',
    warehouse_bin_location VARCHAR(32) NOT NULL DEFAULT 'BIN-A-44',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Crucial Hard Invariant: No two phones can share an IMEI
    CONSTRAINT uq_inventory_imei UNIQUE (imei),
    CONSTRAINT uq_inventory_serial UNIQUE (serial_number)
);

-- ----------------------------------------------------------------------------
-- 4. CHECKOUT RESERVATION LOGS (Audit & Redlock Reconciliation Table)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS checkout_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
    imei VARCHAR(15) NOT NULL,
    buyer_user_id VARCHAR(64) NOT NULL,
    session_id VARCHAR(128) NOT NULL,
    client_ip VARCHAR(45) NOT NULL,
    status reservation_status NOT NULL DEFAULT 'ACTIVE',
    ttl_seconds INT NOT NULL DEFAULT 600,       -- 10-Minute standard reservation window
    reserved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    released_at TIMESTAMPTZ DEFAULT NULL,
    order_id UUID DEFAULT NULL,
    CONSTRAINT uq_active_session_reservation UNIQUE (session_id, inventory_item_id)
);

-- ----------------------------------------------------------------------------
-- 5. IMMUTABLE INVENTORY AUDIT LOG (Zero-Loss Forensic Trail)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_state_audit_log (
    id BIGSERIAL PRIMARY KEY,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    imei VARCHAR(15) NOT NULL,
    previous_status phone_inventory_status NOT NULL,
    new_status phone_inventory_status NOT NULL,
    triggered_by_service VARCHAR(64) NOT NULL, -- e.g. 'lock-service', 'payment-webhook', 'ttl-worker'
    correlation_id VARCHAR(128) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. HIGH-PERFORMANCE INDEXES
-- Designed for sub-millisecond lookups under 5,000+ concurrent users
-- ----------------------------------------------------------------------------
-- Fast IMEI lookup (lock acquisition, status check)
CREATE INDEX IF NOT EXISTS idx_inventory_imei ON inventory_items(imei);

-- Fast catalog filtering for storefront (only show AVAILABLE items for a given model)
CREATE INDEX IF NOT EXISTS idx_inventory_storefront_filter 
ON inventory_items(device_id, status, condition_grade, selling_price_cents)
WHERE status = 'AVAILABLE';

-- TTL Expiration sweep index (for background cleanup workers)
CREATE INDEX IF NOT EXISTS idx_inventory_lock_expiry 
ON inventory_items(lock_expires_at) 
WHERE status = 'LOCKED_CHECKOUT_HOLD';

-- Reservations by session
CREATE INDEX IF NOT EXISTS idx_reservations_session ON checkout_reservations(session_id, status);

-- Audit log timeline
CREATE INDEX IF NOT EXISTS idx_audit_log_imei_time ON inventory_state_audit_log(imei, recorded_at DESC);

-- ----------------------------------------------------------------------------
-- 7. TRIGGER: AUTOMATIC STATE TRANSITION AUDIT LOGGING
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_audit_inventory_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO inventory_state_audit_log (
            inventory_item_id,
            imei,
            previous_status,
            new_status,
            triggered_by_service,
            correlation_id,
            metadata
        ) VALUES (
            NEW.id,
            NEW.imei,
            OLD.status,
            NEW.status,
            COALESCE(current_setting('ultron.service_name', true), 'inventory-service'),
            COALESCE(NEW.active_lock_session_id, 'SYSTEM_TRIGGER'),
            jsonb_build_object(
                'lock_expires_at', NEW.lock_expires_at,
                'updated_at', NEW.updated_at
            )
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
