-- Allow anyone (including anonymous users) to submit applications
CREATE POLICY "Anyone can create applications"
ON public.applications
FOR INSERT
WITH CHECK (true);

-- Drop the old policy that required authentication
DROP POLICY IF EXISTS "Authenticated users can create applications" ON public.applications;