-- Migration Script for Adding Audit Fields
-- Date: 2025-11-17
-- Purpose: Add createdAt, updatedAt, isDeleted to existing tables with data

-- ==============================================================
-- VACCINES TABLE
-- ==============================================================

-- Step 1: Add columns as NULLABLE first (to avoid errors with existing data)
ALTER TABLE vaccines 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE vaccines 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE vaccines 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Step 2: Update NULL values in existing rows
UPDATE vaccines 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;

UPDATE vaccines 
SET updated_at = CURRENT_TIMESTAMP 
WHERE updated_at IS NULL;

UPDATE vaccines 
SET is_deleted = FALSE 
WHERE is_deleted IS NULL;

-- ==============================================================
-- CENTERS TABLE
-- ==============================================================

-- Step 1: Add slug column (nullable, will be populated by application)
ALTER TABLE centers 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Step 2: Add audit columns as NULLABLE
ALTER TABLE centers 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE centers 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE centers 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Step 3: Update NULL values in existing rows
UPDATE centers 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;

UPDATE centers 
SET updated_at = CURRENT_TIMESTAMP 
WHERE updated_at IS NULL;

UPDATE centers 
SET is_deleted = FALSE 
WHERE is_deleted IS NULL;

-- Step 4: Generate slugs for existing centers (basic slug generation)
-- This will be improved by application auto-generation
UPDATE centers 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- Step 5: Add unique constraint on slug
CREATE UNIQUE INDEX IF NOT EXISTS uk_centers_slug ON centers(slug);

-- ==============================================================
-- VERIFY MIGRATION
-- ==============================================================

-- Check vaccines table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'vaccines' 
  AND column_name IN ('created_at', 'updated_at', 'is_deleted')
ORDER BY ordinal_position;

-- Check centers table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'centers' 
  AND column_name IN ('slug', 'created_at', 'updated_at', 'is_deleted')
ORDER BY ordinal_position;

-- Check for any NULL values (should be zero)
SELECT 
    'vaccines' as table_name,
    COUNT(*) FILTER (WHERE created_at IS NULL) as null_created_at,
    COUNT(*) FILTER (WHERE updated_at IS NULL) as null_updated_at,
    COUNT(*) FILTER (WHERE is_deleted IS NULL) as null_is_deleted
FROM vaccines
UNION ALL
SELECT 
    'centers' as table_name,
    COUNT(*) FILTER (WHERE created_at IS NULL) as null_created_at,
    COUNT(*) FILTER (WHERE updated_at IS NULL) as null_updated_at,
    COUNT(*) FILTER (WHERE is_deleted IS NULL) as null_is_deleted
FROM centers;

-- ==============================================================
-- NOTES
-- ==============================================================

-- 1. All new columns are NULLABLE to support Hibernate's @Column without nullable=false
-- 2. Default values ensure existing rows have proper values
-- 3. Application will handle setting values for new records via @CreationTimestamp/@UpdateTimestamp
-- 4. center_id remains unchanged to preserve foreign key relationships
-- 5. Slug generation in SQL is basic - application will generate better slugs for Vietnamese names
-- 6. Run this script BEFORE restarting the Spring Boot application

-- ==============================================================
-- ROLLBACK (if needed)
-- ==============================================================

-- Uncomment below to rollback changes:

-- ALTER TABLE vaccines DROP COLUMN IF EXISTS created_at;
-- ALTER TABLE vaccines DROP COLUMN IF EXISTS updated_at;
-- ALTER TABLE vaccines DROP COLUMN IF EXISTS is_deleted;

-- ALTER TABLE centers DROP COLUMN IF EXISTS slug;
-- ALTER TABLE centers DROP COLUMN IF EXISTS created_at;
-- ALTER TABLE centers DROP COLUMN IF EXISTS updated_at;
-- ALTER TABLE centers DROP COLUMN IF EXISTS is_deleted;
-- DROP INDEX IF EXISTS uk_centers_slug;
