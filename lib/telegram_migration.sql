-- ====================================================
-- 🤖 SAMARQAND CRAFTOUR TELEGRAM BOT INTEGRATION MIGRATION
-- Run this script in your Supabase SQL Editor.
-- ====================================================

-- 1. Add Telegram fields to guides table
ALTER TABLE guides ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT UNIQUE;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS bot_active BOOLEAN DEFAULT FALSE;

-- 2. Add Telegram fields to vehicles table
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT UNIQUE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS bot_active BOOLEAN DEFAULT FALSE;

-- 3. Create partner response status enum type and add response fields to bookings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partner_response_status') THEN
        CREATE TYPE partner_response_status AS ENUM ('pending', 'confirmed', 'rejected');
    END IF;
END$$;

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guide_response partner_response_status DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS vehicle_response partner_response_status DEFAULT 'pending';
