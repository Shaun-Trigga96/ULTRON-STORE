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


-- ============================================================================
-- SEED DATA
-- ============================================================================

INSERT INTO ultron_catalog.catalog_devices (id, brand, model_name, storage_capacity_gb, color_name, release_year, base_retail_price_cents, image_gallery_urls, technical_specs)
VALUES 
-- APPLE
('d1a2b3c4-0000-0000-0000-000000000001', 'Apple', 'iPhone 15 Pro Max', 256, 'Natural Titanium', 2023, 2399900, '["https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=400&auto=format&fit=crop"]', '{"screen": "6.7 Super Retina XDR OLED", "chip": "A17 Pro", "cameras": "48MP Main"}'),
('d1a2b3c4-0000-0000-0000-000000000002', 'Apple', 'iPhone 14 Pro', 128, 'Deep Purple', 2022, 1799900, '["https://images.unsplash.com/photo-1678652733566-3d2331c1f77d?q=80&w=400&auto=format&fit=crop"]', '{"screen": "6.1 Super Retina XDR OLED", "chip": "A16 Bionic", "cameras": "48MP Main"}'),
('d1a2b3c4-0000-0000-0000-000000000003', 'Apple', 'iPhone 13', 128, 'Midnight', 2021, 1149900, '["https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=400&auto=format&fit=crop"]', '{"screen": "6.1 Super Retina XDR OLED", "chip": "A15 Bionic", "cameras": "12MP Main"}'),
('d1a2b3c4-0000-0000-0000-000000000004', 'Apple', 'iPhone 12', 64, 'Blue', 2020, 799900, '["https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=400&auto=format&fit=crop"]', '{"screen": "6.1 Super Retina XDR OLED", "chip": "A14 Bionic", "cameras": "12MP Main"}'),
('d1a2b3c4-0000-0000-0000-000000000005', 'Apple', 'iPhone SE (3rd Gen)', 64, 'Starlight', 2022, 649900, '["https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=400&auto=format&fit=crop"]', '{"screen": "4.7 Retina HD", "chip": "A15 Bionic", "cameras": "12MP Main"}'),
-- SAMSUNG
('d1a2b3c4-0000-0000-0000-000000000006', 'Samsung', 'Galaxy S24 Ultra', 512, 'Titanium Gray', 2024, 2599900, '["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=400&auto=format&fit=crop"]', '{"screen": "6.8 Dynamic AMOLED", "chip": "Snapdragon 8 Gen 3", "cameras": "200MP Main"}'),
('d1a2b3c4-0000-0000-0000-000000000007', 'Samsung', 'Galaxy S23', 256, 'Phantom Black', 2023, 1299900, '["https://images.unsplash.com/photo-1674726245673-9b57e7932822?q=80&w=400&auto=format&fit=crop"]', '{"screen": "6.1 Dynamic AMOLED", "chip": "Snapdragon 8 Gen 2", "cameras": "50MP Main"}'),
('d1a2b3c4-0000-0000-0000-000000000008', 'Samsung', 'Galaxy Z Fold 5', 512, 'Icy Blue', 2023, 2299900, '["https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=400&auto=format&fit=crop"]', '{"screen": "7.6 Foldable AMOLED", "chip": "Snapdragon 8 Gen 2", "cameras": "50MP Main"}'),
('d1a2b3c4-0000-0000-0000-000000000009', 'Samsung', 'Galaxy Z Flip 5', 256, 'Mint', 2023, 1499900, '["https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?q=80&w=400&auto=format&fit=crop"]', '{"screen": "6.7 Foldable AMOLED", "chip": "Snapdragon 8 Gen 2", "cameras": "12MP Main"}'),
('d1a2b3c4-0000-0000-0000-000000000010', 'Samsung', 'Galaxy A54', 128, 'Awesome Graphite', 2023, 599900, '["https://images.unsplash.com/photo-1609252925148-b0f1b515e111?q=80&w=400&auto=format&fit=crop"]', '{"screen": "6.4 Super AMOLED", "chip": "Exynos 1380", "cameras": "50MP Main"}'),
-- GOOGLE
('d1a2b3c4-0000-0000-0000-000000000011', 'Google', 'Pixel 8 Pro', 256, 'Bay Blue', 2023, 1899900, '["https://images.unsplash.com/photo-1662955519195-2cc08f658055?q=80&w=400&auto=format&fit=crop"]', '{"screen": "6.7 LTPO OLED", "chip": "Tensor G3", "cameras": "50MP Main"}'),
('d1a2b3c4-0000-0000-0000-000000000012', 'Google', 'Pixel 7a', 128, 'Sea', 2023, 899900, '["https://images.unsplash.com/photo-1673891780590-b1933baee042?q=80&w=400&auto=format&fit=crop"]', '{"screen": "6.1 OLED", "chip": "Tensor G2", "cameras": "64MP Main"}'),
('d1a2b3c4-0000-0000-0000-000000000013', 'Google', 'Pixel 7', 128, 'Lemongrass', 2022, 1049900, '["https://images.unsplash.com/photo-1665686377065-08ba896d16fd?q=80&w=400&auto=format&fit=crop"]', '{"screen": "6.3 AMOLED", "chip": "Tensor G2", "cameras": "50MP Main"}'),
('d1a2b3c4-0000-0000-0000-000000000014', 'Google', 'Pixel 6 Pro', 128, 'Cloudy White', 2021, 799900, '["https://images.unsplash.com/photo-1644342555577-b84cc52cbff6?q=80&w=400&auto=format&fit=crop"]', '{"screen": "6.7 LTPO AMOLED", "chip": "Tensor", "cameras": "50MP Main"}'),
('d1a2b3c4-0000-0000-0000-000000000015', 'Google', 'Pixel Fold', 256, 'Obsidian', 2023, 2499900, '["https://images.unsplash.com/photo-1615526675159-e248c3021d3f?q=80&w=400&auto=format&fit=crop"]', '{"screen": "7.6 Foldable OLED", "chip": "Tensor G2", "cameras": "48MP Main"}')
ON CONFLICT DO NOTHING;

