-- Ensure RLS is enabled on applications table
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner as well
ALTER TABLE public.applications FORCE ROW LEVEL SECURITY;

-- Drop all existing SELECT policies on applications
DROP POLICY IF EXISTS "Admins can view all applications" ON public.applications;
DROP POLICY IF EXISTS "Applicants can view their own applications" ON public.applications;

-- Create PERMISSIVE SELECT policies that only allow authenticated users
-- Admins can view all applications
CREATE POLICY "Admins can view all applications" 
ON public.applications 
AS PERMISSIVE
FOR SELECT 
TO authenticated
USING (is_admin(auth.uid()));

-- Users can only view their own applications
CREATE POLICY "Applicants can view their own applications" 
ON public.applications 
AS PERMISSIVE
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);