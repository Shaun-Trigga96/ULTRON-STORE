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
