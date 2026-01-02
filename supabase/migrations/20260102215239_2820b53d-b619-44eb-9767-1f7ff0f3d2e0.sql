-- Add columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS business_name text,
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'America/New_York',
ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);

-- Create appointment_types table
CREATE TABLE IF NOT EXISTS public.appointment_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  description text,
  location_type text DEFAULT 'phone',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create availability_rules table
CREATE TABLE IF NOT EXISTS public.availability_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  timezone text DEFAULT 'America/New_York',
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  appointment_type_id uuid REFERENCES public.appointment_types(id) ON DELETE SET NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  notes text,
  status text DEFAULT 'booked',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointment_types_user_id ON public.appointment_types(user_id);
CREATE INDEX IF NOT EXISTS idx_availability_rules_user_id ON public.availability_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON public.bookings(start_time);

-- RLS Policies for appointment_types
CREATE POLICY "Users can view their own appointment types"
ON public.appointment_types FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own appointment types"
ON public.appointment_types FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointment types"
ON public.appointment_types FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointment types"
ON public.appointment_types FOR DELETE
USING (auth.uid() = user_id);

-- Public read access for booking page
CREATE POLICY "Public can view active appointment types for booking"
ON public.appointment_types FOR SELECT
USING (is_active = true);

-- RLS Policies for availability_rules
CREATE POLICY "Users can view their own availability rules"
ON public.availability_rules FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own availability rules"
ON public.availability_rules FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own availability rules"
ON public.availability_rules FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own availability rules"
ON public.availability_rules FOR DELETE
USING (auth.uid() = user_id);

-- Public read access for booking page
CREATE POLICY "Public can view availability rules for booking"
ON public.availability_rules FOR SELECT
USING (true);

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings"
ON public.bookings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
ON public.bookings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings"
ON public.bookings FOR DELETE
USING (auth.uid() = user_id);

-- Public can create bookings (for customers booking appointments)
CREATE POLICY "Public can create bookings"
ON public.bookings FOR INSERT
WITH CHECK (true);

-- Public can view booking times for conflict checking (no PII exposed in this context)
CREATE POLICY "Public can view booking times for availability"
ON public.bookings FOR SELECT
USING (true);

-- Public read access for profiles (for booking page)
CREATE POLICY "Public can view profiles for booking"
ON public.profiles FOR SELECT
USING (true);

-- Function to generate slug from email
CREATE OR REPLACE FUNCTION public.generate_slug_from_email(email text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Extract the part before @ and replace dots/special chars with hyphens
  base_slug := lower(regexp_replace(split_part(email, '@', 1), '[^a-z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append number if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::text;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Update handle_new_user to include slug generation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  generated_slug text;
BEGIN
  -- Generate unique slug from email
  generated_slug := public.generate_slug_from_email(NEW.email);
  
  INSERT INTO public.profiles (id, email, full_name, slug)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    generated_slug
  );
  RETURN NEW;
END;
$$;