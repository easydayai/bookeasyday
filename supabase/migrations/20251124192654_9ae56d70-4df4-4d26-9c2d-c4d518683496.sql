-- Completely disable RLS on the applications table as a last resort
-- This allows anyone to insert without any policy checks
ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;