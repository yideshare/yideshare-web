-- ==========================================
-- STEP 1: Backup Important Tables
-- ==========================================
-- Purpose: Create a snapshot of current data before making changes.

CREATE TABLE "Ride_backup" AS SELECT * FROM "Ride";
CREATE TABLE "User_backup" AS SELECT * FROM "User";
CREATE TABLE "RideParticipant_backup" AS SELECT * FROM "RideParticipant";
CREATE TABLE "Bookmark_backup" AS SELECT * FROM "Bookmark";

-- Verification:
SELECT COUNT(*) as original_count FROM "Ride";
SELECT COUNT(*) as backup_count FROM "Ride_backup";


-- ==========================================
-- STEP 2: Check Current Status
-- ==========================================

-- Check current columns in "Ride" table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'Ride'
ORDER BY ordinal_position;

SELECT COUNT(*) as total_rides FROM "Ride";

-- Integrity Check:
SELECT COUNT(*) as rides_without_user
FROM "Ride" r
LEFT JOIN "User" u ON r."ownerNetId" = u."netId"
WHERE u."netId" IS NULL;

-- STOP HERE if "rides_without_user" > 0. 
-- must fix orphan rides before proceeding, or the NOT NULL constraint later will fail.


-- ==========================================
-- STEP 3.1: Add `ownerEmail` Column
-- ==========================================
BEGIN;

ALTER TABLE "Ride" ADD COLUMN "ownerEmail" text;

-- Verification:
SELECT column_name 
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'Ride' 
  AND column_name = 'ownerEmail';

COMMIT;
-- 🛑 ROLLBACK; -- Run this only if the column was not added correctly.


-- ==========================================
-- STEP 3.2: Populate `ownerEmail` (Test Batch)
-- ==========================================
BEGIN;

-- Test with first 10 rows to ensure JOIN works as expected
-- Note: PostgreSQL UPDATE does not support LIMIT directly in standard SQL, 
-- but we can use a CTE (Common Table Expression) to target specific rows safely.
WITH targets AS (
    SELECT "rideId"
    FROM "Ride"
    WHERE "ownerEmail" IS NULL
    LIMIT 10
)
UPDATE "Ride" r
SET "ownerEmail" = u.email
FROM "User" u, targets t
WHERE r."ownerNetId" = u."netId"
  AND r."rideId" = t."rideId";

-- Verification: Check if data looks correct
SELECT 
  "rideId", 
  "ownerName", 
  "ownerEmail", 
  "ownerNetId"
FROM "Ride"
WHERE "ownerEmail" IS NOT NULL
LIMIT 10;

COMMIT;
-- 🛑 ROLLBACK; -- Run this if the emails look wrong or update failed.


-- ==========================================
-- STEP 3.3: Populate `ownerEmail` (Full Table)
-- ==========================================
BEGIN;

-- Update all remaining rows
UPDATE "Ride" r
SET "ownerEmail" = u.email
FROM "User" u
WHERE r."ownerNetId" = u."netId"
  AND r."ownerEmail" IS NULL;

-- Verification: Ensure NO null values remain
SELECT COUNT(*) as null_count
FROM "Ride"
WHERE "ownerEmail" IS NULL;

-- 🛑 IMPORTANT DECISION POINT:
-- If "null_count" is 0, execute COMMIT;
-- If "null_count" > 0, execute ROLLBACK; and investigate why some users don't have emails.
COMMIT;
-- ROLLBACK;


-- ==========================================
-- STEP 4: Enforce NOT NULL on `ownerEmail`
-- ==========================================
BEGIN;

-- Final safety check
SELECT COUNT(*) FROM "Ride" WHERE "ownerEmail" IS NULL;

-- Apply the constraint
ALTER TABLE "Ride" ALTER COLUMN "ownerEmail" SET NOT NULL;

COMMIT;
-- 🛑 ROLLBACK; -- Run this if PostgreSQL throws a violation error.


-- ==========================================
-- STEP 5: Add `hasCar` Column
-- ==========================================
BEGIN;

ALTER TABLE "Ride" ADD COLUMN "hasCar" boolean NOT NULL DEFAULT false;

-- Verification:
SELECT "rideId", "ownerName", "hasCar"
FROM "Ride"
LIMIT 5;

COMMIT;
-- 🛑 ROLLBACK; -- Run this if the default value isn't setting correctly.


-- ==========================================
-- STEP 6: Make `ownerPhone` Optional
-- ==========================================
BEGIN;

ALTER TABLE "Ride" ALTER COLUMN "ownerPhone" DROP NOT NULL;

-- Verification:
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'Ride' 
  AND column_name = 'ownerPhone';

-- Expectation: is_nullable should be 'YES'

COMMIT; 
-- 🛑 ROLLBACK; -- Run this if is_nullable is still 'NO'.


-- ==========================================
-- STEP 7: Final Post-Migration Check
-- ==========================================

-- 1. Visual Inspection
SELECT 
  "rideId",
  "ownerName",
  "ownerEmail",      
  "ownerPhone",      
  "hasCar",        
  "isClosed"
FROM "Ride"
LIMIT 10;

-- 2. Data Integrity Check vs Backup
SELECT 
  (SELECT COUNT(*) FROM "Ride") as current_count,
  (SELECT COUNT(*) FROM "Ride_backup") as backup_count;
  
-- Expectation: Counts should match exactly.