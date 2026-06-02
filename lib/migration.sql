-- ====================================================
-- 💳 SAMARQAND CRAFTOUR PAYMENT SCHEMAS MIGRATION
-- Run this script in your Supabase SQL Editor.
-- ====================================================

-- 1. Add payment fields to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'unpaid'; -- 'unpaid', 'deposit_paid', 'fully_paid'
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50); -- 'payme', 'click', 'stripe', 'paypal'
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10, 2) DEFAULT 0.00; -- 20% deposit in USD
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_tx_id VARCHAR(255); -- transaction ID
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- 2. Create transactions tracking table (particularly for Payme state machine & Click transactions)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id VARCHAR(255) PRIMARY KEY,
    booking_id INT REFERENCES bookings(id) ON DELETE CASCADE,
    state INT NOT NULL, -- 1 = active, 2 = performed, -1 = cancelled, -2 = cancelled after perform
    amount DECIMAL(10, 2) NOT NULL, -- transaction amount
    payment_method VARCHAR(50) NOT NULL,
    payme_time BIGINT,
    perform_time BIGINT,
    cancel_time BIGINT,
    reason INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Add estimated_duration field to locations table
ALTER TABLE locations ADD COLUMN IF NOT EXISTS estimated_duration INT DEFAULT 90;
UPDATE locations SET estimated_duration = 120 WHERE name_en = 'Registan Square';
UPDATE locations SET estimated_duration = 90 WHERE name_en = 'Gur-e-Amir Mausoleum';
UPDATE locations SET estimated_duration = 90 WHERE name_en = 'Shah-i-Zinda';
UPDATE locations SET estimated_duration = 60 WHERE name_en = 'Bibi-Khanym Mosque';
UPDATE locations SET estimated_duration = 60 WHERE name_en = 'Ulugh Beg Observatory';
UPDATE locations SET estimated_duration = 240 WHERE name_en = 'Urgut Mountain Bazaar & Hills';
UPDATE locations SET estimated_duration = 180 WHERE name_en = 'Omonqo''ton Pass & Pines';
UPDATE locations SET estimated_duration = 120 WHERE name_en = 'Konigil Paper Mill';
UPDATE locations SET estimated_duration = 60 WHERE name_en = 'National Osh House';
UPDATE locations SET estimated_duration = 45 WHERE name_en = 'Samarkand Bread Bakery';
UPDATE locations SET estimated_duration = 90 WHERE name_en = 'Karimbek Restaurant';
