-- ==========================================
-- MIGRATION: Message ride threads
-- Status: NOT YET APPLIED
-- ==========================================
-- Adds the schema the messaging feature needs. Messages become scoped to a
-- ride, so a conversation is identified by (rideId, sender, receiver) rather
-- than by the two participants alone.
--
-- Changes to the "Message" table:
--   1. Add "rideId" (text, NOT NULL, FK -> "Ride"."rideId")
--   2. Add three composite indexes for thread lookups
--
-- Expected starting state: prisma/schema.prisma as of branch `main`, where
-- Message exists but is marked [UNUSED] and has no ride relation.
--
-- Run against the DIRECT (or session pooler) connection, never the
-- transaction pooler on port 6543 - DDL does not work under pgbouncer
-- transaction pooling. The Supabase SQL editor is fine.
--
-- Run one STEP at a time and read the verification output before continuing.


-- ==========================================
-- STEP 1: Pre-flight - confirm current state
-- ==========================================
-- Purpose: verify production actually matches what this script expects
-- before changing anything.

-- 1a. Does "Message" exist at all?
SELECT COUNT(*) AS message_table_exists
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'Message';

-- If message_table_exists = 0, SKIP STEPS 2-5 and use STEP 6 instead.
-- If message_table_exists = 1, continue below.

-- 1b. Current columns - expect exactly:
--     messageId, senderNetId, receiverNetId, timestamp, payload
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'Message'
ORDER BY ordinal_position;

-- 1c. Is "rideId" already present? Expect 0.
SELECT COUNT(*) AS ride_id_already_exists
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'Message'
  AND column_name = 'rideId';

-- STOP if ride_id_already_exists > 0 - this migration has already run.

-- 1d. Row count. This decides which branch of STEP 3 to take.
SELECT COUNT(*) AS existing_messages FROM "Message";


-- ==========================================
-- STEP 2: Backup
-- ==========================================
-- Purpose: snapshot before any change. "Message" is the only table this
-- migration touches.

CREATE TABLE "Message_backup" AS SELECT * FROM "Message";

-- Verification: counts must match.
SELECT
  (SELECT COUNT(*) FROM "Message")        AS original_count,
  (SELECT COUNT(*) FROM "Message_backup") AS backup_count;


-- ==========================================
-- STEP 3: Add "rideId" column
-- ==========================================
-- The column is NOT NULL with no default, so it can only be added directly
-- when the table is empty. Pick 3A or 3B based on existing_messages from
-- STEP 1d.

-- ------------------------------------------
-- STEP 3A: existing_messages = 0 (expected case)
-- ------------------------------------------
BEGIN;

ALTER TABLE "Message" ADD COLUMN "rideId" TEXT NOT NULL;

-- Verification: expect one row, is_nullable = 'NO'.
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'Message'
  AND column_name = 'rideId';

COMMIT;
-- ROLLBACK; -- Run this instead if the column was not added correctly.

-- ------------------------------------------
-- STEP 3B: existing_messages > 0
-- ------------------------------------------
-- Legacy rows predate the ride relation and carry no ride association, so
-- there is nothing to backfill from. They must be removed before the NOT NULL
-- constraint can apply. STEP 2 has already backed them up.
--
-- Only run this block if you took branch 3B. Uncomment to use.
--
-- BEGIN;
--
-- ALTER TABLE "Message" ADD COLUMN "rideId" TEXT;
--
-- DELETE FROM "Message" WHERE "rideId" IS NULL;
--
-- -- Verification: expect 0.
-- SELECT COUNT(*) AS remaining_null_ride_id
-- FROM "Message" WHERE "rideId" IS NULL;
--
-- -- DECISION POINT: only proceed if remaining_null_ride_id = 0.
-- ALTER TABLE "Message" ALTER COLUMN "rideId" SET NOT NULL;
--
-- COMMIT;
-- -- ROLLBACK;


-- ==========================================
-- STEP 4: Add the foreign key
-- ==========================================
BEGIN;

ALTER TABLE "Message"
  ADD CONSTRAINT "Message_rideId_fkey"
  FOREIGN KEY ("rideId") REFERENCES "Ride"("rideId")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Verification: expect one row.
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = '"Message"'::regclass
  AND conname = 'Message_rideId_fkey';

COMMIT;
-- ROLLBACK; -- Run this if the constraint failed to attach.


-- ==========================================
-- STEP 5: Add indexes
-- ==========================================
-- Names match what Prisma generates for @@index, so a later `prisma db push`
-- sees them as already present and does not try to recreate them.

BEGIN;

CREATE INDEX "Message_senderNetId_receiverNetId_timestamp_idx"
  ON "Message"("senderNetId", "receiverNetId", "timestamp");

CREATE INDEX "Message_receiverNetId_senderNetId_timestamp_idx"
  ON "Message"("receiverNetId", "senderNetId", "timestamp");

CREATE INDEX "Message_rideId_senderNetId_receiverNetId_timestamp_idx"
  ON "Message"("rideId", "senderNetId", "receiverNetId", "timestamp");

