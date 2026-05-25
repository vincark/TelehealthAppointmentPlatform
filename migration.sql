-- ============================================================
--  TELEHEALTH — INCREMENTAL MIGRATION
--  Safe to run on any existing database created from telehealth.sql
--  All statements are idempotent (won't error if already applied)
-- ============================================================

-- ── 1. provider_profiles: add base_fee ───────────────────────
ALTER TABLE public.provider_profiles
  ADD COLUMN IF NOT EXISTS base_fee NUMERIC(10,2) DEFAULT 75.00;


-- ── 2. appointments: add fee, payment, prescription columns ──
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS fee               NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS payment_status    VARCHAR(20) DEFAULT 'Unpaid',
  ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS prescription      TEXT;


-- ── 3. appointments: extend status constraint to include Rescheduled ──
DO $$
BEGIN
  -- Drop the old constraint (only if it still has the old definition)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'appointments_status_check'
      AND table_name = 'appointments'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.appointments DROP CONSTRAINT appointments_status_check;
  END IF;

  -- Re-add with Rescheduled included
  ALTER TABLE public.appointments
    ADD CONSTRAINT appointments_status_check
    CHECK (
      (status)::text = ANY (ARRAY[
        'Pending', 'Confirmed', 'Cancelled', 'Completed', 'Rescheduled'
      ])
    );
END $$;


-- ── 4. ratings: create table (skipped if it already exists) ──
CREATE TABLE IF NOT EXISTS public.ratings (
  rating_id      SERIAL PRIMARY KEY,
  patient_id     INTEGER NOT NULL REFERENCES public.users(user_id)        ON DELETE CASCADE,
  provider_id    INTEGER NOT NULL REFERENCES public.users(user_id)        ON DELETE CASCADE,
  appointment_id INTEGER NOT NULL UNIQUE REFERENCES public.appointments(appointment_id) ON DELETE CASCADE,
  rating         INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at     TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