INSERT INTO ultron_inventory.inventory_items (device_id, imei, serial_number, condition_grade, battery_health_percentage, cosmetic_scratches_rating, has_original_box, has_original_charger, inspection_id, inspector_technician_id, selling_price_cents, status)
VALUES 
-- APPLE
('d1a2b3c4-0000-0000-0000-000000000001', '358900112233441', 'SN-APL-15PM-001', 'MINT', 100, 10, true, true, 'INSP-1001', 'TECH-404', 2399900, 'AVAILABLE'),
('d1a2b3c4-0000-0000-0000-000000000002', '358900112233442', 'SN-APL-14P-001', 'GOOD', 92, 8, false, true, 'INSP-1002', 'TECH-404', 1799900, 'AVAILABLE'),
('d1a2b3c4-0000-0000-0000-000000000003', '358900112233443', 'SN-APL-13-001', 'MINT', 98, 9, true, true, 'INSP-1003', 'TECH-405', 1149900, 'AVAILABLE'),
('d1a2b3c4-0000-0000-0000-000000000004', '358900112233444', 'SN-APL-12-001', 'FAIR', 85, 6, false, false, 'INSP-1004', 'TECH-405', 799900, 'AVAILABLE'),
('d1a2b3c4-0000-0000-0000-000000000005', '358900112233445', 'SN-APL-SE-001', 'GOOD', 91, 8, false, true, 'INSP-1005', 'TECH-406', 649900, 'AVAILABLE'),
-- SAMSUNG
('d1a2b3c4-0000-0000-0000-000000000006', '358900112233551', 'SN-SAM-S24U-001', 'MINT', 100, 10, true, true, 'INSP-1006', 'TECH-406', 2599900, 'AVAILABLE'),
('d1a2b3c4-0000-0000-0000-000000000007', '358900112233552', 'SN-SAM-S23-001', 'GOOD', 93, 8, false, true, 'INSP-1007', 'TECH-407', 1299900, 'AVAILABLE'),
('d1a2b3c4-0000-0000-0000-000000000008', '358900112233553', 'SN-SAM-ZF5-001', 'MINT', 97, 9, true, true, 'INSP-1008', 'TECH-407', 2299900, 'AVAILABLE'),
('d1a2b3c4-0000-0000-0000-000000000009', '358900112233554', 'SN-SAM-ZFL5-001', 'GOOD', 89, 8, false, false, 'INSP-1009', 'TECH-408', 1499900, 'AVAILABLE'),
('d1a2b3c4-0000-0000-0000-000000000010', '358900112233555', 'SN-SAM-A54-001', 'FAIR', 84, 7, false, true, 'INSP-1010', 'TECH-408', 599900, 'AVAILABLE'),
-- GOOGLE
('d1a2b3c4-0000-0000-0000-000000000011', '358900112233661', 'SN-GGL-P8P-001', 'MINT', 99, 10, true, true, 'INSP-1011', 'TECH-409', 1899900, 'AVAILABLE'),
('d1a2b3c4-0000-0000-0000-000000000012', '358900112233662', 'SN-GGL-P7A-001', 'MINT', 98, 9, true, true, 'INSP-1012', 'TECH-409', 899900, 'AVAILABLE'),
('d1a2b3c4-0000-0000-0000-000000000013', '358900112233663', 'SN-GGL-P7-001', 'GOOD', 90, 8, false, true, 'INSP-1013', 'TECH-410', 1049900, 'AVAILABLE'),
('d1a2b3c4-0000-0000-0000-000000000014', '358900112233664', 'SN-GGL-P6P-001', 'FAIR', 83, 7, false, false, 'INSP-1014', 'TECH-410', 799900, 'AVAILABLE'),
('d1a2b3c4-0000-0000-0000-000000000015', '358900112233665', 'SN-GGL-PF-001', 'MINT', 96, 9, true, true, 'INSP-1015', 'TECH-411', 2499900, 'AVAILABLE')
ON CONFLICT DO NOTHING;
