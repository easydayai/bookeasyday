-- Drop the policy targeting public role
DROP POLICY IF EXISTS "Anyone can create applications" ON public.applications;

-- Create policy specifically for anon role (anonymous users)
CREATE POLICY "Anonymous users can create applications"
ON public.applications
FOR INSERT
TO anon
WITH CHECK (true);

-- Also need to grant INSERT permission to anon role on the table
GRANT INSERT ON public.applications TO anon;