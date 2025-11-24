-- Drop the conflicting admin insert policy that requires authenticated role
DROP POLICY IF EXISTS "Admins can insert applications" ON public.applications;

-- The "Anyone can create applications" policy already allows all inserts (including admin)