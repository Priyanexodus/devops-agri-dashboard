-- ================================================================
-- V1: Create all tables for the Agri-Dashboard backend
-- Flyway runs this on first application startup automatically.
-- ================================================================

CREATE TABLE IF NOT EXISTS crop_yields (
    id              BIGSERIAL        PRIMARY KEY,
    crop_name       VARCHAR(100)     NOT NULL,
    year            INTEGER          NOT NULL,
    yield_amount    DOUBLE PRECISION NOT NULL,
    region          VARCHAR(100)     NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crop_yields_crop_name ON crop_yields (LOWER(crop_name));
CREATE INDEX IF NOT EXISTS idx_crop_yields_year      ON crop_yields (year);
CREATE INDEX IF NOT EXISTS idx_crop_yields_region    ON crop_yields (region);

-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS domestic_consumption (
    id                  BIGSERIAL        PRIMARY KEY,
    crop_name           VARCHAR(100)     NOT NULL,
    year                INTEGER          NOT NULL,
    consumption_amount  DOUBLE PRECISION NOT NULL,
    region              VARCHAR(100)     NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_consumption_crop_name ON domestic_consumption (LOWER(crop_name));
CREATE INDEX IF NOT EXISTS idx_consumption_year      ON domestic_consumption (year);
CREATE INDEX IF NOT EXISTS idx_consumption_region    ON domestic_consumption (region);

-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ethanol_targets (
    id                           BIGSERIAL        PRIMARY KEY,
    year                         INTEGER          NOT NULL UNIQUE,
    target_blending_percentage   DOUBLE PRECISION NOT NULL,
    achieved_blending_percentage DOUBLE PRECISION NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ethanol_year ON ethanol_targets (year);
