-- Drop existing SELECT policies on applications table
DROP POLICY IF EXISTS "Admins can view all applications" ON public.applications;
DROP POLICY IF EXISTS "Applicants can view their own applications" ON public.applications;

-- Create new PERMISSIVE SELECT policies (uses OR logic between policies)
CREATE POLICY "Admins can view all applications" 
ON public.applications 
FOR SELECT 
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Applicants can view their own applications" 
ON public.applications 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);