-- Verification: expect 3 rows.
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'Message'
  AND indexname LIKE '%_idx'
ORDER BY indexname;

COMMIT;
-- ROLLBACK; -- Run this if any index failed to create.


-- ==========================================
-- STEP 6: ALTERNATIVE - "Message" does not exist
-- ==========================================
-- Only for the case where STEP 1a returned 0, meaning the [UNUSED] Message
-- model was never pushed to production. This creates the table in its final
-- shape; STEPS 2-5 are then unnecessary.
--
-- Uncomment to use.
--
-- BEGIN;
--
-- CREATE TABLE "Message" (
--     "messageId"     TEXT NOT NULL,
--     "senderNetId"   TEXT NOT NULL,
--     "receiverNetId" TEXT NOT NULL,
--     "rideId"        TEXT NOT NULL,
--     "timestamp"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "payload"       TEXT NOT NULL,
--     CONSTRAINT "Message_pkey" PRIMARY KEY ("messageId")
-- );
--
-- ALTER TABLE "Message"
--   ADD CONSTRAINT "Message_senderNetId_fkey"
--   FOREIGN KEY ("senderNetId") REFERENCES "User"("netId")
--   ON DELETE RESTRICT ON UPDATE CASCADE;
--
-- ALTER TABLE "Message"
--   ADD CONSTRAINT "Message_receiverNetId_fkey"
--   FOREIGN KEY ("receiverNetId") REFERENCES "User"("netId")
--   ON DELETE RESTRICT ON UPDATE CASCADE;
--
-- ALTER TABLE "Message"
--   ADD CONSTRAINT "Message_rideId_fkey"
--   FOREIGN KEY ("rideId") REFERENCES "Ride"("rideId")
--   ON DELETE RESTRICT ON UPDATE CASCADE;
--
-- CREATE INDEX "Message_senderNetId_receiverNetId_timestamp_idx"
--   ON "Message"("senderNetId", "receiverNetId", "timestamp");
-- CREATE INDEX "Message_receiverNetId_senderNetId_timestamp_idx"
--   ON "Message"("receiverNetId", "senderNetId", "timestamp");
-- CREATE INDEX "Message_rideId_senderNetId_receiverNetId_timestamp_idx"
--   ON "Message"("rideId", "senderNetId", "receiverNetId", "timestamp");
--
-- COMMIT;
-- -- ROLLBACK;


-- ==========================================
-- STEP 7: Post-migration check
-- ==========================================

-- 1. Final column layout - expect messageId, senderNetId, receiverNetId,
--    rideId, timestamp, payload.
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'Message'
ORDER BY ordinal_position;

-- 2. Constraints - expect Message_pkey plus three *_fkey rows.
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = '"Message"'::regclass
ORDER BY conname;

-- 3. Indexes - expect the primary key index plus the three above.
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'Message'
ORDER BY indexname;

-- 4. No orphaned rides referenced. Expect 0.
SELECT COUNT(*) AS messages_without_ride
FROM "Message" m
LEFT JOIN "Ride" r ON m."rideId" = r."rideId"
WHERE r."rideId" IS NULL;

-- 5. Confirm the database now matches prisma/schema.prisma. Run from a shell,
--    not the SQL editor (note: Prisma 7 renamed these flags - it is
--    `--to-schema`, not `--to-schema-datamodel`, and `--from-url` is gone in
--    favour of `--from-config-datasource`, which reads DIRECT_URL):
--
--      DIRECT_URL="<prod-direct-url>" npx prisma migrate diff \
--        --from-config-datasource --to-schema prisma/schema.prisma --script
--
--    Expected output is ONLY the deferred avatar drops below. Anything else
--    means production has drifted from the schema - investigate before
--    deploying.


-- ==========================================
-- STEP 8: Cleanup (after the deploy is confirmed healthy)
-- ==========================================
-- Only once messaging works in production and you are sure no rollback is
-- needed.
--
-- DROP TABLE "Message_backup";


-- ==========================================
-- DEFERRED: drop unused "User" avatar columns
-- ==========================================
-- prisma/schema.prisma on the messaging branch also removes User.avatar and
-- User.avatarType. That is deliberately NOT part of this migration:
--
--   - It is unrelated to messaging.
--   - It is the only irreversible step, and Supabase's free tier has no
--     point-in-time recovery.
--   - Both columns are nullable, so leaving them in place costs nothing and
--     Prisma ignores columns absent from the schema.
--
-- Run this separately, after taking a backup, once you have confirmed nothing
-- reads either column.
--
-- BEGIN;
--
-- CREATE TABLE "User_backup" AS SELECT * FROM "User";
--
-- -- How many rows would actually lose data? Expect 0.
-- SELECT COUNT(*) AS users_with_avatar
-- FROM "User" WHERE "avatar" IS NOT NULL;
--
-- -- DECISION POINT: if users_with_avatar > 0, ROLLBACK and decide whether
-- -- those images need preserving first.
-- ALTER TABLE "User" DROP COLUMN "avatar";
-- ALTER TABLE "User" DROP COLUMN "avatarType";
--
-- COMMIT;
-- -- ROLLBACK;
