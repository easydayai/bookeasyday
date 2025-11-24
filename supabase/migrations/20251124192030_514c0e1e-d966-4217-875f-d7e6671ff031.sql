-- Let's try a nuclear option: make the table completely open for inserts
-- This bypasses all the complexity

-- First, drop ALL existing INSERT policies
DROP POLICY IF EXISTS "Anonymous users can create applications" ON public.applications;
DROP POLICY IF EXISTS "Anyone can create applications" ON public.applications;
DROP POLICY IF EXISTS "Authenticated users can create applications" ON public.applications;
DROP POLICY IF EXISTS "Admins can insert applications" ON public.applications;

-- Create a simple, permissive policy that allows ALL roles to insert
CREATE POLICY "Allow all inserts"
ON public.applications
FOR INSERT
TO public
WITH CHECK (true);

-- Make absolutely sure the grants are in place
GRANT INSERT ON public.applications TO anon;
GRANT INSERT ON public.applications TO authenticated;
GRANT INSERT ON public.applications TO public;