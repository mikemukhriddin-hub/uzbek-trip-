-- ==========================================
-- 🔐 RLS POLICIES — SAMARQAND CRAFTOUR
-- Run this in your Supabase SQL Editor.
-- ==========================================

-- ==========================================
-- STEP 1: Enable RLS on all tables
-- ==========================================
ALTER TABLE public.locations              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_language_tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items          ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- STEP 2: Drop existing policies (clean slate)
-- ==========================================
DROP POLICY IF EXISTS "locations_public_read"              ON public.locations;
DROP POLICY IF EXISTS "locations_service_all"              ON public.locations;

DROP POLICY IF EXISTS "guides_public_read"                 ON public.guides;
DROP POLICY IF EXISTS "guides_service_all"                 ON public.guides;

DROP POLICY IF EXISTS "guide_tariffs_public_read"          ON public.guide_language_tariffs;
DROP POLICY IF EXISTS "guide_tariffs_service_all"          ON public.guide_language_tariffs;

DROP POLICY IF EXISTS "vehicles_public_read"               ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_service_all"               ON public.vehicles;

DROP POLICY IF EXISTS "bookings_service_all"               ON public.bookings;
DROP POLICY IF EXISTS "bookings_anon_insert"               ON public.bookings;

DROP POLICY IF EXISTS "booking_items_service_all"          ON public.booking_items;
DROP POLICY IF EXISTS "booking_items_anon_insert"          ON public.booking_items;


-- ==========================================
-- STEP 3: LOCATIONS — public read, service role write
-- Tourists need to browse locations without logging in.
-- Only your backend (service_role key) can add/edit/delete.
-- ==========================================
CREATE POLICY "locations_public_read"
  ON public.locations
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "locations_service_all"
  ON public.locations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ==========================================
-- STEP 4: GUIDES — public read, service role write
-- ==========================================
CREATE POLICY "guides_public_read"
  ON public.guides
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "guides_service_all"
  ON public.guides
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ==========================================
-- STEP 5: GUIDE_LANGUAGE_TARIFFS — public read, service role write
-- ==========================================
CREATE POLICY "guide_tariffs_public_read"
  ON public.guide_language_tariffs
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "guide_tariffs_service_all"
  ON public.guide_language_tariffs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ==========================================
-- STEP 6: VEHICLES — public read, service role write
-- ==========================================
CREATE POLICY "vehicles_public_read"
  ON public.vehicles
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "vehicles_service_all"
  ON public.vehicles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ==========================================
-- STEP 7: BOOKINGS — anonymous can INSERT (submit booking),
-- only service_role can SELECT/UPDATE/DELETE (admin panel & API routes).
-- ==========================================
CREATE POLICY "bookings_anon_insert"
  ON public.bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "bookings_service_all"
  ON public.bookings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ==========================================
-- STEP 8: BOOKING_ITEMS — same as bookings.
-- Anonymous users can INSERT their route items,
-- only service_role can read/manage them.
-- ==========================================
CREATE POLICY "booking_items_anon_insert"
  ON public.booking_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "booking_items_service_all"
  ON public.booking_items
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ==========================================
-- ✅ DONE — Verify with:
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public';
-- ==========================================
