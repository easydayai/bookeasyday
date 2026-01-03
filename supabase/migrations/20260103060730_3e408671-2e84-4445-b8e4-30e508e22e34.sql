-- Add pricing mode columns to appointment_types
ALTER TABLE public.appointment_types
ADD COLUMN IF NOT EXISTS pricing_mode text NOT NULL DEFAULT 'free',
ADD COLUMN IF NOT EXISTS deposit_cents integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_pay_cents integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS suggested_pay_cents integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_pay_cents integer;

-- Add constraint for pricing_mode on appointment_types
ALTER TABLE public.appointment_types
DROP CONSTRAINT IF EXISTS appointment_types_pricing_mode_check;

ALTER TABLE public.appointment_types
ADD CONSTRAINT appointment_types_pricing_mode_check 
CHECK (pricing_mode IN ('free', 'fixed', 'deposit', 'pay_what_you_want'));

-- Add payment tracking columns to bookings
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS total_amount_cents integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS paid_amount_cents integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS balance_due_cents integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS pricing_mode text NOT NULL DEFAULT 'free',
ADD COLUMN IF NOT EXISTS stripe_session_id text,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;

-- Add constraint for pricing_mode on bookings
ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_pricing_mode_check;

ALTER TABLE public.bookings
ADD CONSTRAINT bookings_pricing_mode_check 
CHECK (pricing_mode IN ('free', 'fixed', 'deposit', 'pay_what_you_want'));

-- Update payment_status check constraint to include new statuses
ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_payment_status_check;

-- Add new constraint with all payment statuses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookings_payment_status_check'
  ) THEN
    -- Only add if column exists and has the right type
    ALTER TABLE public.bookings
    ADD CONSTRAINT bookings_payment_status_check
    CHECK (status IN ('booked', 'confirmed', 'cancelled', 'completed', 'no_show'));
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;